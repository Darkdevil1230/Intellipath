require('dotenv').config();
const mongoose = require('mongoose');
const Career = require('../models/Career');
const Course = require('../models/Course');
const Mentor = require('../models/Mentor');
const Resource = require('../models/Resource');

const careers = [
  // Engineering Careers
  {
    title: 'Software Engineer',
    description: 'Design, develop, and maintain software applications and systems.',
    salaryRange: { min: 70000, max: 160000, currency: 'USD' },
    growthOutlook: 'High',
    requiredSkills: ['Programming', 'Problem Solving', 'System Design', 'Algorithms'],
    topCompanies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'],
    educationRequirements: ['Bachelor in Computer Science', 'Bootcamp', 'Self-taught'],
    category: 'Technology',
    stream: 'Engineering',
  },
  {
    title: 'Civil Engineer',
    description: 'Design and supervise construction of infrastructure projects like roads, bridges, and buildings.',
    salaryRange: { min: 65000, max: 130000, currency: 'USD' },
    growthOutlook: 'Medium',
    requiredSkills: ['AutoCAD', 'Structural Analysis', 'Project Management', 'Surveying'],
    topCompanies: ['Bechtel', 'AECOM', 'Fluor', 'Skanska', 'Kiewit'],
    educationRequirements: ['Bachelor in Civil Engineering', 'Masters in Structural Engineering'],
    category: 'Technology',
    stream: 'Engineering',
  },
  {
    title: 'Mechanical Engineer',
    description: 'Design and develop mechanical systems and devices.',
    salaryRange: { min: 70000, max: 140000, currency: 'USD' },
    growthOutlook: 'Medium',
    requiredSkills: ['CAD', 'Thermodynamics', 'Mechanics', 'Manufacturing'],
    topCompanies: ['Boeing', 'General Electric', 'Lockheed Martin', 'Tesla', 'Caterpillar'],
    educationRequirements: ['Bachelor in Mechanical Engineering', 'Masters in Mechanical Engineering'],
    category: 'Technology',
    stream: 'Engineering',
  },
  {
    title: 'Robotics Engineer',
    description: 'Design, build, and program robots and autonomous systems for industrial and research applications.',
    salaryRange: { min: 80000, max: 165000, currency: 'USD' },
    growthOutlook: 'High',
    requiredSkills: [
      'Electronics & Microcontrollers',
      'Arduino',
      'ROS (Robot Operating System)',
      'Control Systems',
      'Programming Fundamentals',
    ],
    topCompanies: ['Boston Dynamics', 'ABB', 'Tesla', 'NASA', 'iRobot'],
    educationRequirements: ['Bachelor in Robotics Engineering', 'Bachelor in Electrical Engineering', 'Masters in Robotics'],
    category: 'Technology',
    stream: 'Engineering',
  },
  // Law Careers
  {
    title: 'Corporate Lawyer',
    description: 'Advise businesses on legal matters and represent them in court.',
    salaryRange: { min: 90000, max: 200000, currency: 'USD' },
    growthOutlook: 'Medium',
    requiredSkills: ['Legal Research', 'Contract Law', 'Negotiation', 'Litigation'],
    topCompanies: ['Skadden', 'Baker McKenzie', 'Clifford Chance', 'Latham & Watkins', 'DLA Piper'],
    educationRequirements: ['Juris Doctor (JD)', 'Bar Exam', 'Bachelor in Law'],
    category: 'Law',
    stream: 'Law',
  },
  {
    title: 'Criminal Defense Attorney',
    description: 'Represent individuals accused of crimes in court proceedings.',
    salaryRange: { min: 60000, max: 150000, currency: 'USD' },
    growthOutlook: 'Medium',
    requiredSkills: ['Criminal Law', 'Courtroom Advocacy', 'Case Analysis', 'Legal Writing'],
    topCompanies: ['Private Firms', 'Public Defender Offices', 'Government Agencies'],
    educationRequirements: ['Juris Doctor (JD)', 'Bar Exam', 'Bachelor in Law'],
    category: 'Law',
    stream: 'Law',
  },
  {
    title: 'Legal Consultant',
    description: 'Provide expert legal advice to businesses and organizations.',
    salaryRange: { min: 80000, max: 180000, currency: 'USD' },
    growthOutlook: 'High',
    requiredSkills: ['Legal Analysis', 'Compliance', 'Risk Assessment', 'Advisory'],
    topCompanies: ['Big Four Accounting Firms', 'Consulting Firms', 'Corporate Legal Departments'],
    educationRequirements: ['Juris Doctor (JD)', 'MBA', 'Bachelor in Law'],
    category: 'Law',
    stream: 'Law',
  },
  // Commerce Careers
  {
    title: 'Chartered Accountant',
    description: 'Manage financial records, prepare tax returns, and provide financial advice.',
    salaryRange: { min: 60000, max: 140000, currency: 'USD' },
    growthOutlook: 'High',
    requiredSkills: ['Accounting', 'Taxation', 'Financial Analysis', 'Auditing'],
    topCompanies: ['Deloitte', 'PwC', 'EY', 'KPMG', 'Grant Thornton'],
    educationRequirements: ['Bachelor in Commerce', 'CA Certification', 'CPA'],
    category: 'Finance',
    stream: 'Commerce',
  },
  {
    title: 'Financial Analyst',
    description: 'Analyze financial data and provide investment recommendations.',
    salaryRange: { min: 70000, max: 150000, currency: 'USD' },
    growthOutlook: 'High',
    requiredSkills: ['Financial Modeling', 'Excel', 'Market Analysis', 'Risk Assessment'],
    topCompanies: ['Goldman Sachs', 'JPMorgan Chase', 'Morgan Stanley', 'BlackRock', 'Fidelity'],
    educationRequirements: ['Bachelor in Finance', 'MBA', 'CFA'],
    category: 'Finance',
    stream: 'Commerce',
  },
  {
    title: 'Investment Banker',
    description: 'Help companies raise capital and provide financial advisory services.',
    salaryRange: { min: 100000, max: 250000, currency: 'USD' },
    growthOutlook: 'High',
    requiredSkills: ['Financial Modeling', 'Valuation', 'Deal Structuring', 'Client Relations'],
    topCompanies: ['Goldman Sachs', 'Morgan Stanley', 'JPMorgan Chase', 'Bank of America', 'Citigroup'],
    educationRequirements: ['Bachelor in Finance', 'MBA', 'CFA'],
    category: 'Finance',
    stream: 'Commerce',
  },
  // Medical Careers
  {
    title: 'Doctor (General Physician)',
    description: 'Diagnose and treat illnesses, prescribe medications, and provide medical care.',
    salaryRange: { min: 150000, max: 300000, currency: 'USD' },
    growthOutlook: 'High',
    requiredSkills: ['Diagnosis', 'Patient Care', 'Medical Knowledge', 'Communication'],
    topCompanies: ['Hospitals', 'Clinics', 'Private Practice', 'Research Institutions'],
    educationRequirements: ['MBBS', 'MD', 'Medical Residency'],
    category: 'Healthcare',
    stream: 'Medical',
  },
  {
    title: 'Surgeon',
    description: 'Perform surgical operations to treat injuries, diseases, and deformities.',
    salaryRange: { min: 200000, max: 450000, currency: 'USD' },
    growthOutlook: 'High',
    requiredSkills: ['Surgical Skills', 'Anatomy', 'Precision', 'Decision Making'],
    topCompanies: ['Hospitals', 'Surgical Centers', 'Medical Institutions'],
    educationRequirements: ['MBBS', 'MS in Surgery', 'Surgical Residency'],
    category: 'Healthcare',
    stream: 'Medical',
  },
  {
    title: 'Medical Researcher',
    description: 'Conduct research to improve medical treatments and develop new drugs.',
    salaryRange: { min: 80000, max: 180000, currency: 'USD' },
    growthOutlook: 'High',
    requiredSkills: ['Research Methods', 'Data Analysis', 'Laboratory Skills', 'Scientific Writing'],
    topCompanies: ['Pharmaceutical Companies', 'Research Institutes', 'Universities', 'Biotech Firms'],
    educationRequirements: ['MBBS', 'PhD in Medical Science', 'Masters in Public Health'],
    category: 'Healthcare',
    stream: 'Medical',
  },
  // Arts Careers
  {
    title: 'Graphic Designer',
    description: 'Create visual content for print and digital media.',
    salaryRange: { min: 45000, max: 90000, currency: 'USD' },
    growthOutlook: 'Medium',
    requiredSkills: ['Adobe Creative Suite', 'Typography', 'Color Theory', 'Branding'],
    topCompanies: ['Design Agencies', 'Tech Companies', 'Publishing Houses', 'Advertising Firms'],
    educationRequirements: ['Bachelor in Fine Arts', 'Design School', 'Self-taught'],
    category: 'Creative',
    stream: 'Arts',
  },
  {
    title: 'Content Writer',
    description: 'Create written content for websites, blogs, marketing materials, and publications.',
    salaryRange: { min: 40000, max: 85000, currency: 'USD' },
    growthOutlook: 'High',
    requiredSkills: ['Writing', 'SEO', 'Research', 'Editing'],
    topCompanies: ['Media Companies', 'Tech Startups', 'Publishing Houses', 'Marketing Agencies'],
    educationRequirements: ['Bachelor in English', 'Journalism', 'Communications'],
    category: 'Creative',
    stream: 'Arts',
  },
  {
    title: 'Fine Artist',
    description: 'Create original artwork using various mediums like painting, sculpture, and digital art.',
    salaryRange: { min: 35000, max: 100000, currency: 'USD' },
    growthOutlook: 'Low',
    requiredSkills: ['Drawing', 'Painting', 'Sculpting', 'Digital Art'],
    topCompanies: ['Galleries', 'Museums', 'Art Studios', 'Freelance'],
    educationRequirements: ['Bachelor in Fine Arts', 'MFA', 'Art School'],
    category: 'Creative',
    stream: 'Arts',
  },
  // Management Careers
  {
    title: 'Product Manager',
    description: 'Lead product strategy and development from conception to launch.',
    salaryRange: { min: 90000, max: 180000, currency: 'USD' },
    growthOutlook: 'High',
    requiredSkills: ['Strategy', 'Communication', 'Analytics', 'Leadership'],
    topCompanies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'],
    educationRequirements: ['MBA', 'Bachelor in Business', 'Bachelor in Engineering'],
    category: 'Business',
    stream: 'Management',
  },
  {
    title: 'Business Analyst',
    description: 'Analyze business processes and recommend improvements.',
    salaryRange: { min: 70000, max: 140000, currency: 'USD' },
    growthOutlook: 'High',
    requiredSkills: ['Data Analysis', 'Process Mapping', 'Requirements Gathering', 'Stakeholder Management'],
    topCompanies: ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'Accenture'],
    educationRequirements: ['MBA', 'Bachelor in Business', 'Analytics Certification'],
    category: 'Business',
    stream: 'Management',
  },
  {
    title: 'Marketing Manager',
    description: 'Develop and execute marketing strategies to promote products and services.',
    salaryRange: { min: 75000, max: 150000, currency: 'USD' },
    growthOutlook: 'High',
    requiredSkills: ['Digital Marketing', 'Brand Management', 'Analytics', 'Communication'],
    topCompanies: ['Procter & Gamble', 'Unilever', 'Google', 'Meta', 'Nike'],
    educationRequirements: ['MBA in Marketing', 'Bachelor in Marketing', 'Digital Marketing Certification'],
    category: 'Business',
    stream: 'Management',
  },
];

