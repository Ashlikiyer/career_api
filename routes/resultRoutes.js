const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { submitAnswer } = require('../controllers/resultController');

// Submit an answer and get the next question or final result
router.post('/submit-answer', authMiddleware, submitAnswer);

module.exports = router;