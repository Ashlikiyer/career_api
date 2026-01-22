/**
 * Admin Routes
 * 
 * Protected routes for admin users only.
 * Provides access to analytics dashboard data.
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const adminAnalyticsController = require('../controllers/adminAnalyticsController');

// All routes require authentication + admin authorization
router.use(auth);
router.use(adminAuth);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get all analytics data (combined endpoint)
 * @access  Admin only
 */
router.get('/analytics', adminAnalyticsController.getAllAnalytics);

/**
 * @route   GET /api/admin/analytics/overview
 * @desc    Get overview statistics (total users, roadmaps, completion rates)
 * @access  Admin only
 */
router.get('/analytics/overview', adminAnalyticsController.getOverviewStats);

/**
 * @route   GET /api/admin/analytics/time
 * @desc    Get time analytics (time per step, per difficulty)
 * @access  Admin only
 */
router.get('/analytics/time', adminAnalyticsController.getTimeAnalytics);

/**
 * @route   GET /api/admin/analytics/assessments
 * @desc    Get assessment analytics (pass rates, scores, retakes)
 * @access  Admin only
 */
router.get('/analytics/assessments', adminAnalyticsController.getAssessmentAnalytics);

/**
 * @route   GET /api/admin/analytics/dropoff
 * @desc    Get dropoff analytics (where users abandon roadmap)
 * @access  Admin only
 */
router.get('/analytics/dropoff', adminAnalyticsController.getDropoffAnalytics);

/**
 * @route   GET /api/admin/analytics/difficulty
 * @desc    Get difficulty analytics (completion by difficulty level)
 * @access  Admin only
 */
router.get('/analytics/difficulty', adminAnalyticsController.getDifficultyAnalytics);

/**
 * @route   GET /api/admin/analytics/careers
 * @desc    Get career analytics (popular careers, completion by career)
 * @access  Admin only
 */
router.get('/analytics/careers', adminAnalyticsController.getCareerAnalytics);

module.exports = router;
