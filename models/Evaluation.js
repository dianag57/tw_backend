/**
 * Evaluation Model
 * Represents an anonymous grade submitted by a jury member
 */

const { DataTypes } = require('sequelize');

/**
 * Define Evaluation model
 * @param {Sequelize} sequelize - Database instance
 * @returns {Model} Evaluation model
 */
const Evaluation = (sequelize) => {
  const evaluation = sequelize.define('Evaluation', {
    // Evaluation identifier
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Jury assignment this evaluation is for
    juryAssignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'jury_assignments',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },

    // Anonymous grade (1-10 with up to 2 decimal places)
    score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
    },

    // Optional feedback comments
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Track when evaluation was submitted
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    // Track when evaluation was last modified
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    tableName: 'evaluations',
  });

  return evaluation;
};

module.exports = Evaluation;
