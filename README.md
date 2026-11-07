# MunchiesSNHU — Campus Food Waste Tracker

A full-stack web application that helps a university dining and sustainability team **record food waste, publish campus metrics to students, and spot which locations need attention first**. Built as my B.S. Computer Science capstone (CS-499) at Southern New Hampshire University.

> **Live demo:** https://munchies-snhu-food-waste.vercel.app — *being restored; the link is listed here once `/api/health` reports `ok`.*

## The problem

Reducing campus food waste starts with measuring it, but waste data is hard to collect consistently, compare across dining locations, or share with students. MunchiesSNHU gives staff one place to record waste and bin/compost sensor readings, and gives students a public view of the published results.

## What it does (implemented today)

| Area | Features |
|---|---|
| **Accounts** | Email/password sign-up and login (bcrypt-hashed passwords, JWT sessions). Roles: **student**, **staff**, **admin**. Staff sign-up requires an owner-issued code; admins are created manually. |
| **Staff** | Data entry with field-level validation; edit, delete, publish/unpublish; search, sort, pagination, bulk publish/delete; CSV import; dashboard charts; report summary built with MongoDB aggregation; pickup-priority ranking. |
| **Students** | Dashboard of **published** campus metrics and charts; settings and notification preferences; feedback form. |
| **Admin** | List users and remove accounts (cannot delete own account). |
| **AI assistant** | "MunchiesAI" sustainability chat (Groq or Anthropic). Shows a clear "not configured" message when no API key is set. |
| **Operations** | `GET /api/health` availability check; rate limiting on the API and stricter limits on login/sign-up. |

## Tech stack

