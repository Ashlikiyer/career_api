const { CareerRoadmap, SavedCareer } = require('../models');
const groq = require('../utils/groqClient');

const getRoadmap = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { saved_career_id } = req.params;

    // Verify the saved career belongs to the user
    const savedCareer = await SavedCareer.findOne({ where: { saved_career_id, user_id } });
    if (!savedCareer) {
      return res.status(404).json({ message: 'Saved career not found or unauthorized' });
    }

    const roadmap = await CareerRoadmap.findAll({ where: { saved_career_id } });
    res.json(roadmap);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
};

const generateRoadmap = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { saved_career_id } = req.params;

    // Verify the saved career belongs to the user
    const savedCareer = await SavedCareer.findOne({ where: { saved_career_id, user_id } });
    if (!savedCareer) {
      return res.status(404).json({ message: 'Saved career not found or unauthorized' });
    }

    // Check if a roadmap already exists for this saved career
    const existingRoadmap = await CareerRoadmap.findAll({ where: { saved_career_id } });
    if (existingRoadmap.length > 0) {
      return res.status(400).json({ message: 'A roadmap already exists for this career' });
    }

    // Generate roadmap using AI
    const prompt = `
      You are an AI career advisor. Based on the career "${savedCareer.career_name}", create a roadmap with exactly 5 steps. Each step must include a step_order (e.g., "Step 1", "Step 2") and a step_description (e.g., "Learn JavaScript"). 
      Return ONLY a valid JSON object with no additional text or Markdown, in this exact format:
      {
        "roadmap": [
          { "step_order": "string", "step_description": "string" },
          ...
        ]
      }
      Example: {"roadmap": [{"step_order": "Step 1", "step_description": "Learn JavaScript"}, {"step_order": "Step 2", "step_description": "Understand basic algorithms"}]}
    `;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    const rawResponse = completion.choices[0]?.message?.content?.trim() || '{}';
    console.log('Grok raw response for roadmap:', rawResponse); // Debug log

    // Remove Markdown code block syntax if present
    let jsonString = rawResponse.replace(/```json\n|\n```/g, '').trim();
    if (!jsonString.startsWith('{')) {
      jsonString = jsonString.match(/\{.*\}/s)?.[0] || '{}';
    }

    // Parse the JSON
    const result = JSON.parse(jsonString);
    const roadmapSteps = result.roadmap || [];

    // Validate roadmap
    if (!Array.isArray(roadmapSteps) || roadmapSteps.length !== 5 || !roadmapSteps.every(step => step.step_order && step.step_description)) {
      return res.status(500).json({ error: 'Failed to generate a valid roadmap' });
    }

    // Save roadmap steps to the database
    for (const step of roadmapSteps) {
      await CareerRoadmap.create({
        saved_career_id,
        step_order: step.step_order,
        step_descriptions: step.step_description,
      });
    }

    res.status(201).json({ message: 'Roadmap generated', roadmap: roadmapSteps });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    res.status(500).json({ error: 'Failed to generate roadmap' });
  }
};

const deleteRoadmapStep = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { roadmap_id } = req.params;

    // Find the roadmap step
    const roadmapStep = await CareerRoadmap.findByPk(roadmap_id);
    if (!roadmapStep) {
      return res.status(404).json({ message: 'Roadmap step not found' });
    }

    // Verify the saved career belongs to the user
    const savedCareer = await SavedCareer.findOne({ where: { saved_career_id: roadmapStep.saved_career_id, user_id } });
    if (!savedCareer) {
      return res.status(403).json({ message: 'Unauthorized to delete this roadmap step' });
    }

    await roadmapStep.destroy();
    res.json({ message: 'Roadmap step deleted' });
  } catch (error) {
    console.error('Error deleting roadmap step:', error);
    res.status(500).json({ error: 'Failed to delete roadmap step' });
  }
};

module.exports = { getRoadmap, generateRoadmap, deleteRoadmapStep };