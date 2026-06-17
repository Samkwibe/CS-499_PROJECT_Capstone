---
layout: home
title: "Professional Self-Assessment"
---

# CS-499 Computer Science Capstone ePortfolio

### Samuel Raymond

SNHU Computer Science | June 2026

## Professional Self-Assessment

Throughout the Computer Science program at Southern New Hampshire University, I have grown from a student who could write procedural scripts into an engineer who thinks about systems — how components fit together, how data flows through an application, and how decisions made early in a codebase affect every developer who comes after. The capstone project, the MunchiesSNHU Food Waste Tracker, gave me the opportunity to apply that growth to a real, running application.

**Collaborating in a team environment.** The Food Waste Tracker was structured as a full-stack project with a Node.js/Express backend and a vanilla JavaScript frontend. Working through the enhancement milestones meant treating my own earlier code the way a collaborator would — reading it critically, identifying where the original design made future changes harder, and refactoring without breaking existing behavior. I practiced the discipline of writing student-friendly comments that document _why_ decisions were made, not just what the code does, because that is what a real teammate needs to pick up unfamiliar code quickly.

**Communicating with stakeholders.** Each milestone included a written narrative explaining technical decisions to a non-technical audience. I translated concepts like MVC architecture, JWT authentication, and MongoDB aggregation pipelines into plain language connected to business outcomes — reducing food waste, improving bin pickup timing, and giving dining hall staff actionable data. The code review video produced for Milestone One followed the same discipline: speaking to what the original code accomplished and why specific changes would improve security and maintainability.

**Data structures and algorithms.** The bin priority algorithm in `wastePriority.js` is the clearest example of applied algorithmic thinking in this project. I designed a weighted scoring function that combines sensor readings (bin fullness, gas levels, pH) with time-decay logic and normalizes them into a 0–100 priority score. The algorithm is deterministic, fully unit-tested, and produces human-readable explanations that staff can act on without understanding the math behind the score.

**Software engineering and database design.** The Milestone Two refactor moved all business logic out of route files and into dedicated controllers, following the Model-View-Controller pattern. Security middleware (Helmet, express-rate-limit, express-mongo-sanitize, xss-clean) was added at the application level so every route inherits protection automatically. For the database milestone, I added schema-level validation with explicit range constraints, MongoDB indexes tuned to the application's actual query patterns, and MongoDB aggregation pipelines that calculate reporting summaries entirely in the database layer rather than in application code.

**Security mindset.** A publicly tracked `.env` file containing database credentials was identified and removed from version history. JWTs are used to protect every staff-facing route, the `submittedBy` field is always assigned from the verified token rather than from user-supplied input, and rate limiting prevents credential-stuffing attacks on the authentication endpoints.

**Summary of enhancements.** The three milestones below demonstrate proficiency across the three Computer Science program outcomes evaluated in CS-499:

| Enhancement                               | Category                      | Key Artifact                                              |
| ----------------------------------------- | ----------------------------- | --------------------------------------------------------- |
| [Enhancement One](enhancement-one.md)     | Software Design & Engineering | MVC refactor, security middleware, consolidated utilities |
| [Enhancement Two](enhancement-two.md)     | Algorithms & Data Structures  | Bin priority scoring algorithm, chart update-in-place     |
| [Enhancement Three](enhancement-three.md) | Databases                     | Schema validation, indexes, aggregation pipelines         |

---

## Navigation

- [Code Review](code-review.md) — Walkthrough video of the original codebase
- [Enhancement One](enhancement-one.md) — Software Design and Engineering
- [Enhancement Two](enhancement-two.md) — Algorithms and Data Structures
- [Enhancement Three](enhancement-three.md) — Databases

---

_Repository: [Samkwibe/MunchiesSNHU-Food_waste_Trucker](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker)_
