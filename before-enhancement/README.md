# Before Enhancement One (Software Design & Engineering)

This folder is a **read-only snapshot** of the project as it existed at git commit `0b8c04b` (*Refactor: project reorganization and line-by-line documentation*)—**before** the Enhancement One engineering work in the main project tree.

Use it to compare **before vs. after** for your capstone documentation, demos, or rubric.

> **Do not run this copy as the live app.** Install dependencies and run the application from the repository root (`snhu-foodwaste-backend/` and `public/`). This archive is for reference only.

## How this snapshot was created

```bash
# Files were exported from the last committed pre-enhancement state (excluding node_modules, .env, coverage).
git ls-tree -r --name-only HEAD | … | git show HEAD:<file> > before-enhancement/<file>
```

## Key differences (before → after)

| Area | Before (this folder) | After (project root) |
|------|----------------------|----------------------|
| **Express layout** | Single `server.js` configures app + listens | `app.js` (config) + `server.js` (DB + listen) for testability |
| **Waste API** | Stub `routes/wasteRoutes.js` echoes POST body | `routes/foodWasteRoutes.js` persists to MongoDB (CRUD, reports, priority) |
| **Signup** | Firebase Auth + Firestore in `public/signup.html` | MongoDB/JWT via `/api/auth/register` (same as login) |
| **Frontend auth** | No shared `public/js/auth.js` | `auth.js` guards pages, JWT headers, role redirects |
| **Security** | CORS + JSON only | Helmet, rate limit, mongo-sanitize, xss-clean, compression |
| **Input validation** | Raw `req.body` to stub route | `utils/sanitizeWasteBody.js` + Mongoose schema validation |
| **Automated tests** | None in snapshot | Jest + Supertest (`snhu-foodwaste-backend/tests/`) |
| **Staff dashboards** | Older HTML filenames / layouts | `staff-dashboard.html`, `data-entry.html`, live API wiring |

## Notable files to open side-by-side

| Before | After |
|--------|--------|
| `snhu-foodwaste-backend/server.js` | `snhu-foodwaste-backend/server.js` + `app.js` |
| `snhu-foodwaste-backend/routes/wasteRoutes.js` | `snhu-foodwaste-backend/routes/foodWasteRoutes.js` |
| `public/signup.html` | `public/signup.html` |
| *(missing)* | `public/js/auth.js` |
| `public/login.html` | `public/login.html` |

## Snapshot metadata

- **Source commit:** `0b8c04b`
- **Snapshot date:** May 2026
- **Excluded from export:** `node_modules/`, `.env`, `coverage/`, large Firebase debug logs
