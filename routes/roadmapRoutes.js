const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getRoadmap,
  updateStepProgress,
  getRoadmapProgress,
  deleteRoadmapStep
} = require('../controllers/roadmapController');

// Fetch the roadmap for a saved career (requires authentication)
router.get('/:saved_career_id', authMiddleware, getRoadmap);

// Get roadmap progress summary for a saved career (requires authentication)
router.get('/:saved_career_id/progress', authMiddleware, getRoadmapProgress);

// Update step progress (mark as done/not done) (requires authentication)
router.put('/step/:step_id/progress', authMiddleware, updateStepProgress);

// Delete a specific roadmap step (requires authentication)
router.delete('/step/:step_id', authMiddleware, deleteRoadmapStep);

module.exports = router;