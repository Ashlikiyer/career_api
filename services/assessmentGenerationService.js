const groq = require('../utils/groqClient');
const roadmapData = require('../careerdata/roadmapData.json');
const { RoadmapAssessment } = require('../models');

/**
 * Generate assessment questions using Groq AI based on roadmap step content
 * @param {number} roadmapId - The roadmap ID
 * @param {number} stepNumber - The step number (1-10)
 * @returns {Promise<Object>} Generated assessment with questions
 */
const generateAssessmentForStep = async (roadmapId, stepNumber, careerName) => {
  try {
    // Get the step data from roadmapData.json
    const career = roadmapData.careers[careerName];
    
    if (!career || !career.roadmap) {
      throw new Error(`Career "${careerName}" not found in roadmap data`);
    }

    const step = career.roadmap.find(s => s.step === stepNumber);
    
    if (!step) {
      throw new Error(`Step ${stepNumber} not found for career "${careerName}"`);
    }

    // Extract topics from weeks
    const topics = step.weeks ? step.weeks.flatMap(week => week.subtopics || []) : [];
    const weekTopics = step.weeks ? step.weeks.map(week => week.topic) : [];

    // Build comprehensive prompt
    const prompt = `
You are an expert technical instructor creating an assessment for a professional career development roadmap.

**Career Path**: ${careerName}
**Step ${stepNumber}**: ${step.title}
**Description**: ${step.description}
**Duration**: ${step.duration}

**Key Topics Covered**:
${weekTopics.map((topic, i) => `${i + 1}. ${topic}`).join('\n')}

**Detailed Subtopics**:
${topics.slice(0, 15).map((topic, i) => `- ${topic}`).join('\n')}

**TASK**: Generate 10 multiple-choice questions to assess understanding of this step's content.

**REQUIREMENTS**:
1. Questions must be practical and test real understanding (not just memorization)
2. Cover diverse topics from the step (don't focus on just one area)
3. Include beginner to intermediate difficulty mix
4. Each question has exactly 4 options
5. Clearly indicate correct answer (0-3 index)
6. Provide brief explanation for correct answer

**OUTPUT FORMAT** (MUST be valid JSON only, no other text):
{
  "questions": [
    {
      "question_id": 1,
      "question": "What is the purpose of NumPy arrays in data science?",
      "options": [
        "To create web applications",
        "To perform efficient numerical computations on arrays",
        "To manage databases",
        "To create user interfaces"
      ],
      "correct_answer": 1,
      "explanation": "NumPy arrays are optimized for fast numerical operations, making them essential for data science computations."
    }
  ]
}

**IMPORTANT**: Return ONLY the JSON object. No markdown, no explanations, no extra text.
`;

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a technical assessment generator. You ONLY respond with valid JSON objects, never with explanatory text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const rawResponse = completion.choices[0]?.message?.content?.trim() || '{}';
    console.log(`[Assessment Gen] Raw Groq response for ${careerName} Step ${stepNumber}:`, rawResponse.substring(0, 200));

    // Parse JSON response
    let result;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = rawResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      result = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('[Assessment Gen] Failed to parse Groq response:', parseError.message);
      
      // Try to extract JSON from text
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to extract valid JSON from Groq response');
      }
    }

    // Validate response structure
    if (!result.questions || !Array.isArray(result.questions) || result.questions.length < 8) {
      throw new Error(`Invalid assessment structure: expected 10 questions, got ${result.questions?.length || 0}`);
    }

    // Ensure we have exactly 10 questions
    const questions = result.questions.slice(0, 10);

    // Validate each question
    questions.forEach((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question format at index ${index}`);
      }
      if (typeof q.correct_answer !== 'number' || q.correct_answer < 0 || q.correct_answer > 3) {
        throw new Error(`Invalid correct_answer at index ${index}: must be 0-3`);
      }
      // Ensure question_id is sequential
      q.question_id = index + 1;
    });

    // Create assessment object
    const assessment = {
      roadmap_id: roadmapId,
      step_number: stepNumber,
      title: `${step.title} Assessment`,
      description: `Test your understanding of: ${step.description}`,
      questions: JSON.stringify(questions),
      passing_score: 70,
      time_limit_minutes: 30,
      is_active: true
    };

    console.log(`[Assessment Gen] ✅ Successfully generated ${questions.length} questions for ${careerName} Step ${stepNumber}`);
    
    return assessment;

  } catch (error) {
    console.error('[Assessment Gen] Error generating assessment:', error.message);
    throw error;
  }
};

/**
 * Get or generate assessment for a roadmap step
 * Checks database first, generates if not found
 * @param {number} roadmapId - The roadmap ID
 * @param {number} stepNumber - The step number
 * @param {string} careerName - Career name for generation
 * @returns {Promise<Object>} Assessment object
 */
const getOrGenerateAssessment = async (roadmapId, stepNumber, careerName) => {
  try {
    // Check if assessment already exists
    let assessment = await RoadmapAssessment.findOne({
      where: {
        roadmap_id: roadmapId,
        step_number: stepNumber
      }
    });

    // If exists, return it
    if (assessment) {
      console.log(`[Assessment Gen] Found cached assessment for roadmap ${roadmapId}, step ${stepNumber}`);
      return assessment;
    }

    // If not exists, generate with AI
    console.log(`[Assessment Gen] Generating new assessment for ${careerName}, step ${stepNumber}...`);
    
    const generatedAssessment = await generateAssessmentForStep(roadmapId, stepNumber, careerName);
    
    // Save to database
    assessment = await RoadmapAssessment.create(generatedAssessment);
    
    console.log(`[Assessment Gen] ✅ Assessment created and cached (ID: ${assessment.assessment_id})`);
    
    return assessment;

  } catch (error) {
    console.error('[Assessment Gen] Error in getOrGenerateAssessment:', error.message);
    throw error;
  }
};

/**
 * Pre-generate assessments for entire career roadmap
 * @param {number} roadmapId - The roadmap ID
 * @param {string} careerName - Career name
 * @param {number} totalSteps - Total number of steps (default 10)
 * @returns {Promise<Object>} Summary of generated assessments
 */
const preGenerateCareerAssessments = async (roadmapId, careerName, totalSteps = 10) => {
  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  console.log(`[Assessment Gen] Starting batch generation for ${careerName} (${totalSteps} steps)...`);

  for (let stepNumber = 1; stepNumber <= totalSteps; stepNumber++) {
    try {
      // Check if already exists
      const existing = await RoadmapAssessment.findOne({
        where: { roadmap_id: roadmapId, step_number: stepNumber }
      });

      if (existing) {
        results.skipped.push(stepNumber);
        console.log(`[Assessment Gen] Step ${stepNumber} already exists, skipping`);
        continue;
      }

      // Generate new assessment
      await getOrGenerateAssessment(roadmapId, stepNumber, careerName);
      results.success.push(stepNumber);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`[Assessment Gen] Failed to generate step ${stepNumber}:`, error.message);
      results.failed.push({ step: stepNumber, error: error.message });
    }
  }

  console.log(`[Assessment Gen] ✅ Batch generation complete:`, results);
  return results;
};

module.exports = {
  generateAssessmentForStep,
  getOrGenerateAssessment,
  preGenerateCareerAssessments
};
