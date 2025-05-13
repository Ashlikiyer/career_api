const { InitialResult, FinalResult, SavedCareer } = require('../models');
const { getCareerFromInitialAnswer, evaluateAnswer, finalizeCareer } = require('../services/careerService');

const submitAnswer = async (req, res) => {
  try {
    const { assessment_id, question_id, selected_option } = req.body;
    const user_id = req.user.id; // From authMiddleware

    // Ensure session exists
    if (!req.session) {
      return res.status(500).json({ error: 'Session not available' });
    }

    // Save the answer to initial_results
    await InitialResult.create({
      assessment_id,
      question_id,
      selected_option,
    });

    // Fetch all answers for this assessment to track progress
    const answers = await InitialResult.findAll({ where: { assessment_id } });

    let currentCareer = req.session.currentCareer || 'Undecided';
    let currentConfidence = req.session.currentConfidence || 0;

    if (question_id === 1) {
      // Handle the default question
      const { career, confidence } = getCareerFromInitialAnswer(selected_option);
      req.session.currentCareer = career;
      req.session.currentConfidence = confidence;
      req.session.assessment_id = assessment_id;

      const feedbackMessage = `Starting quiz! You're at ${confidence}% confidence for ${career}.`;
      return res.json({ career, confidence, feedbackMessage, nextQuestionId: 2 });
    } else {
      // Check if assessment_id matches the session
      if (req.session.assessment_id !== assessment_id) {
        return res.status(400).json({ error: 'Invalid assessment ID. Please start a new quiz.' });
      }

      // Evaluate the answer and update career/confidence
      const { career, confidence } = await evaluateAnswer(currentCareer, selected_option, question_id);
      let feedbackMessage = '';

      if (career !== currentCareer) {
        // Pivot to a new career path
        req.session.currentCareer = career;
        req.session.currentConfidence = confidence;
        feedbackMessage = `You've pivoted to ${career} at ${confidence}% confidence!`;
      } else {
        // Increase confidence for the current career path
        req.session.currentConfidence = (currentConfidence || 0) + confidence;
        feedbackMessage = `You're now at ${req.session.currentConfidence}% confidence for ${currentCareer}!`;
      }

      currentCareer = req.session.currentCareer;
      currentConfidence = req.session.currentConfidence;

      // Check if we've reached 80% or 100% confidence or the end of questions
      if (currentConfidence >= 80 || question_id >= 6) {
        // Use AI to finalize the career suggestion
        const { suggestedCareer, score } = await finalizeCareer(answers);

        // Automatically save the career if confidence is 80% or higher
        let savedCareerId = null;
        if (score >= 80) {
          let savedCareer = await SavedCareer.findOne({ where: { user_id, career_name: suggestedCareer } });
          if (!savedCareer) {
            savedCareer = await SavedCareer.create({
              user_id,
              career_name: suggestedCareer,
              saved_at: new Date().toISOString(),
            });
          }
          savedCareerId = savedCareer.saved_career_id;
        }

        // Handle undecided case
        if (question_id >= 6 && currentConfidence < 80 && score < 50) {
          feedbackMessage = `We couldn't determine a clear career path (confidence: ${score}%). Would you like to restart the quiz?`;
          req.session.currentCareer = null;
          req.session.currentConfidence = null;
          req.session.assessment_id = null;
          return res.json({
            message: 'Undecided career path',
            suggestedCareer,
            score,
            feedbackMessage,
            restartOption: true,
          });
        }

        await FinalResult.create({
          assessment_id,
          user_id,
          career_suggestion: suggestedCareer,
          score,
        });

        feedbackMessage = `Quiz completed! We suggest ${suggestedCareer} with ${score}% confidence.`;
        if (score >= 80) {
          feedbackMessage += ` You can generate a roadmap for this career.`;
        }
        req.session.currentCareer = null;
        req.session.currentConfidence = null;
        req.session.assessment_id = null;

        return res.status(201).json({
          message: 'Assessment completed',
          career_suggestion: suggestedCareer,
          score,
          saved_career_id: savedCareerId,
          feedbackMessage,
        });
      }

      // Return the updated career, confidence, next question ID, and feedback
      res.json({
        career: currentCareer,
        confidence: currentConfidence,
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