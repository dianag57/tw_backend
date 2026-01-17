const { Project, Deliverable, User } = require('../models');

/**
 * Create a new project
 * POST /api/projects
 */
const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    const project = await Project.create({
      title,
      description,
      userId,
      status: 'draft',
    });

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt,
      },
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
};

/**
 * Get user's projects
 * GET /api/projects
 */
const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await Project.findAll({
      where: { userId },
      include: [{
        model: Deliverable,
        as: 'Deliverables',
        attributes: ['id', 'title', 'description', 'dueDate', 'status', 'videoUrl', 'serverUrl'],
        include: [{
          model: require('../models').JuryAssignment,
          as: 'JuryAssignments',
          attributes: ['id'],
        }],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

/**
 * Get single project details
 * GET /api/projects/:id
 */
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findByPk(id, {
      include: [{
        model: Deliverable,
        as: 'Deliverables',
      }, {
        model: User,
        as: 'creator',
        attributes: ['id', 'fullName', 'email'],
      }],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only allow project creator to view full details
    if (project.userId !== userId) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

/**
 * Update project
 * PUT /api/projects/:id
 */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = req.user.id;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project creator can update
    if (project.userId !== userId) {
      return res.status(403).json({ message: 'You cannot update this project' });
    }

    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;

    await project.save();

    res.json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
};

/**
 * Activate project (change status to active)
 * POST /api/projects/:id/activate
 */
const activateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.userId !== userId) {
      return res.status(403).json({ message: 'You cannot activate this project' });
    }

    project.status = 'active';
    await project.save();

    res.json({
      message: 'Project activated successfully',
      project,
    });
  } catch (error) {
    console.error('Activate project error:', error);
    res.status(500).json({ message: 'Failed to activate project' });
  }
};

/**
 * Delete project
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project creator can delete
    if (project.userId !== userId) {
      return res.status(403).json({ message: 'You cannot delete this project' });
    }

    // Delete associated deliverables first
    await Deliverable.destroy({
      where: { projectId: id },
    });

    // Delete the project
    await project.destroy();

    res.json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
};

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  activateProject,
  deleteProject,
};
