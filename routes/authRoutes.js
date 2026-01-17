/**
 * Authentication Routes
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, registerSchema, loginSchema } = require('../middleware/validation');
const {
  register,
  login,
  getProfile,
} = require('../controllers/authController');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validateRequest(registerSchema), register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validateRequest(loginSchema), login);

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
