/**
 * Student Progress Controller
 * 
 * Provides personalized learning progress data for individual students.
 * All data is scoped to the authenticated user only.
 */

const { SavedCareer, Roadmap, RoadmapStep, UserRoadmapAssessmentResult, RoadmapAssessment } = require('../models');

/**
 * Get complete student progress data
 * Returns all progress information for the authenticated user
 */
const getStudentProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's saved careers
    const savedCareers = await SavedCareer.findAll({
      where: { user_id: userId },
      order: [['saved_at', 'DESC']]
    });

    if (!savedCareers || savedCareers.length === 0) {
      return res.json({
        success: true,
        data: {
          hasProgress: false,
          message: 'No learning paths started yet',
          careers: [],
          summary: {
            totalCareers: 0,
            totalSteps: 0,
            completedSteps: 0,
            totalTimeMinutes: 0,
            overallProgress: 0
          }
        }
      });
    }

    // Get career names for roadmap lookup
    const careerNames = savedCareers.map(sc => sc.career_name);

    // Get roadmaps for these careers (Roadmap is shared, not per-user)
    const roadmaps = await Roadmap.findAll({
      where: { career_name: careerNames }
    });

    // Get roadmap IDs
    const roadmapIds = roadmaps.map(r => r.roadmap_id);

    // Get user-specific steps for these roadmaps
    const allUserSteps = await RoadmapStep.findAll({
      where: { 
        roadmap_id: roadmapIds,
        user_id: userId 
      },
      order: [['step_number', 'ASC']]
    });

    // Get all assessment results for this user
    const assessmentResults = await UserRoadmapAssessmentResult.findAll({
      where: { user_id: userId },
      include: [{
        model: RoadmapAssessment,
        as: 'assessment',
        attributes: ['assessment_id', 'step_number', 'roadmap_id']
      }]
    });

    // Build progress data for each career
    const careersProgress = [];
    let totalSteps = 0;
    let completedSteps = 0;
    let totalTimeMinutes = 0;

    for (const savedCareer of savedCareers) {
      // Find the roadmap for this career
      const roadmap = roadmaps.find(r => r.career_name === savedCareer.career_name);
      
      if (!roadmap) continue;

      // Get steps for this roadmap and user
      const steps = allUserSteps.filter(s => s.roadmap_id === roadmap.roadmap_id);
      const sortedSteps = steps.sort((a, b) => a.step_number - b.step_number);

      // If no steps exist yet, this career hasn't been started
      if (sortedSteps.length === 0) continue;

      // Find the current active step (first incomplete step)
      let currentStep = null;
      let completedCount = 0;
      let careerTimeMinutes = 0;

      const stepsProgress = sortedSteps.map((step, index) => {
        const isCompleted = step.is_done === true;
        const timeSpent = step.time_spent_minutes || 0;
        careerTimeMinutes += timeSpent;

        if (isCompleted) {
          completedCount++;
        } else if (!currentStep) {
          currentStep = step;
        }

        // Determine step status
        let status = 'locked';
        if (isCompleted) {
          status = 'completed';
        } else if (index === 0 || sortedSteps[index - 1]?.is_done) {
          status = 'in-progress';
        }

        // Get assessment info for this step
        const stepAssessment = assessmentResults.find(
          ar => ar.assessment?.roadmap_id === roadmap.roadmap_id &&
                ar.assessment?.step_number === step.step_number
        );

        return {
          step_id: step.step_id,
          step_number: step.step_number,
          title: step.title,
          description: step.description,
          duration: step.duration,
          difficulty_level: step.difficulty_level || 'beginner',
          status,
          is_done: isCompleted,
          time_spent_minutes: timeSpent,
          time_spent_formatted: formatMinutes(timeSpent),
          started_at: step.started_at,
          completed_at: step.completed_at,
          assessment: stepAssessment ? {
            completed: true,
            passed: stepAssessment.pass_fail_status === 'pass',
            score: parseFloat(stepAssessment.score) || 0,
            attempts: stepAssessment.attempt_count || 1
          } : {
            completed: false,
            passed: false,
            score: 0,
            attempts: 0
          }
        };
      });

      totalSteps += sortedSteps.length;
      completedSteps += completedCount;
      totalTimeMinutes += careerTimeMinutes;

      // Calculate progress percentage
      const progressPercent = sortedSteps.length > 0 
        ? Math.round((completedCount / sortedSteps.length) * 100) 
        : 0;

      careersProgress.push({
        saved_career_id: savedCareer.saved_career_id,
        career_name: savedCareer.career_name,
        saved_at: savedCareer.saved_at,
        roadmap_id: roadmap.roadmap_id,
        total_steps: sortedSteps.length,
        completed_steps: completedCount,
        remaining_steps: sortedSteps.length - completedCount,
        progress_percent: progressPercent,
        is_completed: completedCount === sortedSteps.length && sortedSteps.length > 0,
        total_time_minutes: careerTimeMinutes,
        total_time_formatted: formatMinutes(careerTimeMinutes),
        current_step: currentStep ? {
          step_number: currentStep.step_number,
          title: currentStep.title,
          difficulty_level: currentStep.difficulty_level || 'beginner'
        } : null,
        steps: stepsProgress,
        difficulty_breakdown: {
          beginner: stepsProgress.filter(s => s.difficulty_level === 'beginner').length,
          intermediate: stepsProgress.filter(s => s.difficulty_level === 'intermediate').length,
          advanced: stepsProgress.filter(s => s.difficulty_level === 'advanced').length
        }
      });
    }

    // Calculate overall progress
    const overallProgress = totalSteps > 0 
      ? Math.round((completedSteps / totalSteps) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        hasProgress: careersProgress.length > 0,
        careers: careersProgress,
        summary: {
          totalCareers: careersProgress.length,
          totalSteps,
          completedSteps,
          remainingSteps: totalSteps - completedSteps,
          totalTimeMinutes,
          totalTimeFormatted: formatMinutes(totalTimeMinutes),
          overallProgress,
          activeCareers: careersProgress.filter(c => !c.is_completed).length,
          completedCareers: careersProgress.filter(c => c.is_completed).length
        }
      }
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student progress',
      error: error.message
    });
  }
};

