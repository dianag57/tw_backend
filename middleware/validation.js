/**
 * Input Validation Schema
 * Defines validation rules for user inputs using Joi
 */

const Joi = require('joi');

/**
 * User registration validation
 */
const registerSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(255)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .min(6)
    .required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required(),
  role: Joi.string()
    .valid('student', 'professor')
    .default('student'),
});

/**
 * User login validation
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .required(),
});

/**
 * Project creation validation
 */
const projectSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(255)
    .required(),
  description: Joi.string()
    .allow(''),
});

/**
 * Deliverable creation validation
 */
const deliverableSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(255)
    .required(),
  description: Joi.string()
    .allow(''),
  dueDate: Joi.date()
    .iso()
    .required(),
  videoUrl: Joi.string()
    .uri()
    .allow(null, ''),
  serverUrl: Joi.string()
    .uri()
    .allow(null, ''),
});

/**
 * Grade submission validation
 */
const evaluationSchema = Joi.object().keys({
  juryAssignmentId: Joi.number().required(),
  score: Joi.number()
    .min(1)
    .max(10)
    .required(),
  feedback: Joi.any()
    .optional()
    .default(''),
});

/**
 * Validation error handler
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error',
        details: error.details.map(d => d.message),
      });
    }
    req.validatedData = value;
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  projectSchema,
  deliverableSchema,
  evaluationSchema,
  validateRequest,
};
