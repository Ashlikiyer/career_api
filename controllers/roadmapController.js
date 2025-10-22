const { SavedCareer, Roadmap, RoadmapStep } = require('../models');
const roadmapData = require('../careerdata/roadmapData.json'); // Roadmap data (fallback)

const getRoadmap = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { saved_career_id } = req.params;

    // Verify the saved career belongs to the user
    const savedCareer = await SavedCareer.findOne({ where: { saved_career_id, user_id } });
    if (!savedCareer) {
      return res.status(404).json({ message: 'Saved career not found or unauthorized' });
    }

    // Find the roadmap for this career
    const roadmap = await Roadmap.findOne({
      where: { career_name: savedCareer.career_name }
    });

    if (!roadmap) {
      return res.status(404).json({ message: 'No roadmap available for this career' });
    }

    // Get or create user-specific roadmap steps
    let userSteps = await RoadmapStep.findAll({
      where: { roadmap_id: roadmap.roadmap_id, user_id },
      order: [['step_number', 'ASC']]
    });

    // If user doesn't have steps yet, create them from JSON data
    if (userSteps.length === 0) {
      const jsonRoadmap = roadmapData.careers[savedCareer.career_name]?.roadmap || [];

      if (jsonRoadmap.length === 0) {
        return res.status(404).json({ message: 'No roadmap data available for this career' });
      }

      // Create roadmap steps for this user
      const stepsToCreate = jsonRoadmap.map((step, index) => ({
        roadmap_id: roadmap.roadmap_id,
        user_id,
        step_number: step.step,
        title: step.title,
        description: step.description,
        duration: step.duration,
        resources: step.resources || [],
        is_done: false,
      }));

      userSteps = await RoadmapStep.bulkCreate(stepsToCreate);
    }

    // Format response
    const formattedRoadmap = userSteps.map(step => ({
      step_id: step.step_id,
      roadmap_id: step.roadmap_id,
      step_number: step.step_number,
      title: step.title,
      description: step.description,
      duration: step.duration,
      resources: step.resources,
      is_done: step.is_done,
      completed_at: step.completed_at,
    }));

    res.json({
      career_name: savedCareer.career_name,
      roadmap_id: roadmap.roadmap_id,
      roadmap: formattedRoadmap,
      total_steps: formattedRoadmap.length,
      completed_steps: formattedRoadmap.filter(step => step.is_done).length,
    });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap', details: error.message });
  }
};

const updateStepProgress = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { step_id } = req.params;
    const { is_done } = req.body;

    if (typeof is_done !== 'boolean') {
      return res.status(400).json({ message: 'is_done must be a boolean value' });
    }

    // Find the roadmap step and verify ownership
    const step = await RoadmapStep.findOne({
      where: { step_id, user_id },
      include: [{
        model: Roadmap,
        as: 'roadmap'
      }]
    });

    if (!step) {
      return res.status(404).json({ message: 'Roadmap step not found or unauthorized' });
    }

    // Update the step progress
    const updateData = {
      is_done,
      updated_at: new Date(),
    };

    if (is_done && !step.is_done) {
      // Mark as completed
      updateData.completed_at = new Date();
    } else if (!is_done && step.is_done) {
      // Mark as incomplete
      updateData.completed_at = null;
    }

    await step.update(updateData);

    res.json({
      message: `Step ${is_done ? 'marked as completed' : 'marked as incomplete'}`,
      step: {
        step_id: step.step_id,
        step_number: step.step_number,
        title: step.title,
        is_done: step.is_done,
        completed_at: step.completed_at,
      }
    });
  } catch (error) {
    console.error('Error updating step progress:', error);
    res.status(500).json({ error: 'Failed to update step progress', details: error.message });
  }
};

const getRoadmapProgress = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { saved_career_id } = req.params;

    // Verify the saved career belongs to the user
    const savedCareer = await SavedCareer.findOne({ where: { saved_career_id, user_id } });
    if (!savedCareer) {
      return res.status(404).json({ message: 'Saved career not found or unauthorized' });
    }

    // Find the roadmap for this career
    const roadmap = await Roadmap.findOne({
      where: { career_name: savedCareer.career_name }
    });

    if (!roadmap) {
      return res.status(404).json({ message: 'No roadmap available for this career' });
    }

    // Get user's roadmap steps
    const userSteps = await RoadmapStep.findAll({
      where: { roadmap_id: roadmap.roadmap_id, user_id },
      order: [['step_number', 'ASC']]
    });

    const totalSteps = userSteps.length;
    const completedSteps = userSteps.filter(step => step.is_done).length;
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    res.json({
      career_name: savedCareer.career_name,
      roadmap_id: roadmap.roadmap_id,
      total_steps: totalSteps,
      completed_steps: completedSteps,
      progress_percentage: progressPercentage,
      steps: userSteps.map(step => ({
        step_id: step.step_id,
        step_number: step.step_number,
        title: step.title,
        is_done: step.is_done,
        completed_at: step.completed_at,
      }))
    });
  } catch (error) {
    console.error('Error fetching roadmap progress:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap progress', details: error.message });
  }
};

const deleteRoadmapStep = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { step_id } = req.params;

    // Find the roadmap step and verify ownership
    const step = await RoadmapStep.findOne({
      where: { step_id, user_id }
    });

    if (!step) {
      return res.status(404).json({ message: 'Roadmap step not found or unauthorized' });
    }

    await step.destroy();
    res.json({ message: 'Roadmap step deleted successfully' });
  } catch (error) {
    console.error('Error deleting roadmap step:', error);
    res.status(500).json({ error: 'Failed to delete roadmap step' });
  }
};

module.exports = {
  getRoadmap,
  updateStepProgress,
  getRoadmapProgress,
  deleteRoadmapStep
};