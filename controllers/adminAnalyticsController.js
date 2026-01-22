/**
 * Admin Analytics Controller
 * 
 * Provides aggregated analytics data for the Admin Dashboard.
 * All data is anonymized and aggregated for research purposes.
 */

const { User, Profile, SavedCareer, Roadmap, RoadmapStep, Question, UserRoadmapAssessmentResult, RoadmapAssessment } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

/**
 * Get Overview Statistics
 * Total users, roadmaps started, completion rates, etc.
 */
const getOverviewStats = async (req, res) => {
  try {
    // Total registered users
    const totalUsers = await User.count();

    // Total roadmaps started (saved careers)
    const totalRoadmapsStarted = await SavedCareer.count();

    // Total roadmap steps
    const totalSteps = await RoadmapStep.count();

    // Completed steps
    const completedSteps = await RoadmapStep.count({
      where: { is_done: true }
    });

    // Users who completed at least one step
    const activeUsers = await RoadmapStep.count({
      distinct: true,
      col: 'user_id',
      where: { is_done: true }
    });

    // Fully completed roadmaps - simplified approach
    // Count users who have completed all their roadmap steps
    // A roadmap is considered complete if a user has >= 10 completed steps for a given roadmap_id
    let completedRoadmapsCount = 0;
    try {
      const completedRoadmapResults = await RoadmapStep.findAll({
        attributes: [
          'user_id',
          'roadmap_id',
          [fn('COUNT', literal('CASE WHEN is_done = true THEN 1 END')), 'completed_count']
        ],
        group: ['user_id', 'roadmap_id'],
        having: literal('COUNT(CASE WHEN is_done = true THEN 1 END) >= 10'),
        raw: true
      });
      completedRoadmapsCount = completedRoadmapResults.length;
    } catch (e) {
      console.log('Completed roadmaps query simplified due to:', e.message);
      completedRoadmapsCount = 0;
    }

    // Total time spent (in minutes)
    const totalTimeResult = await RoadmapStep.findOne({
      attributes: [
        [fn('SUM', col('time_spent_minutes')), 'total_minutes']
      ]
    });
    const totalTimeMinutes = parseInt(totalTimeResult?.dataValues?.total_minutes || 0);

    // Average completion rate
    const completionRate = totalSteps > 0 
      ? Math.round((completedSteps / totalSteps) * 100) 
      : 0;

    // Users with profiles
    const usersWithProfiles = await Profile.count();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalRoadmapsStarted,
        totalSteps,
        completedSteps,
        activeUsers,
        completedRoadmaps: completedRoadmapsCount,
        completionRate,
        usersWithProfiles,
        totalTimeMinutes,
        totalTimeFormatted: formatMinutes(totalTimeMinutes)
      }
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview statistics',
      error: error.message
    });
  }
};

/**
 * Get Time Analytics
 * Average time per step, per difficulty, estimated vs actual
 */
