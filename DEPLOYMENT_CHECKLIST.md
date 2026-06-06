# Pre-Deployment Verification Checklist

**Document Last Updated:** June 2, 2026  
**IntelliPath Version:** 1.0.0  

This checklist ensures all critical features are tested and configured before production deployment.

---

## 1. Environment Configuration

- [ ] **Server environment variables** are set
  - Run: `npm run validate-env` (from `server/` directory)
  - Required: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `BACKEND_URL`
  - Optional but recommended: `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, `SMTP_*`
  - File: `server/.env`

- [ ] **Client environment variables** are set
  - Required: `VITE_API_URL` (e.g., `http://localhost:5000`)
  - Optional: `VITE_GOOGLE_CLIENT_ID`
  - File: `client/.env`

- [ ] **Database connection** works
  - Verify `MONGODB_URI` points to an accessible MongoDB instance
  - Test: `npm run smoke-tests` should show MongoDB connected

---

## 2. Authentication & Security

### 2.1 Email (SMTP) Configuration
- [ ] **Forgot Password** flow works end-to-end
  - Manual test: 
    1. Go to login page
    2. Click "Forgot Password"
    3. Enter registered email
    4. Check email for reset link
  - If SMTP not configured: debug URL is shown in dev mode (check browser console or network response)
  - Production note: SMTP must be configured before deploying to production

### 2.2 Local Email Testing (Development)
- [ ] **Debug reset URL** appears when SMTP is unconfigured
  - Send forgot-password request; response contains `debugResetUrl` and `warning`
  - Use the URL directly: `/reset-password/{token}`

### 2.3 Google OAuth Configuration
- [ ] **Client ID matches server ID**
  - Run: `npm run verify-google-oauth` (from `server/` directory)
  - Checks if `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` match
  - If mismatch, Login page displays warning

- [ ] **Google Cloud Console** is configured
  - Go to https://console.cloud.google.com
  - Authorized JavaScript origins include:
    - `http://localhost:5173` (dev)
    - Your production domain (e.g., `https://intellipath.example.com`)
  - Authorized redirect URIs include:
    - `http://localhost:5000/api/auth/google` (dev)
    - Your production backend URL

- [ ] **Google Sign-In button** renders without 403 errors
  - Manual test: Open login page, verify Google button appears
  - If 403 error: check origins in Google Cloud Console

---

## 3. Core Features

### 3.1 Authentication Endpoints
- [ ] **Register & Email Verification**
  - Test: `npm run smoke-tests`
  - New user registration succeeds with status 201
  - Email verification link works (or debug URL in dev)

- [ ] **Login & Token Refresh**
  - Test: `npm run smoke-tests`
  - Login returns `token` and `refreshToken`
  - `/api/auth/me` endpoint works with bearer token

- [ ] **Logout & Session Cleanup**
  - Manual test: Login → navigate → logout → token should be cleared

### 3.2 Onboarding & Roadmap
- [ ] **Onboarding flow** generates roadmap
  - Manual test:
    1. Register & login
    2. Complete onboarding (select stream, education, career, topics)
    3. Verify roadmap is generated with phases and topics

- [ ] **Roadmap regeneration** resets progress
  - Manual test:
    1. Mark topics complete
    2. Regenerate roadmap
    3. Verify progress is reset to 0

### 3.3 Analytics & Progress Tracking
- [ ] **Analytics persistence** works
  - Run: `npm run test-analytics` (from `server/` directory)
  - After marking a topic complete:
    - Analytics document created/updated
    - `topicsCompleted` increments
    - `roadmapProgress` increases

- [ ] **Dashboard displays analytics**
  - Manual test:
    1. Login & complete onboarding
    2. Mark 2-3 topics complete
    3. Go to Dashboard
    4. Verify progress bar and stats update

### 3.4 Achievements & Badges
- [ ] **Badges are awarded**
  - Run: `npm run test-achievements` (from `server/` directory)
  - Complete first topic → "First Topic Completed" badge awarded
  - Badges visible on Profile page

- [ ] **Badge UI renders**
  - Manual test:
    1. Go to Profile page
    2. Verify badges section displays (with list of earned badges)
    3. Complete a topic to trigger a new badge

### 3.5 Discovery & Personalization
- [ ] **Career discovery** filters by stream
  - Manual test:
    1. Go to Careers page
    2. Verify careers matching your academic stream appear first

- [ ] **Course discovery** filters by topics
  - Manual test:
    1. Go to Courses page
    2. Verify courses ranked by your selected topics

---

## 4. Security & Performance

- [ ] **Rate limiting** is enabled
  - Auth endpoints: max 100 requests per 15 min (dev), 5 per 15 min (prod)
  - AI endpoints (onboarding, chat): max 10 per minute
  - General API: max 100 per 15 min

- [ ] **CORS** is configured for production origin
  - Server `FRONTEND_URL` matches client origin
  - Test: curl requests from client origin succeed; others fail (or are rate-limited)

- [ ] **Frontend build** succeeds and is optimized
  - Run from `client/`: `npm run build`
  - Verify `dist/` folder created with `index.html`, assets
  - Check bundle warnings (non-critical unless > 1MB chunks)

