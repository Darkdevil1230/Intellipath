/**
 * Flexible discovery matching: aliases, fuzzy overlap, scoring, ranking, fallbacks.
 */

const normalize = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value) =>
  normalize(value)
    .split(' ')
    .filter((token) => token.length > 1);

const escapeRegExp = (string) => String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseCommaList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

/** Canonical alias groups — any member expands to the full group */
const ALIAS_GROUPS = [
  ['cse', 'computer science', 'comp sci', 'cs', 'computing'],
  [
    'software engineer',
    'software developer',
    'software engineering',
    'swe',
    'developer',
    'programmer',
  ],
  ['dsa', 'data structures and algorithms', 'data structures', 'algorithms'],
  ['ml', 'machine learning'],
  ['ai', 'artificial intelligence'],
  ['devops', 'dev ops', 'development operations'],
  ['ui', 'user interface', 'ux', 'user experience'],
  ['dbms', 'database', 'databases', 'sql'],
  ['os', 'operating systems', 'operating system'],
  ['iot', 'internet of things'],
  ['robotics engineer', 'robotics engineering', 'robotics'],
];

const STREAM_ALIASES = {
  engineering: ['engineering', 'cse', 'computer science', 'it', 'ece', 'eee'],
  it: ['it', 'information technology', 'computer science', 'cse', 'engineering'],
  science: ['science', 'bsc', 'pure science'],
  commerce: ['commerce', 'bcom', 'business'],
  law: ['law', 'legal'],
  medicine: ['medicine', 'medical', 'mbbs'],
  medical: ['medical', 'medicine', 'mbbs'],
  management: ['management', 'mba', 'business'],
  arts: ['arts', 'humanities'],
};

const expandFromGroups = (term, groups = ALIAS_GROUPS) => {
  const base = normalize(term);
  const expanded = new Set([base]);
  if (!base) return [];

  for (const group of groups) {
    const normalizedGroup = group.map(normalize);
    const hit = normalizedGroup.some(
      (member) => base === member || base.includes(member) || member.includes(base)
    );
    if (hit) {
      normalizedGroup.forEach((member) => expanded.add(member));
    }
  }

  return [...expanded];
};

const expandStreamTerms = (stream) => {
  const base = normalize(stream);
  const terms = new Set(expandFromGroups(stream));
  const streamKey = base.replace(/\s+/g, ' ');
  const mapped = STREAM_ALIASES[streamKey];
  if (mapped) mapped.forEach((t) => terms.add(normalize(t)));
  terms.add(base);
  return [...terms].filter(Boolean);
};

const expandCareerTerms = (career) => {
  const terms = new Set(expandFromGroups(career));
  parseCommaList(career).forEach((part) => expandFromGroups(part).forEach((t) => terms.add(t)));
  return [...terms].filter(Boolean);
};

const expandTopicTerms = (topic) => {
  const terms = new Set(expandFromGroups(topic));
  tokenize(topic).forEach((token) => {
    if (token.length > 2) terms.add(token);
  });
  return [...terms].filter(Boolean);
};

const textsMatch = (left, right) => {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;

  const aVariants = expandFromGroups(a);
  const bVariants = expandFromGroups(b);
  for (const av of aVariants) {
    for (const bv of bVariants) {
      if (av === bv || av.includes(bv) || bv.includes(av)) return true;
    }
  }

  const aTokens = tokenize(a).filter((token) => token.length > 3);
  const bTokens = tokenize(b).filter((token) => token.length > 3);
  if (!aTokens.length || !bTokens.length) return false;

  const shared = aTokens.filter((token) =>
    bTokens.some((other) => token === other || token.includes(other) || other.includes(token))
  );
  if (shared.length >= 2) return true;
  if (shared.length >= 1 && shared.length / aTokens.length >= 0.6) return true;

  return false;
};