const getTimeAnalytics = async (req, res) => {
  try {
    // Average time per step number
    const timePerStep = await RoadmapStep.findAll({
      attributes: [
        'step_number',
        [fn('AVG', col('time_spent_minutes')), 'avg_minutes'],
        [fn('COUNT', col('step_id')), 'total_steps'],
        [fn('SUM', col('time_spent_minutes')), 'total_minutes']
      ],
      where: {
        time_spent_minutes: { [Op.gt]: 0 }
      },
      group: ['step_number'],
      order: [['step_number', 'ASC']]
    });

    // Average time per difficulty level
    const timePerDifficulty = await RoadmapStep.findAll({
      attributes: [
        'difficulty_level',
        [fn('AVG', col('time_spent_minutes')), 'avg_minutes'],
        [fn('COUNT', col('step_id')), 'total_steps'],
        [fn('SUM', col('time_spent_minutes')), 'total_minutes']
      ],
      where: {
        time_spent_minutes: { [Op.gt]: 0 },
        difficulty_level: { [Op.ne]: null }
      },
      group: ['difficulty_level']
    });

    // Expected vs actual time (based on duration field)
    // Duration is stored as "X weeks" or "X-Y weeks"
    const stepsWithTime = await RoadmapStep.findAll({
      attributes: ['step_number', 'duration', 'time_spent_minutes', 'difficulty_level'],
      where: {
        time_spent_minutes: { [Op.gt]: 0 },
        is_done: true
      }
    });

    // Calculate estimated vs actual
    let estimatedVsActual = [];
    const stepTimeMap = new Map();

    stepsWithTime.forEach(step => {
      const stepNum = step.step_number;
      const actualMinutes = step.time_spent_minutes || 0;
      
      // Parse duration (e.g., "4 weeks" -> 4 * 7 * 8 hours * 60 minutes)
      // Assuming 8 hours/day, 5 days/week for learning
      let estimatedMinutes = 0;
      if (step.duration) {
        const match = step.duration.match(/(\d+)(?:-(\d+))?\s*weeks?/i);
        if (match) {
          const weeks = parseInt(match[1]);
          // Estimate: 8 hours/week of active learning
          estimatedMinutes = weeks * 8 * 60;
        }
      }

      if (!stepTimeMap.has(stepNum)) {
        stepTimeMap.set(stepNum, { 
          estimated: [], 
          actual: [],
          difficulty: step.difficulty_level
        });
      }
      stepTimeMap.get(stepNum).estimated.push(estimatedMinutes);
      stepTimeMap.get(stepNum).actual.push(actualMinutes);
    });

    // Calculate averages
    stepTimeMap.forEach((value, stepNum) => {
      const avgEstimated = value.estimated.reduce((a, b) => a + b, 0) / value.estimated.length;
      const avgActual = value.actual.reduce((a, b) => a + b, 0) / value.actual.length;
      estimatedVsActual.push({
        step_number: stepNum,
        difficulty: value.difficulty,
        avg_estimated_minutes: Math.round(avgEstimated),
        avg_actual_minutes: Math.round(avgActual),
        difference_percent: avgEstimated > 0 
          ? Math.round(((avgActual - avgEstimated) / avgEstimated) * 100) 
          : 0
      });
    });

    estimatedVsActual.sort((a, b) => a.step_number - b.step_number);

    res.json({
      success: true,
      data: {
        timePerStep: timePerStep.map(s => ({
          step_number: s.step_number,
          avg_minutes: Math.round(parseFloat(s.dataValues.avg_minutes) || 0),
          total_steps: parseInt(s.dataValues.total_steps) || 0,
          total_minutes: parseInt(s.dataValues.total_minutes) || 0,
          avg_formatted: formatMinutes(Math.round(parseFloat(s.dataValues.avg_minutes) || 0))
        })),
        timePerDifficulty: timePerDifficulty.map(d => ({
          difficulty: d.difficulty_level,
          avg_minutes: Math.round(parseFloat(d.dataValues.avg_minutes) || 0),
          total_steps: parseInt(d.dataValues.total_steps) || 0,
          total_minutes: parseInt(d.dataValues.total_minutes) || 0,
          avg_formatted: formatMinutes(Math.round(parseFloat(d.dataValues.avg_minutes) || 0))
        })),
        estimatedVsActual
      }
    });
  } catch (error) {
    console.error('Get time analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time analytics',
      error: error.message
    });
  }
};

/**
 * Get Assessment Analytics
 * Pass/fail rates, retakes, scores
 */
