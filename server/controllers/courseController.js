const Course = require('../models/Course');
const SavedItem = require('../models/SavedItem');
const discoveryLog = require('../utils/discoveryLog');
const {
  parseCommaList,
  scoreCourseOrResource,
  rankDiscoverables,
  fetchDiscoveryCandidates,
  hasDiscoveryCriteria,
} = require('../utils/discoveryMatching');

const hasValue = (value) => typeof value === 'string' && value.trim() !== '';

const buildFilterQuery = (req) => {
  const { category, provider, level, isFree, search, tags } = req.query;
  const query = {};

  if (hasValue(category)) query.category = category;
  if (hasValue(provider)) query.provider = provider;
  if (hasValue(level)) query.level = level;
  if (isFree === 'true' || isFree === 'false') query.isFree = isFree === 'true';
  if (hasValue(tags)) query.tags = { $in: parseCommaList(tags) };
  if (hasValue(search)) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  return query;
};

const getCourses = async (req, res) => {
  try {
    const { stream, career, topics } = req.query;
    const criteria = {
      stream: stream?.trim(),
      career: career?.trim(),
      topics: topics?.trim(),
    };

    if (!hasDiscoveryCriteria(criteria, { requireTopics: true })) {
      discoveryLog('COURSES', {
        stream,
        career,
        topics,
        results: 0,
        note: 'missing stream, career, or topics',
      });
      return res.json([]);
    }

    const filterQuery = buildFilterQuery(req);
    const candidates = await fetchDiscoveryCandidates(Course, criteria, filterQuery, {
      mode: 'catalog',
    });

    const rankedCourses = rankDiscoverables(
      candidates,
      (course) => scoreCourseOrResource(course, criteria),
      { maxResults: 50, mode: 'catalog' }
    );

    discoveryLog('COURSES', {
      stream,
      career,
      topics,
      candidates: candidates.length,
      filters: filterQuery,
      results: rankedCourses.length,
      topMatches: rankedCourses.slice(0, 5).map((course) => ({
        id: course._id,
        title: course.title,
        matchScore: course.matchScore,
        details: course.matchDetails,
      })),
    });

    res.json(rankedCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const savedItem = await SavedItem.create({
      user: req.user._id,
      itemType: 'course',
      itemId: courseId,
    });

    res.json(savedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSavedCourses = async (req, res) => {
  try {
    const savedItems = await SavedItem.find({
      user: req.user._id,
      itemType: 'course',
    }).populate('itemId');

    const courses = savedItems.map((item) => item.itemId);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unsaveCourse = async (req, res) => {
  try {
    await SavedItem.findOneAndDelete({
      user: req.user._id,
      itemType: 'course',
      itemId: req.params.id,
    });

    res.json({ message: 'Course removed from saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourses,
  saveCourse,
  getSavedCourses,
  unsaveCourse,
};
