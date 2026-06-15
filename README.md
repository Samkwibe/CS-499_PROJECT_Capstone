# MunchiesSNHU Food Waste Tracker

MunchiesSNHU is a full-stack food waste tracking application for a campus sustainability workflow. The project includes a static HTML/CSS/JavaScript frontend and a Node.js, Express, and MongoDB backend.

## Before vs. after (Enhancement One)

The folder [`before-enhancement/`](before-enhancement/) holds a **frozen copy of the codebase before Software Design & Engineering improvements** (from git commit `0b8c04b`). Compare it side-by-side with the current project root to document changes for your capstone.

See [`before-enhancement/README.md`](before-enhancement/README.md) for a file-by-file comparison table.

## Quick start

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Backend setup

```bash
cd snhu-foodwaste-backend
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET
npm install
npm test
npm start
```

The API and frontend are served together (static files from `public/`). Default port is **5002** if set in `.env`, otherwise **5001**.

### 2. Open the app

Visit `http://localhost:5002` (or your `PORT`), then:

- **Register / log in** — unified MongoDB + JWT (`/api/auth/register`, `/api/auth/login`)
- **Staff** — data entry, dashboard, reports (roles `staff` or `admin`)
- **Student** — published campus metrics on the student dashboard

### 3. Verify engineering quality

```bash
cd snhu-foodwaste-backend
npm test          # Jest + Supertest
npm run lint      # ESLint (optional)
```

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

## Repository layout

```
├── before-enhancement/     # Pre-enhancement snapshot (read-only reference)
├── public/                 # Frontend static assets and pages
├── snhu-foodwaste-backend/ # Express API, models, tests
└── README.md
```

## Environment variables

Copy `snhu-foodwaste-backend/.env.example` to `.env`. Required:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs and verifies login tokens |
| `PORT` | HTTP port (optional, default 5001) |

Never commit `.env` or secrets to git.

## Deploy to Vercel

This project is configured for [Vercel](https://vercel.com) as a single Express serverless function (`api/index.js`) that serves the API and the static frontend.

### 1. Push the repository to GitHub

```bash
git push origin master
```

### 2. Import the project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import `Samkwibe/MunchiesSNHU-Food_waste_Trucker`.
2. **Framework preset:** Other (uses root `vercel.json`).
3. **Root directory:** `.` (repository root).

### 3. Set environment variables (Project → Settings → Environment Variables)

| Name | Value |
|------|--------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Same secret you use locally |
| `NODE_ENV` | `production` (optional) |

Redeploy after adding variables.

### 4. Deploy from the CLI (optional)

```bash
npx vercel login
npx vercel --prod
```

### Notes

- MongoDB must be reachable from the public internet. In **MongoDB Atlas → Network Access**, allow **`0.0.0.0/0`** (or Vercel’s IPs) so serverless functions can connect.
- `before-enhancement/` is excluded from deployment via `.vercelignore`.
- Local development still uses `cd snhu-foodwaste-backend && npm start`.
- **Production URL:** [https://munchies-snhu-food-waste.vercel.app](https://munchies-snhu-food-waste.vercel.app)