const getAssessmentAnalytics = async (req, res) => {
  try {
    // Total assessments taken
    const totalAssessments = await UserRoadmapAssessmentResult.count();

    // Passed assessments (pass_fail_status = 'pass')
    const passedAssessments = await UserRoadmapAssessmentResult.count({
      where: { pass_fail_status: 'pass' }
    });

    // Failed assessments
    const failedAssessments = await UserRoadmapAssessmentResult.count({
      where: { pass_fail_status: 'fail' }
    });

    // Pass rate
    const passRate = totalAssessments > 0 
      ? Math.round((passedAssessments / totalAssessments) * 100) 
      : 0;

    // Average score
    const avgScoreResult = await UserRoadmapAssessmentResult.findOne({
      attributes: [
        [fn('AVG', col('score')), 'avg_score']
      ]
    });
    const avgScore = Math.round(parseFloat(avgScoreResult?.dataValues?.avg_score) || 0);

    // Pass rate by step number - need to join with RoadmapAssessment
    const passRateByStep = await UserRoadmapAssessmentResult.findAll({
      include: [{
        model: RoadmapAssessment,
        as: 'assessment',
        attributes: ['step_number'],
        required: true
      }],
      attributes: [
        [fn('COUNT', col('UserRoadmapAssessmentResult.result_id')), 'total'],
        [fn('SUM', literal("CASE WHEN \"UserRoadmapAssessmentResult\".\"pass_fail_status\" = 'pass' THEN 1 ELSE 0 END")), 'passed'],
        [fn('AVG', col('UserRoadmapAssessmentResult.score')), 'avg_score']
      ],
      group: ['assessment.step_number', 'assessment.assessment_id'],
      raw: true
    });

    // Consolidate by step number
    const stepMap = new Map();
    passRateByStep.forEach(result => {
      const stepNum = result['assessment.step_number'];
      if (!stepMap.has(stepNum)) {
        stepMap.set(stepNum, { total: 0, passed: 0, totalScore: 0, count: 0 });
      }
      const data = stepMap.get(stepNum);
      data.total += parseInt(result.total) || 0;
      data.passed += parseInt(result.passed) || 0;
      data.totalScore += (parseFloat(result.avg_score) || 0) * (parseInt(result.total) || 0);
      data.count += parseInt(result.total) || 0;
    });

    const passRateByStepFormatted = Array.from(stepMap.entries())
      .map(([stepNum, data]) => ({
        step_number: stepNum,
        total: data.total,
        passed: data.passed,
        pass_rate: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0,
        avg_score: data.count > 0 ? Math.round(data.totalScore / data.count) : 0
      }))
      .sort((a, b) => a.step_number - b.step_number);

    // Retake analysis by attempt_count
    const retakeAnalysis = await UserRoadmapAssessmentResult.findAll({
      where: { attempt_count: { [Op.gt]: 1 } },
      attributes: [
        'user_id',
        [fn('MAX', col('attempt_count')), 'max_attempts']
      ],
      group: ['user_id']
    });

    const totalUsersWithRetakes = retakeAnalysis.length;
    const avgRetakesPerUser = retakeAnalysis.length > 0
      ? Math.round(retakeAnalysis.reduce((sum, r) => sum + parseInt(r.dataValues.max_attempts || 1), 0) / retakeAnalysis.length)
      : 0;

    // Score distribution
    const scoreDistribution = await UserRoadmapAssessmentResult.findAll({
      attributes: [
        [literal("CASE WHEN score >= 90 THEN '90-100' WHEN score >= 80 THEN '80-89' WHEN score >= 70 THEN '70-79' WHEN score >= 60 THEN '60-69' ELSE 'Below 60' END"), 'range'],
        [fn('COUNT', col('result_id')), 'count']
      ],
      group: [literal("CASE WHEN score >= 90 THEN '90-100' WHEN score >= 80 THEN '80-89' WHEN score >= 70 THEN '70-79' WHEN score >= 60 THEN '60-69' ELSE 'Below 60' END")]
    });

    res.json({
      success: true,
      data: {
        totalAssessments,
        passedAssessments,
        failedAssessments,
        passRate,
        avgScore,
        passRateByStep: passRateByStepFormatted,
        retakeStats: {
          usersWithRetakes: totalUsersWithRetakes,
          avgRetakesPerUser,
          totalRetakes: retakeAnalysis.length
        },
        scoreDistribution: scoreDistribution.map(s => ({
          range: s.dataValues.range,
          count: parseInt(s.dataValues.count) || 0
        }))
      }
    });
  } catch (error) {
    console.error('Get assessment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment analytics',
      error: error.message
    });
  }
};

/**
 * Get Dropoff Analytics
 * Where users commonly stop/abandon their roadmap
 */
const getDropoffAnalytics = async (req, res) => {
  try {
    // Steps started but not completed (by step number)
    const dropoffByStep = await RoadmapStep.findAll({
      attributes: [
        'step_number',
        [fn('COUNT', col('step_id')), 'total_started'],
        [fn('SUM', literal('CASE WHEN is_done = true THEN 1 ELSE 0 END')), 'completed'],
        [fn('SUM', literal('CASE WHEN is_done = false AND started_at IS NOT NULL THEN 1 ELSE 0 END')), 'abandoned']
      ],
      where: {
        started_at: { [Op.ne]: null }
      },
      group: ['step_number'],
      order: [['step_number', 'ASC']]
    });

    // Calculate dropoff rate per step
    const dropoffRates = dropoffByStep.map(s => {
      const total = parseInt(s.dataValues.total_started) || 0;
      const abandoned = parseInt(s.dataValues.abandoned) || 0;
      return {
        step_number: s.step_number,
        total_started: total,
        completed: parseInt(s.dataValues.completed) || 0,
        abandoned,
        dropoff_rate: total > 0 ? Math.round((abandoned / total) * 100) : 0
      };
    });

    // Users' last active step (where they stopped)
    const userLastStep = await RoadmapStep.findAll({
      attributes: [
        'user_id',
        [fn('MAX', col('step_number')), 'last_step']
      ],
      where: {
        is_done: true
      },
      group: ['user_id']
    });

    // Distribution of where users stopped
    const stoppedAtDistribution = {};
    userLastStep.forEach(u => {
      const step = u.dataValues.last_step;
      stoppedAtDistribution[step] = (stoppedAtDistribution[step] || 0) + 1;
    });

    // Convert to array format
    const stoppedAtArray = Object.entries(stoppedAtDistribution)
      .map(([step, count]) => ({ step: parseInt(step), count }))
      .sort((a, b) => a.step - b.step);

    // Average progress before dropping off
    const avgProgressResult = await RoadmapStep.findOne({
      attributes: [
        [fn('AVG', literal('CASE WHEN is_done = true THEN step_number ELSE 0 END')), 'avg_progress']
      ]
    });

    res.json({
      success: true,
      data: {
        dropoffByStep: dropoffRates,
        stoppedAtDistribution: stoppedAtArray,
        avgLastCompletedStep: Math.round(parseFloat(avgProgressResult?.dataValues?.avg_progress) || 0),
        highestDropoffStep: dropoffRates.reduce((max, s) => 
          s.dropoff_rate > (max?.dropoff_rate || 0) ? s : max, null
        )
      }
    });
  } catch (error) {
    console.error('Get dropoff analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dropoff analytics',
      error: error.message
    });
  }
};

