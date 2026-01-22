const { RoadmapAssessment, UserRoadmapAssessmentResult, Roadmap, RoadmapStep, SavedCareer } = require('../models');
const { Op } = require('sequelize');
const { getOrGenerateAssessment, preGenerateCareerAssessments } = require('../services/assessmentGenerationService');

/**
 * Get assessment for a specific roadmap step
 * Validates that previous step is completed before allowing access
 */
const getStepAssessment = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { saved_career_id, step_number } = req.params;

    // Validate step number
    const stepNum = parseInt(step_number);
    if (isNaN(stepNum) || stepNum < 1 || stepNum > 10) {
      return res.status(400).json({ message: 'Invalid step number. Must be between 1 and 10.' });
    }

    // Verify saved career belongs to user
    const savedCareer = await SavedCareer.findOne({
      where: { saved_career_id, user_id }
    });

    if (!savedCareer) {
      return res.status(404).json({ message: 'Saved career not found or unauthorized' });
    }

    // Get roadmap
    const roadmap = await Roadmap.findOne({
      where: { career_name: savedCareer.career_name }
    });

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found for this career' });
    }

    // Check if previous step is completed (unless this is step 1)
    if (stepNum > 1) {
      const previousStepCompleted = await RoadmapStep.findOne({
        where: {
          roadmap_id: roadmap.roadmap_id,
          user_id,
          step_number: stepNum - 1,
          is_done: true
        }
      });

      if (!previousStepCompleted) {
        return res.status(403).json({
          message: `Step ${stepNum - 1} must be completed before accessing step ${stepNum} assessment`,
          locked: true,
          required_step: stepNum - 1
        });
      }
    }

    // Get or generate assessment for this step using AI
    let assessment;
    try {
      assessment = await getOrGenerateAssessment(
        roadmap.roadmap_id,
        stepNum,
        savedCareer.career_name
      );
    } catch (generationError) {
      console.error('[Assessment] Failed to generate assessment:', generationError.message);
      return res.status(500).json({
        message: 'Failed to generate assessment. Please try again later.',
        error: generationError.message
      });
    }

    if (!assessment || !assessment.is_active) {
      return res.status(404).json({
        message: 'No assessment available for this step',
        has_assessment: false
      });
    }

    // Get user's previous attempts
    const previousAttempts = await UserRoadmapAssessmentResult.findAll({
      where: {
        user_id,
        roadmap_assessment_id: assessment.assessment_id
      },
      order: [['created_at', 'DESC']]
    });

    // Check if user already passed
    const passedAttempt = previousAttempts.find(attempt => attempt.pass_fail_status === 'pass');

    // Parse questions from JSON string to array
    const questionsArray = typeof assessment.questions === 'string' 
      ? JSON.parse(assessment.questions) 
      : assessment.questions;

    // Return assessment without answers
    res.json({
      assessment_id: assessment.assessment_id,
      title: assessment.title,
      description: assessment.description,
      questions: questionsArray,
      passing_score: assessment.passing_score,
      time_limit_minutes: assessment.time_limit_minutes,
      step_number: stepNum,
      total_questions: questionsArray.length,
      has_passed: !!passedAttempt,
      attempt_count: previousAttempts.length,
      best_score: previousAttempts.length > 0 
        ? Math.max(...previousAttempts.map(a => parseFloat(a.score)))
        : null,
      can_retake: !passedAttempt
    });

  } catch (error) {
    console.error('Error fetching step assessment:', error);
    res.status(500).json({ message: 'Failed to fetch assessment', error: error.message });
  }
};

/**
 * Submit assessment answers and calculate score
 * Marks step as complete if passed
 */
