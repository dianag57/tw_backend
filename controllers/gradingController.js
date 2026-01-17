const { Op } = require('sequelize');
const {
  User,
  Project,
  Deliverable,
  JuryAssignment,
  Evaluation,
  sequelize,
} = require('../models');
const { calculateFinalGrade, selectRandomJury, canEditEvaluation } = require('../utils/gradingUtils');

/**
 * Get jury assignments for current user
 * GET /api/jury/assignments
 */
const getJuryAssignments = async (req, res) => {
  try {
    const juryMemberId = req.user.id;

    const assignments = await JuryAssignment.findAll({
      where: { juryMemberId },
      include: [{
        model: Deliverable,
        as: 'deliverable',
        attributes: ['id', 'title', 'description', 'dueDate', 'videoUrl', 'serverUrl', 'status'],
        include: [{
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'userId'],
          include: [{
            model: User,
            as: 'creator',
            attributes: ['fullName'],
          }],
        }],
      }, {
        model: Evaluation,
        attributes: ['id', 'score', 'feedback'],
        required: false,
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ assignments });
  } catch (error) {
    console.error('Get jury assignments error:', error);
    res.status(500).json({ message: 'Failed to fetch jury assignments' });
  }
};

/**
 * Submit or update evaluation for assigned deliverable
 * POST /api/evaluations
 */
const submitEvaluation = async (req, res) => {
  try {
    let { juryAssignmentId, score, feedback } = req.body;
    const juryMemberId = req.user.id;

    console.log('submitEvaluation received:', { juryAssignmentId, score, feedback });

    // Manual validation
    if (!juryAssignmentId) {
      return res.status(400).json({ message: 'Jury assignment ID is required' });
    }
    juryAssignmentId = parseInt(juryAssignmentId, 10);
    if (isNaN(juryAssignmentId) || juryAssignmentId <= 0) {
      return res.status(400).json({ message: 'Invalid jury assignment ID' });
    }
    score = parseFloat(score);
    if (isNaN(score) || score < 1 || score > 10) {
      return res.status(400).json({ message: 'Score must be a number between 1 and 10' });
    }

    // Verify jury assignment exists and belongs to current user
    const assignment = await JuryAssignment.findByPk(juryAssignmentId, {
      include: [{
        model: Deliverable,
        as: 'deliverable',
      }],
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Jury assignment not found' });
    }

    if (assignment.juryMemberId !== juryMemberId) {
      return res.status(403).json({ message: 'This assignment does not belong to you' });
    }

    // Verify deliverable is open for grading
    if (assignment.deliverable.status !== 'open_for_grading') {
      return res.status(400).json({ message: 'This deliverable is not open for grading' });
    }

    // Check if evaluation already exists
    let evaluation = await Evaluation.findOne({
      where: { juryAssignmentId },
    });

    if (evaluation) {
      // Update existing evaluation if within 24 hours
      const canEdit = await canEditEvaluation(evaluation.id);
      if (!canEdit) {
        return res.status(403).json({ message: 'You can only edit your evaluation within 24 hours of submission' });
      }
      evaluation.score = score;
      evaluation.feedback = feedback;
    } else {
      // Create new evaluation
      evaluation = await Evaluation.create({
        juryAssignmentId,
        score,
        feedback,
      });
    }

    await evaluation.save();

    // Update assignment status
    assignment.status = 'submitted';
    await assignment.save();

    res.json({
      message: 'Evaluation submitted successfully',
      evaluation,
    });
  } catch (error) {
    console.error('Submit evaluation error:', error);
    res.status(500).json({ message: 'Failed to submit evaluation' });
  }
};

/**
 * Get evaluation details (for jury member to edit)
 * GET /api/evaluations/:id
 */
const getEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const evaluation = await Evaluation.findByPk(id, {
      include: [{
        model: JuryAssignment,
        as: 'assignment',
      }],
    });

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    // Only the jury member who created it can view
    if (evaluation.assignment.juryMemberId !== userId) {
      return res.status(403).json({ message: 'You do not have access to this evaluation' });
    }

    res.json({ evaluation });
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({ message: 'Failed to fetch evaluation' });
  }
};

/**
 * Trigger random jury selection for a deliverable
 * POST /api/deliverables/:deliverableId/select-jury
 */
const selectJury = async (req, res) => {
  try {
    const { deliverableId } = req.params;
    const { jurySize = 5 } = req.body;
    const userId = req.user.id;

    // Get deliverable and verify user is project creator
    const deliverable = await Deliverable.findByPk(deliverableId, {
      include: [{
        model: Project,
        as: 'project',
      }],
    });

    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }

    if (deliverable.project.userId !== userId) {
      return res.status(403).json({ message: 'You cannot select jury for this deliverable' });
    }

    // Get available students (excluding project creator)
    const availableJury = await User.findAll({
      where: {
        id: { [Op.ne]: deliverable.project.userId },
        role: 'student',
      },
      attributes: ['id'],
      raw: true,
      subQuery: false,
    });

    if (availableJury.length < jurySize) {
      return res.status(400).json({
        message: `Not enough students available. Found ${availableJury.length}, needed ${jurySize}`,
      });
    }

    // Randomly select jury members
    const shuffled = availableJury.sort(() => 0.5 - Math.random());
    const selectedJury = shuffled.slice(0, jurySize);

    // Create jury assignments
    const assignments = await Promise.all(
      selectedJury.map(member =>
        JuryAssignment.create({
          deliverableId,
          juryMemberId: member.id,
          status: 'assigned',
        })
      )
    );

    res.json({
      message: 'Jury selected successfully',
      juryCount: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error('Select jury error:', error);
    res.status(500).json({ message: 'Failed to select jury' });
  }
};

/**
 * Get final grade for a deliverable
 * GET /api/deliverables/:id/grade
 */
const getFinalGrade = async (req, res) => {
  try {
    const { id } = req.params;

    const deliverable = await Deliverable.findByPk(id, {
      include: [{
        model: Project,
        as: 'project',
      }],
    });

    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }

    const gradeInfo = await calculateFinalGrade(id);

    res.json({
      deliverable: {
        id: deliverable.id,
        title: deliverable.title,
      },
      gradeInfo,
    });
  } catch (error) {
    console.error('Get final grade error:', error);
    res.status(500).json({ message: 'Failed to calculate final grade' });
  }
};

module.exports = {
  getJuryAssignments,
  submitEvaluation,
  getEvaluation,
  selectJury,
  getFinalGrade,
};
