const { SavedCareer } = require('../models');
const roadmapData = require('../careerdata/roadmapData.json'); // Roadmap data (currently placeholder)

const getRoadmap = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { saved_career_id } = req.params;

    // Verify the saved career belongs to the user
    const savedCareer = await SavedCareer.findOne({ where: { saved_career_id, user_id } });
    if (!savedCareer) {
      return res.status(404).json({ message: 'Saved career not found or unauthorized' });
    }

    // Fetch the roadmap from roadmapData.json
    const roadmap = roadmapData.careers[savedCareer.career_name]?.roadmap || [];
    if (roadmap.length === 0) {
      return res.status(404).json({ message: 'No roadmap available for this career' });
    }

    // Format roadmap to include more details
    const formattedRoadmap = roadmap.map((step, index) => ({
      roadmap_id: index + 1, // Temporary ID for response (not saved)
      saved_career_id,
      step_order: `Step ${step.step}`,
      step_description: `${step.title}: ${step.description}`,
      duration: step.duration, // Include duration from JSON
      resources: step.resources // Include resources from JSON
    }));

    res.json(formattedRoadmap);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
};

const deleteRoadmapStep = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { roadmap_id } = req.params;

    // Find the roadmap step (only relevant if we store roadmaps in the database later)
    const roadmapStep = await CareerRoadmap.findByPk(roadmap_id);
    if (!roadmapStep) {
      return res.status(404).json({ message: 'Roadmap step not found' });
    }

    // Verify the saved career belongs to the user
    const savedCareer = await SavedCareer.findOne({ where: { saved_career_id: roadmapStep.saved_career_id, user_id } });
    if (!savedCareer) {
      return res.status(403).json({ message: 'Unauthorized to delete this roadmap step' });
    }

    await roadmapStep.destroy();
    res.json({ message: 'Roadmap step deleted' });
  } catch (error) {
    console.error('Error deleting roadmap step:', error);
    res.status(500).json({ error: 'Failed to delete roadmap step' });
  }
};

module.exports = { getRoadmap, deleteRoadmapStep };