const { user_feedback, User, Assessment, Roadmap } = require('../models');

// Submit user feedback/rating for assessment or roadmap experience
const submitFeedback = async (req, res) => {
  try {
    const { rating, feedback_text, assessment_id, roadmap_id, feedback_type } = req.body;

    // Validate required fields
    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // Validate feedback type
    const validTypes = ['assessment', 'roadmap'];
    const finalFeedbackType = feedback_type || 'assessment';

    if (!validTypes.includes(finalFeedbackType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback type. Must be "assessment" or "roadmap"'
      });
    }

    // Validate that appropriate ID is provided based on feedback type
    if (finalFeedbackType === 'assessment' && !assessment_id) {
      return res.status(400).json({
        success: false,
        message: 'assessment_id is required for assessment feedback'
      });
    }

    if (finalFeedbackType === 'roadmap' && !roadmap_id) {
      return res.status(400).json({
        success: false,
        message: 'roadmap_id is required for roadmap feedback'
      });
    }

    // Get user_id from session/token (if authenticated)
    const user_id = req.user?.user_id || null;

    // Create feedback record
    const feedbackData = {
      user_id,
      assessment_id: assessment_id || null,
      roadmap_id: roadmap_id || null,
      feedback_type: finalFeedbackType,
      rating,
      feedback_text: feedback_text?.trim() || null
    };

    const feedback = await user_feedback.create(feedbackData);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: feedback.id,
        feedback_type: feedback.feedback_type,
        rating: feedback.rating,
        feedback_text: feedback.feedback_text,
        created_at: feedback.created_at
      }
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get feedback analytics for admin dashboard
const getFeedbackAnalytics = async (req, res) => {
  try {
    // Get feedback counts by type
    const totalFeedback = await user_feedback.count();
    const assessmentFeedback = await user_feedback.count({
      where: { feedback_type: 'assessment' }
    });
    const roadmapFeedback = await user_feedback.count({
      where: { feedback_type: 'roadmap' }
    });

    // Get all feedback to calculate stats
    const allFeedback = await user_feedback.findAll({
      attributes: ['rating', 'feedback_type', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    // Calculate rating distribution by type
    const ratingStats = {
      overall: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      assessment: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      roadmap: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    let totalRating = 0;
    let assessmentRating = 0;
    let roadmapRating = 0;

    allFeedback.forEach(feedback => {
      ratingStats.overall[feedback.rating] = (ratingStats.overall[feedback.rating] || 0) + 1;
      ratingStats[feedback.feedback_type][feedback.rating] = (ratingStats[feedback.feedback_type][feedback.rating] || 0) + 1;

      totalRating += feedback.rating;
      if (feedback.feedback_type === 'assessment') {
        assessmentRating += feedback.rating;
      } else if (feedback.feedback_type === 'roadmap') {
        roadmapRating += feedback.rating;
      }
    });

    const averageRating = totalFeedback > 0 ? (totalRating / totalFeedback).toFixed(2) : '0.00';
    const assessmentAverage = assessmentFeedback > 0 ? (assessmentRating / assessmentFeedback).toFixed(2) : '0.00';
    const roadmapAverage = roadmapFeedback > 0 ? (roadmapRating / roadmapFeedback).toFixed(2) : '0.00';

    // Get recent feedback with type information
    const recentFeedback = await user_feedback.findAll({
      where: {
        feedback_text: {
          [require('sequelize').Op.not]: null
        }
      },
      include: [
        {
          model: Assessment,
          as: 'assessment',
          attributes: ['name'],
          required: false
        },
        {
          model: Roadmap,
          as: 'roadmap',
          attributes: ['career_name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalFeedback,
          assessmentFeedback,
          roadmapFeedback,
          averageRating,
          assessmentAverage,
          roadmapAverage,
          timeRange: req.query.timeRange || '30d'
        },
        ratingDistribution: ratingStats,
        recentFeedback: recentFeedback.map(item => ({
          id: item.id,
          feedback_type: item.feedback_type,
          rating: item.rating,
          feedback_text: item.feedback_text,
          created_at: item.created_at,
          user_email: 'Anonymous', // Simplified for now
          reference_name: item.feedback_type === 'assessment'
            ? (item.assessment?.name || 'General Assessment')
            : (item.roadmap?.career_name || 'General Roadmap')
        }))
      }
    });

  } catch (error) {
    console.error('Get feedback analytics error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback analytics',
      error: error.message
    });
  }
};

// Get user's own feedback history
const getUserFeedback = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userFeedback = await user_feedback.findAll({
      where: { user_id },
      include: [
        {
          model: Assessment,
          as: 'assessment',
          attributes: ['name'],
          required: false
        },
        {
          model: Roadmap,
          as: 'roadmap',
          attributes: ['career_name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: userFeedback.map(item => ({
        id: item.id,
        feedback_type: item.feedback_type,
        rating: item.rating,
        feedback_text: item.feedback_text,
        created_at: item.created_at,
        reference_name: item.feedback_type === 'assessment'
          ? (item.assessment?.name || 'General Assessment')
          : (item.roadmap?.career_name || 'General Roadmap')
      }))
    });

  } catch (error) {
    console.error('Get user feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  submitFeedback,
  getFeedbackAnalytics,
  getUserFeedback
};