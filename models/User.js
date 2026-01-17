/**
 * User Model
 * Represents students, jury members, and professors in the system
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * Define User model
 * @param {Sequelize} sequelize - Database instance
 * @returns {Model} User model
 */
const User = (sequelize) => {
  const user = sequelize.define('User', {
    // User identifier
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // User's full name
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    // User's email (unique identifier for login)
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    // User's password (hashed)
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    // User role: 'student', 'professor'
    role: {
      type: DataTypes.ENUM('student', 'professor'),
      defaultValue: 'student',
    },

    // Track when user was created
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    // Track when user was last updated
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    tableName: 'users',
  });

  /**
   * Hash password before saving to database
   */
  user.beforeCreate(async (user) => {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });

  /**
   * Validate password by comparing with hashed password
   * @param {string} password - Plain text password to validate
   * @returns {boolean} True if password matches
   */
  user.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  return user;
};

module.exports = User;
