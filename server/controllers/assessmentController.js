const Assessment = require('../models/Assessment');
const { generateAssessment } = require('../utils/gemini');

const generateQuiz = async (req, res) => {
  try {
    const { topic, roadmapId } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ message: 'Assessment topic is required' });
    }

    const quizData = await generateAssessment(topic.trim(), 10);
    if (!quizData || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      return res.status(500).json({ message: 'Failed to generate assessment questions' });
    }

    const assessment = await Assessment.create({
      user: req.user._id,
      title: `${topic.trim()} Assessment`,
      topic: topic.trim(),
      roadmapId,
      questions: quizData.questions,
      totalQuestions: quizData.questions.length,
      score: 0,
    });

    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitAssessment = async (req, res) => {
  try {
    const { assessmentId, answers } = req.body;
    const assessment = await Assessment.findById(assessmentId);

    if (!assessment || assessment.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (!Array.isArray(answers) || answers.length !== assessment.questions.length) {
      return res.status(400).json({ message: 'All assessment questions must be answered' });
    }

    let correctCount = 0;
    const userAnswers = [];
    const weakAreas = [];

    answers.forEach((answer, index) => {
      const question = assessment.questions[index];
      if (!question) return;

      const isCorrect = answer === question.correctAnswer;
      if (isCorrect) correctCount++;

      userAnswers.push({
        questionIndex: index,
        answer,
        isCorrect,
      });

      if (!isCorrect) {
        weakAreas.push(question.question.substring(0, 50) + '...');
      }
    });

    assessment.userAnswers = userAnswers;
    assessment.score = (correctCount / assessment.totalQuestions) * 100;
    assessment.weakAreas = weakAreas;
    assessment.recommendations = weakAreas.length > 0 
      ? ['Review the topics where you scored lower', 'Practice more questions in these areas']
      : ['Great job! You have a good understanding of this topic'];
    assessment.completedAt = new Date();
    await assessment.save();

    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssessmentHistory = async (req, res) => {
  try {
    const assessments = await Assessment.find({ user: req.user._id })
      .sort({ completedAt: -1 })
      .select('title topic score completedAt');

    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment || assessment.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateQuiz,
  submitAssessment,
  getAssessmentHistory,
  getAssessmentById,
};
