/**
 * Student Progress Routes
 * 
 * Protected routes for individual student progress tracking.
 * All data is scoped to the authenticated user only.
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const studentProgressController = require('../controllers/studentProgressController');

// All routes require authentication
router.use(auth);

/**
 * @route   GET /api/student/progress
 * @desc    Get complete student progress data (all careers)
 * @access  Private (authenticated user only)
 */
router.get('/progress', studentProgressController.getStudentProgress);

/**
 * @route   GET /api/student/progress/:savedCareerId
 * @desc    Get progress for a specific career
 * @access  Private (authenticated user only)
 */
router.get('/progress/:savedCareerId', studentProgressController.getCareerProgress);

/**
 * @route   GET /api/student/stats
 * @desc    Get learning statistics summary
 * @access  Private (authenticated user only)
 */
router.get('/stats', studentProgressController.getLearningStats);

module.exports = router;
