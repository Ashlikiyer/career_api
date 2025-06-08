const { Assessment } = require('../models');
const questionsData = require('../careerdata/questions.json');

const getDefaultQuestion = async (req, res) => {
  try {
    console.log('Request session:', req.session);
    if (!req.session) {
      console.log('Session is undefined!');
      throw new Error('Session not initialized');
    }
    req.session.currentCareer = null;
    req.session.currentConfidence = null;
    req.session.assessment_id = null;
    console.log('Session reset, new state:', req.session);

    console.log('Attempting to create assessment...');
    const assessment = await Assessment.create({ name: `Assessment_${Date.now()}` });
    req.session.assessment_id = assessment.assessmentId;
    console.log('Assessment created, ID:', assessment.assessmentId);

    console.log('Questions data:', questionsData);
    res.json({ 
      ...questionsData.default_question, 
      assessment_id: assessment.assessmentId 
    });
  } catch (error) {
    console.error('Error in getDefaultQuestion:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch default question', details: error.message });
  }
};

const getNextQuestion = (req, res) => {
  const { currentQuestionId } = req.query;
  try {
    const nextQuestionId = parseInt(currentQuestionId) + 1;
    const nextQuestion = questionsData.progressive_questions.find(q => q.question_id === nextQuestionId);
    if (nextQuestion) {
      res.json(nextQuestion);
    } else {
      res.status(404).json({ message: 'No more questions available' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch next question' });
  }
};

const restartQuiz = async (req, res) => {
  try {
    req.session.currentCareer = null;
    req.session.currentConfidence = null;
    req.session.assessment_id = null;

    const assessment = await Assessment.create({ name: `Assessment_${Date.now()}` });
    req.session.assessment_id = assessment.assessmentId;

    res.json({ 
      message: 'Quiz restarted', 
      nextQuestionId: 1, 
      assessment_id: assessment.assessmentId 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restart quiz' });
  }
};

module.exports = { getDefaultQuestion, getNextQuestion, restartQuiz };