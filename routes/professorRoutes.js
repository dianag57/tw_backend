/**
 * Professor Routes
 */

const express = require('express');
const { authenticateToken, requireProfessor } = require('../middleware/auth');
const {
  getAllProjects,
  getProjectEvaluations,
  getDeliverableStats,
} = require('../controllers/professorController');

const router = express.Router();

// All professor routes require authentication and professor role
router.use(authenticateToken, requireProfessor);

/**
 * GET /api/professor/projects
 * Get all projects for review
 */
router.get('/projects', getAllProjects);

/**
 * GET /api/professor/projects/:projectId/evaluations
 * Get evaluations for specific project (anonymous)
 */
router.get('/projects/:projectId/evaluations', getProjectEvaluations);

/**
 * GET /api/professor/deliverables/:deliverableId/stats
 * Get statistics for deliverable
 */
router.get('/deliverables/:deliverableId/stats', getDeliverableStats);

module.exports = router;
