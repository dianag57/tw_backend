const { Sequelize } = require('sequelize');
const path = require('path');

// Determine which database to use based on environment
let sequelize;

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) {
  // Production: Use PostgreSQL connection string
  try {
    console.log('Connecting to PostgreSQL database...');
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error.message);
    process.exit(1);
  }
} else {
  // Development: Use SQLite
  console.log('DATABASE_URL not set, using SQLite for development');
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
    console.error('Unable to connect to the database:', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
};
