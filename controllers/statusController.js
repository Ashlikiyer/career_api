const getAssessmentStatus = async (req, res) => {
  try {
    console.log('Assessment status check:', {
      sessionId: req.sessionID,
      userId: req.user?.id,
      sessionAssessmentId: req.session?.assessment_id,
      hasSession: !!req.session,
      sessionKeys: req.session ? Object.keys(req.session) : 'no session'
    });

    if (!req.session || !req.session.assessment_id) {
      return res.json({
        hasActiveAssessment: false,
        message: 'No active assessment found',
        debug: {
          hasSession: !!req.session,
          sessionId: req.sessionID,
          assessmentId: req.session?.assessment_id
        }
      });
    }

    const { Assessment } = require('../models');
    const assessment = await Assessment.findByPk(req.session.assessment_id);
    
    if (!assessment) {
      // Clear invalid session data
      req.session.assessment_id = null;
      req.session.currentCareer = null;
      req.session.currentConfidence = null;
      req.session.careerHistory = null;
      
      return res.json({
        hasActiveAssessment: false,
        message: 'Assessment not found in database'
      });
    }

    res.json({
      hasActiveAssessment: true,
      assessment_id: assessment.assessment_id,
      currentCareer: assessment.current_career,
      currentConfidence: assessment.current_confidence,
      message: 'Active assessment found',
      debug: {
        sessionId: req.sessionID,
        assessmentId: assessment.assessment_id
      }
    });
  } catch (error) {
    console.error('Error checking assessment status:', error);
    res.status(500).json({ error: 'Failed to check assessment status' });
  }
};

module.exports = { getAssessmentStatus };
