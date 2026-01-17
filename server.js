require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const gradingRoutes = require('./routes/gradingRoutes');
const professorRoutes = require('./routes/professorRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
    ];
    
    // Allow all Vercel preview and production deployments
    if (origin && origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', gradingRoutes);
app.use('/api/professor', professorRoutes);

/**
 * 404 Not Found handler
 */
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

/**
 * Initialize database and start server
 */
const startServer = async () => {
  try {
    // Test and sync database
    await testConnection();
    await sequelize.sync();
    console.log('Database synchronized successfully.');

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
