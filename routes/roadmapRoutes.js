const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getRoadmap,
  updateStepProgress,
  getRoadmapProgress,
  deleteRoadmapStep
} = require('../controllers/roadmapController');
const {
  startStep,
  recordTimeSpent,
  getStepTimeStats,
  getRoadmapTimeStats,
  getDifficultyTimeStats
} = require('../controllers/timeTrackingController');

// Fetch the roadmap for a saved career (requires authentication)
router.get('/:saved_career_id', authMiddleware, getRoadmap);

// Get roadmap progress summary for a saved career (requires authentication)
router.get('/:saved_career_id/progress', authMiddleware, getRoadmapProgress);

// Get roadmap time tracking statistics (requires authentication)
router.get('/:saved_career_id/time-stats', authMiddleware, getRoadmapTimeStats);

// Get time statistics by difficulty level (requires authentication)
router.get('/:saved_career_id/difficulty-stats', authMiddleware, getDifficultyTimeStats);

// Update step progress (mark as done/not done) (requires authentication)
router.put('/step/:step_id/progress', authMiddleware, updateStepProgress);

// Start tracking time for a step (requires authentication)
router.post('/step/:step_id/start', authMiddleware, startStep);

// Record time spent on a step (requires authentication)
router.put('/step/:step_id/time', authMiddleware, recordTimeSpent);

// Get time statistics for a specific step (requires authentication)
router.get('/step/:step_id/time-stats', authMiddleware, getStepTimeStats);

// Delete a specific roadmap step (requires authentication)
router.delete('/step/:step_id', authMiddleware, deleteRoadmapStep);

module.exports = router;