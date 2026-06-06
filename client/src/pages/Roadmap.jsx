import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, RefreshCw, ChevronRight, Zap } from 'lucide-react';
import { RoadmapSkeleton } from '../components/ui/Skeleton';
import FriendlyError from '../components/ui/FriendlyError';
import { classifyApiError, getErrorMessage } from '../utils/apiErrors';

const Roadmap = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);

  // Fetch roadmap - by ID if URL param exists, otherwise current user's roadmap
  const {
    data: roadmap,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['roadmap', id],
    queryFn: () => {
      if (id) {
        return api.get(`/roadmap/${id}`).then((res) => res.data);
      }
      return api.get('/roadmap').then((res) => res.data);
    },
  });

  // Set initial phase on load
  useEffect(() => {
    if (roadmap && selectedPhase === null) {
      setSelectedPhase(roadmap.currentPhase - 1);
    }
  }, [roadmap, selectedPhase]);

  const updateProgressMutation = useMutation({
    mutationFn: (data) => api.patch('/roadmap/progress', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roadmap']);
      toast.success('Progress updated!');
    },
    onError: () => toast.error('Failed to update progress'),
  });

  const markTopicCompleteMutation = useMutation({
    mutationFn: ({ roadmapId, topicName }) => 
      api.patch(`/roadmap/${roadmapId}/topics/${encodeURIComponent(topicName)}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['roadmap']);
      toast.success('Topic marked as complete!');
    },
    onError: () => toast.error('Failed to update topic'),
  });

  const updatePhasesMutation = useMutation({
    mutationFn: ({ roadmapId, currentPhase }) => 
      api.patch(`/roadmap/${roadmapId}/phase`, { currentPhase }),
    onSuccess: () => {
      queryClient.invalidateQueries(['roadmap']);
      toast.success('Phase updated!');
    },
    onError: () => toast.error('Failed to update phase'),
  });

  const regenerateMutation = useMutation({
    mutationFn: () => api.post('/roadmap/regenerate'),
    onSuccess: () => {
      queryClient.invalidateQueries(['roadmap']);
      toast.success('Roadmap regenerated!');
    },
    onError: () => toast.error('Failed to regenerate roadmap'),
  });

  const handleTopicComplete = (topicName) => {
    if (!roadmap) return;
    markTopicCompleteMutation.mutate({
      roadmapId: roadmap._id,
      topicName,
    });
  };

  const handlePhaseChange = (phaseNumber) => {
    if (!roadmap) return;
    setSelectedPhase(phaseNumber - 1);
    setExpandedTopic(null);
    updatePhasesMutation.mutate({
      roadmapId: roadmap._id,
      currentPhase: phaseNumber,
    });
  };

  if (isLoading) {
    return <RoadmapSkeleton />;
  }

  if (isError) {
    const variant = classifyApiError(error) === 'network' ? 'network' : 'gemini';
    return (
      <FriendlyError
        variant={variant}
        description={getErrorMessage(error)}
        onRetry={() => refetch()}
        actionTo="/onboarding"
        actionLabel="Complete onboarding"
      />
    );
  }

  if (!roadmap) {
    return (
      <FriendlyError
        variant="noResults"
        title="No roadmap yet"
        description="Complete onboarding and generate your personalized roadmap to start tracking phases and topics."
        actionTo="/onboarding"
        actionLabel="Start onboarding"
      />
    );
  }

  const currentPhaseData = selectedPhase !== null ? roadmap.phases[selectedPhase] : null;
  const completedTopics = roadmap.phases.reduce((sum, phase) => 
    sum + phase.topics.filter(t => t.completed).length, 0
  );
  const totalTopics = roadmap.phases.reduce((sum, phase) => 
    sum + phase.topics.length, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {roadmap.careerTitle} Roadmap
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {completedTopics} of {totalTopics} topics completed • Progress: {roadmap.progress.toFixed(1)}%
          </p>
        </div>
        <button
          onClick={() => regenerateMutation.mutate()}
          disabled={regenerateMutation.isLoading}
          className="btn-secondary flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${regenerateMutation.isLoading ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary-600 to-primary-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${roadmap.progress}%` }}
        ></div>
      </div>

      {/* Phase Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {roadmap.phases.map((phase) => (
          <button
            key={phase.phaseNumber}
            onClick={() => handlePhaseChange(phase.phaseNumber)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
              selectedPhase === phase.phaseNumber - 1
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Phase {phase.phaseNumber}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Phase Details */}
          {currentPhaseData && (
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {currentPhaseData.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Duration: {currentPhaseData.duration}
                  </p>
                </div>
                {currentPhaseData.topics.every(t => t.completed) && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {currentPhaseData.description}
              </p>

              {/* Topics */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-primary-600 animate-pulse" />
                  Topics to Master
                </h3>
                {(() => {
                  const nextIncompleteTopicInPhase = currentPhaseData.topics.find(t => !t.completed);
                  
                  return currentPhaseData.topics.map((topic, topicIndex) => {
                    const isNextTopic = nextIncompleteTopicInPhase && nextIncompleteTopicInPhase.name === topic.name;
                    const isExpanded = expandedTopic === topicIndex;
                    
                    return (
                      <div
                        key={topicIndex}
                        className={`flex flex-col p-4 rounded-xl border transition-all duration-300 ${
                          topic.completed
                            ? 'bg-green-50/40 dark:bg-green-950/5 border-green-200/50 dark:border-green-950/40'
                            : isNextTopic
                            ? 'bg-white dark:bg-gray-800 border-2 border-primary-500 dark:border-primary-400 shadow-md shadow-primary-500/10'
                            : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800/80 hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {topic.completed ? (
                              <CheckCircle2 
                                className="w-5 h-5 text-green-600 flex-shrink-0 cursor-pointer hover:scale-110 transition-transform" 
                                onClick={() => handleTopicComplete(topic.name)}
                              />
                            ) : (
                              <Circle 
                                className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 cursor-pointer hover:scale-110 transition-transform hover:text-primary-500" 
                                onClick={() => handleTopicComplete(topic.name)}
                              />
                            )}
                            <div 
                              className="flex-1 cursor-pointer min-w-0"
                              onClick={() => setExpandedTopic(isExpanded ? null : topicIndex)}
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`truncate text-sm sm:text-base font-semibold ${
                                  topic.completed 
                                    ? 'line-through text-gray-500 dark:text-gray-500' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {topic.name}
                                </p>
                                {isNextTopic && (
                                  <span className="px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase bg-primary-600 text-white rounded-full animate-pulse shadow-sm shadow-primary-500/20">
                                    Current Focus
                                  </span>
                                )}
                              </div>
                              {topic.resources && topic.resources.length > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {topic.resources.length} resource{topic.resources.length > 1 ? 's' : ''} available • Click to expand
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center ml-4 whitespace-nowrap">
                            <button
                              onClick={() => handleTopicComplete(topic.name)}
                              disabled={markTopicCompleteMutation.isLoading}
                              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                                topic.completed
                                  ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 hover:bg-green-200'
                                  : 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-950/60'
                              }`}
                            >
                              {topic.completed ? 'Completed' : 'Mark Done'}
                            </button>
                          </div>
                        </div>

                        {/* Accordion content for resources */}
                        {isExpanded && topic.resources && topic.resources.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 space-y-2 animate-fadeIn pl-8">
                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Recommended Learning Resources:</p>
                            <div className="grid grid-cols-1 gap-2">
                              {topic.resources.map((res, rIdx) => (
                                <a
                                  key={rIdx}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-500 transition-colors text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm"
                                >
                                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">{res.type || 'link'}</span>
                                  <span className="font-semibold flex-1 truncate">{res.title}</span>
                                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* All Phases Summary */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Learning Path
            </h3>
            <div className="space-y-2">
              {roadmap.phases.map((phase, idx) => {
                const completed = phase.completed !== undefined ? phase.completed : phase.topics.every(t => t.completed);
                return (
                  <div key={idx} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Phase {phase.phaseNumber}
                      </span>
                      {completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {phase.topics.filter(t => t.completed).length}/{phase.topics.length} topics
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Projects */}
          {roadmap.projects && roadmap.projects.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Projects
              </h3>
              <div className="space-y-3">
                {roadmap.projects.map((project, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {project.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {project.description}
                    </p>
                    <span className="text-xs text-primary-600 font-medium mt-2 inline-block">
                      {project.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {roadmap.certifications && roadmap.certifications.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Certifications
              </h3>
              <div className="space-y-3">
                {roadmap.certifications.map((cert, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {cert.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {cert.provider}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
