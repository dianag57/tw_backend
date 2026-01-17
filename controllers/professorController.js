const { Op } = require('sequelize');
const {
  User,
  Project,
  Deliverable,
  JuryAssignment,
  Evaluation,
  sequelize,
} = require('../models');
const { calculateFinalGrade } = require('../utils/gradingUtils');

/**
 * Get all projects for review (professor only)
 * GET /api/professor/projects
 */
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'fullName', 'email'],
      }, {
        model: Deliverable,
        as: 'Deliverables',
        attributes: ['id', 'title', 'dueDate', 'status'],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ projects });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

/**
 * Get evaluations for a specific project (anonymous)
 * GET /api/professor/projects/:projectId/evaluations
 */
const getProjectEvaluations = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists
    const project = await Project.findByPk(projectId, {
      include: [{
        model: Deliverable,
        as: 'Deliverables',
      }],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get all evaluations for all deliverables in this project
    const deliverables = await Deliverable.findAll({
      where: { projectId },
      include: [{
        model: JuryAssignment,
        as: 'JuryAssignments',
        attributes: ['id', 'status'],
        include: [{
          model: Evaluation,
          attributes: ['id', 'score', 'feedback', 'createdAt'],
          required: false,
        }],
      }],
    });

    // Format response with calculated grades for each deliverable
    const evaluationData = await Promise.all(
      deliverables.map(async (deliverable) => {
        const gradeInfo = await calculateFinalGrade(deliverable.id);

        return {
          deliverable: {
            id: deliverable.id,
            title: deliverable.title,
            dueDate: deliverable.dueDate,
            status: deliverable.status,
          },
          evaluations: deliverable.JuryAssignments.filter(a => a.Evaluation).map(assignment => ({
            evaluationId: assignment.Evaluation.id,
            score: assignment.Evaluation.score,
            feedback: assignment.Evaluation.feedback,
            submittedAt: assignment.Evaluation.createdAt,
            // Jury member identity is NOT included (anonymous)
          })),
          finalGrade: gradeInfo.finalGrade,
          totalEvaluations: gradeInfo.totalEvaluations,
        };
      })
    );

    // Calculate project average grade
    const gradesWithValue = evaluationData.filter(e => e.finalGrade !== null);
    const projectAverage = gradesWithValue.length > 0 
      ? (gradesWithValue.reduce((sum, e) => sum + parseFloat(e.finalGrade), 0) / gradesWithValue.length).toFixed(2)
      : null;

    res.json({
      project: {
        id: project.id,
        title: project.title,
        createdBy: project.creator?.fullName,
      },
      projectAverage,
      evaluations: evaluationData,
    });
  } catch (error) {
    console.error('Get project evaluations error:', error);
    res.status(500).json({ message: 'Failed to fetch evaluations' });
  }
};

/**
 * Get statistics for a specific deliverable (professor view)
 * GET /api/professor/deliverables/:deliverableId/stats
 */
const getDeliverableStats = async (req, res) => {
  try {
    const { deliverableId } = req.params;

    const deliverable = await Deliverable.findByPk(deliverableId, {
      include: [{
        model: JuryAssignment,
        as: 'JuryAssignments',
        attributes: ['id', 'status'],
        include: [{
          model: Evaluation,
          attributes: ['score'],
          required: false,
        }],
      }],
    });

    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }

    // Calculate statistics
    const gradeInfo = await calculateFinalGrade(deliverableId);
    const totalAssignments = deliverable.JuryAssignments.length;
    const submittedCount = deliverable.JuryAssignments.filter(a => a.status === 'submitted').length;
    const pendingCount = totalAssignments - submittedCount;

    // Calculate statistical measures
    const scores = gradeInfo.allScores || [];
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const min = scores.length > 0 ? Math.min(...scores) : null;
    const max = scores.length > 0 ? Math.max(...scores) : null;

    res.json({
      deliverable: {
        id: deliverable.id,
        title: deliverable.title,
        status: deliverable.status,
      },
      stats: {
        totalJuryMembers: totalAssignments,
        submittedEvaluations: submittedCount,
        pendingEvaluations: pendingCount,
        submissionRate: totalAssignments > 0 ? ((submittedCount / totalAssignments) * 100).toFixed(2) + '%' : 'N/A',
        finalGrade: gradeInfo.finalGrade,
        averageScore: parseFloat(average.toFixed(2)),
        minScore: min,
        maxScore: max,
        allScores: scores,
      },
    });
  } catch (error) {
    console.error('Get deliverable stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};

module.exports = {
  getAllProjects,
  getProjectEvaluations,
  getDeliverableStats,
};
