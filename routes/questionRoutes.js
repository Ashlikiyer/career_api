const express = require('express');
const router = express.Router();
const { getQuestions } = require('../controllers/questionController');

// Fetch all questions
router.get('/', getQuestions);

module.exports = router;