const courses = [
  // Engineering Courses
  {
    title: 'Complete Python Bootcamp',
    description: 'Learn Python from scratch and build real-world applications.',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/complete-python-bootcamp/',
    duration: '22 hours',
    level: 'Beginner',
    price: 15,
    isFree: false,
    rating: 4.6,
    tags: ['Python', 'Programming', 'Beginner'],
    category: 'Programming',
    stream: 'Engineering',
    relatedCareers: ['Software Engineer', 'Data Scientist'],
    relatedTopics: ['Programming Fundamentals', 'Python Basics', 'Data Structures'],
  },
  {
    title: 'CS50: Introduction to Computer Science',
    description: 'Harvard\'s introduction to computer science and programming.',
    provider: 'CS50',
    url: 'https://cs50.harvard.edu/x/',
    duration: '12 weeks',
    level: 'Beginner',
    price: 0,
    isFree: true,
    rating: 4.9,
    tags: ['Computer Science', 'Programming', 'Fundamentals'],
    category: 'Computer Science',
    stream: 'Engineering',
  },
  {
    title: 'Machine Learning Specialization',
    description: 'Build ML models with NumPy and scikit-learn.',
    provider: 'Coursera',
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
    duration: '3 months',
    level: 'Intermediate',
    price: 49,
    isFree: false,
    rating: 4.8,
    tags: ['Machine Learning', 'Python', 'AI'],
    category: 'AI',
    stream: 'Engineering',
    relatedCareers: ['Data Scientist', 'AI Engineer', 'Machine Learning Engineer'],
    relatedTopics: ['Machine Learning Basics', 'Neural Networks', 'Model Training'],
  },
  {
    title: 'AutoCAD for Beginners',
    description: 'Learn 2D and 3D drafting with AutoCAD.',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/autocad-for-beginners/',
    duration: '15 hours',
    level: 'Beginner',
    price: 20,
    isFree: false,
    rating: 4.5,
    tags: ['AutoCAD', 'CAD', 'Engineering'],
    category: 'Engineering',
    stream: 'Engineering',
  },
  // Law Courses
  {
    title: 'Introduction to Contract Law',
    description: 'Understand the fundamentals of contract law.',
    provider: 'Coursera',
    url: 'https://www.coursera.org/learn/contract-law',
    duration: '4 weeks',
    level: 'Beginner',
    price: 0,
    isFree: true,
    rating: 4.7,
    tags: ['Contract Law', 'Legal', 'Business'],
    category: 'Law',
    stream: 'Law',
  },
  {
    title: 'Criminal Law and Procedure',
    description: 'Learn about criminal law and judicial procedures.',
    provider: 'edX',
    url: 'https://www.edx.org/learn/criminal-law',
    duration: '6 weeks',
    level: 'Intermediate',
    price: 0,
    isFree: true,
    rating: 4.6,
    tags: ['Criminal Law', 'Legal', 'Procedure'],
    category: 'Law',
    stream: 'Law',
  },
  // Commerce Courses
  {
    title: 'Financial Accounting Fundamentals',
    description: 'Master the basics of financial accounting.',
    provider: 'Coursera',
    url: 'https://www.coursera.org/learn/financial-accounting',
    duration: '5 weeks',
    level: 'Beginner',
    price: 49,
    isFree: false,
    rating: 4.8,
    tags: ['Accounting', 'Finance', 'Business'],
    category: 'Finance',
    stream: 'Commerce',
    relatedCareers: ['Chartered Accountant', 'Financial Analyst'],
    relatedTopics: ['Financial Statements', 'Accounting Principles', 'GAAP'],
  },
  {
    title: 'Investment Banking Fundamentals',
    description: 'Learn the essentials of investment banking.',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/investment-banking-fundamentals/',
    duration: '8 hours',
    level: 'Intermediate',
    price: 25,
    isFree: false,
    rating: 4.5,
    tags: ['Investment Banking', 'Finance', 'Corporate Finance'],
    category: 'Finance',
    stream: 'Commerce',
  },
  // Medical Courses
  {
    title: 'Anatomy Specialization',
    description: 'Comprehensive course on human anatomy.',
    provider: 'Coursera',
    url: 'https://www.coursera.org/specializations/anatomy',
    duration: '6 months',
    level: 'Intermediate',
    price: 49,
    isFree: false,
    rating: 4.9,
    tags: ['Anatomy', 'Medical', 'Healthcare'],
    category: 'Medical',
    stream: 'Medical',
  },
  {
    title: 'Medical Terminology',
    description: 'Learn medical terminology for healthcare professionals.',
    provider: 'edX',
    url: 'https://www.edx.org/learn/medical-terminology',
    duration: '4 weeks',
    level: 'Beginner',
    price: 0,
    isFree: true,
    rating: 4.7,
    tags: ['Medical Terminology', 'Healthcare', 'Medicine'],
    category: 'Medical',
    stream: 'Medical',
  },
  // Arts Courses
  {
    title: 'Graphic Design Masterclass',
    description: 'Learn graphic design from scratch.',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/graphic-design-masterclass/',
    duration: '13 hours',
    level: 'Beginner',
    price: 15,
    isFree: false,
    rating: 4.6,
    tags: ['Graphic Design', 'Adobe Creative Suite', 'Design'],
    category: 'Design',
    stream: 'Arts',
  },
  {
    title: 'Creative Writing Specialization',
    description: 'Master the art of creative writing.',
    provider: 'Coursera',
    url: 'https://www.coursera.org/specializations/creative-writing',
    duration: '5 months',
    level: 'Beginner',
    price: 49,
    isFree: false,
    rating: 4.8,
    tags: ['Creative Writing', 'Writing', 'Storytelling'],
    category: 'Writing',
    stream: 'Arts',
  },
  // Management Courses
  {
    title: 'Product Management Specialization',
    description: 'Learn product management from industry experts.',
    provider: 'Coursera',
    url: 'https://www.coursera.org/specializations/product-management',
    duration: '4 months',
    level: 'Intermediate',
    price: 49,
    isFree: false,
    rating: 4.7,
    tags: ['Product Management', 'Strategy', 'Business'],
    category: 'Business',
    stream: 'Management',
  },
  {
    title: 'Digital Marketing Specialization',
    description: 'Master digital marketing strategies and tools.',
    provider: 'Coursera',
    url: 'https://www.coursera.org/specializations/digital-marketing',
    duration: '3 months',
    level: 'Beginner',
    price: 49,
    isFree: false,
    rating: 4.8,
    tags: ['Digital Marketing', 'Marketing', 'SEO'],
    category: 'Marketing',
    stream: 'Management',
  },
];

