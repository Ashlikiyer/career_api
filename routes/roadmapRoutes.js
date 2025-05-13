const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getRoadmap, generateRoadmap, deleteRoadmapStep } = require('../controllers/roadmapController');

// Fetch the roadmap for a saved career (requires authentication)
router.get('/:saved_career_id', authMiddleware, getRoadmap);

// Generate a new roadmap for a saved career (requires authentication)
router.post('/:saved_career_id/generate', authMiddleware, generateRoadmap);

// Delete a specific roadmap step (requires authentication)
router.delete('/:roadmap_id', authMiddleware, deleteRoadmapStep);

module.exports = router;