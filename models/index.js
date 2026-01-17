/**
 * Index for all models
 * Initializes and associates all database models
 */

const { sequelize } = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Deliverable = require('./Deliverable');
const JuryAssignment = require('./JuryAssignment');
const Evaluation = require('./Evaluation');

// Initialize models
const UserModel = User(sequelize);
const ProjectModel = Project(sequelize);
const DeliverableModel = Deliverable(sequelize);
const JuryAssignmentModel = JuryAssignment(sequelize);
const EvaluationModel = Evaluation(sequelize);

// Define associations (relationships between models)

/**
 * User -> Project (One-to-Many)
 * A user can create many projects
 */
UserModel.hasMany(ProjectModel, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
ProjectModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  as: 'creator',
});

/**
 * Project -> Deliverable (One-to-Many)
 * A project can have many deliverables
 */
ProjectModel.hasMany(DeliverableModel, {
  foreignKey: 'projectId',
  onDelete: 'CASCADE',
});
DeliverableModel.belongsTo(ProjectModel, {
  foreignKey: 'projectId',
  as: 'project',
});

/**
 * Deliverable -> JuryAssignment (One-to-Many)
 * A deliverable can have many jury assignments
 */
DeliverableModel.hasMany(JuryAssignmentModel, {
  foreignKey: 'deliverableId',
  onDelete: 'CASCADE',
});
JuryAssignmentModel.belongsTo(DeliverableModel, {
  foreignKey: 'deliverableId',
  as: 'deliverable',
});

/**
 * User -> JuryAssignment (One-to-Many)
 * A user can be assigned to many jury roles
 */
UserModel.hasMany(JuryAssignmentModel, {
  foreignKey: 'juryMemberId',
  onDelete: 'CASCADE',
});
JuryAssignmentModel.belongsTo(UserModel, {
  foreignKey: 'juryMemberId',
  as: 'juryMember',
});

/**
 * JuryAssignment -> Evaluation (One-to-One)
 * Each jury assignment has one evaluation
 */
JuryAssignmentModel.hasOne(EvaluationModel, {
  foreignKey: 'juryAssignmentId',
  onDelete: 'CASCADE',
});
EvaluationModel.belongsTo(JuryAssignmentModel, {
  foreignKey: 'juryAssignmentId',
  as: 'assignment',
});

module.exports = {
  sequelize,
  User: UserModel,
  Project: ProjectModel,
  Deliverable: DeliverableModel,
  JuryAssignment: JuryAssignmentModel,
  Evaluation: EvaluationModel,
};