const mentors = [
  // Engineering Mentors
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    photo: '',
    bio: 'Senior Software Engineer at Google with 8 years of experience in full-stack development.',
    company: 'Google',
    position: 'Senior Software Engineer',
    experience: 8,
    expertise: ['JavaScript', 'React', 'Node.js', 'System Design'],
    rating: 4.8,
    reviewCount: 45,
    availability: 'Available',
    hourlyRate: 100,
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    stream: 'Engineering',
  },
  {
    name: 'Robert Williams',
    email: 'robert.williams@example.com',
    photo: '',
    bio: 'Civil Engineer at AECOM with 12 years of experience in infrastructure projects.',
    company: 'AECOM',
    position: 'Senior Civil Engineer',
    experience: 12,
    expertise: ['Civil Engineering', 'AutoCAD', 'Project Management', 'Structural Design'],
    rating: 4.7,
    reviewCount: 38,
    availability: 'Available',
    hourlyRate: 90,
    linkedin: 'https://linkedin.com/in/robertwilliams',
    stream: 'Engineering',
  },
  // Law Mentors
  {
    name: 'Jennifer Martinez',
    email: 'jennifer.martinez@example.com',
    photo: '',
    bio: 'Corporate Lawyer at Skadden with 10 years of experience in M&A and corporate law.',
    company: 'Skadden',
    position: 'Senior Corporate Lawyer',
    experience: 10,
    expertise: ['Corporate Law', 'M&A', 'Contract Law', 'Legal Strategy'],
    rating: 4.9,
    reviewCount: 52,
    availability: 'Available',
    hourlyRate: 150,
    linkedin: 'https://linkedin.com/in/jennifermartinez',
    stream: 'Law',
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    photo: '',
    bio: 'Criminal Defense Attorney with 8 years of experience in criminal litigation.',
    company: 'Wilson Law Firm',
    position: 'Partner',
    experience: 8,
    expertise: ['Criminal Law', 'Litigation', 'Courtroom Advocacy', 'Legal Research'],
    rating: 4.6,
    reviewCount: 34,
    availability: 'Busy',
    hourlyRate: 120,
    linkedin: 'https://linkedin.com/in/jameswilson',
    stream: 'Law',
  },
  // Commerce Mentors
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    photo: '',
    bio: 'Data Scientist at Netflix specializing in machine learning and recommendation systems.',
    company: 'Netflix',
    position: 'Senior Data Scientist',
    experience: 6,
    expertise: ['Python', 'Machine Learning', 'Data Science', 'SQL'],
    rating: 4.9,
    reviewCount: 38,
    availability: 'Available',
    hourlyRate: 120,
    linkedin: 'https://linkedin.com/in/michaelchen',
    stream: 'Commerce',
  },
  {
    name: 'Amanda Foster',
    email: 'amanda.foster@example.com',
    photo: '',
    bio: 'Investment Banker at Goldman Sachs with 9 years of experience in capital markets.',
    company: 'Goldman Sachs',
    position: 'Vice President',
    experience: 9,
    expertise: ['Investment Banking', 'Financial Modeling', 'Valuation', 'Capital Markets'],
    rating: 4.8,
    reviewCount: 41,
    availability: 'Available',
    hourlyRate: 180,
    linkedin: 'https://linkedin.com/in/amandafoster',
    stream: 'Commerce',
  },
  // Medical Mentors
  {
    name: 'Dr. Rachel Green',
    email: 'rachel.green@example.com',
    photo: '',
    bio: 'General Physician at Mayo Clinic with 15 years of clinical experience.',
    company: 'Mayo Clinic',
    position: 'Senior Physician',
    experience: 15,
    expertise: ['General Medicine', 'Patient Care', 'Diagnosis', 'Medical Research'],
    rating: 4.9,
    reviewCount: 72,
    availability: 'Available',
    hourlyRate: 200,
    linkedin: 'https://linkedin.com/in/rachelgreen',
    stream: 'Medical',
  },
  {
    name: 'Dr. David Thompson',
    email: 'david.thompson@example.com',
    photo: '',
    bio: 'Cardiac Surgeon at Johns Hopkins with 12 years of surgical experience.',
    company: 'Johns Hopkins Hospital',
    position: 'Cardiac Surgeon',
    experience: 12,
    expertise: ['Cardiac Surgery', 'Surgical Procedures', 'Medical Research', 'Patient Care'],
    rating: 5.0,
    reviewCount: 58,
    availability: 'Busy',
    hourlyRate: 250,
    linkedin: 'https://linkedin.com/in/davidthompson',
    stream: 'Medical',
  },
  // Arts Mentors
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    photo: '',
    bio: 'Product Manager at Meta with experience in consumer products and growth.',
    company: 'Meta',
    position: 'Senior Product Manager',
    experience: 7,
    expertise: ['Product Strategy', 'User Research', 'Analytics', 'Roadmapping'],
    rating: 4.7,
    reviewCount: 52,
    availability: 'Busy',
    hourlyRate: 110,
    linkedin: 'https://linkedin.com/in/emilyrodriguez',
    stream: 'Management',
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    photo: '',
    bio: 'UX Design Lead at Apple with expertise in design systems and user research.',
    company: 'Apple',
    position: 'UX Design Lead',
    experience: 10,
    expertise: ['UX Design', 'User Research', 'Prototyping', 'Design Systems'],
    rating: 4.9,
    reviewCount: 67,
    availability: 'Available',
    hourlyRate: 130,
    linkedin: 'https://linkedin.com/in/davidkim',
    stream: 'Arts',
  },
  {
    name: 'Sophie Turner',
    email: 'sophie.turner@example.com',
    photo: '',
    bio: 'Content Writer and Editor at The New York Times with 8 years of experience.',
    company: 'The New York Times',
    position: 'Senior Editor',
    experience: 8,
    expertise: ['Content Writing', 'Editing', 'Journalism', 'SEO'],
    rating: 4.6,
    reviewCount: 29,
    availability: 'Available',
    hourlyRate: 80,
    linkedin: 'https://linkedin.com/in/sophieturner',
    stream: 'Arts',
  },
  // Management Mentors
  {
    name: 'Christopher Lee',
    email: 'christopher.lee@example.com',
    photo: '',
    bio: 'Business Consultant at McKinsey with 11 years of strategy consulting experience.',
    company: 'McKinsey & Company',
    position: 'Engagement Manager',
    experience: 11,
    expertise: ['Business Strategy', 'Management Consulting', 'Operations', 'Analytics'],
    rating: 4.8,
    reviewCount: 55,
    availability: 'Available',
    hourlyRate: 160,
    linkedin: 'https://linkedin.com/in/christopherlee',
    stream: 'Management',
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    photo: '',
    bio: 'Marketing Director at Nike with 9 years of brand marketing experience.',
    company: 'Nike',
    position: 'Marketing Director',
    experience: 9,
    expertise: ['Digital Marketing', 'Brand Management', 'Marketing Strategy', 'Analytics'],
    rating: 4.7,
    reviewCount: 43,
    availability: 'Available',
    hourlyRate: 140,
    linkedin: 'https://linkedin.com/in/mariagarcia',
    stream: 'Management',
  },
];

