const { user_feedback, User, Assessment } = require('../models');

// Submit user feedback/rating for assessment experience
const submitFeedback = async (req, res) => {
  try {
    const { rating, feedback_text, assessment_id } = req.body;

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

    // Get user_id from session/token (if authenticated)
    const user_id = req.user?.user_id || null;

    // Create feedback record
    const feedbackData = {
      user_id,
      assessment_id: assessment_id || null,
      rating,
      feedback_text: feedback_text?.trim() || null
    };

    const feedback = await user_feedback.create(feedbackData);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: feedback.id,
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
    // Simple analytics - just get basic stats for now
    const totalFeedback = await user_feedback.count();

    // Get all feedback to calculate simple stats
    const allFeedback = await user_feedback.findAll({
      attributes: ['rating', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    // Calculate rating distribution
    const ratingStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    allFeedback.forEach(feedback => {
      ratingStats[feedback.rating] = (ratingStats[feedback.rating] || 0) + 1;
      totalRating += feedback.rating;
    });

    const averageRating = totalFeedback > 0 ? (totalRating / totalFeedback).toFixed(2) : '0.00';

    // Get recent feedback
    const recentFeedback = await user_feedback.findAll({
      where: {
        feedback_text: {
          [require('sequelize').Op.not]: null
        }
      },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalFeedback,
          averageRating,
          timeRange: req.query.timeRange || '30d'
        },
        ratingDistribution: ratingStats,
        recentFeedback: recentFeedback.map(item => ({
          id: item.id,
          rating: item.rating,
          feedback_text: item.feedback_text,
          created_at: item.created_at,
          user_email: 'Anonymous', // Simplified for now
          assessment_name: 'General Feedback'
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
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: userFeedback.map(item => ({
        id: item.id,
        rating: item.rating,
        feedback_text: item.feedback_text,
        created_at: item.created_at,
        assessment_name: item.assessment?.name || 'General Feedback'
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