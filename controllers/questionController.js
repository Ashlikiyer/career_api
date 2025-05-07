const questionsData = require('../careerData/questions.json');

const getQuestions = (req, res) => {
  try {
    res.json(questionsData.questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

module.exports = { getQuestions };