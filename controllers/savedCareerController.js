const { SavedCareer } = require('../models');
const careerData = require('../careerdata/careerMapping.json');

// List of valid career names from careerMapping.json
const validCareers = careerData.careers.map(career => career.career_name);

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

    res.status(201).json({ message: 'Career saved', savedCareer });
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

    await savedCareer.destroy();
    res.json({ message: 'Saved career deleted' });
  } catch (error) {
    console.error('Error deleting saved career:', error);
    res.status(500).json({ error: 'Failed to delete saved career' });
  }
};

module.exports = { saveCareer, getSavedCareers, deleteSavedCareer };