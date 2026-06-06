import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Search, Bookmark, BookmarkCheck } from 'lucide-react';
import { useRoadmapContext } from '../context/RoadmapContext';
import { DiscoveryGridSkeleton, DiscoveryFiltersSkeleton } from '../components/ui/Skeleton';
import FriendlyError from '../components/ui/FriendlyError';
import { classifyApiError, getErrorMessage } from '../utils/apiErrors';

const Resources = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const {
    stream,
    selectedCareer,
    discoveryTopics,
    isLoading: isRoadmapLoading,
    hasActiveRoadmap,
  } = useRoadmapContext();

  const topicsParam = useMemo(
    () => (discoveryTopics.length ? discoveryTopics.join(',') : ''),
    [discoveryTopics]
  );

  const canQuery = Boolean(
    hasActiveRoadmap && stream && selectedCareer && discoveryTopics.length > 0
  );

  const resourceParams = useMemo(() => {
    if (!canQuery) return null;
    const params = {
      stream,
      career: selectedCareer,
      topics: topicsParam,
    };
    if (search) params.search = search;
    if (category) params.category = category;
    if (type) params.type = type;
    if (difficulty) params.difficulty = difficulty;
    return params;
  }, [canQuery, stream, selectedCareer, topicsParam, search, category, type, difficulty]);

  const { data: resources, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['resources', resourceParams],
    queryFn: () => api.get('/resources', { params: resourceParams }).then((res) => res.data),
    enabled: !!resourceParams,
  });

  const { data: savedResources } = useQuery({
    queryKey: ['saved-resources'],
    queryFn: () => api.get('/resources/saved').then(res => res.data),
  });

  const saveMutation = useMutation({
    mutationFn: (resourceId) => api.post('/resources/save', { resourceId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-resources']);
      toast.success('Resource saved!');
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (resourceId) => api.delete(`/resources/saved/${resourceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-resources']);
      toast.success('Resource removed from saved');
    },
  });

  const isSaved = (resourceId) => savedResources?.some((resource) => resource._id === resourceId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resources</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {selectedCareer
            ? `Resources matched to your ${selectedCareer} roadmap`
            : 'Resources are personalized from your active roadmap.'}
        </p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search within roadmap matches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              disabled={!canQuery}
            />
          </div>
          <input
            type="text"
            placeholder="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
            disabled={!canQuery}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input-field"
            disabled={!canQuery}
          >
            <option value="">All Types</option>
            <option value="video">Video</option>
            <option value="article">Article</option>
            <option value="book">Book</option>
            <option value="tool">Tool</option>
            <option value="practice-site">Practice Site</option>
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="input-field"
            disabled={!canQuery}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {isRoadmapLoading ? (
        <div className="space-y-6">
          <DiscoveryFiltersSkeleton />
          <DiscoveryGridSkeleton />
        </div>
      ) : !canQuery ? (
        <FriendlyError
          variant="noResults"
          title="Roadmap required"
          description="Generate your personalized roadmap to see resources matched to your career and topics."
          actionTo="/onboarding"
          actionLabel="Set up roadmap"
        />
      ) : isLoading ? (
        <DiscoveryGridSkeleton />
      ) : isError ? (
        <FriendlyError
          variant={classifyApiError(error) === 'network' ? 'network' : 'gemini'}
          description={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : resources?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {resource.title}
                  </h3>
                  <span className="text-xs text-primary-600 uppercase">{resource.type}</span>
                </div>
                <button
                  onClick={() => {
                    if (isSaved(resource._id)) {
                      unsaveMutation.mutate(resource._id);
                    } else {
                      saveMutation.mutate(resource._id);
                    }
                  }}
                  className="text-primary-600 hover:text-primary-500"
                >
                  {isSaved(resource._id) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {resource.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{resource.difficulty}</span>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm"
                >
                  View Resource
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <FriendlyError
          variant="noResults"
          title="No resources available for your roadmap"
          description="We could not find resources matching your stream, career, and current topics."
          actionTo="/roadmap"
          actionLabel="View roadmap"
        />
      )}
    </div>
  );
};

export default Resources;
