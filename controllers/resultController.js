const { InitialResult, FinalResult, SavedCareer } = require('../models');
const { getCareerFromInitialAnswer, evaluateAnswer, finalizeCareer } = require('../services/careerService');

const submitAnswer = async (req, res) => {
  try {
    console.log('Request headers:', req.headers);
    console.log('Raw request body:', req.body);

    if (!req.body) {
      console.log('Request body is undefined');
      return res.status(400).json({ error: 'Request body is missing or invalid' });
    }

    const { assessment_id, question_id, selected_option } = req.body;

    if (!assessment_id || !question_id || !selected_option) {
      console.log('Missing required fields in body:', req.body);
      return res.status(400).json({ error: 'Missing required fields: assessment_id, question_id, and selected_option are required' });
    }

    const user_id = req.user.id;
    console.log('User ID:', user_id);

    if (!req.session) {
      console.log('Session not available');
      return res.status(500).json({ error: 'Session not available' });
    }
    console.log('Session data:', req.session);

    await InitialResult.create({
      assessment_id,
      question_id,
      selected_option,
    });
    console.log('InitialResult created successfully');

    const answers = await InitialResult.findAll({ where: { assessment_id } });
    console.log('Fetched answers:', answers);

    let currentCareer = req.session.currentCareer || 'Undecided';
    let currentConfidence = req.session.currentConfidence || 0;
    let careerHistory = req.session.careerHistory || {};
    console.log('Current state - Career:', currentCareer, 'Confidence:', currentConfidence, 'History:', careerHistory);

    if (question_id === 1) {
      console.log('Processing default question with option:', selected_option);
      const { career, confidence } = getCareerFromInitialAnswer(selected_option);
      req.session.currentCareer = career;
      req.session.currentConfidence = confidence;
      req.session.careerHistory = { [career]: confidence };
      req.session.assessment_id = assessment_id;
      const feedbackMessage = `Starting quiz! You're at ${confidence}% confidence for ${career}.`;
      return res.json({ career, confidence, feedbackMessage, nextQuestionId: 2 });
    } else {
      console.log('Processing subsequent question:', question_id);
      if (req.session.assessment_id !== assessment_id) {
        return res.status(400).json({ error: 'Invalid assessment ID. Please start a new quiz.' });
      }

      const { career, confidence } = await evaluateAnswer(currentCareer, selected_option, question_id, careerHistory);
      console.log('evaluateAnswer result - Career:', career, 'Confidence:', confidence);

      let feedbackMessage = '';
      if (career !== currentCareer) {
        req.session.currentCareer = career;
        req.session.careerHistory[career] = (req.session.careerHistory[career] || 0) + confidence; // Accumulate confidence
        req.session.currentConfidence = req.session.careerHistory[career]; // Set to cumulative confidence
        feedbackMessage = careerHistory[career] > 10 ? `Returning to ${career} at ${req.session.careerHistory[career]}% confidence!` : `You've pivoted to ${career} at ${confidence}% confidence!`;
      } else {
        req.session.careerHistory[currentCareer] = (req.session.careerHistory[currentCareer] || 0) + confidence; // Accumulate confidence
        req.session.currentConfidence = req.session.careerHistory[currentCareer];
        feedbackMessage = `You're now at ${req.session.currentConfidence}% confidence for ${currentCareer}!`;
      }

      currentCareer = req.session.currentCareer;
      currentConfidence = req.session.currentConfidence; // Use cumulative confidence
      console.log('Updated state - Career:', currentCareer, 'Confidence:', currentConfidence, 'History:', req.session.careerHistory);

      if (currentConfidence >= 90 || question_id >= 10) {
        console.log('Finalizing career with answers:', answers);
        const { suggestedCareer, score } = await finalizeCareer(answers);
        console.log('finalizeCareer result - Suggested Career:', suggestedCareer, 'Score:', score);

        await FinalResult.create({
          assessment_id,
          user_id,
          career_suggestion: suggestedCareer,
          score,
        });

        feedbackMessage = `Quiz completed! We suggest ${suggestedCareer} with ${score}% confidence.`;
        req.session.currentCareer = null;
        req.session.currentConfidence = null;
        req.session.careerHistory = null;
        req.session.assessment_id = null;

        return res.status(201).json({
          message: 'Assessment completed',
          career_suggestion: suggestedCareer,
          score,
          feedbackMessage,
          saveOption: true,
          restartOption: true,
        });
      }

      res.json({
        career: currentCareer,
        confidence: currentConfidence, // Use cumulative confidence in response
        feedbackMessage,
        nextQuestionId: parseInt(question_id) + 1,
      });
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
};

module.exports = { submitAnswer };