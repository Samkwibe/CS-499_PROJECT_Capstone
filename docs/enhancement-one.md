---
layout: page
title: "Enhancement One — Software Design and Engineering"
permalink: /enhancement-one/
---

# Enhancement One: Software Design and Engineering

**Course Outcome Addressed:** *Design and evaluate computing solutions that solve a given problem using algorithmic principles and computer science practices and standards appropriate to its solution.*

---

## Narrative

[Download PDF Narrative](narratives/milestone-two-narrative.pdf)

---

## Summary of Changes

| Area | Before | After |
|---|---|---|
| Route files | Contained direct database queries and business logic | Thin — only mount controllers and middleware |
| Controllers | Did not exist | `wasteEntryController.js`, `authController.js`, `staffController.js`, `feedbackController.js`, `notificationController.js`, `userController.js` |
| Token generation | `generateToken` duplicated inside `authController.js` | Consolidated into `utils/generateToken.js`, imported where needed |
| Security | No middleware | Helmet, express-rate-limit (100 req/15 min), express-mongo-sanitize, xss-clean, compression |
| Empty files | Placeholder `.js` files with no code | Removed entirely |
| Comments | Minimal | Student-friendly comments explaining purpose and design decisions |

### Key Design Decision: MVC Separation

The original codebase placed all database queries and response logic inside Express route callbacks. This made the routes difficult to test in isolation and meant any business rule change required editing the route file directly.

The refactored architecture follows the Model-View-Controller pattern:
- **Models** define schema and validation (unchanged from their original intent)
- **Controllers** contain all async handler functions with database access
- **Routes** only wire HTTP methods to controller functions and apply middleware

This separation means a future developer can change how a route is protected (swap middleware) without touching business logic, and can test controller logic without spinning up a full HTTP server.

---

## Code Links

### Before Enhancement
- [before-enhancement/snhu-foodwaste-backend/routes/](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/tree/milestone-two/before-enhancement/snhu-foodwaste-backend/routes)
- [before-enhancement/snhu-foodwaste-backend/](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/tree/milestone-two/before-enhancement/snhu-foodwaste-backend)

### After Enhancement
- [snhu-foodwaste-backend/app.js](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/blob/milestone-two/snhu-foodwaste-backend/app.js) — security middleware stack
- [snhu-foodwaste-backend/controllers/](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/tree/milestone-two/snhu-foodwaste-backend/controllers) — all controller functions
- [snhu-foodwaste-backend/routes/](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/tree/milestone-two/snhu-foodwaste-backend/routes) — thin route files
- [snhu-foodwaste-backend/utils/generateToken.js](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/blob/milestone-two/snhu-foodwaste-backend/utils/generateToken.js) — consolidated token helper

---

[← Back to Home](/) | [Enhancement Two →](enhancement-two.md)
