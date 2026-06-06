import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { classifyApiError, getErrorMessage } from '../utils/apiErrors';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsLoaded, setRecommendationsLoaded] = useState(false);
  const [recommendedCareers, setRecommendedCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState('');
  const [formData, setFormData] = useState({
    academicStream: '',
    currentEducation: '',
    skills: [],
    interests: [],
    careerGoal: '',
  });
  const { setUser, user } = useAuthStore();

  const streams = ['Engineering', 'Science', 'Commerce', 'Arts', 'Medicine', 'Law', 'Management', 'IT'];
  const educationLevels = ['10th', '12th', 'UG', 'PG', 'Professional'];

  const streamSkillOptions = {
    Engineering: ['Circuit Design', 'Robotics', 'Mechanics', 'CAD', 'Simulation', 'Systems Engineering', 'Programming', 'Materials Science'],
    Science: ['Laboratory Techniques', 'Data Analysis', 'Experimental Design', 'Biochemistry', 'Research Methods', 'Scientific Writing', 'Field Work'],
    Commerce: ['Accounting', 'Finance', 'Economics', 'Market Research', 'Sales', 'Business Strategy', 'Excel', 'Analytics'],
    Arts: ['Creative Writing', 'Graphic Design', 'Photography', 'Visual Arts', 'Music Theory', 'Storytelling', 'Media Production'],
    Medicine: ['Anatomy', 'Physiology', 'Clinical Research', 'Patient Care', 'Pharmacology', 'Medical Ethics', 'Diagnostics', 'Healthcare Systems'],
    Law: ['Legal Research', 'Argumentation', 'Contract Writing', 'Litigation', 'Compliance', 'Negotiation', 'Case Analysis'],
    Management: ['Leadership', 'Project Management', 'Team Building', 'Operations', 'Strategy', 'Change Management', 'Communication'],
    IT: ['Programming', 'Cloud Computing', 'Cybersecurity', 'Networks', 'DevOps', 'Database Management', 'System Architecture'],
  };

  const streamInterestOptions = {
    Engineering: ['Innovation', 'Robotics', 'Automation', 'Sustainability', 'Product Design', 'Infrastructure'],
    Science: ['Biology', 'Chemistry', 'Physics', 'Environmental Science', 'Space', 'Research'],
    Commerce: ['Startups', 'Investing', 'E-commerce', 'Marketing', 'Entrepreneurship', 'Finance'],
    Arts: ['Visual Arts', 'Performance', 'Literature', 'Film', 'Culture', 'Creative Expression'],
    Medicine: ['Healthcare', 'Public Health', 'Neuroscience', 'Pharmacology', 'Genetics', 'Medical Technology'],
    Law: ['Human Rights', 'Corporate Law', 'Public Policy', 'Criminal Justice', 'Intellectual Property'],
    Management: ['Business Strategy', 'Organizational Behaviour', 'Sustainability', 'Leadership', 'Consulting'],
    IT: ['AI', 'Cybersecurity', 'Gaming', 'Cloud Platforms', 'Software Development', 'Data Science'],
  };

  const selectedStream = formData.academicStream || 'Your stream';

  const skillOptions = streamSkillOptions[formData.academicStream] || [
    'Critical Thinking',
    'Communication',
    'Problem Solving',
    'Research',
    'Teamwork',
    'Time Management',
  ];
  const interestOptions = streamInterestOptions[formData.academicStream] || [
    'Innovation',
    'Leadership',
    'Creativity',
    'Technology',
    'Health',
    'Science',
  ];

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const loadRecommendations = async () => {
    if (recommendationsLoaded || recommendationsLoading) return;
    setRecommendationsLoading(true);

    try {
      const response = await api.post('/onboarding/complete', formData);
      const recs = response.data.recommendedCareers || [];
      setRecommendedCareers(recs);
      setSelectedCareer(recs[0]?.title || '');
      setRecommendationsLoaded(true);
      if (setUser) {
        const updatedUser = response.data.user
          ? { ...user, ...response.data.user }
          : {
              ...user,
              onboardingCompleted: true,
              academicStream: formData.academicStream,
              currentEducation: formData.currentEducation,
              skills: formData.skills,
              interests: formData.interests,
              careerGoal: formData.careerGoal,
              recommendedCareers: recs,
            };
        setUser(updatedUser);
      }
      toast.success('AI career recommendations generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate career recommendations');
    } finally {
      setRecommendationsLoading(false);
    }
  };

  useEffect(() => {
    if (step === 6) {
      loadRecommendations();
    }

    if (step < 6 && recommendationsLoaded) {
      setRecommendationsLoaded(false);
      setRecommendedCareers([]);
      setSelectedCareer('');
    }
  }, [step]);

  const handleGenerateRoadmap = async () => {
    try {
      setLoading(true);
      if (!selectedCareer) {
        toast.error('Please select a career before generating your roadmap.');
        return;
      }

      await api.post('/onboarding/generate-roadmap', {
        careerTitle: selectedCareer,
      });

      if (setUser) {
        const me = await api.get('/auth/me').then((res) => res.data);
        setUser(me.user || me);
      }

      toast.success('Your personalized roadmap is ready!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to generate roadmap'));
      if (classifyApiError(error) === 'gemini') {
        toast('If generation failed, retry — the server may still save a backup roadmap.', {
          icon: 'ℹ️',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 7) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Profile
          </h1>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {step} of 7
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="card">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select Your Academic Stream
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {streams.map((stream) => (
                <button
                  key={stream}
                  onClick={() => setFormData({ ...formData, academicStream: stream })}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    formData.academicStream === stream
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  {stream}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Current Education Level
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {educationLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, currentEducation: level })}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    formData.currentEducation === level
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select Skills Relevant to {selectedStream}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              These skill options are tailored to the stream you selected.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    formData.skills.includes(skill)
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select Interests Related to {selectedStream}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              These interests are chosen to match your academic stream.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    formData.interests.includes(interest)
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Career Goal (Optional)
            </h2>
            <textarea
              value={formData.careerGoal}
              onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
              className="input-field"
              rows={4}
              placeholder="Describe your career goal or dream job..."
            />
            <button
              onClick={() => setFormData({ ...formData, careerGoal: '' })}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Skip this step
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Career Recommendations
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our AI is analyzing your profile and recommending suitable careers.
            </p>

            {recommendationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendedCareers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedCareers.map((career, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedCareer(career.title)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                          selectedCareer === career.title
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {career.title}
                        </h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                          {career.reason}
                        </p>
                        <p className="mt-3 text-sm font-medium text-primary-600">
                          Match score: {career.score}%
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No career recommendations were generated. Please go back and review your selections.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Generate Your Learning Roadmap
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Based on your selected career recommendation, we'll create a personalized roadmap.
            </p>
            <div className="card bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Selected career</p>
              <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                {selectedCareer || 'None selected'}
              </p>
            </div>
            <button
              onClick={handleGenerateRoadmap}
              disabled={loading || !selectedCareer}
              className="btn-primary w-full"
            >
              {loading ? 'Generating...' : 'Generate Roadmap'}
            </button>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="btn-secondary flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          {step < 7 && (
            <button
              onClick={nextStep}
              disabled={
                (step === 1 && !formData.academicStream) ||
                (step === 2 && !formData.currentEducation) ||
                (step === 3 && formData.skills.length === 0) ||
                (step === 4 && formData.interests.length === 0) ||
                (step === 6 && (recommendationsLoading || !selectedCareer))
              }
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