**Frontend:** HTML, CSS, vanilla JavaScript, Chart.js · **Backend:** Node.js, Express · **Database:** MongoDB Atlas with Mongoose · **Auth:** bcryptjs, JSON Web Tokens · **Security middleware:** Helmet (CSP), express-rate-limit, express-mongo-sanitize, xss-clean · **Testing:** Jest, Supertest, Playwright · **Hosting:** Vercel (one serverless function serves the API; static pages are served by Vercel's CDN) · **CI:** GitHub Actions

## Architecture

```
Browser (public/*.html + js/)
   │  fetch('/api/...')  with  Authorization: Bearer <JWT>
   ▼
Vercel serverless function  api/index.js
   │  1. validate configuration (MONGODB_URI, JWT_SECRET)
   │  2. connect to MongoDB (connection cached across warm invocations, 4 s timeouts)
   │  3. hand the request to Express
   ▼
Express app  snhu-foodwaste-backend/app.js
   ├─ security middleware: helmet · rate limits · mongo-sanitize · xss-clean
   ├─ /api/auth   register · login · me · profile
   ├─ /api/waste  public list · staff CRUD · publish · reports · priority
   ├─ /api/feedback · /api/tips · /api/notifications · /api/users · /api/staff · /api/chat
   └─ /api/health
   ▼
MongoDB Atlas (collections: users, foodwasteentries, feedbacks)
```

## Run it locally

Prerequisites: Node.js 24 (20.19+ works), and MongoDB (local or Atlas).

```bash
cd snhu-foodwaste-backend
cp .env.example .env          # set MONGODB_URI and a 32+ character JWT_SECRET
npm install
npm start                     # http://localhost:5002 (or your PORT)
```

Optional fictional demo data (two demo accounts + 42 sample entries; never deletes anything):

```bash
DEMO_STUDENT_PASSWORD=<choose> DEMO_STAFF_PASSWORD=<choose> node scripts/seed-demo.js --confirm
```

## Testing

| Suite | Command | Needs |
|---|---|---|
| Unit + API tests (mocked DB) | `cd snhu-foodwaste-backend && npm test` | nothing — runs offline |
| Integration tests (real MongoDB) | `MONGODB_TEST_URI=mongodb://127.0.0.1:27017 npx jest` | a **local** MongoDB; uses a throwaway `test_*` database and refuses non-local hosts |
| Browser workflows (Playwright) | `cd e2e && npm install && BASE_URL=http://localhost:5055 npm test` | the app running locally against a local database seeded with demo data |

The integration suite covers registration, login, hashing, role checks, privilege-escalation attempts, CRUD, publishing, reports, feedback, notifications, the AI-assistant fallback, admin actions, and deactivated/deleted accounts. GitHub Actions runs the unit and integration suites on every push and pull request.

## Security notes

- Passwords are hashed with bcrypt; password hashes are never returned by the API.
- JWTs are signed with `JWT_SECRET`; the server refuses to start with a missing, placeholder, too-short, or previously exposed secret.
- Users can change only their name, theme, and notification preferences — role, email, and password changes through the profile endpoint are ignored.
- Staff sign-up requires `STAFF_SIGNUP_CODE`; admin accounts cannot be self-registered.
- Tokens for deleted or deactivated accounts are rejected.
- Public error responses are generic; details go to server logs. `/api/health` reveals only availability.
- Secrets live in environment variables only; `.env` files are git-ignored.

**Known limitations:** sessions last 30 days and logout is client-side (the token is removed from the browser); the in-memory rate limiter is per serverless instance.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string (`MONGO_URI` also accepted) |
| `JWT_SECRET` | yes | 32+ random characters; signs login tokens |
| `STAFF_SIGNUP_CODE` | no | Enables staff self-registration for people who know the code |
| `GROQ_API_KEY` / `ANTHROPIC_API_KEY` | no | Enables the AI assistant |
| `PORT` | no | Local port (default 5001) |

## Deploying on Vercel

1. Vercel project → **Settings → Environment Variables** (Production and Preview): set the variables above. Enter values in the dashboard only.
2. MongoDB Atlas → **Network Access**: Vercel functions use changing IP addresses, so allow access via the Vercel ↔ Atlas integration or `0.0.0.0/0` with a strong, dedicated database user.
3. Push a branch → Vercel builds a **Preview**. Check `https://<preview-url>/api/health` returns `{"status":"ok","database":"connected"}` before merging to `main` (production).

## Repository layout

```
├── api/index.js              # Vercel serverless entry (config check, DB connect, Express)
├── public/                   # Frontend pages, CSS, JS, images
├── snhu-foodwaste-backend/   # Express app, models, routes, controllers, tests, scripts
├── e2e/                      # Playwright browser workflow checks
├── docs/                     # Capstone ePortfolio (enhancement write-ups, narratives)
└── before-enhancement/       # Frozen pre-enhancement snapshot (not deployed)
```

---

## Capstone context

This repository is my CS-499 capstone artifact. The folder [`before-enhancement/`](before-enhancement/) holds a frozen copy of the codebase **before** my enhancements, and [`docs/`](docs/) contains the enhancement write-ups and narratives.

## Enhancement One: Software Design and Engineering

Enhancement One focuses on improving the structure, reliability, security, and maintainability of the application. The original project had a strong concept and several useful files, but major parts of the frontend, backend, authentication flow, and database workflow were not fully connected.

### Problems in the original version

- The backend mounted a stub waste route that only echoed request data instead of saving food waste entries to MongoDB.
- The more complete MongoDB-backed food waste route existed, but it was not connected through `server.js`.
- Signup used Firebase while login used the backend MongoDB/JWT flow, creating two separate account systems.
- Staff-only pages did not consistently check whether the user was authenticated.
- The frontend form used field names that did not match the `FoodWasteEntry` schema.
- The backend server startup was tightly coupled to the Express app, which made automated route testing harder.
- Security middleware dependencies were installed but not active.
- `node_modules` and `.env` files were tracked by Git, which is not appropriate for a professional repository.

### Software design improvements

The backend was reorganized so `snhu-foodwaste-backend/app.js` configures the Express app and `snhu-foodwaste-backend/server.js` only connects to MongoDB and starts the server. This separation makes the API easier to test because Supertest can import the app without opening a real network port.

The `/api/waste` endpoint now uses the MongoDB-backed food waste route. Staff and admin users can create, update, publish, unpublish, delete, report on, and prioritize waste entries through protected endpoints.

Authentication was unified around the backend MongoDB/JWT system. Signup and login now both return a JWT, and `public/js/auth.js` provides shared frontend helpers for storing tokens, sending protected headers, guarding staff pages, and logging out.

Security middleware is now active in the Express app. The app uses CORS, Helmet, rate limiting, JSON parsing, MongoDB sanitization, XSS cleaning, compression, and development request logging.

Request bodies for waste entries pass through `utils/sanitizeWasteBody.js` before Mongoose validation so clients receive clear 400 responses instead of opaque validation failures.

### Key files (after enhancement)

| Layer | Files |
|-------|--------|
| App bootstrap | `snhu-foodwaste-backend/app.js`, `server.js` |
| Waste API | `routes/foodWasteRoutes.js`, `utils/sanitizeWasteBody.js`, `utils/wastePriority.js` |
| Auth | `controllers/authController.js`, `middleware/authMiddleware.js`, `public/js/auth.js` |
| Data | `models/FoodWasteEntry.js`, `models/User.js` |
| Frontend | `public/data-entry.html`, `public/staff-dashboard.html`, `public/staff-report.html`, `public/student-dashboard.html` |
| Tests | `snhu-foodwaste-backend/tests/*.test.js` |
| Before snapshot | `before-enhancement/` |

### Course outcome connection

This enhancement demonstrates software engineering and design by improving modularity, testability, security, maintainability, and frontend/backend integration. The result is a more professional full-stack application with clearer responsibilities between the server, routes, authentication middleware, database models, and frontend pages.

### Verification

- Backend syntax checks and ESLint configuration
- Jest test suites: auth, protected routes, model validation, waste priority scoring, input sanitization, waste POST API
- Manual demo: staff login → create entry → dashboard/report → student views published data only

