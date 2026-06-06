const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const DEFAULT_ANTHROPIC_MODEL = 'claude-3.5-sonic';
const REQUEST_TIMEOUT_MS = 25000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1200;

let genAI = null;

const isPlaceholderKey = (key) => !key || String(key).trim().startsWith('your_');
const getEnv = (name) => (process.env[name] ? String(process.env[name]).trim() : undefined);

const safeList = (value, fallback = 'Not specified') =>
  Array.isArray(value) && value.length ? value.join(', ') : fallback;

/**
 * Strip markdown fences and extract the first JSON object or array from model text.
 */
const extractJson = (text) => {
  if (!text) throw new Error('Empty text received from AI provider');

  let cleaned = String(text).trim();

  cleaned = cleaned.replace(/^```(?:json|javascript|js)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/g, '');
  cleaned = cleaned.replace(/```json/gi, '');
  cleaned = cleaned.replace(/```/g, '');
  cleaned = cleaned.trim();

  const tryParse = (candidate) => {
    const sanitized = candidate.replace(/,\s*([\]}])/g, '$1').trim();
    return JSON.parse(sanitized);
  };

  try {
    return tryParse(cleaned);
  } catch (firstErr) {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return tryParse(objectMatch[0]);
      } catch (objectErr) {
        console.error('[AI] Object extract parse failed:', objectErr.message);
      }
    }

    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return tryParse(arrayMatch[0]);
      } catch (arrayErr) {
        console.error('[AI] Array extract parse failed:', arrayErr.message);
      }
    }

    throw new Error(`JSON parsing failed: ${firstErr.message}`);
  }
};

const withTimeout = (promise, ms, label = 'AI API call') =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);

const getActiveAiProviders = () => {
  const providers = [];
  const geminiKey = getEnv('GEMINI_API_KEY') || getEnv('GOOGLE_API_KEY');
  if (!isPlaceholderKey(geminiKey)) {
    providers.push({
      name: 'gemini',
      key: geminiKey,
      model: getEnv('GEMINI_MODEL') || DEFAULT_GEMINI_MODEL,
    });
  }

  const openAiKey = getEnv('OPENAI_API_KEY');
  if (!isPlaceholderKey(openAiKey)) {
    providers.push({
      name: 'openai',
      key: openAiKey,
      model: getEnv('OPENAI_MODEL') || DEFAULT_OPENAI_MODEL,
    });
  }

  const anthropicKey = getEnv('ANTHROPIC_API_KEY');
  if (!isPlaceholderKey(anthropicKey)) {
    providers.push({
      name: 'anthropic',
      key: anthropicKey,
      model: getEnv('ANTHROPIC_MODEL') || DEFAULT_ANTHROPIC_MODEL,
    });
  }

  return providers;
};

const getGoogleGenAI = () => {
  const apiKey = getEnv('GEMINI_API_KEY') || getEnv('GOOGLE_API_KEY');
  if (isPlaceholderKey(apiKey)) {
    throw new Error(
      'Gemini API key is missing or still a placeholder. Set GEMINI_API_KEY or GOOGLE_API_KEY in server/.env'
    );
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

const extractTextFromOpenAI = (data) => {
  if (!data) throw new Error('Empty OpenAI response');

  if (typeof data === 'string') {
    return data.trim();
  }

  const candidates = [];
  if (Array.isArray(data.output)) {
    data.output.forEach((item) => {
      if (typeof item === 'string') {
        candidates.push(item);
        return;
      }
      if (item.text) {
        candidates.push(item.text);
        return;
      }
      if (item.message?.content) {
        if (typeof item.message.content === 'string') {
          candidates.push(item.message.content);
        } else if (Array.isArray(item.message.content)) {
          candidates.push(item.message.content.map((part) => part.text || '').join(''));
        }
        return;
      }
      if (Array.isArray(item.content)) {
        candidates.push(item.content.map((part) => (typeof part === 'string' ? part : part.text || part.markdown || '')).join(''));
      }
    });
  }

  if (Array.isArray(data.choices) && data.choices.length) {
    const choice = data.choices[0];
    if (choice.message?.content) {
      candidates.push(choice.message.content);
    } else if (choice.text) {
      candidates.push(choice.text);
    }
  }

  const output = candidates.join('\n').trim();
  if (!output) {
    throw new Error('OpenAI response had no extractable text');
  }

  return output;
};

const extractTextFromAnthropic = (data) => {
  if (!data || typeof data.completion !== 'string') {
    throw new Error('Empty Anthropic response');
  }
  return String(data.completion).trim();
};

const callGeminiProvider = async (provider, prompt) => {
  const model = getGoogleGenAI().getGenerativeModel({ model: provider.model });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const callOpenAIProvider = async (provider, prompt) => {
  const response = await axios.post(
    'https://api.openai.com/v1/responses',
    {
      model: provider.model,
      input: prompt,
      max_output_tokens: 1500,
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${provider.key}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return extractTextFromOpenAI(response.data);
};

const callAnthropicProvider = async (provider, prompt) => {
  const anthropicPrompt = `\n\nHuman: ${prompt}\n\nAssistant:`;
  const response = await axios.post(
    'https://api.anthropic.com/v1/complete',
    {
      model: provider.model,
      prompt: anthropicPrompt,
      max_tokens_to_sample: 1500,
      temperature: 0.2,
      stop_sequences: ['\n\nHuman:'],
    },
    {
      headers: {
        'x-api-key': provider.key,
        'Content-Type': 'application/json',
      },
    }
  );
  return extractTextFromAnthropic(response.data);
};

const callProvider = async (provider, prompt) => {
  switch (provider.name) {
    case 'gemini':
      return callGeminiProvider(provider, prompt);
    case 'openai':
      return callOpenAIProvider(provider, prompt);
    case 'anthropic':
      return callAnthropicProvider(provider, prompt);
    default:
      throw new Error(`Unknown AI provider: ${provider.name}`);
  }
};

const callAiWithRetry = async (
  prompt,
  validator,
  fallbackGenerator,
  parseResponse = extractJson
) => {
  const providers = getActiveAiProviders();
  if (!providers.length) {
    console.warn(
      'No AI provider configured. Falling back to built-in roadmap/assessment generation.'
    );
    return fallbackGenerator();
  }

  let lastError = null;

  for (const provider of providers) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(
          `[AI] Attempt ${attempt}/${MAX_RETRIES} (${provider.name}:${provider.model})...`
        );

        const responseText = await withTimeout(
          callProvider(provider, prompt),
          REQUEST_TIMEOUT_MS,
          `${provider.name} API call`
        );

        const parsedData = parseResponse(responseText);
        if (validator(parsedData)) {
          console.log(
            `[AI] Attempt ${attempt}/${MAX_RETRIES} (${provider.name}) succeeded.`
          );
          return parsedData;
        }

        throw new Error('Parsed response failed schema validation');
      } catch (err) {
        lastError = err;
        console.error(
          `[AI] Attempt ${attempt}/${MAX_RETRIES} (${provider.name}) failed: ${err.message}`
        );
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }
    }
  }

  console.warn(
    `[AI] All configured providers failed. Using fallback. Last error: ${
      lastError?.message || 'unknown'
    }`
  );
  return fallbackGenerator();
};

const generateFallbackCareerRecommendations = (userData) => {
  const stream = userData?.academicStream || 'Engineering';
  const map = {
    Engineering: [
      { title: 'Software Engineer', score: 95, reason: 'Strong fit for engineering and programming paths.' },
      { title: 'Robotics Engineer', score: 92, reason: 'Matches hardware, control systems, and embedded interests.' },
      { title: 'Cloud Solutions Architect', score: 88, reason: 'Aligns with systems design and infrastructure skills.' },
      { title: 'Data Engineer', score: 85, reason: 'Uses analytical and pipeline-building strengths.' },
      { title: 'DevOps Engineer', score: 83, reason: 'Fits automation, CI/CD, and operations focus.' },
    ],
    Science: [
      { title: 'Data Scientist', score: 92, reason: 'Applies scientific method and quantitative analysis.' },
      { title: 'Machine Learning Researcher', score: 88, reason: 'Focus on models, math, and experimentation.' },
      { title: 'Research Scientist', score: 85, reason: 'Advances knowledge through structured research.' },
      { title: 'Bioinformatics Specialist', score: 81, reason: 'Combines biology and computing.' },
      { title: 'Quantitative Analyst', score: 84, reason: 'Statistical and numerical modeling strength.' },
    ],
    Commerce: [
      { title: 'Financial Analyst', score: 94, reason: 'Matches finance and quantitative reasoning.' },
      { title: 'Business Intelligence Analyst', score: 89, reason: 'Turns data into business insights.' },
      { title: 'Product Manager', score: 88, reason: 'Bridges business, users, and technology.' },
      { title: 'Investment Banker', score: 85, reason: 'Deal-making and financial structuring.' },
      { title: 'Digital Marketing Strategist', score: 82, reason: 'Growth and analytics-driven marketing.' },
    ],
    Arts: [
      { title: 'UI/UX Product Designer', score: 95, reason: 'Creative and user-centered design strengths.' },
      { title: 'Creative Director', score: 88, reason: 'Leads visual and brand storytelling.' },
      { title: 'Interaction Designer', score: 85, reason: 'Optimizes digital product experiences.' },
      { title: 'Brand Identity Designer', score: 87, reason: 'Builds cohesive visual systems.' },
      { title: '3D Visualizer', score: 80, reason: 'Spatial and rendering skills.' },
    ],
    Medicine: [
      { title: 'Healthcare Technology Consultant', score: 90, reason: 'Tech applied to healthcare systems.' },
      { title: 'Clinical Research Director', score: 88, reason: 'Research and trial oversight.' },
      { title: 'Medical Researcher', score: 86, reason: 'Laboratory and clinical investigation.' },
      { title: 'Surgeon', score: 84, reason: 'Advanced clinical procedural path.' },
      { title: 'Doctor (General Physician)', score: 82, reason: 'Primary patient care career.' },
    ],
    Law: [
      { title: 'Corporate Lawyer', score: 94, reason: 'Business and contract law alignment.' },
      { title: 'Legal Consultant', score: 88, reason: 'Advisory and compliance expertise.' },
      { title: 'Criminal Defense Attorney', score: 85, reason: 'Litigation and advocacy skills.' },
      { title: 'Corporate Lawyer', score: 90, reason: 'Corporate legal strategy fit.' },
      { title: 'Legal Consultant', score: 87, reason: 'Cross-functional legal advisory.' },
    ],
    Management: [
      { title: 'Product Manager', score: 93, reason: 'Roadmaps, metrics, and cross-team leadership.' },
      { title: 'Management Consultant', score: 90, reason: 'Strategy and operations advisory.' },
      { title: 'Business Analyst', score: 88, reason: 'Process and requirements analysis.' },
      { title: 'Marketing Manager', score: 86, reason: 'Brand and growth leadership.' },
      { title: 'Operations Lead', score: 84, reason: 'Efficiency and team coordination.' },
    ],
    IT: [
      { title: 'Software Engineer', score: 94, reason: 'Core development and engineering path.' },
      { title: 'Cloud Engineer', score: 90, reason: 'Infrastructure and cloud platforms.' },
      { title: 'Cybersecurity Analyst', score: 88, reason: 'Security engineering focus.' },
      { title: 'DevOps Engineer', score: 86, reason: 'Automation and delivery pipelines.' },
      { title: 'Data Scientist', score: 84, reason: 'Analytics and ML applications.' },
    ],
  };

  const defaultRecs = [
    { title: 'Technology Strategy Consultant', score: 90, reason: 'Bridges technology and business outcomes.' },
    { title: 'Product Manager', score: 88, reason: 'User needs, delivery, and roadmap ownership.' },
    { title: 'Data Analyst', score: 85, reason: 'Insight generation from structured data.' },
    { title: 'Operations Lead', score: 82, reason: 'Process optimization and coordination.' },
    { title: 'Customer Success Architect', score: 80, reason: 'Technical account guidance.' },
  ];

  return { recommendedCareers: map[stream] || defaultRecs };
};

const generateFallbackRoadmap = (careerTitle, userData) => {
  const stream = userData?.academicStream || 'Engineering';
  const skillTopics = Array.isArray(userData?.skills) ? userData.skills.slice(0, 3) : [];

  const defaultTopics = [
    `Introduction to ${careerTitle} Core Principles`,
    'Basic Tooling and Environment Setup',
    skillTopics[0] || `${careerTitle} Fundamentals`,
    skillTopics[1] || 'Intermediate Concepts and Architecture',
    'Advanced Optimization and Scaling',
  ];

  return {
    phases: [
      {
        phaseNumber: 1,
        title: `Foundations of ${careerTitle}`,
        description: `Kickstart your journey into ${careerTitle} (${stream} stream).`,
        duration: '4-6 weeks',
        completed: false,
        topics: [
          {
            name: defaultTopics[0],
            completed: false,
            resources: [
              { title: `${careerTitle} 101`, url: 'https://www.coursera.org', type: 'video' },
              { title: 'Getting Started Guide', url: 'https://developer.mozilla.org', type: 'article' },
            ],
          },
          {
            name: defaultTopics[1],
            completed: false,
            resources: [
              { title: 'Environment Setup', url: 'https://github.com', type: 'tool' },
            ],
          },
        ],
      },
      {
        phaseNumber: 2,
        title: `Intermediate ${careerTitle}`,
        description: `Core methodologies used by professional ${careerTitle} practitioners.`,
        duration: '6-8 weeks',
        completed: false,
        topics: [
          {
            name: defaultTopics[2],
            completed: false,
            resources: [
              { title: 'Intermediate Course', url: 'https://www.udemy.com', type: 'video' },
            ],
          },
          {
            name: defaultTopics[3],
            completed: false,
            resources: [
              { title: 'Best Practices', url: 'https://dev.to', type: 'article' },
            ],
          },
        ],
      },
      {
        phaseNumber: 3,
        title: `Advanced ${careerTitle} Portfolio`,
        description: 'Industry-standard concepts and portfolio-ready projects.',
        duration: '8-12 weeks',
        completed: false,
        topics: [
          {
            name: defaultTopics[4],
            completed: false,
            resources: [
              { title: 'Advanced Masterclass', url: 'https://www.youtube.com', type: 'video' },
            ],
          },
        ],
      },
    ],
    projects: [
      {
        title: `${careerTitle} Foundational Sandbox`,
        description: 'Beginner project applying core concepts.',
        difficulty: 'Beginner',
        completed: false,
      },
      {
        title: `Production-ready ${careerTitle} Application`,
        description: 'Portfolio-grade capstone project.',
        difficulty: 'Advanced',
        completed: false,
      },
    ],
    certifications: [
      {
        title: `Professional ${careerTitle} Specialization`,
        provider: 'Coursera',
        url: 'https://www.coursera.org',
        completed: false,
      },
    ],
  };
};

const generateFallbackAssessment = (topic, questionCount = 10) => {
  const questions = [];
  for (let i = 1; i <= questionCount; i++) {
    questions.push({
      question: `Review #${i} on ${topic}: Which option reflects a standard best practice?`,
      options: [
        `Structured approach to ${topic}`,
        'Ad-hoc implementation without validation',
        'Ignoring documented standards',
        'Using deprecated techniques only',
      ],
      correctAnswer: 0,
      explanation: `A structured approach is essential for reliable ${topic} outcomes.`,
    });
  }
  return { questions };
};