const streamsCompatible = (queryStream, itemStream) => {
  if (!queryStream || !itemStream) return false;
  if (textsMatch(queryStream, itemStream)) return true;

  const queryNorm = normalize(queryStream);
  const itemNorm = normalize(itemStream);
  const families = Object.entries(STREAM_ALIASES).map(([key, aliases]) => [
    key,
    ...aliases.map(normalize),
  ]);

  return families.some((family) => family.includes(queryNorm) && family.includes(itemNorm));
};

const listMatchesQuery = (queryValue, values = []) => {
  if (!queryValue || !values?.length) return false;
  const queryParts = parseCommaList(queryValue).length
    ? parseCommaList(queryValue)
    : [queryValue];
  return queryParts.some((part) =>
    values.some((candidate) => textsMatch(part, candidate))
  );
};

const topicOverlapRatio = (queryTopics, catalogTopics = []) => {
  if (!queryTopics.length) return 0;
  if (!catalogTopics.length) return 0;

  let hits = 0;
  for (const queryTopic of queryTopics) {
    const matched = catalogTopics.some((catalogTopic) => textsMatch(queryTopic, catalogTopic));
    if (matched) hits += 1;
  }
  return hits / queryTopics.length;
};

const scoreStream = (queryStream, itemStream) => {
  if (!queryStream || !itemStream) return { points: 0, matched: false };
  const matched = streamsCompatible(queryStream, itemStream);
  return { points: matched ? 25 : 0, matched };
};

const scoreCareer = (queryCareer, relatedCareers = [], { allowSoft = false } = {}) => {
  if (!queryCareer) return { points: 0, matched: false, softMatched: false };
  const matched = listMatchesQuery(queryCareer, relatedCareers);
  if (matched) return { points: 35, matched: true, softMatched: false };

  if (!allowSoft) {
    return { points: 0, matched: false, softMatched: false };
  }

  const queryTokens = tokenize(queryCareer).filter((token) => token.length > 3);
  const softHit = relatedCareers.some((career) => {
    const careerTokens = tokenize(career).filter((token) => token.length > 3);
    const shared = queryTokens.filter((qt) =>
      careerTokens.some((ct) => qt === ct || qt.includes(ct) || ct.includes(qt))
    );
    return shared.length >= 2;
  });

  return { points: softHit ? 15 : 0, matched: false, softMatched: softHit };
};

const scoreTopics = (queryTopics, catalogTopics = []) => {
  const ratio = topicOverlapRatio(queryTopics, catalogTopics);
  if (ratio < 0.25) return { points: 0, matched: false, ratio };
  const points = Math.round(ratio * 40);
  return { points, matched: ratio >= 0.5, ratio };
};

const scoreCourseOrResource = (item, criteria) => {
  const { stream, career, topics } = criteria;
  const queryTopics = parseCommaList(topics);

  const streamResult = scoreStream(stream, item.stream);
  const careerResult = scoreCareer(career, item.relatedCareers || [], { allowSoft: false });
  const topicResult = scoreTopics(queryTopics, item.relatedTopics || []);

  const score = streamResult.points + careerResult.points + topicResult.points;

  return {
    score,
    details: {
      topicMatch: topicResult.matched,
      topicOverlap: Number(topicResult.ratio.toFixed(2)),
      careerMatch: careerResult.matched,
      streamMatch: streamResult.matched,
    },
  };
};

const CATALOG_MIN_SCORE_STRICT = 50;
const CATALOG_MIN_SCORE_RELAXED = 45;

const passesCatalogQuality = (item, { relaxed = false } = {}) => {
  const details = item.matchDetails || {};
  const minScore = relaxed ? CATALOG_MIN_SCORE_RELAXED : CATALOG_MIN_SCORE_STRICT;

  if (item.matchScore < minScore) return false;
  if (!details.careerMatch) return false;
  if (!details.streamMatch && !details.topicMatch) return false;

  return true;
};

