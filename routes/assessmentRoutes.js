const express = require('express');
const router = express.Router();
const { createAssessment, getAssessment, updateAssessment, deleteAssessment, getAllAssessments } = require('../controllers/assessmentController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createAssessment);
router.get('/:assessmentId', authMiddleware, getAssessment);
router.put('/:assessmentId', authMiddleware, updateAssessment);
router.delete('/:assessmentId', authMiddleware, deleteAssessment);
router.get('/', authMiddleware, getAllAssessments);

module.exports = router;