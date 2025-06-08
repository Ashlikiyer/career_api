const db = require('../models');

const createAssessment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Assessment name is required' });
    }
    const assessment = await db.Assessment.create({ name });
    req.session.assessment_id = assessment.assessmentId;
    console.log('Assessment created, ID:', assessment.assessmentId);
    res.status(201).json({ 
      assessment_id: assessment.assessmentId, 
      name: assessment.name 
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
};

const getAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await db.Assessment.findByPk(assessmentId, {
      include: [{ model: db.InitialResult, as: 'InitialResults' }],
    });
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
};

const updateAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { name } = req.body;
    const assessment = await db.Assessment.findByPk(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    await assessment.update({ name });
    res.json({ assessment_id: assessment.assessmentId, name: assessment.name });
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({ error: 'Failed to update assessment' });
  }
};

const deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await db.Assessment.findByPk(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    await assessment.destroy();
    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
};

const getAllAssessments = async (req, res) => {
  try {
    const assessments = await db.Assessment.findAll({
      include: [{ model: db.InitialResult, as: 'InitialResults' }],
    });
    res.json(assessments);
  } catch (error) {
    console.error('Error fetching all assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
};

module.exports = {
  createAssessment,
  getAssessment,
  updateAssessment,
  deleteAssessment,
  getAllAssessments,
};