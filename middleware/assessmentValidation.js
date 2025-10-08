const validateAssessmentSession = (req, res, next) => {
  const { assessment_id } = req.body || req.query;
  
  console.log('=== ASSESSMENT SESSION VALIDATION ===');
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Session ID:', req.sessionID);
  console.log('Has Session:', !!req.session);
  console.log('Session Keys:', req.session ? Object.keys(req.session) : 'no session');
  console.log('Session Assessment ID:', req.session?.assessment_id);
  console.log('Request Assessment ID:', assessment_id);
  console.log('Cookies Present:', !!req.headers.cookie);
  console.log('Cookie Header:', req.headers.cookie);
  console.log('=====================================');
  
  if (!assessment_id) {
    console.error('VALIDATION FAILED: No assessment_id provided');
    return res.status(400).json({ 
      error: 'Assessment ID is required' 
    });
  }

  if (!req.session) {
    console.error('VALIDATION FAILED: No session found');
    return res.status(400).json({ 
      error: 'Session not found. Please start a new assessment.',
      debug: {
        sessionID: req.sessionID,
        hasCookies: !!req.headers.cookie
      }
    });
  }

  const sessionAssessmentId = parseInt(req.session.assessment_id);
  const requestAssessmentId = parseInt(assessment_id);

  if (!sessionAssessmentId || sessionAssessmentId !== requestAssessmentId) {
    console.error('VALIDATION FAILED: Assessment ID mismatch');
    console.error('Session Assessment ID:', sessionAssessmentId);
    console.error('Request Assessment ID:', requestAssessmentId);
    console.error('Full Session Object:', JSON.stringify(req.session, null, 2));
    
    return res.status(400).json({ 
      error: 'Invalid assessment session. Please start a new assessment.',
      code: 'INVALID_ASSESSMENT_SESSION',
      debug: {
        sessionAssessmentId,
        requestAssessmentId,
        sessionID: req.sessionID
      }
    });
  }

  console.log('VALIDATION PASSED: Assessment session is valid');
  next();
};

const ensureSession = (req, res, next) => {
  if (!req.session) {
    console.error('Session middleware not working properly');
    return res.status(500).json({ 
      error: 'Session not initialized. Please try again.' 
    });
  }
  next();
};

module.exports = {
  validateAssessmentSession,
  ensureSession
};
