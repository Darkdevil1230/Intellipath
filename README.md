# IntelliPath - AI-Powered Career Guidance Platform

A production-ready, full-stack SaaS application that helps students discover careers, generate personalized learning roadmaps, track progress, chat with AI, connect with industry mentors, and monitor growth analytics.

**Live Demo:** [Coming Soon]  
**Documentation:** See [DEPLOYMENT.md](./DEPLOYMENT.md) and [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## 🚀 Key Features

### Career Discovery
- **AI Career Recommendations** – Gemini-powered matching based on skills, interests, and goals with multi-provider fallback (OpenAI, Anthropic)
- **Career Explorer** – Browse careers with salary data, growth outlook, and requirements
- **Mentorship Matching** – Connect with industry mentors and schedule live sessions

### Learning & Roadmaps
- **AI Roadmap Generator** – Personalized 5-phase learning paths with topics, resources, projects, and certifications
- **Onboarding Flow** – 7-step guided setup with progress tracking
- **Assessments** – AI-generated quizzes with explanations and retry capability
- **Learning Courses** – Browse, filter, and save courses from multiple providers

### Student Hub
- **Dashboard** – Overview of progress, streaks, achievements, and quick actions
- **Learning Analytics** – Detailed charts, time-series metrics, and insights
- **AI Buddy Chat** – Conversational assistant with history and context-aware responses
- **Real-time Mentor Chat** – Socket.io-powered live messaging with notifications
- **Profile & Settings** – Customizable preferences, dark mode, privacy controls

### Admin & Monitoring
- **Resource Management** – Curated learning resources with tagging and categorization
- **Notifications** – In-app alerts for milestones, bookings, and updates
- **Smoke Tests** – Built-in health checks for critical API endpoints

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **State:** Zustand + React Query (TanStack Query)
- **Forms & Validation:** React Hook Form + Zod
- **Charts:** Recharts
- **Real-time:** Socket.io Client
- **HTTP:** Axios
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + Google OAuth 2.0
- **AI Integration:** Google Generative AI (Gemini) with OpenAI & Anthropic fallback
- **Real-time:** Socket.io
- **File Storage:** Cloudinary
- **Email:** Nodemailer
- **Security:** Helmet, Express Rate Limit, bcryptjs
- **Logging:** Winston
- **Validation:** Express Validator

### Infrastructure & Deployment
- **Frontend:** Vercel
- **Backend:** Render or Railway
- **Database:** MongoDB Atlas (free tier available)
- **Media Storage:** Cloudinary (free tier)
- **AI Services:** Gemini API (free tier), OpenAI (optional), Anthropic (optional)

---

## 📋 Prerequisites

- **Node.js 18+** – [Install](https://nodejs.org/)
- **MongoDB Atlas** – [Free account](https://www.mongodb.com/cloud/atlas)
- **Gemini API Key** – [Get from Google AI Studio](https://aistudio.google.com)
- **Google OAuth Credentials** – [Google Cloud Console](https://console.cloud.google.com)
- *(Optional)* **OpenAI API Key** – For fallback AI provider
- *(Optional)* **Anthropic API Key** – For fallback AI provider
- *(Optional)* **Cloudinary Account** – For image uploads (free tier)
- *(Optional)* **SMTP Service** – For email verification (e.g., SendGrid, Gmail)

---

## 🔧 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Darkdevil1230/intellipath.git
cd intellipath
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` with your credentials:

```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/intellipath

# Auth & JWT
JWT_SECRET=your_long_random_secret_key_here
JWT_REFRESH_SECRET=your_long_random_refresh_secret_here
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Providers (Gemini is required; OpenAI & Anthropic are optional fallbacks)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Email (optional, but recommended for verification)
SMTP_USER=your_smtp_email@example.com
SMTP_PASS=your_smtp_password

# Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Monitoring (optional)
SENTRY_DSN=your_sentry_dsn
```

### 3. Seed the Database

```bash
npm run seed
```

This populates MongoDB with sample careers, courses, mentors, and resources.

### 4. Start Backend Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`. Check logs for startup confirmation.

### 5. Frontend Setup

In a new terminal:

```bash
cd client
npm install
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 6. Start Frontend Development Server

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`. Open in browser and test signup/login flow.

---

## 🧪 Testing & Validation

### Validate Environment Variables
```bash
cd server
npm run validate-env
```

### Run Smoke Tests
```bash
npm run smoke-tests
```

Tests critical endpoints:
- `/health` – Server health
- `/api/auth/register` – User signup
- `/api/auth/login` – User login
- `/api/auth/me` – Auth verification
- `/api/resources` – Resource discovery

### Seed Test Data
```bash
npm run seed
```

### Run Specific Scripts
```bash
npm run test-analytics          # Analytics persistence
npm run test-achievements       # Achievement system
npm run test-google-user        # Google OAuth flow
npm run verify-google-oauth     # OAuth configuration
npm run migrate:roadmap-stream  # Backfill roadmap.stream for existing users
```

---

## 📁 Project Structure

```
intellipath/
├── client/                          # React + Vite frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── auth/                # Auth forms & flows
│   │   │   └── ui/                  # Common UI elements
│   │   ├── pages/                   # Route pages (Dashboard, Roadmap, etc.)
│   │   ├── layouts/                 # Page layouts
│   │   ├── context/                 # React context (RoadmapContext)
│   │   ├── services/                # API calls (api.js, authService.js)
│   │   ├── store/                   # Zustand stores
│   │   ├── utils/                   # Helpers (apiErrors.js, etc.)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── vercel.json
│
├── server/                          # Express.js backend
│   ├── config/
│   │   ├── database.js              # MongoDB connection
│   │   ├── env.js                   # Environment validation
│   │   └── logger.js                # Winston logger
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js
│   │   ├── Roadmap.js
│   │   ├── Course.js
│   │   ├── Mentor.js
│   │   ├── Assessment.js
│   │   └── ...
│   ├── controllers/                 # Request handlers
│   │   ├── authController.js
│   │   ├── onboardingController.js
│   │   ├── roadmapController.js
│   │   ├── chatController.js
│   │   ├── assessmentController.js
│   │   └── ...
│   ├── routes/                      # Express routers
│   │   ├── auth.js
│   │   ├── onboarding.js
│   │   ├── roadmap.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── errorHandler.js
│   │   └── security.js              # Helmet, rate limiting
│   ├── services/                    # Business logic
│   │   └── (API integrations, utils)
│   ├── utils/
│   │   ├── gemini.js                # Multi-provider AI with fallback
│   │   ├── discoveryMatching.js     # Resource/mentor matching
│   │   ├── discoveryLog.js          # Discovery logging
│   │   ├── achievements.js          # Achievement system
│   │   ├── email.js                 # Email sending
│   │   └── seed.js                  # Database seeding
│   ├── sockets/
│   │   └── mentorChat.js            # Socket.io mentor messaging
│   ├── scripts/
│   │   ├── setup-dev-env.js         # Local dev setup
│   │   ├── smoke-tests.js           # Health checks
│   │   ├── validate-env.js          # Env var validation
│   │   ├── migrate-roadmap-stream.js
│   │   ├── test-analytics-persistence.js
│   │   └── ...
│   ├── logs/                        # Local logs (not committed)
│   ├── package.json
│   ├── server.js                    # Entry point
│   ├── app.js                       # Express app setup
│   ├── .env.example
│   ├── render.yaml                  # Render deployment config
│   └── railway.json                 # Railway deployment config (optional)
│
├── .github/
│   └── workflows/                   # GitHub Actions CI/CD (if configured)
├── .gitignore
├── README.md                        # This file
├── DEPLOYMENT.md                    # Deployment guide
├── DEPLOYMENT_CHECKLIST.md          # Pre-deploy checklist
├── QUICK_FIX_GUIDE.md               # Common issues & fixes
└── spec.md                          # API & feature specifications

```

---

## 🔄 AI Provider Fallback System

The backend intelligently falls back between AI providers to ensure uninterrupted service:

1. **Primary:** Google Gemini (`GEMINI_API_KEY` or `GOOGLE_API_KEY`)
2. **Fallback 1:** OpenAI (`OPENAI_API_KEY`)
3. **Fallback 2:** Anthropic (`ANTHROPIC_API_KEY`)
4. **Built-in Fallback:** Deterministic roadmap generator (no API call)

**Features:**
- 3 retries per provider with exponential backoff
- 25-second timeout per request
- Automatic JSON extraction from markdown responses
- Comprehensive error logging
- Server still starts if all providers are unavailable

**Configuration in `.env`:**
```env
# At least ONE of these is required; all are optional
GEMINI_API_KEY=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...

# Optional model overrides
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

---

## 📦 Build & Deployment

### Build Frontend
```bash
cd client
npm run build
```

Creates optimized static bundle in `client/dist/`.

### Build Backend
No build step needed; backend runs Node.js directly.

### Deploy to Vercel (Frontend)
```bash
# Method 1: Connect GitHub repository to Vercel dashboard
# Set root directory to 'client'
# Add environment variables:
# - VITE_API_URL=https://your-backend.onrender.com
# - VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Method 2: CLI
npm install -g vercel
vercel --cwd=client --prod
```

### Deploy to Render (Backend)
```bash
# 1. Connect GitHub repository to Render dashboard
# 2. Create a Web Service
# 3. Set:
#    - Root Directory: server
#    - Build Command: npm install
#    - Start Command: node server.js
# 4. Add all environment variables from server/.env
# 5. Deploy

# See render.yaml for pre-configured settings
```

### Deploy to Railway (Alternative Backend)
```bash
# 1. Connect GitHub to Railway
# 2. Add environment variables
# 3. Railway auto-detects Node.js and runs server.js
```

### Environment Variables for Production
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production setup guide, including:
- Google OAuth configuration
- MongoDB Atlas connection
- Cloudinary setup
- Email service setup
- Domain & HTTPS configuration

---

## 🔐 Security Checklist

- [ ] Change JWT secrets to long random strings
- [ ] Enable MongoDB IP whitelist in Atlas
- [ ] Set `NODE_ENV=production` in Render/Railway
- [ ] Configure CORS for frontend domain only
- [ ] Enable rate limiting on auth endpoints
- [ ] Use HTTPS for all URLs
- [ ] Regenerate Cloudinary API secret
- [ ] Encrypt sensitive environment variables
- [ ] Set up Sentry for error tracking (optional)


---

## 📊 API Overview

**Base URL:** `http://localhost:5000/api`

### Authentication
- `POST /auth/register` – User signup
- `POST /auth/login` – User login
- `POST /auth/logout` – User logout
- `GET /auth/me` – Current user info
- `POST /auth/refresh` – Refresh JWT
- `POST /auth/forgot-password` – Password reset request
- `POST /auth/reset-password` – Reset password with token

### Onboarding
- `POST /onboarding/complete` – Complete onboarding
- `POST /onboarding/generate-roadmap` – Generate AI roadmap

### Roadmap
- `GET /roadmap` – Get user's current roadmap
- `GET /roadmap/:id` – Get roadmap by ID
- `POST /roadmap/:id/update-progress` – Update phase/topic progress
- `POST /roadmap/:id/regenerate` – Regenerate roadmap

### Resources, Courses, Mentors, Assessments
- `GET /resources?stream=Law&career=Corporate+Lawyer&topics=...` – Discover resources
- `GET /courses?stream=...&career=...` – Discover courses
- `GET /mentors?stream=...&career=...` – Discover mentors
- `GET /assessment/:id` – Get assessment by ID
- `POST /assessment/generate` – Generate new assessment

### Chat & Notifications
- `POST /chat/send` – Send chat message
- `GET /chat/history` – Get chat history
- `GET /notifications` – Get notifications
- `POST /notifications/:id/read` – Mark notification as read



---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License – see LICENSE file for details.


---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Video course integration
- [ ] Live mentor sessions
- [ ] Advanced analytics dashboard
- [ ] Skill marketplace
- [ ] Peer learning groups
- [ ] Job matching based on roadmap progress
- [ ] Certification verification system

---

**Built with ❤️ for students and career explorers.**

