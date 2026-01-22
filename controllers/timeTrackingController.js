/**
 * Time Tracking Controller
 * Handles time tracking for learning progress on roadmap steps
 */

const { RoadmapStep, Roadmap, SavedCareer } = require('../models');
const { Op } = require('sequelize');

/**
 * Start tracking time for a step
 * Records when user begins working on a step
 */
const startStep = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { step_id } = req.params;

    // Find the step and verify ownership
    const step = await RoadmapStep.findOne({
      where: { step_id, user_id }
    });

    if (!step) {
      return res.status(404).json({ message: 'Roadmap step not found or unauthorized' });
    }

    // Only set started_at if it hasn't been set before
    if (!step.started_at) {
      await step.update({
        started_at: new Date()
      });
      
      console.log(`[Time Tracking] Step ${step_id} started by user ${user_id}`);
      
      return res.json({
        message: 'Step started',
        step_id: step.step_id,
        started_at: step.started_at,
        is_first_start: true
      });
    }

    return res.json({
      message: 'Step already started',
      step_id: step.step_id,
      started_at: step.started_at,
      is_first_start: false
    });
  } catch (error) {
    console.error('Error starting step:', error);
    res.status(500).json({ error: 'Failed to start step', details: error.message });
  }
};

/**
 * Record time spent on a step
 * Updates the cumulative time spent
 */
const recordTimeSpent = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { step_id } = req.params;
    const { minutes } = req.body;

    if (typeof minutes !== 'number' || minutes < 0) {
      return res.status(400).json({ message: 'Invalid minutes value. Must be a non-negative number.' });
    }

    // Find the step and verify ownership
    const step = await RoadmapStep.findOne({
      where: { step_id, user_id }
    });

    if (!step) {
      return res.status(404).json({ message: 'Roadmap step not found or unauthorized' });
    }

    // Add to existing time spent
    const newTimeSpent = step.time_spent_minutes + minutes;
    
    await step.update({
      time_spent_minutes: newTimeSpent,
      // Auto-start if not already started
      started_at: step.started_at || new Date()
    });

    console.log(`[Time Tracking] Step ${step_id}: Added ${minutes} min, Total: ${newTimeSpent} min`);

    return res.json({
      message: 'Time recorded',
      step_id: step.step_id,
      minutes_added: minutes,
      total_time_spent_minutes: newTimeSpent,
      started_at: step.started_at
    });
  } catch (error) {
    console.error('Error recording time:', error);
    res.status(500).json({ error: 'Failed to record time', details: error.message });
  }
};

/**
 * Get time statistics for a single step
 */
const getStepTimeStats = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { step_id } = req.params;

    const step = await RoadmapStep.findOne({
      where: { step_id, user_id }
    });

    if (!step) {
      return res.status(404).json({ message: 'Roadmap step not found or unauthorized' });
    }

    // Calculate calendar days if both started and completed
    let calendar_days = null;
    if (step.started_at && step.completed_at) {
      const startDate = new Date(step.started_at);
      const endDate = new Date(step.completed_at);
      calendar_days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    } else if (step.started_at) {
      // Calculate days since started (in progress)
      const startDate = new Date(step.started_at);
      const now = new Date();
      calendar_days = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    }

    return res.json({
      step_id: step.step_id,
      step_number: step.step_number,
      title: step.title,
      difficulty_level: step.difficulty_level,
      estimated_duration: step.duration,
      started_at: step.started_at,
      completed_at: step.completed_at,
      is_done: step.is_done,
      time_spent_minutes: step.time_spent_minutes,
      time_spent_formatted: formatMinutes(step.time_spent_minutes),
      calendar_days,
      status: step.is_done ? 'completed' : (step.started_at ? 'in_progress' : 'not_started')
    });
  } catch (error) {
    console.error('Error getting step time stats:', error);
    res.status(500).json({ error: 'Failed to get step time stats', details: error.message });
  }
};

/**
 * Get time statistics for entire roadmap
 */
