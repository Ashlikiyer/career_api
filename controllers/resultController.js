'use strict';

const { InitialResult, FinalResult, Assessment } = require('../models');
const { getCareerFromInitialAnswer, evaluateAnswer, finalizeCareer } = require('../services/careerService');

const submitAnswer = async (req, res) => {
  try {
    const { assessment_id, question_id, selected_option } = req.body;
    
    console.log('Submitting answer:', {
      assessment_id,
      question_id,
      selected_option,
      user_id: req.user?.id,
      session_id: req.sessionID
    });

    if (!assessment_id || !question_id || !selected_option) {
      console.error('Missing required fields:', { assessment_id, question_id, selected_option });
      return res.status(400).json({ error: 'Missing required fields: assessment_id, question_id, and selected_option are required' });
    }

    // Validate assessment exists in database
    const assessment = await Assessment.findByPk(assessment_id);
    if (!assessment) {
      console.error('Assessment not found in database:', assessment_id);
      return res.status(400).json({ error: 'Invalid assessment ID - assessment not found' });
    }

    // Session validation is now handled by middleware

    const user_id = req.user.id;

    await InitialResult.create({
      assessment_id,
      question_id,
      selected_option,
    });

    const answers = await InitialResult.findAll({ where: { assessment_id } });
    
    // Get assessment state from database (reuse existing assessment object)
    let currentCareer = assessment.current_career || 'Undecided';
    let currentConfidence = assessment.current_confidence || 0;
    let careerHistory = {};
    
    try {
      careerHistory = assessment.career_history ? JSON.parse(assessment.career_history) : {};
    } catch (e) {
      careerHistory = {};
    }

    if (question_id === 1) {
      const { career, confidence } = getCareerFromInitialAnswer(selected_option);
      
      // Update assessment in database
      await assessment.update({
        current_career: career,
        current_confidence: confidence,
        career_history: JSON.stringify({ [career]: confidence })
      });

      const feedbackMessage = `Starting assessment! You're at ${confidence}% confidence for ${career}.`;
      return res.json({ career, confidence, feedbackMessage, nextQuestionId: 2 });
    }

    const { career, confidence } = await evaluateAnswer(currentCareer, selected_option, question_id, careerHistory);

    let feedbackMessage = '';
    if (career !== currentCareer) {
      careerHistory[career] = (careerHistory[career] || 0) + confidence;
      currentCareer = career;
      currentConfidence = careerHistory[career];
      feedbackMessage = careerHistory[career] > 10 ? `Returning to ${career} at ${careerHistory[career]}% confidence!` : `You've pivoted to ${career} at ${confidence}% confidence!`;
    } else {
      careerHistory[currentCareer] = (careerHistory[currentCareer] || 0) + confidence;
      currentConfidence = careerHistory[currentCareer];
      feedbackMessage = `You're now at ${currentConfidence}% confidence for ${currentCareer}!`;
    }

    // Update assessment in database
    await assessment.update({
      current_career: currentCareer,
      current_confidence: currentConfidence,
      career_history: JSON.stringify(careerHistory)
    });

    if (currentConfidence >= 90 || question_id >= 10) {
      const { suggestedCareer, score } = await finalizeCareer(answers);

      await FinalResult.create({
        assessment_id,
        user_id,
        career_suggestion: suggestedCareer,
        score,
      });

      feedbackMessage = `Assessment completed! We suggest ${suggestedCareer} with ${score}% confidence.`;
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
      confidence: currentConfidence,
      feedbackMessage,
      nextQuestionId: parseInt(question_id) + 1,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer', details: error.message });
  }
};

module.exports = { submitAnswer };