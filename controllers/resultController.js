'use strict';

const { InitialResult, FinalResult, Assessment } = require('../models');
const { getCareerFromInitialAnswer, evaluateAnswer, finalizeCareer } = require('../services/careerService');

const submitAnswer = async (req, res) => {
  try {
    const { assessment_id, question_id, selected_option } = req.body;

    if (!assessment_id || !question_id || !selected_option) {
      return res.status(400).json({ error: 'Missing required fields: assessment_id, question_id, and selected_option are required' });
    }

    const assessment = await Assessment.findByPk(assessment_id);
    if (!assessment) {
      return res.status(400).json({ error: 'Invalid assessment ID' });
    }

    if (!req.session || req.session.assessment_id !== assessment_id) {
      return res.status(400).json({ error: 'Invalid assessment ID. Please start a new assessment.' });
    }

    const user_id = req.user.id;

    await InitialResult.create({
      assessment_id,
      question_id,
      selected_option,
    });

    const answers = await InitialResult.findAll({ where: { assessment_id } });
    let currentCareer = req.session.currentCareer || 'Undecided';
    let currentConfidence = req.session.currentConfidence || 0;
    let careerHistory = req.session.careerHistory || {};

    if (question_id === 1) {
      const { career, confidence } = getCareerFromInitialAnswer(selected_option);
      req.session.currentCareer = career;
      req.session.currentConfidence = confidence;
      req.session.careerHistory = { [career]: confidence };
      req.session.assessment_id = assessment_id;

      const feedbackMessage = `Starting assessment! You're at ${confidence}% confidence for ${career}.`;
      return res.json({ career, confidence, feedbackMessage, nextQuestionId: 2 });
    }

    const { career, confidence } = await evaluateAnswer(currentCareer, selected_option, question_id, careerHistory);

    let feedbackMessage = '';
    if (career !== currentCareer) {
      req.session.currentCareer = career;
      req.session.careerHistory[career] = (req.session.careerHistory[career] || 0) + confidence;
      req.session.currentConfidence = req.session.careerHistory[career];
      feedbackMessage = req.session.careerHistory[career] > 10 ? `Returning to ${career} at ${req.session.careerHistory[career]}% confidence!` : `You've pivoted to ${career} at ${confidence}% confidence!`;
    } else {
      req.session.careerHistory[currentCareer] = (req.session.careerHistory[currentCareer] || 0) + confidence;
      req.session.currentConfidence = req.session.careerHistory[currentCareer];
      feedbackMessage = `You're now at ${req.session.currentConfidence}% confidence for ${currentCareer}!`;
    }

    currentCareer = req.session.currentCareer;
    currentConfidence = req.session.currentConfidence;

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