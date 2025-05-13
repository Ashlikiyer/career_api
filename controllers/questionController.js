const questionsData = require('../careerData/questions.json');

const getDefaultQuestion = (req, res) => {
  try {
    // Reset session state when starting a new quiz
    req.session.currentCareer = null;
    req.session.currentConfidence = null;
    req.session.assessment_id = null;
    res.json(questionsData.default_question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch default question' });
  }
};

const getNextQuestion = (req, res) => {
  const { currentQuestionId } = req.query; // Current question ID to determine the next one
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

const restartQuiz = (req, res) => {
  try {
    // Reset session state
    req.session.currentCareer = null;
    req.session.currentConfidence = null;
    req.session.assessment_id = null;
    res.json({ message: 'Quiz restarted', nextQuestionId: 1 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restart quiz' });
  }
};

module.exports = { getDefaultQuestion, getNextQuestion, restartQuiz };