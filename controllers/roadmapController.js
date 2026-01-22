const { SavedCareer, Roadmap, RoadmapStep, user_feedback, RoadmapAssessment, UserRoadmapAssessmentResult } = require('../models');
const roadmapData = require('../careerdata/roadmapData.json'); // Roadmap data (fallback)

const getRoadmap = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { saved_career_id } = req.params;

    // Verify the saved career belongs to the user
    const savedCareer = await SavedCareer.findOne({ where: { saved_career_id, user_id } });
    if (!savedCareer) {
      return res.status(404).json({ message: 'Saved career not found or unauthorized' });
    }

    // Find the roadmap for this career
    const roadmap = await Roadmap.findOne({
      where: { career_name: savedCareer.career_name }
    });

    if (!roadmap) {
      return res.status(404).json({ message: 'No roadmap available for this career' });
    }

    // Get or create user-specific roadmap steps
    let userSteps = await RoadmapStep.findAll({
      where: { roadmap_id: roadmap.roadmap_id, user_id },
      order: [['step_number', 'ASC']]
    });

    // If user doesn't have steps yet, create them from JSON data
    if (userSteps.length === 0) {
      const jsonRoadmap = roadmapData.careers[savedCareer.career_name]?.roadmap || [];

      if (jsonRoadmap.length === 0) {
        return res.status(404).json({ message: 'No roadmap data available for this career' });
      }

      // Create roadmap steps for this user
      const stepsToCreate = jsonRoadmap.map((step, index) => ({
        roadmap_id: roadmap.roadmap_id,
        user_id,
        step_number: step.step,
        title: step.title,
        description: step.description,
        duration: step.duration,
        resources: step.resources || [],
        weeks: step.weeks || null,
        milestone_project: step.milestoneProject || null,
        difficulty_level: step.difficulty_level || (step.step <= 3 ? 'beginner' : step.step <= 7 ? 'intermediate' : 'advanced'),
        is_done: false,
      }));

      userSteps = await RoadmapStep.bulkCreate(stepsToCreate);
    }

    // Check if roadmap is completed (all steps done)
    const isCompleted = userSteps.length > 0 && userSteps.every(step => step.is_done);

    // Check if user has already submitted feedback for this roadmap
    // NOTE: Check feedback regardless of completion status to properly track submission history
    console.log(`[Roadmap Feedback Check] Searching for feedback with:`, {
      user_id,
      roadmap_id: roadmap.roadmap_id,
      feedback_type: 'roadmap'
    });

    const existingFeedback = await user_feedback.findOne({
      where: {
        user_id,
        roadmap_id: roadmap.roadmap_id,
        feedback_type: 'roadmap'
      },
      raw: true // Get plain object for better logging
    });
    const hasSubmittedFeedback = !!existingFeedback;

    console.log(`[Roadmap Feedback Check] User: ${user_id}, Roadmap: ${roadmap.roadmap_id}, Feedback Found: ${hasSubmittedFeedback}`, existingFeedback ? `(Feedback ID: ${existingFeedback.id})` : '(No feedback found)');
    
    if (existingFeedback) {
      console.log(`[Roadmap Feedback Check] Existing feedback details:`, existingFeedback);
    }

    // Helper function to format minutes
    const formatMinutes = (totalMinutes) => {
      if (!totalMinutes || totalMinutes === 0) return '0m';
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      if (hours === 0) return `${minutes}m`;
      if (minutes === 0) return `${hours}h`;
      return `${hours}h ${minutes}m`;
    };

    // Calculate total time spent
    const totalTimeMinutes = userSteps.reduce((sum, step) => sum + (step.time_spent_minutes || 0), 0);

    // Format response with time tracking data
    const formattedRoadmap = userSteps.map(step => ({
      step_id: step.step_id,
      roadmap_id: step.roadmap_id,
      step_number: step.step_number,
      title: step.title,
      description: step.description,
      duration: step.duration,
      resources: step.resources,
      weeks: step.weeks,
      milestone_project: step.milestone_project,
      difficulty_level: step.difficulty_level || (step.step_number <= 3 ? 'beginner' : step.step_number <= 7 ? 'intermediate' : 'advanced'),
      is_done: step.is_done,
      started_at: step.started_at,
      completed_at: step.completed_at,
      time_spent_minutes: step.time_spent_minutes || 0,
      time_spent_formatted: formatMinutes(step.time_spent_minutes || 0),
    }));

    res.json({
      career_name: savedCareer.career_name,
      roadmap_id: roadmap.roadmap_id,
      roadmap: formattedRoadmap,
      total_steps: formattedRoadmap.length,
      completed_steps: formattedRoadmap.filter(step => step.is_done).length,
      steps_in_progress: formattedRoadmap.filter(step => step.started_at && !step.is_done).length,
      total_time_minutes: totalTimeMinutes,
      total_time_formatted: formatMinutes(totalTimeMinutes),
      is_completed: isCompleted,
      feedback_submitted: hasSubmittedFeedback,
      can_submit_feedback: isCompleted && !hasSubmittedFeedback
    });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap', details: error.message });
  }
};

