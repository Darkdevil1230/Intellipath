const Analytics = require('../models/Analytics');
const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const { addUserBadge } = require('../utils/achievements');

const getAnalytics = async (req, res) => {
  try {
    let analytics = await Analytics.findOne({ user: req.user._id });
    
    if (!analytics) {
      analytics = await Analytics.create({ user: req.user._id });
    }

    // Calculate current progress from roadmap if exists
    const roadmap = await Roadmap.findOne({ user: req.user._id });
    if (roadmap) {
      analytics.roadmapProgress = roadmap.progress;
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAnalytics = async (req, res) => {
  try {
    const { topicsCompleted, hoursLearned, score, skill } = req.body;
    
    let analytics = await Analytics.findOne({ user: req.user._id });
    
    if (!analytics) {
      analytics = await Analytics.create({ user: req.user._id });
    }

    if (topicsCompleted !== undefined) {
      analytics.topicsCompleted += topicsCompleted;
    }

    if (hoursLearned !== undefined) {
      analytics.hoursLearned += hoursLearned;
    }

    if (score !== undefined) {
      analytics.assessmentHistory.push({
        date: new Date(),
        score,
        topic: req.body.topic || 'General',
      });

      // Calculate average score
      const totalScore = analytics.assessmentHistory.reduce((sum, h) => sum + h.score, 0);
      analytics.averageScore = totalScore / analytics.assessmentHistory.length;
    }

    if (skill) {
      const existingSkill = analytics.skillsImproved.find(s => s.skill === skill.name);
      if (existingSkill) {
        existingSkill.level = skill.level;
      } else {
        analytics.skillsImproved.push(skill);
      }
    }

    // Update learning streak
    const today = new Date();
    const lastLearning = analytics.lastLearningDate;
    if (lastLearning) {
      const diffDays = Math.floor((today - lastLearning) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        analytics.learningStreak += 1;
      } else if (diffDays > 1) {
        analytics.learningStreak = 1;
      }
    } else {
      analytics.learningStreak = 1;
    }
    analytics.lastLearningDate = today;

    await analytics.save();
    if (analytics.learningStreak === 7) {
      await addUserBadge(req.user._id, '7 Day Streak');
    }
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const recordMilestone = async (req, res) => {
  try {
    const { milestoneName, milestoneMeta } = req.body;
    
    let analytics = await Analytics.findOne({ user: req.user._id });
    
    if (!analytics) {
      analytics = await Analytics.create({ user: req.user._id });
    }

    analytics.milestonesAchieved.push({
      name: milestoneName,
      achievedAt: new Date(),
      meta: milestoneMeta,
    });

    await analytics.save();
    res.json({ message: 'Milestone recorded', analytics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const recordPhaseCompletion = async (req, res) => {
  try {
    const { phaseName } = req.body;
    
    let analytics = await Analytics.findOne({ user: req.user._id });
    
    if (!analytics) {
      analytics = await Analytics.create({ user: req.user._id });
    }

    // Check if phase already recorded
    const phaseExists = analytics.roadmapPhasesCompleted.some(p => p.phase === phaseName);
    if (!phaseExists) {
      analytics.roadmapPhasesCompleted.push({
        phase: phaseName,
        completedAt: new Date(),
      });
    }

    // Update learning streak
    const today = new Date();
    const lastLearning = analytics.lastLearningDate;
    if (lastLearning) {
      const diffDays = Math.floor((today - lastLearning) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        analytics.learningStreak += 1;
      } else if (diffDays > 1) {
        analytics.learningStreak = 1;
      }
    } else {
      analytics.learningStreak = 1;
    }
    analytics.lastLearningDate = today;

    await analytics.save();
    if (analytics.learningStreak === 7) {
      await addUserBadge(req.user._id, '7 Day Streak');
    }
    res.json({ message: 'Phase completion recorded', analytics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProgressSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let analytics = await Analytics.findOne({ user: req.user._id });
    
    if (!analytics) {
      analytics = await Analytics.create({ user: req.user._id });
    }

    const roadmap = await Roadmap.findOne({ user: req.user._id });

    const summary = {
      topicsCompleted: analytics.topicsCompleted,
      hoursLearned: analytics.hoursLearned,
      averageScore: analytics.averageScore,
      learningStreak: analytics.learningStreak,
      roadmapProgress: roadmap ? roadmap.progress : 0,
      roadmapPhasesCompleted: analytics.roadmapPhasesCompleted.length,
      milestonesAchieved: analytics.milestonesAchieved.length,
      selectedCareer: user?.selectedCareer || null,
      currentPhase: roadmap ? roadmap.currentPhase : 1,
      skillsImproved: analytics.skillsImproved,
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnalytics,
  updateAnalytics,
  recordMilestone,
  recordPhaseCompletion,
  getProgressSummary,
};
