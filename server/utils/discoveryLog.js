const discoveryLog = (label, payload = {}) => {
  const {
    stream,
    career,
    topics,
    results,
    candidates,
    filters,
    topMatches,
    note,
  } = payload;

  const topicsList =
    typeof topics === 'string'
      ? topics.split(',').map((t) => t.trim()).filter(Boolean)
      : Array.isArray(topics)
        ? topics
        : [];

  const payloadForLog = {
    input: {
      stream: stream || '(none)',
      career: career || '(none)',
      topics: topicsList,
    },
    filters: filters || '(default)',
    candidates: candidates ?? '(n/a)',
    results: results ?? 0,
    topMatches: topMatches || [],
    note: note || undefined,
  };

  try {
    console.log(`[DISCOVERY:${label}]`, JSON.parse(JSON.stringify(payloadForLog, (_key, value) => {
      if (value && typeof value === 'object' && value._bsontype === 'ObjectID') {
        return value.toString();
      }
      return value;
    }), 2));
  } catch (err) {
    console.log(`[DISCOVERY:${label}]`, payloadForLog);
  }
};

module.exports = discoveryLog;