const updateStepProgress = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { step_id } = req.params;
    const { is_done } = req.body;

    if (typeof is_done !== 'boolean') {
      return res.status(400).json({ message: 'is_done must be a boolean value' });
    }

    // Find the roadmap step and verify ownership
    const step = await RoadmapStep.findOne({
      where: { step_id, user_id },
      include: [{
        model: Roadmap,
        as: 'roadmap'
      }]
    });

    if (!step) {
      return res.status(404).json({ message: 'Roadmap step not found or unauthorized' });
    }

    // ✅ NEW VALIDATION: If user is trying to mark as done (is_done = true),
    // check if they have passed the assessment for this step
    if (is_done === true && !step.is_done) {
      // Find the assessment for this step
      const assessment = await RoadmapAssessment.findOne({
        where: {
          roadmap_id: step.roadmap_id,
          step_number: step.step_number
        }
      });

      if (assessment) {
        // Check if user has passed this assessment
        const passingResult = await UserRoadmapAssessmentResult.findOne({
          where: {
            user_id,
            roadmap_assessment_id: assessment.assessment_id,
            pass_fail_status: 'pass'
          }
        });

        if (!passingResult) {
          return res.status(403).json({
            message: 'You must pass the assessment before marking this step as done',
            assessment_required: true,
            step_number: step.step_number,
            hint: 'Complete the assessment for this step with a passing score (≥70%) to unlock manual marking'
          });
        }
      }
    }

    // Update the step progress
    const updateData = {
      is_done,
      updated_at: new Date(),
    };

    if (is_done && !step.is_done) {
      // Mark as completed
      updateData.completed_at = new Date();
    } else if (!is_done && step.is_done) {
      // Mark as incomplete
      updateData.completed_at = null;
    }

    await step.update(updateData);

    res.json({
      message: `Step ${is_done ? 'marked as completed' : 'marked as incomplete'}`,
      step: {
        step_id: step.step_id,
        step_number: step.step_number,
        title: step.title,
        is_done: step.is_done,
        completed_at: step.completed_at,
      }
    });
  } catch (error) {
    console.error('Error updating step progress:', error);
    res.status(500).json({ error: 'Failed to update step progress', details: error.message });
  }
};

const getRoadmapProgress = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { saved_career_id } = req.params;

    // Verify the saved career belongs to the user
    const savedCareer = await SavedCareer.findOne({ where: { saved_career_id, user_id } });
    if (!savedCareer) {
      return res.status(404).json({ message: 'Saved career not found or unauthorized' });
    }

    // Find the roadmap for this career
    const roadmap = await Roadmap.findOne({
      where: { career_name: savedCareer.career_name }
    });

    if (!roadmap) {
      return res.status(404).json({ message: 'No roadmap available for this career' });
    }

    // Get user's roadmap steps
    const userSteps = await RoadmapStep.findAll({
      where: { roadmap_id: roadmap.roadmap_id, user_id },
      order: [['step_number', 'ASC']]
    });

    const totalSteps = userSteps.length;
    const completedSteps = userSteps.filter(step => step.is_done).length;
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    const isCompleted = totalSteps > 0 && completedSteps === totalSteps;

    // Check if user has already submitted feedback for this roadmap
    // NOTE: Check feedback regardless of completion status to properly track submission history
    console.log(`[Roadmap Progress Feedback Check] Searching for feedback with:`, {
      user_id,
      roadmap_id: roadmap.roadmap_id,
      feedback_type: 'roadmap'
    });

    const existingFeedback = await user_feedback.findOne({
      where: {
        user_id,
        roadmap_id: roadmap.roadmap_id,
        feedback_type: 'roadmap'
      },
      raw: true
    });
    const hasSubmittedFeedback = !!existingFeedback;

    console.log(`[Roadmap Progress Feedback Check] User: ${user_id}, Roadmap: ${roadmap.roadmap_id}, Feedback Found: ${hasSubmittedFeedback}`, existingFeedback ? `(Feedback ID: ${existingFeedback.id})` : '(No feedback found)');
    
    if (existingFeedback) {
      console.log(`[Roadmap Progress Feedback Check] Existing feedback details:`, existingFeedback);
    }

    res.json({
      career_name: savedCareer.career_name,
      roadmap_id: roadmap.roadmap_id,
      total_steps: totalSteps,
      completed_steps: completedSteps,
      progress_percentage: progressPercentage,
      is_completed: isCompleted,
      feedback_submitted: hasSubmittedFeedback,
      can_submit_feedback: isCompleted && !hasSubmittedFeedback,
      steps: userSteps.map(step => ({
        step_id: step.step_id,
        step_number: step.step_number,
        title: step.title,
        is_done: step.is_done,
        completed_at: step.completed_at,
      }))
    });
  } catch (error) {
    console.error('Error fetching roadmap progress:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap progress', details: error.message });
  }
};

const deleteRoadmapStep = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { step_id } = req.params;

    // Find the roadmap step and verify ownership
    const step = await RoadmapStep.findOne({
      where: { step_id, user_id }
    });

    if (!step) {
      return res.status(404).json({ message: 'Roadmap step not found or unauthorized' });
    }

    await step.destroy();
    res.json({ message: 'Roadmap step deleted successfully' });
  } catch (error) {
    console.error('Error deleting roadmap step:', error);
    res.status(500).json({ error: 'Failed to delete roadmap step' });
  }
};

module.exports = {
  getRoadmap,
  updateStepProgress,
  getRoadmapProgress,
  deleteRoadmapStep
};