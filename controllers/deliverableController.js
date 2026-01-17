const { Deliverable, Project } = require('../models');

/**
 * Create deliverable for a project
 * POST /api/projects/:projectId/deliverables
 */
const createDeliverable = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, dueDate, videoUrl, serverUrl } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!dueDate) {
      return res.status(400).json({ message: 'Due date is required' });
    }

    // Verify project exists and user is the creator
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.userId !== userId) {
      return res.status(403).json({ message: 'You cannot add deliverables to this project' });
    }

    const deliverable = await Deliverable.create({
      projectId,
      title: title.trim(),
      description: description || null,
      dueDate,
      videoUrl: videoUrl || null,
      serverUrl: serverUrl || null,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Deliverable created successfully',
      deliverable,
    });
  } catch (error) {
    console.error('Create deliverable error:', error);
    res.status(500).json({ message: error.message || 'Failed to create deliverable' });
  }
};

/**
 * Get deliverable details
 * GET /api/deliverables/:id
 */
const getDeliverable = async (req, res) => {
  try {
    const { id } = req.params;

    const deliverable = await Deliverable.findByPk(id, {
      include: [{
        model: Project,
        as: 'project',
        attributes: ['id', 'title', 'userId'],
      }],
    });

    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }

    res.json({ deliverable });
  } catch (error) {
    console.error('Get deliverable error:', error);
    res.status(500).json({ message: 'Failed to fetch deliverable' });
  }
};

/**
 * Update deliverable (add video/server URL)
 * PUT /api/deliverables/:id
 */
const updateDeliverable = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, serverUrl, dueDate } = req.body;
    const userId = req.user.id;

    const deliverable = await Deliverable.findByPk(id, {
      include: [{
        model: Project,
        as: 'project',
      }],
    });

    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }

    // Only project creator can update deliverable
    if (deliverable.project.userId !== userId) {
      return res.status(403).json({ message: 'You cannot update this deliverable' });
    }

    if (title) deliverable.title = title;
    if (description !== undefined) deliverable.description = description;
    if (videoUrl !== undefined) deliverable.videoUrl = videoUrl;
    if (serverUrl !== undefined) deliverable.serverUrl = serverUrl;
    if (dueDate) deliverable.dueDate = dueDate;

    await deliverable.save();

    res.json({
      message: 'Deliverable updated successfully',
      deliverable,
    });
  } catch (error) {
    console.error('Update deliverable error:', error);
    res.status(500).json({ message: 'Failed to update deliverable' });
  }
};

/**
 * Open deliverable for grading
 * POST /api/deliverables/:id/open-grading
 */
const openForGrading = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deliverable = await Deliverable.findByPk(id, {
      include: [{
        model: Project,
        as: 'project',
      }],
    });

    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }

    // Only project creator can open for grading
    if (deliverable.project.userId !== userId) {
      return res.status(403).json({ message: 'You cannot open this deliverable for grading' });
    }

    deliverable.status = 'open_for_grading';
    await deliverable.save();

    res.json({
      message: 'Deliverable opened for grading',
      deliverable,
    });
  } catch (error) {
    console.error('Open for grading error:', error);
    res.status(500).json({ message: 'Failed to open deliverable for grading' });
  }
};

/**
 * Close deliverable grading
 * POST /api/deliverables/:id/close-grading
 */
const closeGrading = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deliverable = await Deliverable.findByPk(id, {
      include: [{
        model: Project,
        as: 'project',
      }],
    });

    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }

    // Only project creator can close grading
    if (deliverable.project.userId !== userId) {
      return res.status(403).json({ message: 'You cannot close grading for this deliverable' });
    }

    deliverable.status = 'grading_closed';
    await deliverable.save();

    res.json({
      message: 'Deliverable grading closed',
      deliverable,
    });
  } catch (error) {
    console.error('Close grading error:', error);
    res.status(500).json({ message: 'Failed to close deliverable grading' });
  }
};

module.exports = {
  createDeliverable,
  getDeliverable,
  updateDeliverable,
  openForGrading,
  closeGrading,
};