const resources = [
  // Engineering Resources
  {
    title: 'MDN Web Docs',
    description: 'Comprehensive documentation for web technologies including HTML, CSS, and JavaScript.',
    url: 'https://developer.mozilla.org/',
    type: 'article',
    thumbnail: '',
    tags: ['HTML', 'CSS', 'JavaScript', 'Documentation'],
    category: 'Web Development',
    difficulty: 'Beginner',
    stream: 'Engineering',
  },
  {
    title: 'LeetCode',
    description: 'Platform for practicing coding interview questions and algorithms.',
    url: 'https://leetcode.com/',
    type: 'practice-site',
    thumbnail: '',
    tags: ['Algorithms', 'Data Structures', 'Interview Prep'],
    category: 'Programming',
    difficulty: 'Intermediate',
    stream: 'Engineering',
  },
  {
    title: 'GitHub',
    description: 'Platform for version control and collaboration on code projects.',
    url: 'https://github.com/',
    type: 'tool',
    thumbnail: '',
    tags: ['Git', 'Version Control', 'Collaboration'],
    category: 'Tools',
    difficulty: 'Beginner',
    stream: 'Engineering',
  },
  // Law Resources
  {
    title: 'Cornell Law School Legal Information Institute',
    description: 'Free access to American legal information and case law.',
    url: 'https://www.law.cornell.edu/',
    type: 'article',
    thumbnail: '',
    tags: ['Legal Research', 'Case Law', 'Constitution'],
    category: 'Law',
    difficulty: 'Intermediate',
    stream: 'Law',
  },
  {
    title: 'FindLaw',
    description: 'Comprehensive legal resource for lawyers and law students.',
    url: 'https://www.findlaw.com/',
    type: 'article',
    thumbnail: '',
    tags: ['Legal Research', 'Case Law', 'Legal Forms'],
    category: 'Law',
    difficulty: 'Beginner',
    stream: 'Law',
  },
  // Commerce Resources
  {
    title: 'Investopedia',
    description: 'Financial education website with articles on investing and finance.',
    url: 'https://www.investopedia.com/',
    type: 'article',
    thumbnail: '',
    tags: ['Finance', 'Investing', 'Economics'],
    category: 'Finance',
    difficulty: 'Beginner',
    stream: 'Commerce',
  },
  {
    title: 'Wall Street Oasis',
    description: 'Community for finance professionals with career advice and resources.',
    url: 'https://www.wallstreetoasis.com/',
    type: 'article',
    thumbnail: '',
    tags: ['Finance', 'Investment Banking', 'Career'],
    category: 'Finance',
    difficulty: 'Intermediate',
    stream: 'Commerce',
  },
  // Medical Resources
  {
    title: 'PubMed',
    description: 'Free search engine accessing primarily the MEDLINE database of references.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
    type: 'article',
    thumbnail: '',
    tags: ['Medical Research', 'Healthcare', 'Science'],
    category: 'Medical',
    difficulty: 'Advanced',
    stream: 'Medical',
  },
  {
    title: 'Medscape',
    description: 'Medical resource for physicians and health professionals.',
    url: 'https://www.medscape.com/',
    type: 'article',
    thumbnail: '',
    tags: ['Medical', 'Healthcare', 'Clinical'],
    category: 'Medical',
    difficulty: 'Intermediate',
    stream: 'Medical',
  },
  // Arts Resources
  {
    title: 'Design Systems Handbook',
    description: 'Comprehensive guide to building and scaling design systems.',
    url: 'https://www.designsystems.com/',
    type: 'book',
    thumbnail: '',
    tags: ['Design Systems', 'UI/UX', 'Design'],
    category: 'Design',
    difficulty: 'Intermediate',
    stream: 'Arts',
  },
  {
    title: 'Adobe Creative Cloud Tutorials',
    description: 'Official tutorials for Adobe Creative Suite applications.',
    url: 'https://www.adobe.com/learn/',
    type: 'video',
    thumbnail: '',
    tags: ['Adobe', 'Design', 'Creative'],
    category: 'Design',
    difficulty: 'Beginner',
    stream: 'Arts',
  },
  // Management Resources
  {
    title: 'Harvard Business Review',
    description: 'Leading publication for business management and strategy.',
    url: 'https://hbr.org/',
    type: 'article',
    thumbnail: '',
    tags: ['Business', 'Management', 'Strategy'],
    category: 'Business',
    difficulty: 'Intermediate',
    stream: 'Management',
  },
  {
    title: 'McKinsey Insights',
    description: 'Research and insights from McKinsey & Company consultants.',
    url: 'https://www.mckinsey.com/insights',
    type: 'article',
    thumbnail: '',
    tags: ['Business', 'Strategy', 'Consulting'],
    category: 'Business',
    difficulty: 'Advanced',
    stream: 'Management',
  },
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Topics used for relatedTopics — includes Gemini-style roadmap topic names */
const topicsForCareer = (career) => {
  const skills = career.requiredSkills || [];
  return [
    ...new Set([
      ...skills,
      `${career.title} Fundamentals`,
      `Introduction to ${career.title} Core Principles`,
      `Introduction to ${career.title}`,
      ...skills.map((skill) => skill.replace(/\s*\([^)]*\)\s*/g, '').trim()),
      `${career.category} Core Skills`,
    ]),
  ].filter(Boolean);
};

