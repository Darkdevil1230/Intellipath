# IntelliPath Deployment Checklist

## Required environment variables (server)

The server **will not start** without:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Database connection |
| `JWT_SECRET` | Auth tokens |
| `GEMINI_API_KEY` | Roadmap & AI features |
| `GOOGLE_CLIENT_ID` | Google Sign-In |

Validate before deploy:

```bash
cd server
npm run validate-env
```

Recommended (warned if missing): `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `BACKEND_URL`

---

## Google OAuth (production)

In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → your OAuth client:

**Authorized JavaScript origins**

```
http://localhost:5173
https://your-vercel-app.vercel.app
```

**Authorized redirect URIs** (if using redirect flow)

```
http://localhost:5173
https://your-vercel-app.vercel.app
```

`VITE_GOOGLE_CLIENT_ID` (client) must match `GOOGLE_CLIENT_ID` (server).

Verify locally:

```bash
cd server
npm run verify-google-oauth
```

---

## One-time: backfill roadmap stream

For users created before `roadmap.stream` existed:

```bash
cd server
npm run migrate:roadmap-stream
```

---

## Seed catalog (development / fresh DB)

```bash
cd server
npm run seed
```

---

## Pre-deploy smoke test

```bash
cd server
npm run smoke-tests
```

---

## AI provider fallback

The server supports multiple AI providers for resilient roadmap, chat, and assessment generation:

- Primary: Gemini / Google Generative AI (`GEMINI_API_KEY` or `GOOGLE_API_KEY`)
- Fallback: OpenAI (`OPENAI_API_KEY`, optional `OPENAI_MODEL`)
- Fallback: Anthropic (`ANTHROPIC_API_KEY`, optional `ANTHROPIC_MODEL`)

`server/utils/gemini.js` includes:

- 3 retries per provider with 1.2s delay
- 25s timeout per request
- Markdown code-fence stripping
- Regex JSON object/array extraction
- Trailing-comma sanitization
- Automatic fallback to the next configured AI provider
- Built-in roadmap/assessment fallback if all providers fail

`POST /onboarding/generate-roadmap` should return **200** with a roadmap (AI or fallback), not 500.

---

## Assessments

Routes:

- `/assessments` — list & generate
- `/assessments/:id` — completed assessment details

API: `GET /api/assessment/:id`
