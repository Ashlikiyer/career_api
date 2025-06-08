const express = require('express');
const router = express.Router();
const { startAssessment, getNextQuestion, restartAssessment } = require('../controllers/assessmentController');
const { submitAnswer } = require('../controllers/resultController');
const authMiddleware = require('../middleware/auth');

// Start a new assessment (creates assessment and returns first question)
router.get('/start', authMiddleware, startAssessment);

// Get the next question for an assessment
router.get('/next', authMiddleware, getNextQuestion);

// Submit an answer for a question
router.post('/answer', authMiddleware, submitAnswer);

// Restart an assessment
router.post('/restart', authMiddleware, restartAssessment);

module.exports = router;