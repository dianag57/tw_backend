/**
 * Project Routes
 */

const express = require('express');
const { authenticateToken, requireStudent } = require('../middleware/auth');
const { validateRequest, projectSchema, deliverableSchema } = require('../middleware/validation');
const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  activateProject,
  deleteProject,
} = require('../controllers/projectController');
const {
  createDeliverable,
  getDeliverable,
  updateDeliverable,
  openForGrading,
  closeGrading,
} = require('../controllers/deliverableController');

const router = express.Router();

// All project routes require authentication and student role
router.use(authenticateToken, requireStudent);

/**
 * POST /api/projects
 * Create new project
 */
router.post('/', createProject);

/**
 * GET /api/projects
 * Get all user's projects
 */
router.get('/', getUserProjects);

/**
 * GET /api/projects/:id
 * Get specific project
 */
router.get('/:id', getProjectById);

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put('/:id', updateProject);

/**
 * DELETE /api/projects/:id
 * Delete project
 */
router.delete('/:id', deleteProject);

/**
 * POST /api/projects/:id/activate
 * Activate project
 */
router.post('/:id/activate', activateProject);

/**
 * POST /api/projects/:projectId/deliverables
 * Create new deliverable for project
 */
router.post('/:projectId/deliverables', createDeliverable);

/**
 * GET /api/deliverables/:id
 * Get deliverable details
 */
router.get('/deliverables/:id', getDeliverable);

/**
 * PUT /api/deliverables/:id
 * Update deliverable
 */
router.put('/deliverables/:id', updateDeliverable);

/**
 * POST /api/deliverables/:id/open-grading
 * Open deliverable for grading
 */
router.post('/deliverables/:id/open-grading', openForGrading);

/**
 * POST /api/deliverables/:id/close-grading
 * Close deliverable grading
 */
router.post('/deliverables/:id/close-grading', closeGrading);

module.exports = router;