const submitAssessment = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { saved_career_id, step_number } = req.params;
    const { answers, time_taken_seconds } = req.body;

    // Validate input
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array is required' });
    }

    const stepNum = parseInt(step_number);

    // Get saved career and roadmap
    const savedCareer = await SavedCareer.findOne({
      where: { saved_career_id, user_id }
    });

    if (!savedCareer) {
      return res.status(404).json({ message: 'Saved career not found' });
    }

    const roadmap = await Roadmap.findOne({
      where: { career_name: savedCareer.career_name }
    });

    // Get assessment
    const assessment = await RoadmapAssessment.findOne({
      where: {
        roadmap_id: roadmap.roadmap_id,
        step_number: stepNum,
        is_active: true
      }
    });

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Check if already passed
    const existingPass = await UserRoadmapAssessmentResult.findOne({
      where: {
        user_id,
        roadmap_assessment_id: assessment.assessment_id,
        pass_fail_status: 'pass'
      }
    });

    if (existingPass) {
      return res.status(400).json({
        message: 'You have already passed this assessment',
        score: parseFloat(existingPass.score),
        passed: true
      });
    }

    // Parse questions from JSON string to array
    const questionsArray = typeof assessment.questions === 'string' 
      ? JSON.parse(assessment.questions) 
      : assessment.questions;

    // Validate all questions answered
    if (answers.length !== questionsArray.length) {
      return res.status(400).json({
        message: `Invalid submission. All ${questionsArray.length} questions must be answered.`
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = questionsArray.length;

    questionsArray.forEach((question, index) => {
      const userAnswer = answers.find(a => a.question_id === question.question_id);
      if (userAnswer && userAnswer.selected_option === question.correct_answer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / totalQuestions) * 100;
    const passed = score >= assessment.passing_score;

    // Get attempt count
    const previousAttempts = await UserRoadmapAssessmentResult.count({
      where: {
        user_id,
        roadmap_assessment_id: assessment.assessment_id
      }
    });

    // Create result record
    const result = await UserRoadmapAssessmentResult.create({
      user_id,
      roadmap_assessment_id: assessment.assessment_id,
      score: score.toFixed(2),
      pass_fail_status: passed ? 'pass' : 'fail',
      attempt_count: previousAttempts + 1,
      answers: answers,
      time_taken_seconds,
      started_at: new Date(Date.now() - (time_taken_seconds * 1000)),
      completed_at: new Date()
    });

    // If passed, mark the roadmap step as complete
    if (passed) {
      await RoadmapStep.update(
        {
          is_done: true,
          completed_at: new Date()
        },
        {
          where: {
            roadmap_id: roadmap.roadmap_id,
            user_id,
            step_number: stepNum
          }
        }
      );
    }

    // Generate detailed results for each question
    const detailedResults = questionsArray.map((question) => {
      const userAnswer = answers.find(a => a.question_id === question.question_id);
      const selectedOption = userAnswer ? userAnswer.selected_option : null;
      const isCorrect = selectedOption === question.correct_answer;

      return {
        question_id: question.question_id,
        question: question.question,
        your_answer: selectedOption,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
        explanation: question.explanation
      };
    });

    res.json({
      result_id: result.result_id,
      score: parseFloat(score.toFixed(2)),
      passing_score: assessment.passing_score,
      passed,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      attempt_number: previousAttempts + 1,
      step_completed: passed,
      message: passed 
        ? `Congratulations! You passed with ${score.toFixed(1)}%. Step ${stepNum} is now complete.`
        : `You scored ${score.toFixed(1)}%. You need ${assessment.passing_score}% to pass. Try again!`,
      detailed_results: detailedResults
    });

  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ message: 'Failed to submit assessment', error: error.message });
  }
};

/**
 * Get user's assessment history for a specific step
 */
const getAssessmentHistory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { saved_career_id, step_number } = req.params;

    const stepNum = parseInt(step_number);

    // Get saved career and roadmap
    const savedCareer = await SavedCareer.findOne({
      where: { saved_career_id, user_id }
    });

    if (!savedCareer) {
      return res.status(404).json({ message: 'Saved career not found' });
    }

    const roadmap = await Roadmap.findOne({
      where: { career_name: savedCareer.career_name }
    });

    const assessment = await RoadmapAssessment.findOne({
      where: {
        roadmap_id: roadmap.roadmap_id,
        step_number: stepNum
      }
    });

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Get all attempts
    const attempts = await UserRoadmapAssessmentResult.findAll({
      where: {
        user_id,
        roadmap_assessment_id: assessment.assessment_id
      },
      order: [['created_at', 'DESC']],
      attributes: {
        exclude: ['answers'] // Don't include answers in history
      }
    });

    const passedAttempt = attempts.find(a => a.pass_fail_status === 'pass');

    res.json({
      step_number: stepNum,
      assessment_title: assessment.title,
      total_attempts: attempts.length,
      has_passed: !!passedAttempt,
      passing_score: assessment.passing_score,
      best_score: attempts.length > 0 
        ? Math.max(...attempts.map(a => parseFloat(a.score)))
        : null,
      attempts: attempts.map(attempt => ({
        result_id: attempt.result_id,
        score: parseFloat(attempt.score),
        status: attempt.pass_fail_status,
        attempt_number: attempt.attempt_count,
        time_taken_seconds: attempt.time_taken_seconds,
        completed_at: attempt.completed_at
      }))
    });

  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({ message: 'Failed to fetch assessment history', error: error.message });
  }
};

