const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { saveCareer, getSavedCareers, deleteSavedCareer, getValidCareers } = require('../controllers/savedCareerController');

// Get list of valid career names (for debugging)
router.get('/valid-careers', getValidCareers);

// Save a career (requires authentication)
router.post('/', authMiddleware, saveCareer);

// Fetch all saved careers for the user (requires authentication)
router.get('/', authMiddleware, getSavedCareers);

// Delete a saved career (requires authentication)
router.delete('/:saved_career_id', authMiddleware, deleteSavedCareer);

module.exports = router;