const scoreMentor = (mentor, criteria) => {
  const { stream, career, topics, expertise } = criteria;
  const queryTopics = [
    ...parseCommaList(topics),
    ...parseCommaList(expertise),
  ];

  let score = 0;
  const details = {
    careerExpert: false,
    streamExpert: false,
    topicExpert: false,
  };

  const careerFields = [
    ...(mentor.relatedCareers || []),
    ...(mentor.expertise || []),
  ];
  const careerResult = scoreCareer(career, careerFields, { allowSoft: true });
  if (careerResult.matched) {
    score += 60;
    details.careerExpert = true;
  } else if (careerResult.softMatched) {
    score += 35;
    details.careerExpert = true;
  }

  const streamResult = scoreStream(stream, mentor.stream);
  if (streamResult.matched) {
    score += 40;
    details.streamExpert = true;
  } else if (streamResult.points > 0) {
    score += 20;
    details.streamExpert = true;
  }

  const expertiseTopics = [...(mentor.expertise || []), ...(mentor.relatedCareers || [])];
  const topicResult = scoreTopics(queryTopics, expertiseTopics);
  if (topicResult.points > 0) {
    score += Math.min(20, topicResult.points);
    details.topicExpert = true;
  }

  return {
    score: Math.min(100, score),
    details,
  };
};

const compareRanked = (a, b) => {
  const scoreDiff = Number(b.matchScore) - Number(a.matchScore);
  if (scoreDiff !== 0) return scoreDiff;

  const aCareer = a.matchDetails?.careerMatch || a.matchDetails?.careerExpert ? 1 : 0;
  const bCareer = b.matchDetails?.careerMatch || b.matchDetails?.careerExpert ? 1 : 0;
  if (bCareer !== aCareer) return bCareer - aCareer;

  const aTopic = a.matchDetails?.topicMatch || a.matchDetails?.topicExpert ? 1 : 0;
  const bTopic = b.matchDetails?.topicMatch || b.matchDetails?.topicExpert ? 1 : 0;
  if (bTopic !== aTopic) return bTopic - aTopic;

  const aRating = Number(a.rating) || 0;
  const bRating = Number(b.rating) || 0;
  if (bRating !== aRating) return bRating - aRating;

  const aLabel = (a.title || a.name || '').toLowerCase();
  const bLabel = (b.title || b.name || '').toLowerCase();
  return aLabel.localeCompare(bLabel);
};

const rankDiscoverables = (items, scoreFn, { maxResults = 100, mode = 'catalog' } = {}) => {
  const scored = items.map((item) => {
    const plain = typeof item.toObject === 'function' ? item.toObject() : { ...item };
    const { score, details } = scoreFn(plain);
    plain.matchScore = Math.round(Math.min(100, Math.max(0, Number(score) || 0)));
    plain.matchDetails = details;
    return plain;
  });

  scored.sort(compareRanked);

  if (mode === 'mentor') {
    return scored.filter((item) => item.matchScore > 0).slice(0, maxResults);
  }

  const strict = scored.filter((item) => passesCatalogQuality(item, { relaxed: false }));
  if (strict.length > 0) {
    return strict.slice(0, maxResults);
  }

  const relaxed = scored.filter((item) => passesCatalogQuality(item, { relaxed: true }));
  return relaxed.slice(0, Math.min(maxResults, 12));
};

const isQueryableTerm = (term) => {
  if (!term) return false;
  if (term.length >= 4) return true;
  return term.includes(' ');
};

const buildCareerQueryClause = (career, { mentor = false } = {}) => {
  const careerOr = expandCareerTerms(career)
    .filter(isQueryableTerm)
    .map((term) => ({ relatedCareers: { $regex: escapeRegExp(term), $options: 'i' } }));

  if (mentor) {
    expandCareerTerms(career)
      .filter(isQueryableTerm)
      .forEach((term) => {
        careerOr.push({ expertise: { $regex: escapeRegExp(term), $options: 'i' } });
      });
  }

  return careerOr.length ? { $or: careerOr } : null;
};

