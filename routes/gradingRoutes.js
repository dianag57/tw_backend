/**
 * Grading and Jury Routes
 */

const express = require('express');
const { authenticateToken, requireStudent } = require('../middleware/auth');
const { validateRequest, evaluationSchema } = require('../middleware/validation');
const {
  getJuryAssignments,
  submitEvaluation,
  getEvaluation,
  selectJury,
  getFinalGrade,
} = require('../controllers/gradingController');

const router = express.Router();

// All grading routes require authentication
router.use(authenticateToken);

/**
 * GET /api/jury/assignments
 * Get jury assignments for current user
 */
router.get('/jury/assignments', requireStudent, getJuryAssignments);

/**
 * POST /api/evaluations
 * Submit or update evaluation
 */
router.post('/evaluations', requireStudent, submitEvaluation);

/**
 * GET /api/evaluations/:id
 * Get specific evaluation
 */
router.get('/evaluations/:id', requireStudent, getEvaluation);

/**
 * POST /api/deliverables/:deliverableId/select-jury
 * Select random jury members for deliverable
 */
router.post('/deliverables/:deliverableId/select-jury', requireStudent, selectJury);

/**
 * GET /api/deliverables/:id/grade
 * Get final grade for deliverable
 */
router.get('/deliverables/:id/grade', getFinalGrade);

module.exports = router;
