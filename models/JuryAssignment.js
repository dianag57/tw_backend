/**
 * Jury Assignment Model
 * Represents the assignment of jury members to projects
 */

const { DataTypes } = require('sequelize');

/**
 * Define JuryAssignment model
 * @param {Sequelize} sequelize - Database instance
 * @returns {Model} JuryAssignment model
 */
const JuryAssignment = (sequelize) => {
  const juryAssignment = sequelize.define('JuryAssignment', {
    // Assignment identifier
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Deliverable being graded
    deliverableId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'deliverables',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },

    // Jury member (student) assigned to grade
    juryMemberId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },

    // Status: 'assigned', 'submitted', 'withdrawn'
    status: {
      type: DataTypes.ENUM('assigned', 'submitted', 'withdrawn'),
      defaultValue: 'assigned',
    },

    // Track when assignment was created
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    // Track when assignment was last updated
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    tableName: 'jury_assignments',
  });

  return juryAssignment;
};

module.exports = JuryAssignment;