const buildTopicQueryClause = (topics, { mentor = false } = {}) => {
  const topicOr = [];

  for (const topic of parseCommaList(topics)) {
    for (const term of expandTopicTerms(topic)) {
      if (!isQueryableTerm(term)) continue;
      topicOr.push({ relatedTopics: { $regex: escapeRegExp(term), $options: 'i' } });
      if (mentor) {
        topicOr.push({ expertise: { $regex: escapeRegExp(term), $options: 'i' } });
      }
    }
  }

  return topicOr.length ? { $or: topicOr } : null;
};

const buildStreamQueryClause = (stream) => ({
  stream: { $regex: `^${escapeRegExp(stream.trim())}$`, $options: 'i' },
});

const buildLooseCandidateQuery = (criteria, { mentor = false } = {}) => {
  const { stream, career, topics } = criteria;
  const or = [];

  if (stream) {
    or.push(buildStreamQueryClause(stream));
  }

  const careerClause = buildCareerQueryClause(career, { mentor });
  if (careerClause) or.push(careerClause);

  const topicClause = buildTopicQueryClause(topics, { mentor });
  if (topicClause) or.push(topicClause);

  return or.length ? { $or: or } : {};
};

const buildStrictCatalogQuery = (criteria) => {
  const { stream, career, topics } = criteria;
  const streamClause = buildStreamQueryClause(stream);
  const careerClause = buildCareerQueryClause(career);
  const topicClause = buildTopicQueryClause(topics);

  const attempts = [];
  if (careerClause && topicClause) {
    attempts.push({ $and: [streamClause, careerClause, topicClause] });
  }
  if (careerClause) {
    attempts.push({ $and: [streamClause, careerClause] });
  }

  return attempts;
};

const mergeDiscoveryQuery = (extraQuery = {}, loose = {}) => {
  const hasExtra = extraQuery && Object.keys(extraQuery).length > 0;
  const hasLoose = loose && Object.keys(loose).length > 0;

  if (hasExtra && hasLoose) {
    return { $and: [extraQuery, loose] };
  }
  if (hasExtra) return extraQuery;
  if (hasLoose) return loose;
  return {};
};

const fetchDiscoveryCandidates = async (Model, criteria, extraQuery = {}, options = {}) => {
  const { mode = 'catalog' } = options;

  if (mode === 'catalog') {
    const attempts = buildStrictCatalogQuery(criteria);

    for (const core of attempts) {
      const query = mergeDiscoveryQuery(extraQuery, core);
      const candidates = await Model.find(query).limit(150);
      if (candidates.length) return candidates;
    }

    return [];
  }

  const loose = buildLooseCandidateQuery(criteria, options);
  const query = mergeDiscoveryQuery(extraQuery, loose);
  let candidates = await Model.find(query).limit(300);

  if (!candidates.length && criteria.stream) {
    candidates = await Model.find(
      mergeDiscoveryQuery(extraQuery, buildStreamQueryClause(criteria.stream))
    ).limit(150);
  }

  if (!candidates.length && criteria.career) {
    const careerClause = buildCareerQueryClause(criteria.career, options);
    if (careerClause) {
      candidates = await Model.find(mergeDiscoveryQuery(extraQuery, careerClause)).limit(150);
    }
  }

  return candidates;
};

const hasDiscoveryCriteria = (criteria, { requireTopics = true } = {}) => {
  const stream = typeof criteria.stream === 'string' && criteria.stream.trim() !== '';
  const career = typeof criteria.career === 'string' && criteria.career.trim() !== '';
  const topics = parseCommaList(criteria.topics);
  if (!stream || !career) return false;
  if (requireTopics && topics.length === 0) return false;
  return true;
};

module.exports = {
  parseCommaList,
  expandStreamTerms,
  expandCareerTerms,
  expandTopicTerms,
  textsMatch,
  scoreCourseOrResource,
  scoreMentor,
  rankDiscoverables,
  fetchDiscoveryCandidates,
  hasDiscoveryCriteria,
  buildLooseCandidateQuery,
};
