import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Search, Calendar, Star, Sparkles, Briefcase, GraduationCap } from 'lucide-react';
import { useRoadmapContext } from '../context/RoadmapContext';
import { DiscoveryGridSkeleton } from '../components/ui/Skeleton';
import FriendlyError from '../components/ui/FriendlyError';
import { classifyApiError, getErrorMessage } from '../utils/apiErrors';

const Mentors = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [expertise, setExpertise] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const {
    stream,
    selectedCareer,
    isLoading: isRoadmapLoading,
    hasActiveRoadmap,
  } = useRoadmapContext();

  const canQuery = Boolean(hasActiveRoadmap && stream && selectedCareer);

  const mentorParams = useMemo(() => {
    if (!canQuery) return null;
    const params = { stream, career: selectedCareer };
    if (search) params.search = search;
    if (expertise) params.expertise = expertise;
    return params;
  }, [canQuery, stream, selectedCareer, search, expertise]);

  const { data: mentors, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['mentors', mentorParams],
    queryFn: () => api.get('/mentors', { params: mentorParams }).then((res) => res.data),
    enabled: !!mentorParams,
  });

  const { data: bookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/mentors/bookings/my').then(res => res.data),
  });

  const bookMutation = useMutation({
    mutationFn: (data) => api.post('/mentors/book', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('Session booked successfully!');
      setSelectedMentor(null);
      setBookingDate('');
      setBookingTime('');
    },
  });

  const handleBook = () => {
    if (!bookingDate || !bookingTime) {
      toast.error('Please select date and time');
      return;
    }
    bookMutation.mutate({
      mentorId: selectedMentor._id,
      date: bookingDate,
      time: bookingTime,
    });
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available':
        return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300 border border-green-200/35 dark:border-green-900/40';
      case 'Busy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-955/20 dark:text-yellow-300 border border-yellow-250/20 dark:border-yellow-900/40';
      case 'Unavailable':
        return 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300 border border-red-200/20 dark:border-red-900/40';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find a Mentor</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {selectedCareer
            ? `Mentors matched to your ${selectedCareer} roadmap`
            : 'Mentors are personalized from your active roadmap.'}
        </p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
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
            placeholder="Filter by expertise"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            className="input-field"
            disabled={!canQuery}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isRoadmapLoading ? (
            <DiscoveryGridSkeleton count={4} columns={2} />
          ) : !canQuery ? (
            <FriendlyError
              variant="noResults"
              title="Roadmap required"
              description="Generate your personalized roadmap to see mentors matched to your career."
              actionTo="/onboarding"
              actionLabel="Set up roadmap"
              compact
            />
          ) : isLoading ? (
            <DiscoveryGridSkeleton count={4} columns={2} />
          ) : isError ? (
            <FriendlyError
              variant={classifyApiError(error) === 'network' ? 'network' : 'gemini'}
              description={getErrorMessage(error)}
              onRetry={() => refetch()}
              compact
            />
          ) : mentors?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mentors.map((mentor) => (
                <div
                  key={mentor._id}
                  className="card relative overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800"
                >
                    {mentor.matchScore !== undefined && (
                      <div
                        className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-bl-xl border-l border-b flex items-center gap-1 ${
                          mentor.matchScore >= 75
                            ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-950/40'
                            : mentor.matchScore >= 40
                            ? 'bg-primary-500/10 text-primary-700 dark:text-primary-400 border-primary-200/50 dark:border-primary-950/40'
                            : 'bg-gray-100/80 text-gray-500 border-gray-200 dark:bg-gray-800/80 dark:text-gray-400 dark:border-gray-700/50'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {mentor.matchScore}% Match
                      </div>
                    )}

                    <div>
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-sm">
                          {mentor.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                            {mentor.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-semibold mt-0.5">
                            {mentor.position} at {mentor.company}
                          </p>
                          <div className="flex items-center mt-1.5">
                            <Star className="w-3.5 h-3.5 text-yellow-500 mr-1" />
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">
                              {mentor.rating} ({mentor.reviewCount || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {mentor.bio}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {mentor.matchDetails?.careerExpert && (
                          <span className="px-2 py-0.5 rounded bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 border border-primary-200/50 dark:border-primary-900/50 text-[10px] font-bold flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            Career Expert
                          </span>
                        )}
                        {mentor.matchDetails?.streamExpert && (
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50 text-[10px] font-bold flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            Stream Expert
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-gray-55/40 dark:border-gray-800/80 pt-3">
                        {mentor.expertise?.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs font-medium border border-gray-100 dark:border-gray-700/50"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-50 dark:border-gray-850 flex items-center justify-between">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getAvailabilityColor(mentor.availability)}`}
                      >
                        {mentor.availability}
                      </span>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-gray-950 dark:text-white">
                          ${mentor.hourlyRate}
                        </span>
                        <span className="text-xs text-gray-500">/hr</span>
                      </div>
                    </div>

                  <button
                    onClick={() => setSelectedMentor(mentor)}
                    className="btn-primary w-full mt-4 py-2 px-3 text-xs"
                  >
                    Book Session
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <FriendlyError
              variant="noResults"
              title="No mentors available for your roadmap"
              description="We could not find mentors matching your stream and selected career."
              actionTo="/roadmap"
              actionLabel="View roadmap"
              compact
            />
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Bookings</h2>
            <div className="space-y-3">
              {bookings?.length > 0 ? (
                bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="p-3 bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-850 rounded-xl"
                  >
                    <p className="font-semibold text-gray-950 dark:text-white text-sm">
                      {booking.mentor?.name}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-primary-600" />
                      {new Date(booking.date).toLocaleDateString()} at {booking.time}
                    </div>
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                        booking.status === 'Confirmed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                          : booking.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No bookings scheduled yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedMentor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-700/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Book Session with {selectedMentor.name}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-750 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-750 dark:text-gray-300 mb-1">
                  Time
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>
              <div className="text-center bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                <p className="text-xs text-gray-500">Hourly Rate</p>
                <div className="mt-1 font-extrabold text-2xl text-gray-950 dark:text-white">
                  ${selectedMentor.hourlyRate}
                  <span className="text-sm font-normal text-gray-500">/hour</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelectedMentor(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={bookMutation.isPending}
                className="btn-primary flex-1"
              >
                {bookMutation.isPending ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentors;