const getRoadmapTimeStats = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { saved_career_id } = req.params;

    // Verify saved career ownership
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
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Get all steps for this user's roadmap
    const steps = await RoadmapStep.findAll({
      where: { roadmap_id: roadmap.roadmap_id, user_id },
      order: [['step_number', 'ASC']]
    });

    if (steps.length === 0) {
      return res.status(404).json({ message: 'No roadmap steps found' });
    }

    // Calculate aggregated statistics
    const totalTimeMinutes = steps.reduce((sum, step) => sum + step.time_spent_minutes, 0);
    
    const timeByDifficulty = {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    };
    
    const stepStats = [];
    let stepsStarted = 0;
    let stepsCompleted = 0;
    let stepsNotStarted = 0;

    steps.forEach(step => {
      // Count by status
      if (step.is_done) {
        stepsCompleted++;
      } else if (step.started_at) {
        stepsStarted++;
      } else {
        stepsNotStarted++;
      }

      // Sum time by difficulty
      const difficulty = step.difficulty_level || 'beginner';
      timeByDifficulty[difficulty] += step.time_spent_minutes;

      // Calculate calendar days
      let calendar_days = null;
      if (step.started_at && step.completed_at) {
        const startDate = new Date(step.started_at);
        const endDate = new Date(step.completed_at);
        calendar_days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      } else if (step.started_at) {
        const startDate = new Date(step.started_at);
        const now = new Date();
        calendar_days = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
      }

      stepStats.push({
        step_id: step.step_id,
        step_number: step.step_number,
        title: step.title,
        difficulty_level: difficulty,
        estimated_duration: step.duration,
        started_at: step.started_at,
        completed_at: step.completed_at,
        is_done: step.is_done,
        time_spent_minutes: step.time_spent_minutes,
        time_spent_formatted: formatMinutes(step.time_spent_minutes),
        calendar_days,
        status: step.is_done ? 'completed' : (step.started_at ? 'in_progress' : 'not_started')
      });
    });

    // Calculate average time per completed step
    const averageTimePerStep = stepsCompleted > 0 
      ? Math.round(totalTimeMinutes / stepsCompleted) 
      : 0;

    // Calculate earliest start and latest completion for total calendar duration
    const startedSteps = steps.filter(s => s.started_at);
    const completedSteps = steps.filter(s => s.completed_at);
    
    let firstStartDate = null;
    let lastCompletionDate = null;
    let totalCalendarDays = null;

    if (startedSteps.length > 0) {
      firstStartDate = new Date(Math.min(...startedSteps.map(s => new Date(s.started_at))));
    }
    
    if (completedSteps.length > 0) {
      lastCompletionDate = new Date(Math.max(...completedSteps.map(s => new Date(s.completed_at))));
    }

    if (firstStartDate) {
      const endDate = lastCompletionDate || new Date();
      totalCalendarDays = Math.ceil((endDate - firstStartDate) / (1000 * 60 * 60 * 24));
    }

    return res.json({
      roadmap_id: roadmap.roadmap_id,
      career_name: savedCareer.career_name,
      total_steps: steps.length,
      steps_not_started: stepsNotStarted,
      steps_in_progress: stepsStarted,
      steps_completed: stepsCompleted,
      total_time_minutes: totalTimeMinutes,
      total_time_formatted: formatMinutes(totalTimeMinutes),
      time_by_difficulty: {
        beginner: {
          minutes: timeByDifficulty.beginner,
          formatted: formatMinutes(timeByDifficulty.beginner)
        },
        intermediate: {
          minutes: timeByDifficulty.intermediate,
          formatted: formatMinutes(timeByDifficulty.intermediate)
        },
        advanced: {
          minutes: timeByDifficulty.advanced,
          formatted: formatMinutes(timeByDifficulty.advanced)
        }
      },
      average_time_per_step_minutes: averageTimePerStep,
      average_time_per_step_formatted: formatMinutes(averageTimePerStep),
      first_start_date: firstStartDate,
      last_completion_date: lastCompletionDate,
      total_calendar_days: totalCalendarDays,
      completion_percentage: Math.round((stepsCompleted / steps.length) * 100),
      steps: stepStats
    });
  } catch (error) {
    console.error('Error getting roadmap time stats:', error);
    res.status(500).json({ error: 'Failed to get roadmap time stats', details: error.message });
  }
};

/**
 * Get aggregated time statistics by difficulty level
 */
const getDifficultyTimeStats = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { saved_career_id } = req.params;

    // Verify saved career ownership
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
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Get all steps grouped by difficulty
    const steps = await RoadmapStep.findAll({
      where: { roadmap_id: roadmap.roadmap_id, user_id },
      order: [['step_number', 'ASC']]
    });

    const difficultyStats = {
      beginner: { total_steps: 0, completed: 0, in_progress: 0, not_started: 0, total_minutes: 0, avg_minutes: 0 },
      intermediate: { total_steps: 0, completed: 0, in_progress: 0, not_started: 0, total_minutes: 0, avg_minutes: 0 },
      advanced: { total_steps: 0, completed: 0, in_progress: 0, not_started: 0, total_minutes: 0, avg_minutes: 0 }
    };

    steps.forEach(step => {
      const difficulty = step.difficulty_level || 'beginner';
      const stats = difficultyStats[difficulty];
      
      stats.total_steps++;
      stats.total_minutes += step.time_spent_minutes;
      
      if (step.is_done) {
        stats.completed++;
      } else if (step.started_at) {
        stats.in_progress++;
      } else {
        stats.not_started++;
      }
    });

    // Calculate averages
    Object.keys(difficultyStats).forEach(difficulty => {
      const stats = difficultyStats[difficulty];
      if (stats.completed > 0) {
        stats.avg_minutes = Math.round(stats.total_minutes / stats.completed);
      }
      stats.total_formatted = formatMinutes(stats.total_minutes);
      stats.avg_formatted = formatMinutes(stats.avg_minutes);
    });

    return res.json({
      career_name: savedCareer.career_name,
      difficulty_breakdown: difficultyStats
    });
  } catch (error) {
    console.error('Error getting difficulty time stats:', error);
    res.status(500).json({ error: 'Failed to get difficulty time stats', details: error.message });
  }
};

/**
 * Helper function to format minutes into readable string
 */
function formatMinutes(totalMinutes) {
  if (totalMinutes === 0) return '0m';
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

module.exports = {
  startStep,
  recordTimeSpent,
  getStepTimeStats,
  getRoadmapTimeStats,
  getDifficultyTimeStats
};
