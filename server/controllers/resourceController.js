const Resource = require('../models/Resource');
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
  const { category, type, difficulty, search, tags } = req.query;
  const query = {};

  if (hasValue(category)) query.category = category;
  if (hasValue(type)) query.type = type;
  if (hasValue(difficulty)) query.difficulty = difficulty;
  if (hasValue(tags)) query.tags = { $in: parseCommaList(tags) };
  if (hasValue(search)) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  return query;
};

const getResources = async (req, res) => {
  try {
    const { stream, career, topics } = req.query;
    const criteria = {
      stream: stream?.trim(),
      career: career?.trim(),
      topics: topics?.trim(),
    };

    if (!hasDiscoveryCriteria(criteria, { requireTopics: true })) {
      discoveryLog('RESOURCES', {
        stream,
        career,
        topics,
        results: 0,
        note: 'missing stream, career, or topics',
      });
      return res.json([]);
    }

    const filterQuery = buildFilterQuery(req);
    const candidates = await fetchDiscoveryCandidates(Resource, criteria, filterQuery, {
      mode: 'catalog',
    });

    const rankedResources = rankDiscoverables(
      candidates,
      (resource) => scoreCourseOrResource(resource, criteria),
      { maxResults: 50, mode: 'catalog' }
    );

    discoveryLog('RESOURCES', {
      stream,
      career,
      topics,
      candidates: candidates.length,
      filters: filterQuery,
      results: rankedResources.length,
      topMatches: rankedResources.slice(0, 5).map((resource) => ({
        id: resource._id,
        title: resource.title,
        matchScore: resource.matchScore,
        details: resource.matchDetails,
      })),
    });

    res.json(rankedResources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveResource = async (req, res) => {
  try {
    const { resourceId } = req.body;

    const savedItem = await SavedItem.create({
      user: req.user._id,
      itemType: 'resource',
      itemId: resourceId,
    });

    res.json(savedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSavedResources = async (req, res) => {
  try {
    const savedItems = await SavedItem.find({
      user: req.user._id,
      itemType: 'resource',
    }).populate('itemId');

    const resources = savedItems.map((item) => item.itemId);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unsaveResource = async (req, res) => {
  try {
    await SavedItem.findOneAndDelete({
      user: req.user._id,
      itemType: 'resource',
      itemId: req.params.id,
    });

    res.json({ message: 'Resource removed from saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getResources,
  saveResource,
  getSavedResources,
  unsaveResource,
};
