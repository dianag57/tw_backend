const { Sequelize } = require('sequelize');
const path = require('path');

// Determine which database to use based on environment
let sequelize;

if (process.env.DATABASE_URL) {
  // Production: Use PostgreSQL connection string
  console.log('Using PostgreSQL database from DATABASE_URL');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // Development: Use SQLite
  console.log('Using SQLite database');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false,
  });
}

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
};