const generateCareerRecommendations = async (userData) => {
  const prompt = `
    Based on the following user data, recommend 5 suitable careers with match scores (0-100) and reasons:

    Academic Stream: ${userData?.academicStream || 'Not specified'}
    Current Education: ${userData?.currentEducation || 'Not specified'}
    Skills: ${safeList(userData?.skills)}
    Interests: ${safeList(userData?.interests)}
    Career Goal: ${userData?.careerGoal || 'Not specified'}

    Return ONLY valid JSON. No markdown, no code fences, no commentary.

    {
      "recommendedCareers": [
        { "title": "Career Title", "score": 95, "reason": "Brief explanation" }
      ]
    }
  `;

  const validator = (data) =>
    data && Array.isArray(data.recommendedCareers) && data.recommendedCareers.length > 0;

  return callAiWithRetry(prompt, validator, () =>
    generateFallbackCareerRecommendations(userData)
  );
};

const generateRoadmap = async (careerTitle, userData) => {
  try {
    const prompt = `
      Generate a comprehensive learning roadmap for becoming a ${careerTitle}.

      User context:
      - Academic Stream: ${userData?.academicStream || 'Not specified'}
      - Current Education: ${userData?.currentEducation || 'Not specified'}
      - Skills: ${safeList(userData?.skills)}

      Return ONLY valid JSON. No markdown, no code fences, no commentary.

      {
        "phases": [
          {
            "phaseNumber": 1,
            "title": "Phase Title",
            "description": "Description",
            "duration": "2-3 months",
            "topics": [
              {
                "name": "Topic Name",
                "resources": [
                  { "title": "Resource Title", "url": "https://example.com", "type": "video" }
                ]
              }
            ]
          }
        ],
        "projects": [
          { "title": "Project Title", "description": "Description", "difficulty": "Beginner" }
        ],
        "certifications": [
          { "title": "Certification Title", "provider": "Provider", "url": "https://example.com" }
        ]
      }
    `;

    const validator = (data) =>
      data &&
      Array.isArray(data.phases) &&
      data.phases.length > 0 &&
      Array.isArray(data.projects) &&
      Array.isArray(data.certifications);

    return await callAiWithRetry(prompt, validator, () =>
      generateFallbackRoadmap(careerTitle, userData)
    );
  } catch (err) {
    console.error('[AI] generateRoadmap fatal error, using fallback:', err.message);
    return generateFallbackRoadmap(careerTitle, userData);
  }
};