/**
 * Get Difficulty Analytics
 * Completion and performance by difficulty level
 */
const getDifficultyAnalytics = async (req, res) => {
  try {
    // Completion rates by difficulty
    const completionByDifficulty = await RoadmapStep.findAll({
      attributes: [
        'difficulty_level',
        [fn('COUNT', col('step_id')), 'total_steps'],
        [fn('SUM', literal('CASE WHEN is_done = true THEN 1 ELSE 0 END')), 'completed'],
        [fn('AVG', col('time_spent_minutes')), 'avg_time']
      ],
      where: {
        difficulty_level: { [Op.ne]: null }
      },
      group: ['difficulty_level']
    });

    // Format completion data
    const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
    const completionData = completionByDifficulty.map(d => {
      const total = parseInt(d.dataValues.total_steps) || 0;
      const completed = parseInt(d.dataValues.completed) || 0;
      return {
        difficulty: d.difficulty_level,
        total_steps: total,
        completed,
        completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        avg_time_minutes: Math.round(parseFloat(d.dataValues.avg_time) || 0),
        avg_time_formatted: formatMinutes(Math.round(parseFloat(d.dataValues.avg_time) || 0))
      };
    }).sort((a, b) => difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty));

    res.json({
      success: true,
      data: {
        completionByDifficulty: completionData,
        // Assessment by difficulty removed - complex join not supported in current schema
        assessmentByDifficulty: []
      }
    });
  } catch (error) {
    console.error('Get difficulty analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch difficulty analytics',
      error: error.message
    });
  }
};

/**
 * Get Career Analytics
 * Most popular careers, completion rates by career
 */
const getCareerAnalytics = async (req, res) => {
  try {
    // Most popular careers (most saved)
    const popularCareers = await SavedCareer.findAll({
      attributes: [
        'career_name',
        [fn('COUNT', col('saved_career_id')), 'total_users']
      ],
      group: ['career_name'],
      order: [[fn('COUNT', col('saved_career_id')), 'DESC']],
      limit: 10
    });

    // Get completion rates by career from roadmap_steps 
    // Using Roadmap table which is linked via career_name
    const careerCompletionRaw = await RoadmapStep.findAll({
      include: [{
        model: Roadmap,
        as: 'roadmap',
        attributes: ['career_name'],
        required: true
      }],
      attributes: [
        [fn('COUNT', col('step_id')), 'total_steps'],
        [fn('SUM', literal('CASE WHEN is_done = true THEN 1 ELSE 0 END')), 'completed_steps'],
        [fn('COUNT', literal('DISTINCT user_id')), 'user_count']
      ],
      group: ['roadmap.roadmap_id', 'roadmap.career_name'],
      raw: true
    });

    // Format career completion rates
    const careerCompletionRates = careerCompletionRaw.map(c => {
      const total = parseInt(c.total_steps) || 0;
      const completed = parseInt(c.completed_steps) || 0;
      return {
        career_name: c['roadmap.career_name'] || 'Unknown',
        users: parseInt(c.user_count) || 0,
        total_steps: total,
        completed_steps: completed,
        completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    }).sort((a, b) => b.users - a.users);

    res.json({
      success: true,
      data: {
        popularCareers: popularCareers.map(c => ({
          career_name: c.career_name,
          total_users: parseInt(c.dataValues.total_users) || 0
        })),
        careerCompletionRates
      }
    });
  } catch (error) {
    console.error('Get career analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch career analytics',
      error: error.message
    });
  }
};

