const { SavedCareer, CareerRoadmap } = require('../models');
const expandedCareerData = require('../careerdata/expandedCareerMapping.json');
const roadmapData = require('../careerdata/roadmapData.json');

// List of valid career names from expandedCareerMapping.json
const validCareers = expandedCareerData.careers.map(career => career.career_name);

const saveCareer = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { career_name } = req.body;

    // Validate career_name
    if (!career_name || !validCareers.includes(career_name)) {
      return res.status(400).json({ message: `Invalid career name. Must be one of: ${validCareers.join(', ')}` });
    }

    // Check if the career is already saved
    const existingCareer = await SavedCareer.findOne({ where: { user_id, career_name } });
    if (existingCareer) {
      return res.status(400).json({ message: 'Career already saved' });
    }

    const savedCareer = await SavedCareer.create({
      user_id,
      career_name,
      saved_at: new Date().toISOString(), // Store as ISO string since saved_at is a STRING
    });

    // AUTO-GENERATE ROADMAP: Automatically create roadmap when career is saved
    try {
      const careerRoadmapData = roadmapData.careers[career_name]?.roadmap || [];
      
      if (careerRoadmapData.length > 0) {
        // Create roadmap entries in the database
        const roadmapEntries = careerRoadmapData.map((step, index) => ({
          saved_career_id: savedCareer.saved_career_id,
          step_order: `Step ${step.step}`,
          step_descriptions: `${step.title}: ${step.description}`
        }));

        await CareerRoadmap.bulkCreate(roadmapEntries);
        
        res.status(201).json({ 
          message: 'Career saved and roadmap generated automatically', 
          savedCareer,
          roadmapGenerated: true,
          roadmapSteps: careerRoadmapData.length
        });
      } else {
        res.status(201).json({ 
          message: 'Career saved (no roadmap data available)', 
          savedCareer,
          roadmapGenerated: false 
        });
      }
    } catch (roadmapError) {
      console.error('Error auto-generating roadmap:', roadmapError);
      // Career was saved successfully, but roadmap generation failed
      res.status(201).json({ 
        message: 'Career saved, but roadmap generation failed', 
        savedCareer,
        roadmapGenerated: false,
        roadmapError: roadmapError.message
      });
    }
  } catch (error) {
    console.error('Error saving career:', error);
    res.status(500).json({ error: 'Failed to save career' });
  }
};

const getSavedCareers = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const savedCareers = await SavedCareer.findAll({ where: { user_id } });

    res.json(savedCareers);
  } catch (error) {
    console.error('Error fetching saved careers:', error);
    res.status(500).json({ error: 'Failed to fetch saved careers' });
  }
};

const deleteSavedCareer = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { saved_career_id } = req.params;

    const savedCareer = await SavedCareer.findOne({ where: { saved_career_id, user_id } });
    if (!savedCareer) {
      return res.status(404).json({ message: 'Saved career not found' });
    }

    // Delete associated roadmap entries first (if any)
    const deletedRoadmapCount = await CareerRoadmap.destroy({ 
      where: { saved_career_id } 
    });

    // Delete the saved career
    await savedCareer.destroy();
    
    res.json({ 
      message: 'Saved career and associated roadmap deleted',
      roadmapStepsDeleted: deletedRoadmapCount
    });
  } catch (error) {
    console.error('Error deleting saved career:', error);
    res.status(500).json({ error: 'Failed to delete saved career' });
  }
};

const getValidCareers = async (req, res) => {
  try {
    res.json({ 
      message: 'List of valid career names',
      valid_careers: validCareers,
      total_count: validCareers.length 
    });
  } catch (error) {
    console.error('Error getting valid careers:', error);
    res.status(500).json({ error: 'Failed to get valid careers' });
  }
};

module.exports = { saveCareer, getSavedCareers, deleteSavedCareer, getValidCareers };