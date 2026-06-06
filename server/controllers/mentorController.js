const Mentor = require('../models/Mentor');
const Booking = require('../models/Booking');
const discoveryLog = require('../utils/discoveryLog');
const {
  scoreMentor,
  rankDiscoverables,
  fetchDiscoveryCandidates,
  hasDiscoveryCriteria,
} = require('../utils/discoveryMatching');

const hasValue = (value) => typeof value === 'string' && value.trim() !== '';

const buildFilterQuery = (req) => {
  const { availability, search } = req.query;
  const query = {};

  if (hasValue(availability)) query.availability = availability;
  if (hasValue(search)) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  return query;
};

const getMentors = async (req, res) => {
  try {
    const { expertise, stream, career, topics } = req.query;
    const criteria = {
      stream: stream?.trim(),
      career: career?.trim(),
      topics: topics?.trim(),
      expertise: expertise?.trim(),
    };

    if (!hasDiscoveryCriteria(criteria, { requireTopics: false })) {
      discoveryLog('MENTORS', {
        stream,
        career,
        topics,
        results: 0,
        note: 'missing stream or career',
      });
      return res.json([]);
    }

    const filterQuery = buildFilterQuery(req);
    const candidates = await fetchDiscoveryCandidates(Mentor, criteria, filterQuery, {
      mentor: true,
      mode: 'mentor',
    });

    const rankedMentors = rankDiscoverables(
      candidates,
      (mentor) => scoreMentor(mentor, criteria),
      { maxResults: 100, mode: 'mentor' }
    );

    discoveryLog('MENTORS', {
      stream,
      career,
      topics,
      candidates: candidates.length,
      filters: filterQuery,
      results: rankedMentors.length,
      topMatches: rankedMentors.slice(0, 5).map((mentor) => ({
        id: mentor._id,
        name: mentor.name,
        matchScore: mentor.matchScore,
        details: mentor.matchDetails,
      })),
    });

    res.json(rankedMentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bookSession = async (req, res) => {
  try {
    const { mentorId, date, time, duration, notes } = req.body;

    const booking = await Booking.create({
      user: req.user._id,
      mentor: mentorId,
      date: new Date(date),
      time,
      duration,
      notes,
    });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('mentor')
      .sort({ date: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMentors,
  getMentorById,
  bookSession,
  getBookings,
};
