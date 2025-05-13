const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getDefaultQuestion, getNextQuestion, restartQuiz } = require('../controllers/questionController');

// Fetch the default question (requires authentication)
router.get('/default', authMiddleware, getDefaultQuestion);

// Fetch the next question in the sequence
router.get('/next', authMiddleware, getNextQuestion);

// Restart the quiz
router.post('/restart', authMiddleware, restartQuiz);

module.exports = router;