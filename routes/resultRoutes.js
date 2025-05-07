const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { submitAssessment } = require('../controllers/resultController');

// Submit user answers and get career suggestion
router.post('/submit', authMiddleware, submitAssessment);

module.exports = router;