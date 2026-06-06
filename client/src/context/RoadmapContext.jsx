import { createContext, useContext, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const RoadmapContext = createContext(null);

const getTopicName = (topic) => {
  if (typeof topic === 'string') return topic;
  return topic?.name || topic?.title || null;
};

const getActivePhase = (roadmap) => {
  if (!roadmap?.phases?.length) return null;
  return (
    roadmap.phases.find((phase) => phase.phaseNumber === roadmap.currentPhase) ??
    roadmap.phases[Math.max((roadmap.currentPhase || 1) - 1, 0)]
  );
};

export const RoadmapProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: roadmap, isLoading, error } = useQuery({
    queryKey: ['roadmap'],
    queryFn: () => api.get('/roadmap').then((res) => res.data),
    enabled: !!user,
  });

  const markTopicCompleteMutation = useMutation({
    mutationFn: ({ roadmapId, topicName }) =>
      api.patch(`/roadmap/${roadmapId}/topics/${encodeURIComponent(topicName)}`),
    onSuccess: (data) => {
      queryClient.setQueryData(['roadmap'], data);
      queryClient.invalidateQueries(['roadmap']);
      toast.success('Roadmap progress updated!');
    },
    onError: () => toast.error('Failed to update topic progress'),
  });

  const updateCurrentPhaseMutation = useMutation({
    mutationFn: ({ roadmapId, currentPhase }) =>
      api.patch(`/roadmap/${roadmapId}/phase`, { currentPhase }),
    onSuccess: (data) => {
      queryClient.setQueryData(['roadmap'], data);
      queryClient.invalidateQueries(['roadmap']);
      toast.success('Active phase updated!');
    },
    onError: () => toast.error('Failed to update active phase'),
  });

  const regenerateMutation = useMutation({
    mutationFn: () => api.post('/roadmap/regenerate'),
    onSuccess: (data) => {
      queryClient.setQueryData(['roadmap'], data);
      queryClient.invalidateQueries(['roadmap']);
      toast.success('Roadmap successfully regenerated!');
    },
    onError: () => toast.error('Failed to regenerate roadmap'),
  });

  const toggleTopic = (topicName) => {
    if (!roadmap) return;
    markTopicCompleteMutation.mutate({
      roadmapId: roadmap._id,
      topicName,
    });
  };

  const updatePhase = (phaseNumber) => {
    if (!roadmap) return;
    updateCurrentPhaseMutation.mutate({
      roadmapId: roadmap._id,
      currentPhase: phaseNumber,
    });
  };

  const regenerateRoadmap = () => {
    if (!roadmap) return;
    regenerateMutation.mutate();
  };

  const personalization = useMemo(() => {
    if (!roadmap) {
      return {
        stream: null,
        selectedCareer: null,
        currentPhase: null,
        currentTopics: [],
        discoveryTopics: [],
        progress: 0,
        hasActiveRoadmap: false,
      };
    }

    const activePhase = getActivePhase(roadmap);
    const currentTopics =
      activePhase?.topics?.map(getTopicName).filter(Boolean) ?? [];

    const allRoadmapTopics =
      roadmap.phases?.flatMap(
        (phase) => phase.topics?.map(getTopicName).filter(Boolean) ?? []
      ) ?? [];

    const discoveryTopics = currentTopics.length ? currentTopics : allRoadmapTopics;

    const stream =
      roadmap?.stream ||
      user?.academicStream ||
      user?.stream ||
      roadmap?.academicStream ||
      'Engineering';

    const selectedCareer = roadmap.careerTitle ?? null;
    const hasActiveRoadmap = !!(roadmap && selectedCareer);

    return {
      stream,
      selectedCareer,
      currentPhase: roadmap.currentPhase ?? 1,
      currentTopics,
      discoveryTopics,
      progress: roadmap.progress ?? roadmap.progressPercentage ?? 0,
      hasActiveRoadmap,
    };
  }, [roadmap, user?.academicStream, user?.stream]);

  useEffect(() => {
    console.log('USER', user);
    console.log('ROADMAP', roadmap);
  }, [user, roadmap]);

  useEffect(() => {
    if (isLoading) return;
    console.log('[RoadmapContext]', {
      roadmap,
      stream: personalization.stream,
      selectedCareer: personalization.selectedCareer,
      currentPhase: personalization.currentPhase,
      currentTopics: personalization.currentTopics,
      discoveryTopics: personalization.discoveryTopics,
      hasActiveRoadmap: personalization.hasActiveRoadmap,
    });
  }, [roadmap, isLoading, personalization]);

  const value = useMemo(
    () => ({
      roadmap,
      isLoading,
      error,
      stream: personalization.stream,
      selectedCareer: personalization.selectedCareer,
      currentPhase: personalization.currentPhase,
      currentTopics: personalization.currentTopics,
      discoveryTopics: personalization.discoveryTopics,
      progress: personalization.progress,
      hasActiveRoadmap: personalization.hasActiveRoadmap,
      toggleTopic,
      updatePhase,
      regenerateRoadmap,
      isMutating:
        markTopicCompleteMutation.isPending ||
        updateCurrentPhaseMutation.isPending ||
        regenerateMutation.isPending,
    }),
    [
      roadmap,
      isLoading,
      error,
      personalization,
      markTopicCompleteMutation.isPending,
      updateCurrentPhaseMutation.isPending,
      regenerateMutation.isPending,
    ]
  );

  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>;
};

export const useRoadmapContext = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmapContext must be used within a RoadmapProvider');
  }
  return context;
};

export default RoadmapContext;
