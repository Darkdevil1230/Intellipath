const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const { generateCareerRecommendations, generateRoadmap } = require('../utils/gemini');

const completeOnboarding = async (req, res) => {
  try {
    const {
      academicStream,
      currentEducation,
      skills,
      interests,
      careerGoal,
    } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!academicStream) {
      return res.status(400).json({ message: 'Academic stream is required' });
    }

    user.academicStream = academicStream;
    user.currentEducation = currentEducation;
    user.skills = skills;
    user.interests = interests;
    user.careerGoal = careerGoal;

    // Generate AI career recommendations
    const recommendations = await generateCareerRecommendations({
      academicStream,
      currentEducation,
      skills,
      interests,
      careerGoal,
    });

    user.recommendedCareers = recommendations.recommendedCareers || [];
    user.onboardingCompleted = true;
    await user.save();

    res.json({
      message: 'Onboarding completed',
      recommendedCareers: user.recommendedCareers,
      user: {
        onboardingCompleted: user.onboardingCompleted,
        academicStream: user.academicStream,
        currentEducation: user.currentEducation,
        skills: user.skills,
        interests: user.interests,
        careerGoal: user.careerGoal,
        recommendedCareers: user.recommendedCareers,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateUserRoadmap = async (req, res) => {
  try {
    const { careerTitle } = req.body;
    if (!careerTitle?.trim()) {
      return res.status(400).json({ message: 'Career title is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // generateRoadmap never throws — uses retry + JSON extraction + fallback
    const roadmapData = await generateRoadmap(careerTitle.trim(), user);

    // Normalize resource types produced by the AI to match our enums
    const normalizeType = (raw) => {
      if (!raw) return 'article';
      const t = String(raw).toLowerCase().trim();
      const map = {
        video: 'video',
        webinar: 'video',
        'live-session': 'video',
        article: 'article',
        journal: 'article',
        guide: 'article',
        'how-to': 'article',
        blog: 'article',
        book: 'book',
        'practice-site': 'practice-site',
        practice: 'practice-site',
        tool: 'tool',
        toolkit: 'tool',
        database: 'tool',
        platform: 'tool',
        project: 'project',
        template: 'project',
        templates: 'project',
        website: 'website',
        service: 'tool',
        resource: 'article',
        guidebook: 'book',
        statute: 'statute',
        'legal_text': 'statute',
        'statute_summary': 'statute',
        rules: 'statute',
        standard: 'statute',
      };
      return map[t] || 'article';
    };

    if (roadmapData && Array.isArray(roadmapData.phases)) {
      roadmapData.phases.forEach((phase) => {
        if (!phase.topics) return;
        phase.topics.forEach((topic) => {
          if (!Array.isArray(topic.resources)) return;
          topic.resources.forEach((r) => {
            if (r && r.type) r.type = normalizeType(r.type);
          });
        });
      });
    }

    const roadmap = await Roadmap.create({
      user: user._id,
      careerTitle: careerTitle.trim(),
      stream: user.academicStream,
      phases: roadmapData.phases,
      projects: roadmapData.projects,
      certifications: roadmapData.certifications,
    });

    user.selectedCareer = careerTitle.trim();
    user.selectedRoadmapId = roadmap._id;
    await user.save();

    res.json(roadmap);
  } catch (error) {
    console.error('[generateUserRoadmap]', error);
    res.status(500).json({ message: error.message || 'Failed to generate roadmap' });
  }
};

module.exports = {
  completeOnboarding,
  generateUserRoadmap,
};