- [ ] **Backend startup** validates envs without crashing dev
  - Start server: `npm run dev` (from `server/`)
  - Should start even if optional vars (AI keys) missing
  - In production mode: exits if critical vars missing

---

## 5. Monitoring & Health Checks

- [ ] **Health check endpoint** responds
  - `GET /health` returns `{ status: 'OK', message: '...' }`
  - Manual: `curl http://localhost:5000/health`

- [ ] **Monitoring endpoint** shows uptime
  - `GET /api/monitor` returns `{ status, uptime, environment, version }`
  - Manual: `curl http://localhost:5000/api/monitor`

- [ ] **Google config endpoint** helps debug mismatches
  - `GET /api/auth/google-config` returns server `clientId`
  - Useful for: comparing with client env var and identifying OAuth issues

- [ ] **Error logs** are captured
  - Backend logs go to `server/logs/` (if configured) or console
  - Check for unusual errors or warnings in development

---

## 6. Deployment Environment Variables

### Server (.env or hosting platform)

```
NODE_ENV=production
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
GEMINI_API_KEY=<your-gemini-api-key>
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
SMTP_HOST=<smtp-provider-host>
SMTP_PORT=587
SMTP_USER=<your-smtp-email>
SMTP_PASS=<your-smtp-password>
PORT=5000
```

### Client (.env or build-time config)

```
VITE_API_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

---

## 7. Testing & Verification Scripts

Run these from `server/` directory:

```bash
# 1. Validate all required env vars are set
npm run validate-env

# 2. Smoke tests (health, register, login, refresh, forgot-password, google-config)
npm run smoke-tests

# 3. Analytics persistence (register → complete onboarding → mark topics → check DB)
npm run test-analytics

# 4. Achievements (register → complete topics → verify badges awarded)
npm run test-achievements

# 5. Google OAuth configuration verification
npm run verify-google-oauth
```

---

## 8. Pre-Production Checklist (Render/Vercel Deployment)

### Render.com (Backend)

- [ ] Create `.env.local` with production values
- [ ] Ensure `render.yaml` specifies correct build & start commands
- [ ] Set environment variables in Render dashboard:
  - All vars from "Deployment Environment Variables" above
  - Use Render secrets for sensitive values
- [ ] Test: `npm run smoke-tests` against deployed URL
- [ ] Verify `/health` and `/api/monitor` respond

### Vercel (Frontend)

- [ ] Create `.env.production.local` with production API URL
- [ ] Set environment variables in Vercel dashboard:
  - `VITE_API_URL=https://api.yourdomain.com`
  - `VITE_GOOGLE_CLIENT_ID=<your-client-id>`
- [ ] Build locally: `npm run build` succeeds
- [ ] Test: Deploy to Vercel, verify login/register work with backend

### MongoDB (Database)

- [ ] Production MongoDB URI configured
- [ ] Database indexes created (run seed or migrations if needed)
- [ ] Backups enabled
- [ ] Access restricted to backend IP/service

### Google Cloud Console

- [ ] OAuth 2.0 Web Client created
- [ ] Authorized origins include production domain
- [ ] Authorized redirect URIs include production backend URL

### DNS & Domains

- [ ] Frontend domain points to Vercel
- [ ] Backend domain points to Render
- [ ] SSL certificates auto-renewed (Vercel & Render handle this)

---

## 9. Post-Deployment Validation

After deploying to production:

1. **Test authentication flow**
   ```bash
   npm run smoke-tests -- --base-url https://api.yourdomain.com
   ```

2. **Monitor logs** for errors

3. **Verify features**
   - User registration & login
   - Email verification (if SMTP configured)
   - Roadmap generation
   - Topic completion & analytics update
   - Badge awards
   - Profile updates

4. **Check performance**
   - Frontend bundle size < 1MB
   - API response times < 500ms (typical)
   - Database queries optimized

5. **Set up alerts** (Sentry, DataDog, or similar)
   - Alert on 5xx errors
   - Alert on high latency
   - Alert on failed payments (if applicable)

---

## 10. Rollback Plan

If issues occur post-deployment:

1. **Stop accepting traffic** to broken version (Vercel: revert, Render: rollback)
2. **Identify issue**: Check logs, test `/health` endpoint
3. **Fix locally** and test with `npm run smoke-tests`
4. **Redeploy** with fix
5. **Verify** core flows work again
6. **Communicate** with users if necessary

---

## 11. Known Limitations & Workarounds

- **SMTP not configured**: Forgot-password shows debug URL in dev; fix by configuring SMTP before production
- **Google OAuth 403**: Ensure origins and client ID match; run `npm run verify-google-oauth` to debug
- **Analytics not updating**: Restart server; check MongoDB connection
- **Badges not awarded**: Ensure `server/utils/achievements.js` is loaded; check logs for errors

---

## Contact & Support

For deployment issues or questions, refer to:
- Backend logs: `server/logs/` or hosting provider dashboard
- Frontend errors: Browser DevTools Console
- Google OAuth issues: `npm run verify-google-oauth`
- Analytics issues: `npm run test-analytics`

---

**Checklist completed by:** ___________________  
**Date:** ___________________  
**Environment deployed to:** ☐ Staging  ☐ Production  
