const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { saveCareer, getSavedCareers, deleteSavedCareer } = require('../controllers/savedCareerController');

// Save a career (requires authentication)
router.post('/', authMiddleware, saveCareer);

// Fetch all saved careers for the user (requires authentication)
router.get('/', authMiddleware, getSavedCareers);

// Delete a saved career (requires authentication)
router.delete('/:saved_career_id', authMiddleware, deleteSavedCareer);

module.exports = router;