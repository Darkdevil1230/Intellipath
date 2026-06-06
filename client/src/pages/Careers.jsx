import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Search, TrendingUp, DollarSign, Building } from 'lucide-react';
import { useRoadmapContext } from '../context/RoadmapContext';

const Careers = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const {
    stream,
    selectedCareer,
    discoveryTopics,
    isLoading: isRoadmapLoading,
    hasActiveRoadmap,
  } = useRoadmapContext();

  const topicsParam = useMemo(
    () => (discoveryTopics.length ? discoveryTopics.join(',') : undefined),
    [discoveryTopics]
  );

  const canQuery = Boolean(hasActiveRoadmap && stream && selectedCareer);

  const careerParams = useMemo(() => {
    if (!canQuery) return null;
    const params = { stream, career: selectedCareer };
    if (search) params.search = search;
    if (category) params.category = category;
    if (topicsParam) params.topics = topicsParam;
    return params;
  }, [canQuery, stream, selectedCareer, search, category, topicsParam]);

  useEffect(() => {
    console.log('[Careers] context:', { stream, selectedCareer, discoveryTopics, hasActiveRoadmap, canQuery });
    if (careerParams) console.log('[Careers] API params:', careerParams);
  }, [stream, selectedCareer, discoveryTopics, hasActiveRoadmap, canQuery, careerParams]);

  const { data: careers, isLoading } = useQuery({
    queryKey: ['careers', careerParams],
    queryFn: () => api.get('/careers', { params: careerParams }).then((res) => res.data),
    enabled: !!careerParams,
  });

  const getGrowthColor = (outlook) => {
    switch (outlook) {
      case 'High':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Explorer</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {selectedCareer
            ? `Careers related to your ${selectedCareer} roadmap`
            : 'Careers are personalized from your active roadmap.'}
        </p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>

      {isLoading || isRoadmapLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : !canQuery ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          Generate your personalized roadmap to see tailored careers.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careers?.length > 0 ? (
            careers.map((career) => (
              <div key={career._id} className="card">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {career.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {career.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-gray-900 dark:text-white">
                      ${career.salaryRange?.min?.toLocaleString()} - $
                      {career.salaryRange?.max?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span className={`font-medium ${getGrowthColor(career.growthOutlook)}`}>
                      {career.growthOutlook} Growth
                    </span>
                  </div>

                  <div className="flex items-start text-sm">
                    <Building className="w-4 h-4 mr-2 mt-1 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Top Companies:</p>
                      <div className="flex flex-wrap gap-1">
                        {career.topCompanies?.slice(0, 3).map((company, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-900 dark:text-white"
                          >
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {career.requiredSkills?.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400 col-span-full">
              No careers available for your roadmap.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Careers;
