const express = require('express');
const router = express.Router();
const roadmapAssessmentController = require('../controllers/roadmapAssessmentController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/roadmap-assessment/:saved_career_id/progress
 * Get overall roadmap progress with assessment status
 */
router.get('/:saved_career_id/progress', roadmapAssessmentController.getRoadmapProgress);

/**
 * GET /api/roadmap-assessment/:saved_career_id/step/:step_number
 * Get assessment questions for a specific step
 * Validates sequential completion before allowing access
 */
router.get('/:saved_career_id/step/:step_number', roadmapAssessmentController.getStepAssessment);

/**
 * POST /api/roadmap-assessment/:saved_career_id/step/:step_number/submit
 * Submit assessment answers and get results
 * Marks step as complete if passed
 */
router.post('/:saved_career_id/step/:step_number/submit', roadmapAssessmentController.submitAssessment);

/**
 * GET /api/roadmap-assessment/:saved_career_id/step/:step_number/history
 * Get user's attempt history for a specific step assessment
 */
router.get('/:saved_career_id/step/:step_number/history', roadmapAssessmentController.getAssessmentHistory);

/**
 * POST /api/roadmap-assessment/admin/generate
 * Admin endpoint: Pre-generate all assessments for a specific career using AI
 * Body: { "career_name": "Data Scientist" }
 */
router.post('/admin/generate', roadmapAssessmentController.generateCareerAssessments);

module.exports = router;
