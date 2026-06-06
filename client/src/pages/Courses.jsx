import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Search, Bookmark, BookmarkCheck, Sparkles } from 'lucide-react';
import { useRoadmapContext } from '../context/RoadmapContext';
import { DiscoveryGridSkeleton, DiscoveryFiltersSkeleton } from '../components/ui/Skeleton';
import FriendlyError from '../components/ui/FriendlyError';
import { classifyApiError, getErrorMessage } from '../utils/apiErrors';

const Courses = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [provider, setProvider] = useState('');
  const [level, setLevel] = useState('');
  const [isFree, setIsFree] = useState('');

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

  const courseParams = useMemo(() => {
    if (!canQuery) return null;
    const params = {
      stream,
      career: selectedCareer,
      topics: topicsParam,
    };
    if (search) params.search = search;
    if (category) params.category = category;
    if (provider) params.provider = provider;
    if (level) params.level = level;
    if (isFree === 'true' || isFree === 'false') params.isFree = isFree;
    return params;
  }, [canQuery, stream, selectedCareer, topicsParam, search, category, provider, level, isFree]);

  const { data: courses, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['courses', courseParams],
    queryFn: () => api.get('/courses', { params: courseParams }).then((res) => res.data),
    enabled: !!courseParams,
  });

  const { data: savedCourses } = useQuery({
    queryKey: ['saved-courses'],
    queryFn: () => api.get('/courses/saved').then(res => res.data),
  });

  const saveMutation = useMutation({
    mutationFn: (courseId) => api.post('/courses/save', { courseId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-courses']);
      toast.success('Course saved!');
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (courseId) => api.delete(`/courses/saved/${courseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-courses']);
      toast.success('Course removed from saved');
    },
  });

  const isSaved = (courseId) => savedCourses?.some((course) => course._id === courseId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {selectedCareer
            ? `Courses matched to your ${selectedCareer} roadmap`
            : 'Courses are personalized from your active roadmap.'}
        </p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-1">
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
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="input-field"
            disabled={!canQuery}
          >
            <option value="">All Providers</option>
            <option value="Coursera">Coursera</option>
            <option value="Udemy">Udemy</option>
            <option value="freeCodeCamp">freeCodeCamp</option>
            <option value="CS50">CS50</option>
          </select>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="input-field"
            disabled={!canQuery}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <select
            value={isFree}
            onChange={(e) => setIsFree(e.target.value)}
            className="input-field"
            disabled={!canQuery}
          >
            <option value="">All Prices</option>
            <option value="true">Free</option>
            <option value="false">Paid</option>
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
          description="Generate your personalized roadmap to see courses matched to your career and topics."
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
      ) : courses?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="card relative overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800"
            >
              {course.matchScore !== undefined && (
                <div
                  className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-bl-xl border-l border-b flex items-center gap-1.5 ${
                    course.matchScore >= 75
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-950/40'
                      : course.matchScore >= 40
                      ? 'bg-primary-500/10 text-primary-700 dark:text-primary-400 border-primary-200/50 dark:border-primary-950/40'
                      : 'bg-gray-100/80 text-gray-500 border-gray-200 dark:bg-gray-800/80 dark:text-gray-400 dark:border-gray-700/50'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  {course.matchScore}% Match
                </div>
              )}

              <div>
                <div className="flex items-start justify-between mb-3 pr-20">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                      {course.provider}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-4">
                  <span className="text-gray-500 dark:text-gray-400">
                    Duration: {course.duration || 'Self-paced'}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md">
                    {course.level}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-850">
                  <span className="font-extrabold text-lg text-gray-950 dark:text-white">
                    {course.isFree ? 'Free' : `$${course.price}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (isSaved(course._id)) {
                          unsaveMutation.mutate(course._id);
                        } else {
                          saveMutation.mutate(course._id);
                        }
                      }}
                      className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all border border-transparent hover:border-primary-100 dark:hover:border-primary-950"
                    >
                      {isSaved(course._id) ? (
                        <BookmarkCheck className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
                      ) : (
                        <Bookmark className="w-4.5 h-4.5" />
                      )}
                    </button>
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs py-2 px-3 rounded-lg"
                    >
                      View Course
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <FriendlyError
          variant="noResults"
          title="No courses available for your roadmap"
          description="We could not find courses matching your stream, career, and current topics. Try advancing your roadmap phase or check back later."
          actionTo="/roadmap"
          actionLabel="View roadmap"
        />
      )}
    </div>
  );
};

export default Courses;
