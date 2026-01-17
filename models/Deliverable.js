/**
 * Deliverable Model
 * Represents a partial deliverable of a project with associated media links
 */

const { DataTypes } = require('sequelize');

/**
 * Define Deliverable model
 * @param {Sequelize} sequelize - Database instance
 * @returns {Model} Deliverable model
 */
const Deliverable = (sequelize) => {
  const deliverable = sequelize.define('Deliverable', {
    // Deliverable identifier
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Project this deliverable belongs to
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },

    // Deliverable title
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    // Deliverable description
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // URL to demonstration video
    videoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        customValidator(value) {
          // Only validate if value exists and is not empty
          if (value && value.trim().length > 0) {
            // Accept any URL-like pattern: http(s)://, www., or containing a dot
            if (!value.includes('.') && !value.startsWith('http://') && !value.startsWith('https://')) {
              throw new Error('videoUrl must contain a URL or domain name');
            }
          }
        },
      },
    },

    // URL to server or hosted project
    serverUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        customValidator(value) {
          // Only validate if value exists and is not empty
          if (value && value.trim().length > 0) {
            // Accept any URL-like pattern: http(s)://, www., or containing a dot
            if (!value.includes('.') && !value.startsWith('http://') && !value.startsWith('https://')) {
              throw new Error('serverUrl must contain a URL or domain name');
            }
          }
        },
      },
    },

    // Due date for this deliverable
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    // Deliverable status: 'pending', 'open_for_grading', 'grading_closed'
    status: {
      type: DataTypes.ENUM('pending', 'open_for_grading', 'grading_closed'),
      defaultValue: 'pending',
    },

    // Track when deliverable was created
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    // Track when deliverable was last updated
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    tableName: 'deliverables',
  });

  return deliverable;
};

module.exports = Deliverable;