const buildChatPrompt = (message, conversationHistory = []) => {
  const historyLines = (conversationHistory || []).map((msg) => {
    const role = msg.role === 'assistant' ? 'Assistant' : 'Human';
    return `${role}: ${msg.content}`;
  });
  historyLines.push(`Human: ${message}`);
  historyLines.push('Assistant:');
  return historyLines.join('\n');
};

const generateChatResponse = async (message, conversationHistory = []) => {
  const prompt = buildChatPrompt(message, conversationHistory);
  const validator = (text) => String(text || '').trim().length > 0;

  return callAiWithRetry(
    prompt,
    validator,
    () =>
      "I'm having a brief connection issue. Please try again in a moment — I'm here to help with your career path.",
    (text) => String(text || '').trim()
  );
};

const generateAssessment = async (topic, questionCount = 10) => {
  const prompt = `
    Generate ${questionCount} multiple choice questions about ${topic}.

    Return ONLY valid JSON. No markdown, no code fences.

    {
      "questions": [
        {
          "question": "Question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0,
          "explanation": "Why this is correct"
        }
      ]
    }
  `;

  const validator = (data) => data && Array.isArray(data.questions) && data.questions.length > 0;

  return callAiWithRetry(prompt, validator, () =>
    generateFallbackAssessment(topic, questionCount)
  );
};

module.exports = {
  generateCareerRecommendations,
  generateRoadmap,
  generateChatResponse,
  generateAssessment,
  generateFallbackRoadmap,
  extractJson,
};