const buildCoursesForCareer = (career) => {
  const topics = topicsForCareer(career);
  const slug = slugify(career.title);
  const templates = [
    { suffix: 'Foundations', level: 'Beginner', category: career.category || 'General' },
    { suffix: 'Applied Skills', level: 'Intermediate', category: career.category || 'General' },
    { suffix: 'Professional Mastery', level: 'Advanced', category: career.category || 'General' },
  ];

  return templates.map((template, index) => ({
    title: `${career.title}: ${template.suffix}`,
    description: `Structured ${template.level.toLowerCase()} path covering core ${career.title} competencies.`,
    provider: 'Udemy',
    url: `https://example.com/courses/${slug}-${index + 1}`,
    duration: `${8 + index * 4} hours`,
    level: template.level,
    price: index === 0 ? 0 : 29,
    isFree: index === 0,
    rating: 4.5 + index * 0.1,
    tags: [career.title, career.stream, template.level],
    category: template.category,
    stream: career.stream,
    relatedCareers: [career.title],
    relatedTopics: topics,
  }));
};

const buildMentorsForCareer = (career) => {
  const topics = topicsForCareer(career);
  const slug = slugify(career.title);
  const templates = [
    { name: 'Senior Mentor', rate: 120 },
    { name: 'Industry Expert', rate: 150 },
  ];

  return templates.map((template, index) => ({
    name: `${career.title} ${template.name}`,
    email: `${slug}.mentor${index + 1}@careerpath.example.com`,
    photo: '',
    bio: `Experienced professional mentoring students pursuing ${career.title}.`,
    company: career.topCompanies?.[0] || 'Industry Partner',
    position: career.title,
    experience: 8 + index * 2,
    expertise: topics.slice(0, 4),
    relatedCareers: [career.title],
    rating: 4.7 + index * 0.1,
    reviewCount: 20 + index * 5,
    availability: 'Available',
    hourlyRate: template.rate,
    linkedin: `https://linkedin.com/in/${slug}-mentor-${index + 1}`,
    stream: career.stream,
  }));
};

