import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { useRoadmapContext } from '../context/RoadmapContext';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  Flame,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    roadmap,
    selectedCareer,
    currentPhase,
    currentTopics,
    progress,
    hasActiveRoadmap,
    isLoading: isRoadmapLoading,
  } = useRoadmapContext();

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/analytics').then((res) => res.data),
  });

  if (isRoadmapLoading || isAnalyticsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's what's happening with your learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Roadmap Progress
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {progress ?? analytics?.progress ?? 0}%
              </p>
            </div>
            <LayoutDashboard className="h-12 w-12 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Topics Completed
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {analytics?.topicsCompleted || 0}
              </p>
            </div>
            <BookOpen className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Hours Learned
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {analytics?.hoursLearned || 0}
              </p>
            </div>
            <Clock className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Learning Streak
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {analytics?.learningStreak || 0} days
              </p>
            </div>
            <Flame className="h-12 w-12 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Career Path
          </h2>
          {hasActiveRoadmap && selectedCareer ? (
            <div className="space-y-4">
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <p className="text-sm text-primary-600 dark:text-primary-300">Selected Career</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {selectedCareer}
                </p>
                <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-medium">Current Phase:</span> Phase {currentPhase || 1}
                  </p>
                  <p>
                    <span className="font-medium">Progress:</span> {progress || 0}%
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/roadmap/${roadmap._id}`)}
                className="btn-primary w-full"
              >
                View Full Roadmap
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-400">
                Generate your personalized roadmap to see tailored careers, courses, mentors, and
                resources.
              </p>
              {!user?.onboardingCompleted && (
                <button onClick={() => navigate('/onboarding')} className="btn-primary">
                  Complete Onboarding
                </button>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (hasActiveRoadmap && roadmap) {
                  navigate(`/roadmap/${roadmap._id}`);
                } else {
                  navigate('/onboarding');
                }
              }}
              className="w-full btn-primary"
            >
              {hasActiveRoadmap ? 'Continue Roadmap' : 'Set Up Roadmap'}
            </button>
            <button
              onClick={() => navigate('/resources')}
              className="w-full btn-secondary"
              disabled={!hasActiveRoadmap}
            >
              Explore Roadmap Resources
            </button>
            <button
              onClick={() => navigate('/mentors')}
              className="w-full btn-secondary"
              disabled={!hasActiveRoadmap}
            >
              Find Roadmap Mentors
            </button>
          </div>

          {hasActiveRoadmap && currentTopics.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                Current phase topics
              </p>
              <div className="flex flex-wrap gap-2">
                {currentTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-200 text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
