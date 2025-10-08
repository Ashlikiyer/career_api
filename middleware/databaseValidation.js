// Alternative assessment validation that uses database instead of sessions
const validateAssessmentDatabase = async (req, res, next) => {
  const { assessment_id } = req.body || req.query;
  
  if (!assessment_id) {
    return res.status(400).json({ 
      error: 'Assessment ID is required' 
    });
  }

  try {
    const { Assessment } = require('../models');
    
    // Check if assessment exists and belongs to the user
    const assessment = await Assessment.findOne({
      where: {
        assessment_id: parseInt(assessment_id)
      }
    });

    if (!assessment) {
      return res.status(400).json({ 
        error: 'Invalid assessment ID. Assessment not found.',
        code: 'INVALID_ASSESSMENT_SESSION'
      });
    }

    // Store assessment in request for later use
    req.currentAssessment = assessment;
    
    console.log('Database validation passed for assessment:', assessment_id);
    next();
    
  } catch (error) {
    console.error('Database assessment validation error:', error);
    res.status(500).json({ error: 'Assessment validation failed' });
  }
};

module.exports = {
  validateAssessmentDatabase
};