const buildResourcesForCareer = (career) => {
  const topics = topicsForCareer(career);
  const slug = slugify(career.title);
  const types = ['article', 'video', 'tool'];
  const templates = [
    { suffix: 'Learning Guide', type: 'article' },
    { suffix: 'Video Workshop', type: 'video' },
    { suffix: 'Practice Toolkit', type: 'tool' },
  ];

  return templates.map((template, index) => ({
    title: `${career.title} ${template.suffix}`,
    description: `Curated ${template.type} resource for ${career.title} learners.`,
    url: `https://example.com/resources/${slug}-${index + 1}`,
    type: types[index] || template.type,
    thumbnail: '',
    tags: [career.title, career.stream],
    category: career.category || 'General',
    difficulty: ['Beginner', 'Intermediate', 'Advanced'][index],
    stream: career.stream,
    relatedCareers: [career.title],
    relatedTopics: topics,
  }));
};

const generateCatalogForCareers = (careerList) => {
  const generatedCourses = [];
  const generatedMentors = [];
  const generatedResources = [];

  careerList.forEach((career) => {
    generatedCourses.push(...buildCoursesForCareer(career));
    generatedMentors.push(...buildMentorsForCareer(career));
    generatedResources.push(...buildResourcesForCareer(career));
  });

  return {
    courses: generatedCourses,
    mentors: generatedMentors,
    resources: generatedResources,
  };
};

