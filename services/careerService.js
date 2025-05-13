const careerData = require('../careerData/careerMapping.json');
const questionsData = require('../careerData/questions.json');
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
      You are an AI career advisor. Based on the following user answers, determine the most likely career path and a confidence score (0-100) from these options: Software Engineer, Data Scientist, Graphic Designer, Software Tester/Quality Assurance.
      Answers:
      ${answerSummary}
      Return ONLY a valid JSON object with no additional text, in this exact format:
      {"suggestedCareer": "string", "score": number}
      Example: {"suggestedCareer": "Software Engineer", "score": 90}
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

module.exports = { getCareerFromInitialAnswer, evaluateAnswer, finalizeCareer };