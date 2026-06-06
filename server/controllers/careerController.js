const Career = require('../models/Career');
const discoveryLog = require('../utils/discoveryLog');

const getCareers = async (req, res) => {
  try {
    const { category, search, stream, career, topics } = req.query;
    const query = {};
    const hasValue = (value) => typeof value === 'string' && value.trim() !== '';

    if (!hasValue(stream) || !hasValue(career)) {
      discoveryLog('CAREERS', { stream, career, topics, results: 0 });
      return res.json([]);
    }

    const orClauses = [];

    if (hasValue(category)) query.category = category;
    if (hasValue(stream)) query.stream = stream;

    if (hasValue(search)) {
      orClauses.push(
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      );
    }

    if (hasValue(career)) {
      orClauses.push(
        { title: { $regex: career, $options: 'i' } },
        { description: { $regex: career, $options: 'i' } },
        { category: { $regex: career, $options: 'i' } },
        { stream: { $regex: career, $options: 'i' } }
      );
    }

    if (hasValue(topics)) {
      const topicTerms = topics.split(',').map((term) => term.trim()).filter(Boolean);
      if (topicTerms.length) {
        orClauses.push(
          ...topicTerms.map((term) => ({ description: { $regex: term, $options: 'i' } })),
          ...topicTerms.map((term) => ({ title: { $regex: term, $options: 'i' } }))
        );
      }
    }

    if (orClauses.length) query.$or = orClauses;

    const careers = await Career.find(query);

    const rankedCareers = careers
      .map((careerItem) => {
        let score = 0;
        const details = { streamMatch: false, careerMatch: false, searchMatch: false };

        if (hasValue(stream) && careerItem.stream?.toLowerCase() === stream.trim().toLowerCase()) {
          score += 40;
          details.streamMatch = true;
        }

        if (
          hasValue(career) &&
          careerItem.title?.toLowerCase().includes(career.trim().toLowerCase())
        ) {
          score += 35;
          details.careerMatch = true;
        }

        if (
          hasValue(search) &&
          (careerItem.title?.toLowerCase().includes(search.toLowerCase()) ||
            careerItem.description?.toLowerCase().includes(search.toLowerCase()))
        ) {
          score += 25;
          details.searchMatch = true;
        }

        const careerObj = careerItem.toObject();
        careerObj.matchScore = score;
        careerObj.matchDetails = details;
        return careerObj;
      })
      .filter((careerItem) => careerItem.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    discoveryLog('CAREERS', { stream, career, topics, results: rankedCareers.length });
    res.json(rankedCareers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCareerById = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }

    res.json(career);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCareers,
  getCareerById,
};
