'use strict';

const { Assessment, Question } = require('../models');
const questionsData = require('../careerdata/questions.json');

const startAssessment = async (req, res) => {
  try {
    console.log('Starting assessment debug:', {
      userId: req.user?.id,
      sessionID: req.sessionID,
      hasSession: !!req.session,
      currentAssessmentId: req.session?.assessment_id,
      sessionKeys: req.session ? Object.keys(req.session) : 'no session',
      cookies: req.headers.cookie
    });
    
    if (!req.session) {
      console.error('Session not initialized');
      throw new Error('Session not initialized');
    }

    // Always start fresh assessment - clear any existing data
    if (req.session.assessment_id) {
      console.log('Found existing assessment, cleaning up old data:', {
        old_assessment_id: req.session.assessment_id,
        session_id: req.sessionID
      });
    }

    // Clear previous assessment data from session
    req.session.currentCareer = null;
    req.session.currentConfidence = null;
    req.session.assessment_id = null;
    req.session.careerHistory = null;

    // Create a completely fresh assessment with clean state
    const assessment = await Assessment.create({
      name: `Assessment_${Date.now()}_User_${req.user?.id}`,
      current_career: null,
      current_confidence: 0,
      career_history: JSON.stringify({})
    });
    
    req.session.assessment_id = assessment.assessment_id;
    
    // Force session save and wait for it
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          reject(err);
        } else {
          console.log('Session saved successfully');
          resolve();
        }
      });
    });
    
    console.log('Assessment created and session updated:', {
      assessment_id: assessment.assessment_id,
      user_id: req.user?.id,
      session_id: req.sessionID,
      session_assessment_id: req.session.assessment_id
    });

    // Get the first question from database to include descriptions
    const firstQuestion = await Question.findOne({
      where: { question_id: 1 }
    });

    if (!firstQuestion) {
      throw new Error('First question not found in database');
    }

    res.json({
      ...firstQuestion.toJSON(),
      assessment_id: assessment.assessment_id,
      question_id: 1,
    });
  } catch (error) {
    console.error('Error in startAssessment:', error);
    res.status(500).json({ error: 'Failed to start assessment', details: error.message });
  }
};

const getNextQuestion = async (req, res) => {
  const { currentQuestionId, assessment_id } = req.query;
  try {
    const nextQuestionId = parseInt(currentQuestionId) + 1;
    const nextQuestion = await Question.findOne({
      where: {
        question_id: nextQuestionId,
      },
    });

    if (nextQuestion) {
      console.log('Next question found:', {
        question_id: nextQuestion.question_id,
        assessment_id,
        user_id: req.user?.id
      });
      
      res.json({
        ...nextQuestion.toJSON(),
        assessment_id,
      });
    } else {
      console.log('No more questions available for assessment:', assessment_id);
      res.status(404).json({ message: 'No more questions available' });
    }
  } catch (error) {
    console.error('Error in getNextQuestion:', error);
    res.status(500).json({ error: 'Failed to fetch next question', details: error.message });
  }
};

const restartAssessment = async (req, res) => {
  try {
    console.log('Restarting assessment for user:', req.user?.id, 'Session ID:', req.sessionID);
    
    if (!req.session) {
      console.error('Session not initialized for restart');
      throw new Error('Session not initialized');
    }

    // Clear all previous assessment data
    req.session.currentCareer = null;
    req.session.currentConfidence = null;
    req.session.assessment_id = null;
    req.session.careerHistory = null;

    const assessment = await Assessment.create({
      name: `Assessment_${Date.now()}_User_${req.user?.id}_Restart`,
    });
    req.session.assessment_id = assessment.assessment_id;
    
    console.log('Assessment restarted:', {
      assessment_id: assessment.assessment_id,
      user_id: req.user?.id,
      session_id: req.sessionID
    });

    res.json({
      message: 'Assessment restarted',
      nextQuestionId: 1,
      assessment_id: assessment.assessment_id,
    });
  } catch (error) {
    console.error('Error in restartAssessment:', error);
    res.status(500).json({ error: 'Failed to restart assessment', details: error.message });
  }
};

const getCurrentOrCreateAssessment = async (req, res) => {
  try {
    console.log('Get current or create assessment:', {
      userId: req.user?.id,
      sessionID: req.sessionID,
      hasSession: !!req.session,
      currentAssessmentId: req.session?.assessment_id
    });
    
    if (!req.session) {
      return res.status(500).json({ error: 'Session not initialized' });
    }

    // Check if there's already an active assessment
    if (req.session.assessment_id) {
      const existingAssessment = await Assessment.findByPk(req.session.assessment_id);
      if (existingAssessment) {
        console.log('Found existing assessment:', {
          assessment_id: existingAssessment.assessment_id,
          session_id: req.sessionID
        });
        
        // Get the first question from database to include descriptions
        const firstQuestion = await Question.findOne({
          where: { question_id: 1 }
        });

        return res.json({
          ...firstQuestion.toJSON(),
          assessment_id: existingAssessment.assessment_id,
          question_id: 1,
          isExisting: true,
          currentCareer: existingAssessment.current_career,
          currentConfidence: existingAssessment.current_confidence
        });
      }
    }

    // Create new assessment if none exists

    const assessment = await Assessment.create({
      name: `Assessment_${Date.now()}_User_${req.user?.id}`,
    });
    
    // Assessment is now stored in database, no need for session
    
    console.log('Created new assessment:', {
      assessment_id: assessment.assessment_id,
      user_id: req.user?.id,
      session_id: req.sessionID
    });

    // Get the first question from database to include descriptions
    const firstQuestion = await Question.findOne({
      where: { question_id: 1 }
    });

    res.json({
      ...firstQuestion.toJSON(),
      assessment_id: assessment.assessment_id,
      question_id: 1,
      isExisting: false
    });
  } catch (error) {
    console.error('Error in getCurrentOrCreateAssessment:', error);
    res.status(500).json({ error: 'Failed to get or create assessment', details: error.message });
  }
};

module.exports = { startAssessment, getNextQuestion, restartAssessment, getCurrentOrCreateAssessment };