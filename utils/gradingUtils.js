/**
 * Grading Utility Functions
 * Handles grade calculations and jury selection
 */

const { Op } = require('sequelize');
const { User, JuryAssignment, Evaluation } = require('../models');

/**
 * Calculate final grade for a deliverable by excluding highest and lowest scores
 * @param {number} deliverableId - ID of deliverable to calculate grade for
 * @returns {Object} Grade calculation result
 */
const calculateFinalGrade = async (deliverableId) => {
  try {
    // Get all evaluations for this deliverable
    const evaluations = await Evaluation.findAll({
      include: [{
        model: JuryAssignment,
        as: 'assignment',
        where: { deliverableId },
        attributes: [],
      }],
      attributes: ['score'],
      raw: true,
    });

    if (evaluations.length === 0) {
      return { finalGrade: null, message: 'No evaluations found' };
    }

    const scores = evaluations.map(e => parseFloat(e.score)).sort((a, b) => a - b);

    // If only 1 or 2 evaluations, return average
    if (scores.length <= 2) {
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        finalGrade: parseFloat(average.toFixed(2)),
        totalEvaluations: scores.length,
        allScores: scores,
      };
    }

    // Exclude highest and lowest
    const middleScores = scores.slice(1, -1);
    const finalGrade = middleScores.reduce((a, b) => a + b, 0) / middleScores.length;

    return {
      finalGrade: parseFloat(finalGrade.toFixed(2)),
      totalEvaluations: scores.length,
      excludedLowest: scores[0],
      excludedHighest: scores[scores.length - 1],
      allScores: scores,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Select random jury members for a deliverable
 * Excludes students who created the project
 * @param {number} deliverableId - ID of deliverable
 * @param {number} jurySize - Number of jury members to select
 * @returns {Array} Array of selected jury members
 */
const selectRandomJury = async (deliverableId, jurySize = 5) => {
  try {
    const { Deliverable, Project } = require('../models');

    // Get the deliverable and its project
    const deliverable = await Deliverable.findByPk(deliverableId, {
      include: [{
        model: Project,
        as: 'project',
        attributes: ['userId'],
      }],
    });

    if (!deliverable) {
      throw new Error('Deliverable not found');
    }

    // Get all students except the project creator
    const availableJury = await User.findAll({
      where: {
        id: { [Op.ne]: deliverable.project.userId },
        role: 'student',
      },
      attributes: ['id'],
      limit: jurySize,
      order: sequelize.where(sequelize.fn('RAND'), sequelize.literal()),
    });

    return availableJury.map(u => u.id);
  } catch (error) {
    throw error;
  }
};

/**
 * Check if jury member can edit their evaluation
 * Allows editing within 24 hours of submission
 * @param {number} evaluationId - ID of evaluation
 * @returns {boolean} True if jury member can edit
 */
const canEditEvaluation = async (evaluationId) => {
  try {
    const evaluation = await Evaluation.findByPk(evaluationId);
    if (!evaluation) return false;

    const submittedTime = new Date(evaluation.updatedAt);
    const now = new Date();
    const hoursDifference = (now - submittedTime) / (1000 * 60 * 60);

    // Allow editing within 24 hours
    return hoursDifference < 24;
  } catch (error) {
    return false;
  }
};

module.exports = {
  calculateFinalGrade,
  selectRandomJury,
  canEditEvaluation,
};