/**
 * Get All Analytics (Combined endpoint for dashboard)
 */
const getAllAnalytics = async (req, res) => {
  try {
    // Run all analytics queries in parallel for efficiency
    const [
      overviewResult,
      timeResult,
      assessmentResult,
      dropoffResult,
      difficultyResult,
      careerResult
    ] = await Promise.all([
      getOverviewData(),
      getTimeData(),
      getAssessmentData(),
      getDropoffData(),
      getDifficultyData(),
      getCareerData()
    ]);

    res.json({
      success: true,
      data: {
        overview: overviewResult,
        time: timeResult,
        assessments: assessmentResult,
        dropoff: dropoffResult,
        difficulty: difficultyResult,
        careers: careerResult
      }
    });
  } catch (error) {
    console.error('Get all analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Helper function to format minutes
function formatMinutes(minutes) {
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

// Helper functions for combined endpoint (return data without res)
async function getOverviewData() {
  const totalUsers = await User.count();
  const totalRoadmapsStarted = await SavedCareer.count();
  const totalSteps = await RoadmapStep.count();
  const completedSteps = await RoadmapStep.count({ where: { is_done: true } });
  const totalTimeResult = await RoadmapStep.findOne({
    attributes: [[fn('SUM', col('time_spent_minutes')), 'total_minutes']]
  });

  return {
    totalUsers,
    totalRoadmapsStarted,
    totalSteps,
    completedSteps,
    completionRate: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
    totalTimeMinutes: parseInt(totalTimeResult?.dataValues?.total_minutes || 0)
  };
}

async function getTimeData() {
  const timePerStep = await RoadmapStep.findAll({
    attributes: [
      'step_number',
      [fn('AVG', col('time_spent_minutes')), 'avg_minutes']
    ],
    where: { time_spent_minutes: { [Op.gt]: 0 } },
    group: ['step_number'],
    order: [['step_number', 'ASC']]
  });

  return timePerStep.map(s => ({
    step_number: s.step_number,
    avg_minutes: Math.round(parseFloat(s.dataValues.avg_minutes) || 0)
  }));
}

async function getAssessmentData() {
  const total = await UserRoadmapAssessmentResult.count();
  const passed = await UserRoadmapAssessmentResult.count({ where: { pass_fail_status: 'pass' } });
  
  return {
    total,
    passed,
    passRate: total > 0 ? Math.round((passed / total) * 100) : 0
  };
}

async function getDropoffData() {
  const dropoffByStep = await RoadmapStep.findAll({
    attributes: [
      'step_number',
      [fn('COUNT', col('step_id')), 'total'],
      [fn('SUM', literal('CASE WHEN is_done = false AND started_at IS NOT NULL THEN 1 ELSE 0 END')), 'abandoned']
    ],
    where: { started_at: { [Op.ne]: null } },
    group: ['step_number'],
    order: [['step_number', 'ASC']]
  });

  return dropoffByStep.map(s => ({
    step_number: s.step_number,
    dropoff_rate: parseInt(s.dataValues.total) > 0 
      ? Math.round((parseInt(s.dataValues.abandoned) / parseInt(s.dataValues.total)) * 100) 
      : 0
  }));
}

async function getDifficultyData() {
  const data = await RoadmapStep.findAll({
    attributes: [
      'difficulty_level',
      [fn('COUNT', col('step_id')), 'total'],
      [fn('SUM', literal('CASE WHEN is_done = true THEN 1 ELSE 0 END')), 'completed']
    ],
    where: { difficulty_level: { [Op.ne]: null } },
    group: ['difficulty_level']
  });

  return data.map(d => ({
    difficulty: d.difficulty_level,
    completion_rate: parseInt(d.dataValues.total) > 0 
      ? Math.round((parseInt(d.dataValues.completed) / parseInt(d.dataValues.total)) * 100) 
      : 0
  }));
}

async function getCareerData() {
  const careers = await SavedCareer.findAll({
    attributes: ['career_name', [fn('COUNT', col('saved_career_id')), 'count']],
    group: ['career_name'],
    order: [[fn('COUNT', col('saved_career_id')), 'DESC']],
    limit: 5
  });

  return careers.map(c => ({
    career: c.career_name,
    users: parseInt(c.dataValues.count) || 0
  }));
}

module.exports = {
  getOverviewStats,
  getTimeAnalytics,
  getAssessmentAnalytics,
  getDropoffAnalytics,
  getDifficultyAnalytics,
  getCareerAnalytics,
  getAllAnalytics
};
