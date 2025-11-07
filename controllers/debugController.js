const { user_feedback } = require('../models');
const { Sequelize } = require('sequelize');

// Debug endpoint to check feedback in database
const debugFeedback = async (req, res) => {
  try {
    const { user_id, roadmap_id } = req.query;

    console.log(`[Debug Feedback] Checking for user_id: ${user_id}, roadmap_id: ${roadmap_id}`);

    // Get all feedback for this roadmap
    const allRoadmapFeedback = await user_feedback.findAll({
      where: {
        roadmap_id: roadmap_id || { [Sequelize.Op.not]: null }
      },
      raw: true
    });

    console.log(`[Debug Feedback] All roadmap feedback:`, allRoadmapFeedback);

    // Get specific user feedback
    if (user_id && roadmap_id) {
      const specificFeedback = await user_feedback.findOne({
        where: {
          user_id: parseInt(user_id),
          roadmap_id: parseInt(roadmap_id),
          feedback_type: 'roadmap'
        },
        raw: true
      });

      console.log(`[Debug Feedback] Specific feedback found:`, specificFeedback);

      return res.json({
        query: { user_id, roadmap_id },
        specificFeedback,
        allRoadmapFeedback
      });
    }

    res.json({
      allRoadmapFeedback
    });

  } catch (error) {
    console.error('[Debug Feedback] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { debugFeedback };
