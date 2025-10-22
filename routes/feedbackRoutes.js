const express = require('express');
const {
  submitFeedback,
  getFeedbackAnalytics,
  getUserFeedback
} = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public route - Submit feedback (allows anonymous feedback)
router.post('/', submitFeedback);

// Protected routes - Require authentication
router.get('/user', authMiddleware, getUserFeedback);

// Admin/Analytics route - For now, no special admin auth, but requires user auth
// In the future, you might want to add admin middleware here
router.get('/analytics', getFeedbackAnalytics);

module.exports = router;