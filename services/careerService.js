const careerData = require('../careerdata/expandedCareerMapping.json');
const questionsData = require('../careerdata/questions.json');
const groq = require('../utils/groqClient');

const getCareerFromInitialAnswer = (answer) => {
  const career = careerData.careers.find(c => c.initial_answer === answer);
  return career ? { career: career.career_name, confidence: 10 } : { career: 'Undecided', confidence: 0 };
};

const evaluateAnswer = async (currentCareer, answer, questionId) => {
  const question = questionsData.progressive_questions.find(q => q.question_id === parseInt(questionId));
  if (!question) return { career: currentCareer, confidence: 0 };

  const selectedCareer = question.career_mapping[answer];
  let newConfidence = 0;

  if (selectedCareer === currentCareer) {
    const careerConfig = careerData.careers.find(c => c.career_name === currentCareer);
    newConfidence = careerConfig.confidence_increments[questionId.toString()] || 0;
    return { career: currentCareer, confidence: newConfidence };
  } else {
    // Pivot to the new career path
    return { career: selectedCareer, confidence: 10 };
  }
};

const finalizeCareer = async (answers) => {
  try {
    const answerSummary = answers.map(a => `Question ${a.question_id}: ${a.selected_option}`).join('\n');

    const prompt = `
      You are an AI career advisor. Based on the following user answers, determine the most likely career path and a confidence score (0-100) from these options: 
      
      Web Developer, Data Scientist, Mobile App Developer, UX/UI Designer, Backend Developer, Frontend Developer, Cybersecurity Engineer, Machine Learning Engineer, Database Administrator, Systems Administrator, Computer Systems Analyst, Game Developer, DevOps Engineer, Business Intelligence Analyst, Software Engineer, QA Tester.
      
      Answers:
      ${answerSummary}
      Return ONLY a valid JSON object with no additional text, in this exact format:
      {"suggestedCareer": "string", "score": number}
      Example: {"suggestedCareer": "Web Developer", "score": 90}
    `;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    const rawResponse = completion.choices[0]?.message?.content?.trim() || '{}';
    console.log('Grok raw response:', rawResponse); // Debug log

    // Attempt to parse JSON, handling potential non-JSON responses
    let result;
    try {
      result = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error('Failed to parse Grok response as JSON:', parseError.message, 'Raw response:', rawResponse);
      // Fallback to extract JSON if wrapped in text
      const jsonMatch = rawResponse.match(/\{.*\}/s);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestedCareer: 'Undecided', score: 0 };
    }

    // Validate result
    if (!result.suggestedCareer || typeof result.score !== 'number' || result.score < 0 || result.score > 100) {
      console.warn('Invalid career suggestion from Grok, falling back:', result);
      return { suggestedCareer: 'Undecided', score: 0 };
    }

    return {
      suggestedCareer: result.suggestedCareer,
      score: result.score,
    };
  } catch (error) {
    console.error('Error finalizing career with Groq:', error);
    // Fallback based on answer pattern matching
    const careerMatch = careerData.careers.find(c =>
      answers.every(a => c.answer_pattern[a.question_id] === a.selected_option)
    );
    return {
      suggestedCareer: careerMatch ? careerMatch.career_name : 'Undecided',
      score: careerMatch ? answers.length * 20 : 0, // 20 per matching answer
    };
  }
};

// NEW FUNCTION: Get multiple career suggestions with scores
const getMultipleCareerSuggestions = async (answers) => {
  try {
    const answerSummary = answers.map(a => `Question ${a.question_id}: ${a.selected_option}`).join('\n');

    const prompt = `
      You are an AI career advisor. Based on the following user answers, provide the TOP 5 most suitable career paths with compatibility scores (0-100) from these options: 
      
      Web Developer, Data Scientist, Mobile App Developer, UX/UI Designer, Backend Developer, Frontend Developer, Cybersecurity Engineer, Machine Learning Engineer, Database Administrator, Systems Administrator, Computer Systems Analyst, Game Developer, DevOps Engineer, Business Intelligence Analyst, Software Engineer, QA Tester.
      
      Answers:
      ${answerSummary}
      
      Return ONLY a valid JSON array with no additional text, in this exact format:
      [
        {"career": "string", "compatibility": number, "reason": "brief explanation"},
        {"career": "string", "compatibility": number, "reason": "brief explanation"},
        {"career": "string", "compatibility": number, "reason": "brief explanation"},
        {"career": "string", "compatibility": number, "reason": "brief explanation"},
        {"career": "string", "compatibility": number, "reason": "brief explanation"}
      ]
      
      Order by compatibility score (highest first). Ensure all scores are realistic and different. Focus on the most relevant tech careers based on the user's interests.
    `;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const rawResponse = completion.choices[0]?.message?.content?.trim() || '[]';
    console.log('Multiple careers raw response:', rawResponse);

    let result;
    try {
      result = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error('Failed to parse multiple careers response:', parseError.message);
      // Fallback to array extraction
      const jsonMatch = rawResponse.match(/\[.*\]/s);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    }

    // Validate and ensure we have an array
    if (!Array.isArray(result) || result.length === 0) {
      console.warn('Invalid multiple careers response, using fallback');
      result = getFallbackCareerSuggestions(answers);
    }

    // Ensure all entries have required fields and valid scores
    result = result.map(item => ({
      career: item.career || 'Undecided',
      compatibility: Math.max(0, Math.min(100, item.compatibility || 0)),
      reason: item.reason || 'Based on your assessment responses'
    }));

    // Sort by compatibility (highest first) and limit to top 5
    result.sort((a, b) => b.compatibility - a.compatibility);
    return result.slice(0, 5);

  } catch (error) {
    console.error('Error getting multiple career suggestions:', error);
    return getFallbackCareerSuggestions(answers);
  }
};

// Fallback function for multiple career suggestions
const getFallbackCareerSuggestions = (answers) => {
  const careers = careerData.careers;
  const careerScores = [];

  careers.forEach(career => {
    let score = 0;
    let matchingAnswers = 0;

    answers.forEach(answer => {
      if (career.answer_pattern[answer.question_id] === answer.selected_option) {
        score += career.confidence_increments[answer.question_id.toString()] || 10;
        matchingAnswers++;
      }
    });

    // Calculate compatibility percentage
    const compatibility = Math.min(100, Math.max(10, (score / answers.length) + (matchingAnswers * 15)));

    careerScores.push({
      career: career.career_name,
      compatibility: Math.round(compatibility),
      reason: `${matchingAnswers} out of ${answers.length} answers align with this career path`
    });
  });

  // Sort by compatibility and return top 5
  careerScores.sort((a, b) => b.compatibility - a.compatibility);
  return careerScores.slice(0, 5);
};

module.exports = { 
  getCareerFromInitialAnswer, 
  evaluateAnswer, 
  finalizeCareer, 
  getMultipleCareerSuggestions 
};