/**
 * Get progress for a specific career
 */
const getCareerProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { savedCareerId } = req.params;

    // Verify the career belongs to this user
    const savedCareer = await SavedCareer.findOne({
      where: { 
        saved_career_id: savedCareerId,
        user_id: userId 
      }
    });

    if (!savedCareer) {
      return res.status(404).json({
        success: false,
        message: 'Career not found or access denied'
      });
    }

    // Get the roadmap for this career (shared table)
    const roadmap = await Roadmap.findOne({
      where: { career_name: savedCareer.career_name }
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    // Get user-specific steps for this roadmap
    const steps = await RoadmapStep.findAll({
      where: { 
        roadmap_id: roadmap.roadmap_id,
        user_id: userId 
      },
      order: [['step_number', 'ASC']]
    });

    if (steps.length === 0) {
      return res.json({
        success: true,
        data: {
          saved_career_id: savedCareer.saved_career_id,
          career_name: savedCareer.career_name,
          roadmap_id: roadmap.roadmap_id,
          total_steps: 0,
          completed_steps: 0,
          remaining_steps: 0,
          progress_percent: 0,
          is_completed: false,
          total_time_minutes: 0,
          total_time_formatted: '0m',
          current_step: null,
          steps: [],
          difficulty_breakdown: { beginner: 0, intermediate: 0, advanced: 0 }
        }
      });
    }

    // Get assessment results for this roadmap
    const assessmentResults = await UserRoadmapAssessmentResult.findAll({
      where: { user_id: userId },
      include: [{
        model: RoadmapAssessment,
        as: 'assessment',
        where: { roadmap_id: roadmap.roadmap_id },
        attributes: ['assessment_id', 'step_number', 'roadmap_id'],
        required: true
      }]
    });

    const sortedSteps = steps.sort((a, b) => a.step_number - b.step_number);

    let completedCount = 0;
    let totalTimeMinutes = 0;
    let currentStep = null;

    const stepsProgress = sortedSteps.map((step, index) => {
      const isCompleted = step.is_done === true;
      const timeSpent = step.time_spent_minutes || 0;
      totalTimeMinutes += timeSpent;

      if (isCompleted) {
        completedCount++;
      } else if (!currentStep) {
        currentStep = step;
      }

      // Determine step status
      let status = 'locked';
      if (isCompleted) {
        status = 'completed';
      } else if (index === 0 || sortedSteps[index - 1]?.is_done) {
        status = 'in-progress';
      }

      // Get assessment info
      const stepAssessment = assessmentResults.find(
        ar => ar.assessment?.step_number === step.step_number
      );

      return {
        step_id: step.step_id,
        step_number: step.step_number,
        title: step.title,
        description: step.description,
        duration: step.duration,
        difficulty_level: step.difficulty_level || 'beginner',
        status,
        is_done: isCompleted,
        time_spent_minutes: timeSpent,
        time_spent_formatted: formatMinutes(timeSpent),
        started_at: step.started_at,
        completed_at: step.completed_at,
        resources: step.resources,
        assessment: stepAssessment ? {
          completed: true,
          passed: stepAssessment.pass_fail_status === 'pass',
          score: parseFloat(stepAssessment.score) || 0
        } : {
          completed: false,
          passed: false,
          score: 0
        }
      };
    });

    const progressPercent = sortedSteps.length > 0 
      ? Math.round((completedCount / sortedSteps.length) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        saved_career_id: savedCareer.saved_career_id,
        career_name: savedCareer.career_name,
        roadmap_id: roadmap.roadmap_id,
        total_steps: sortedSteps.length,
        completed_steps: completedCount,
        remaining_steps: sortedSteps.length - completedCount,
        progress_percent: progressPercent,
        is_completed: completedCount === sortedSteps.length && sortedSteps.length > 0,
        total_time_minutes: totalTimeMinutes,
        total_time_formatted: formatMinutes(totalTimeMinutes),
        current_step: currentStep ? {
          step_number: currentStep.step_number,
          title: currentStep.title,
          difficulty_level: currentStep.difficulty_level || 'beginner'
        } : null,
        steps: stepsProgress,
        difficulty_breakdown: {
          beginner: stepsProgress.filter(s => s.difficulty_level === 'beginner').length,
          intermediate: stepsProgress.filter(s => s.difficulty_level === 'intermediate').length,
          advanced: stepsProgress.filter(s => s.difficulty_level === 'advanced').length
        }
      }
    });
  } catch (error) {
    console.error('Get career progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch career progress',
      error: error.message
    });
  }
};

