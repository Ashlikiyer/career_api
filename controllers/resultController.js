const { InitialResult, FinalResult } = require('../models');
const careerData = require('../careerData/careerMapping.json');

const submitAssessment = async (req, res) => {
  try {
    const { assessment_id, answers } = req.body; // answers: [{ question_id, selected_option }]
    const user_id = req.user.id; // From authMiddleware

    // Save initial results (user answers)
    for (const answer of answers) {
      await InitialResult.create({
        assessment_id,
        question_id: answer.question_id,
        selected_option: answer.selected_option,
      });
    }

    // Evaluate answers against career data
    let highestScore = 0;
    let suggestedCareer = 'Undecided';

    for (const career of careerData.careers) {
      let score = 0;
      for (const answer of answers) {
        const questionId = answer.question_id.toString();
        if (career.answer_pattern[questionId] === answer.selected_option) {
          score++;
        }
      }
      if (score >= career.threshold && score > highestScore) {
        highestScore = score;
        suggestedCareer = career.career_name;
      }
    }

    // Save final result
    const finalResult = await FinalResult.create({
      assessment_id,
      user_id,
      career_suggestion: suggestedCareer,
      score: highestScore,
    });

    res.status(201).json({ message: 'Assessment submitted', career_suggestion: suggestedCareer, score: highestScore });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
};

module.exports = { submitAssessment };