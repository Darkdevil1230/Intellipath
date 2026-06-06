const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const { generateRoadmap } = require('../utils/gemini');

/**
 * Calculates and updates all metrics of a learning roadmap:
 * - individual phase completion states and timestamps.
 * - total completion percentage (progress and progressPercentage).
 * - auto-advancing currentPhase to the next active incomplete phase.
 */
const updateRoadmapStats = (roadmap) => {
  let totalTopics = 0;
  let completedTopics = 0;

  roadmap.phases.forEach(phase => {
    let phaseTotal = 0;
    let phaseCompleted = 0;
    
    phase.topics.forEach(topic => {
      totalTopics++;
      phaseTotal++;
      if (topic.completed) {
        completedTopics++;
        phaseCompleted++;
      }
    });

    const wasCompleted = phase.completed;
    phase.completed = phaseTotal > 0 && phaseCompleted === phaseTotal;
    
    if (phase.completed && !wasCompleted) {
      phase.completedAt = new Date();
    } else if (!phase.completed) {
      phase.completedAt = undefined;
    }
  });

  roadmap.progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  roadmap.progressPercentage = roadmap.progress;

  // Auto-advance currentPhase to the first phase that is not yet fully completed
  const firstIncompletePhase = roadmap.phases.find(p => !p.completed);
  if (firstIncompletePhase) {
    roadmap.currentPhase = firstIncompletePhase.phaseNumber;
  } else if (roadmap.phases.length > 0) {
    roadmap.currentPhase = roadmap.phases.length; // Set to last phase if all completed
  }
  
  return completedTopics;
};

const getRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user._id });
    if (roadmap && !roadmap.stream) {
      const user = await User.findById(req.user._id);
      if (user?.academicStream) {
        roadmap.stream = user.academicStream;
        await roadmap.save();
      }
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRoadmapById = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    // Verify user owns this roadmap
    if (roadmap.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this roadmap' });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { phaseIndex, topicIndex, completed } = req.body;
    const roadmap = await Roadmap.findOne({ user: req.user._id });

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found for this user' });
    }

    if (phaseIndex !== undefined && topicIndex !== undefined) {
      const topic = roadmap.phases[phaseIndex].topics[topicIndex];
      if (topic) {
        // Toggle or set state based on body parameter
        topic.completed = completed !== undefined ? completed : !topic.completed;
        if (topic.completed) {
          topic.completedAt = new Date();
        } else {
          topic.completedAt = undefined;
        }
      }
    }

    // Recalculate all stats and phase completions
    const completedTopics = updateRoadmapStats(roadmap);
    await roadmap.save();

    // Update analytics
    await Analytics.findOneAndUpdate(
      { user: req.user._id },
      { 
        roadmapProgress: roadmap.progress,
        topicsCompleted: completedTopics
      },
      { new: true, upsert: true }
    );

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markTopicComplete = async (req, res) => {
  try {
    const { id, topicName } = req.params;
    const roadmap = await Roadmap.findById(id);

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Verify user owns this roadmap
    if (roadmap.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this roadmap' });
    }

    // Find and toggle topic completion
    let isMarkedCompleteNow = false;
    roadmap.phases.forEach(phase => {
      const topic = phase.topics.find(t => t.name === topicName);
      if (topic) {
        topic.completed = !topic.completed; // Toggle state
        isMarkedCompleteNow = topic.completed;
        if (topic.completed) {
          topic.completedAt = new Date();
        } else {
          topic.completedAt = undefined;
        }
      }
    });

    // Recalculate stats
    const completedTopics = updateRoadmapStats(roadmap);
    await roadmap.save();

    // Prepare analytics updates
    const analyticsUpdate = {
      roadmapProgress: roadmap.progress,
      topicsCompleted: completedTopics
    };

    // Only record completion milestones if we toggled complete state to true
    if (isMarkedCompleteNow) {
      analyticsUpdate.$push = {
        milestonesAchieved: {
          name: `Completed topic: ${topicName}`,
          achievedAt: new Date()
        }
      };
    }

    // Update analytics
    await Analytics.findOneAndUpdate(
      { user: req.user._id },
      analyticsUpdate,
      { new: true, upsert: true }
    );

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCurrentPhase = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPhase } = req.body;
    const roadmap = await Roadmap.findById(id);

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Verify user owns this roadmap
    if (roadmap.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this roadmap' });
    }

    roadmap.currentPhase = currentPhase;
    await roadmap.save();

    // Track phase completion in analytics
    await Analytics.findOneAndUpdate(
      { user: req.user._id },
      {
        $push: {
          roadmapPhasesCompleted: {
            phase: `Phase ${roadmap.phases[currentPhase - 1]?.title || currentPhase}`,
            completedAt: new Date()
          }
        }
      },
      { new: true, upsert: true }
    );

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const regenerateRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found. Complete onboarding first.' });
    }

    const roadmapData = await generateRoadmap(roadmap.careerTitle, user);

    roadmap.phases = roadmapData.phases;
    roadmap.projects = roadmapData.projects;
    roadmap.certifications = roadmapData.certifications;
    if (user.academicStream) {
      roadmap.stream = user.academicStream;
    }

    // Reset roadmap statistics
    updateRoadmapStats(roadmap);
    await roadmap.save();

    // Reset analytics progress metrics
    await Analytics.findOneAndUpdate(
      { user: req.user._id },
      { 
        roadmapProgress: 0,
        topicsCompleted: 0
      },
      { new: true, upsert: true }
    );

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRoadmap,
  getRoadmapById,
  updateProgress,
  regenerateRoadmap,
  markTopicComplete,
  updateCurrentPhase,
};