/**
 * Get learning statistics summary
 */
const getLearningStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all steps for this user
    const allSteps = await RoadmapStep.findAll({
      where: { user_id: userId }
    });

    // Get all assessment results
    const assessmentResults = await UserRoadmapAssessmentResult.findAll({
      where: { user_id: userId }
    });

    // Calculate stats
    const totalSteps = allSteps.length;
    const completedSteps = allSteps.filter(s => s.is_done).length;
    const totalTimeMinutes = allSteps.reduce((sum, s) => sum + (s.time_spent_minutes || 0), 0);

    // Group by difficulty
    const byDifficulty = {
      beginner: { total: 0, completed: 0, time: 0 },
      intermediate: { total: 0, completed: 0, time: 0 },
      advanced: { total: 0, completed: 0, time: 0 }
    };

    allSteps.forEach(step => {
      const diff = step.difficulty_level || 'beginner';
      if (byDifficulty[diff]) {
        byDifficulty[diff].total++;
        if (step.is_done) byDifficulty[diff].completed++;
        byDifficulty[diff].time += step.time_spent_minutes || 0;
      }
    });

    // Assessment stats
    const totalAssessments = assessmentResults.length;
    const passedAssessments = assessmentResults.filter(a => a.pass_fail_status === 'pass').length;
    const avgScore = assessmentResults.length > 0
      ? Math.round(assessmentResults.reduce((sum, a) => sum + parseFloat(a.score || 0), 0) / assessmentResults.length)
      : 0;

    // Calculate streak (consecutive days with activity)
    const stepsWithDates = allSteps
      .filter(s => s.completed_at)
      .map(s => new Date(s.completed_at).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b) - new Date(a));

    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (stepsWithDates.length > 0) {
      if (stepsWithDates[0] === today || stepsWithDates[0] === yesterday) {
        currentStreak = 1;
        for (let i = 1; i < stepsWithDates.length; i++) {
          const date1 = new Date(stepsWithDates[i - 1]);
          const date2 = new Date(stepsWithDates[i]);
          const diffDays = Math.round((date1 - date2) / 86400000);
          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        steps: {
          total: totalSteps,
          completed: completedSteps,
          remaining: totalSteps - completedSteps,
          completionRate: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
        },
        time: {
          totalMinutes: totalTimeMinutes,
          totalFormatted: formatMinutes(totalTimeMinutes),
          avgPerStep: completedSteps > 0 ? Math.round(totalTimeMinutes / completedSteps) : 0,
          avgPerStepFormatted: completedSteps > 0 ? formatMinutes(Math.round(totalTimeMinutes / completedSteps)) : '0m'
        },
        difficulty: {
          beginner: {
            ...byDifficulty.beginner,
            timeFormatted: formatMinutes(byDifficulty.beginner.time),
            completionRate: byDifficulty.beginner.total > 0 
              ? Math.round((byDifficulty.beginner.completed / byDifficulty.beginner.total) * 100) 
              : 0
          },
          intermediate: {
            ...byDifficulty.intermediate,
            timeFormatted: formatMinutes(byDifficulty.intermediate.time),
            completionRate: byDifficulty.intermediate.total > 0 
              ? Math.round((byDifficulty.intermediate.completed / byDifficulty.intermediate.total) * 100) 
              : 0
          },
          advanced: {
            ...byDifficulty.advanced,
            timeFormatted: formatMinutes(byDifficulty.advanced.time),
            completionRate: byDifficulty.advanced.total > 0 
              ? Math.round((byDifficulty.advanced.completed / byDifficulty.advanced.total) * 100) 
              : 0
          }
        },
        assessments: {
          total: totalAssessments,
          passed: passedAssessments,
          failed: totalAssessments - passedAssessments,
          passRate: totalAssessments > 0 ? Math.round((passedAssessments / totalAssessments) * 100) : 0,
          avgScore
        },
        streak: {
          current: currentStreak,
          message: currentStreak > 0 
            ? `🔥 ${currentStreak} day${currentStreak > 1 ? 's' : ''} streak!` 
            : 'Start learning to build your streak!'
        }
      }
    });
  } catch (error) {
    console.error('Get learning stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning stats',
      error: error.message
    });
  }
};

// Helper function to format minutes
function formatMinutes(minutes) {
  if (!minutes || minutes === 0) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

module.exports = {
  getStudentProgress,
  getCareerProgress,
  getLearningStats
};
