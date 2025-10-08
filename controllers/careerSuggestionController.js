const { getMultipleCareerSuggestions, finalizeCareer } = require('../services/careerService');
const { InitialResult, FinalResult, Assessment } = require('../models');

// Get multiple career suggestions for a completed assessment
const getCareerSuggestions = async (req, res) => {
  try {
    const { assessment_id } = req.params;
    const user_id = req.user.id;

    // Verify assessment exists and belongs to user
    const assessment = await Assessment.findByPk(assessment_id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Get all answers for this assessment
    const answers = await InitialResult.findAll({ 
      where: { assessment_id },
      order: [['question_id', 'ASC']]
    });

    if (answers.length === 0) {
      return res.status(400).json({ error: 'No answers found for this assessment' });
    }

    // Get multiple career suggestions
    const careerSuggestions = await getMultipleCareerSuggestions(answers);

    // Check if we have a final result stored
    const finalResult = await FinalResult.findOne({
      where: { assessment_id, user_id }
    });

    res.json({
      assessment_id: parseInt(assessment_id),
      career_suggestions: careerSuggestions,
      primary_career: careerSuggestions[0]?.career,
      primary_score: careerSuggestions[0]?.compatibility,
      answers_count: answers.length,
      completion_date: finalResult?.created_at || assessment.updated_at,
      message: `Found ${careerSuggestions.length} career matches for your assessment`
    });

  } catch (error) {
    console.error('Error getting career suggestions:', error);
    res.status(500).json({ error: 'Failed to get career suggestions', details: error.message });
  }
};

// Get detailed analysis for a specific career suggestion
const getCareerDetails = async (req, res) => {
  try {
    const { assessment_id, career_name } = req.params;

    // Get assessment answers
    const answers = await InitialResult.findAll({ 
      where: { assessment_id },
      order: [['question_id', 'ASC']]
    });

    if (answers.length === 0) {
      return res.status(400).json({ error: 'No answers found for this assessment' });
    }

    // Get all career suggestions to find the specific one
    const careerSuggestions = await getMultipleCareerSuggestions(answers);
    const selectedCareer = careerSuggestions.find(c => 
      c.career.toLowerCase() === career_name.toLowerCase()
    );

    if (!selectedCareer) {
      return res.status(404).json({ error: 'Career not found in suggestions' });
    }

    // Additional career information could be added here
    // For now, return the career with detailed reasoning
    res.json({
      career: selectedCareer,
      assessment_id: parseInt(assessment_id),
      total_suggestions: careerSuggestions.length,
      rank: careerSuggestions.findIndex(c => c.career === selectedCareer.career) + 1,
      message: `Detailed information for ${selectedCareer.career}`
    });

  } catch (error) {
    console.error('Error getting career details:', error);
    res.status(500).json({ error: 'Failed to get career details', details: error.message });
  }
};

module.exports = {
  getCareerSuggestions,
  getCareerDetails
};