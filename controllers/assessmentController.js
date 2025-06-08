'use strict';

const { Assessment, Question } = require('../models');
const questionsData = require('../careerdata/questions.json');

const startAssessment = async (req, res) => {
  try {
    if (!req.session) {
      throw new Error('Session not initialized');
    }

    req.session.currentCareer = null;
    req.session.currentConfidence = null;
    req.session.assessment_id = null;

    const assessment = await Assessment.create({
      name: `Assessment_${Date.now()}`,
    });
    req.session.assessment_id = assessment.assessment_id;

    res.json({
      ...questionsData.default_question,
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
    if (!req.session || req.session.assessment_id !== parseInt(assessment_id)) {
      return res.status(400).json({ error: 'Invalid or missing assessment ID' });
    }

    const nextQuestionId = parseInt(currentQuestionId) + 1;
    const nextQuestion = await Question.findOne({
      where: {
        question_id: nextQuestionId,
      },
    });

    if (nextQuestion) {
      res.json({
        ...nextQuestion.toJSON(),
        assessment_id,
      });
    } else {
      res.status(404).json({ message: 'No more questions available' });
    }
  } catch (error) {
    console.error('Error in getNextQuestion:', error);
    res.status(500).json({ error: 'Failed to fetch next question' });
  }
};

const restartAssessment = async (req, res) => {
  try {
    if (!req.session) {
      throw new Error('Session not initialized');
    }

    req.session.currentCareer = null;
    req.session.currentConfidence = null;
    req.session.assessment_id = null;

    const assessment = await Assessment.create({
      name: `Assessment_${Date.now()}`,
    });
    req.session.assessment_id = assessment.assessment_id;

    res.json({
      message: 'Assessment restarted',
      nextQuestionId: 1,
      assessment_id: assessment.assessment_id,
    });
  } catch (error) {
    console.error('Error in restartAssessment:', error);
    res.status(500).json({ error: 'Failed to restart assessment' });
  }
};

module.exports = { startAssessment, getNextQuestion, restartAssessment };