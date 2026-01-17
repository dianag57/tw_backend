/**
 * Project Model
 * Represents a student project that will be graded
 */

const { DataTypes } = require('sequelize');

/**
 * Define Project model
 * @param {Sequelize} sequelize - Database instance
 * @returns {Model} Project model
 */
const Project = (sequelize) => {
  const project = sequelize.define('Project', {
    // Project identifier
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Project title
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    // Project description
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // User (student) who created the project
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },

    // Project status: 'draft', 'active', 'completed'
    status: {
      type: DataTypes.ENUM('draft', 'active', 'completed'),
      defaultValue: 'draft',
    },

    // Track when project was created
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    // Track when project was last updated
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    tableName: 'projects',
  });

  return project;
};

module.exports = Project;