/**
 * Get roadmap progress with assessment status
 */
const getRoadmapProgress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { saved_career_id } = req.params;

    const savedCareer = await SavedCareer.findOne({
      where: { saved_career_id, user_id }
    });

    if (!savedCareer) {
      return res.status(404).json({ message: 'Saved career not found' });
    }

    const roadmap = await Roadmap.findOne({
      where: { career_name: savedCareer.career_name }
    });

    // Get all steps
    const steps = await RoadmapStep.findAll({
      where: {
        roadmap_id: roadmap.roadmap_id,
        user_id
      },
      order: [['step_number', 'ASC']]
    });

    // Get all assessments for this roadmap
    const assessments = await RoadmapAssessment.findAll({
      where: { roadmap_id: roadmap.roadmap_id, is_active: true }
    });

    // Get user's assessment results
    const results = await UserRoadmapAssessmentResult.findAll({
      where: {
        user_id,
        roadmap_assessment_id: {
          [Op.in]: assessments.map(a => a.assessment_id)
        },
        pass_fail_status: 'pass'
      }
    });

    // Build progress data
    const progressData = steps.map(step => {
      const assessment = assessments.find(a => a.step_number === step.step_number);
      const passed = results.find(r => r.roadmap_assessment_id === assessment?.assessment_id);

      return {
        step_number: step.step_number,
        title: step.title,
        is_completed: step.is_done,
        completed_at: step.completed_at,
        has_assessment: !!assessment,
        assessment_passed: !!passed,
        is_locked: step.step_number > 1 && !steps[step.step_number - 2]?.is_done
      };
    });

    const completedSteps = steps.filter(s => s.is_done).length;
    const totalSteps = steps.length;

    res.json({
      career_name: savedCareer.career_name,
      total_steps: totalSteps,
      completed_steps: completedSteps,
      progress_percentage: ((completedSteps / totalSteps) * 100).toFixed(1),
      steps: progressData
    });

  } catch (error) {
    console.error('Error fetching roadmap progress:', error);
    res.status(500).json({ message: 'Failed to fetch roadmap progress', error: error.message });
  }
};

/**
 * Admin endpoint: Pre-generate all assessments for a specific career
 * This is useful to generate assessments in advance rather than on-demand
 */
const generateCareerAssessments = async (req, res) => {
  try {
    const { career_name } = req.body;

    if (!career_name) {
      return res.status(400).json({ message: 'career_name is required' });
    }

    // Find roadmap for this career
    const roadmap = await Roadmap.findOne({
      where: { career_name }
    });

    if (!roadmap) {
      return res.status(404).json({ message: `Roadmap not found for career: ${career_name}` });
    }

    // Count existing steps for this career
    const steps = await RoadmapStep.findAll({
      where: { roadmap_id: roadmap.roadmap_id },
      attributes: ['step_number']
    });

    const totalSteps = steps.length || 10;

    console.log(`[Admin] Starting assessment generation for ${career_name} (${totalSteps} steps)`);

    // Generate all assessments
    const results = await preGenerateCareerAssessments(
      roadmap.roadmap_id,
      career_name,
      totalSteps
    );

    res.json({
      message: 'Assessment generation completed',
      career_name,
      roadmap_id: roadmap.roadmap_id,
      total_steps: totalSteps,
      results: {
        success: results.success.length,
        skipped: results.skipped.length,
        failed: results.failed.length,
        details: results
      }
    });

  } catch (error) {
    console.error('[Admin] Error generating career assessments:', error);
    res.status(500).json({
      message: 'Failed to generate assessments',
      error: error.message
    });
  }
};


module.exports = {
  getStepAssessment,
  submitAssessment,
  getAssessmentHistory,
  getRoadmapProgress,
  generateCareerAssessments
};
