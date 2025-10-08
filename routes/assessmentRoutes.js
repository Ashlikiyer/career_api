const express = require('express');
const router = express.Router();
const { startAssessment, getNextQuestion, restartAssessment, getCurrentOrCreateAssessment } = require('../controllers/assessmentController');
const { submitAnswer } = require('../controllers/resultController');
const { getAssessmentStatus } = require('../controllers/statusController');
const authMiddleware = require('../middleware/auth');
const { validateAssessmentSession, ensureSession } = require('../middleware/assessmentValidation');
const { validateAssessmentDatabase } = require('../middleware/databaseValidation');

// Start a new assessment (creates assessment and returns first question)
router.get('/start', authMiddleware, ensureSession, startAssessment);

// Get the next question for an assessment (use database validation)
router.get('/next', authMiddleware, validateAssessmentDatabase, getNextQuestion);

// Submit an answer for a question (use database validation) 
router.post('/answer', authMiddleware, validateAssessmentDatabase, submitAnswer);

// Restart an assessment
router.post('/restart', authMiddleware, ensureSession, restartAssessment);

// Get assessment status
router.get('/status', authMiddleware, ensureSession, getAssessmentStatus);

// Get or create assessment (combines status check and start)
router.get('/current', authMiddleware, ensureSession, getCurrentOrCreateAssessment);

module.exports = router;