const enrichStaticCatalog = (items, careerList) => {
  return items.map((item) => {
    if (!item.stream) return item;
    const matchingCareers = careerList.filter((c) => c.stream === item.stream);
    const defaultCareer = matchingCareers[0];
    if (!defaultCareer) return item;

    return {
      ...item,
      relatedCareers: item.relatedCareers?.length
        ? item.relatedCareers
        : [defaultCareer.title],
      relatedTopics: item.relatedTopics?.length
        ? item.relatedTopics
        : topicsForCareer(defaultCareer),
    };
  });
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected');

    await Career.deleteMany();
    await Course.deleteMany();
    await Mentor.deleteMany();
    await Resource.deleteMany();

    const generated = generateCatalogForCareers(careers);
    const enrichedCourses = enrichStaticCatalog(courses, careers);
    const enrichedMentors = enrichStaticCatalog(mentors, careers).map((mentor) => ({
      ...mentor,
      relatedCareers: mentor.relatedCareers?.length
        ? mentor.relatedCareers
        : careers
            .filter((c) => c.stream === mentor.stream)
            .slice(0, 1)
            .map((c) => c.title),
    }));
    const enrichedResources = enrichStaticCatalog(resources, careers);

    const allCourses = [...enrichedCourses, ...generated.courses];
    const allMentors = [...enrichedMentors, ...generated.mentors];
    const allResources = [...enrichedResources, ...generated.resources];

    await Career.insertMany(careers);
    console.log(`Careers seeded: ${careers.length}`);

    await Course.insertMany(allCourses);
    console.log(`Courses seeded: ${allCourses.length} (${generated.courses.length} career-specific)`);

    await Mentor.insertMany(allMentors);
    console.log(`Mentors seeded: ${allMentors.length} (${generated.mentors.length} career-specific)`);

    await Resource.insertMany(allResources);
    console.log(`Resources seeded: ${allResources.length} (${generated.resources.length} career-specific)`);

    const roboticsCount = await Course.countDocuments({
      relatedCareers: 'Robotics Engineer',
    });
    console.log(`Robotics Engineer courses in DB: ${roboticsCount}`);

    console.log('Database seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
