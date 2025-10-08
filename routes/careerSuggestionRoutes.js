const express = require('express');
const router = express.Router();
const { getCareerSuggestions, getCareerDetails } = require('../controllers/careerSuggestionController');
const authMiddleware = require('../middleware/auth');

// Get multiple career suggestions for a completed assessment
router.get('/:assessment_id', authMiddleware, getCareerSuggestions);

// Get detailed information about a specific career suggestion
router.get('/:assessment_id/career/:career_name', authMiddleware, getCareerDetails);

module.exports = router;