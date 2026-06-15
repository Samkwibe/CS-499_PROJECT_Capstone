---
layout: page
title: "Enhancement Three — Databases"
permalink: /enhancement-three/
---

# Enhancement Three: Databases

**Course Outcome Addressed:** *Demonstrate an ability to use well-founded and innovative techniques, skills, and tools in computing practices for the purpose of implementing computer solutions that deliver value and accomplish industry-specific goals.*

---

## Narrative

[Download PDF Narrative](narratives/milestone-four-narrative.pdf)

---

## Summary of Changes

| Area | Before | After |
|---|---|---|
| Schema validation | Numeric fields accepted any value (negative pH, humidity > 100%) | Range constraints on all sensor fields enforced by Mongoose |
| `submittedBy` field | Accepted from request body — could be spoofed | Always set from `req.user._id` (JWT) in the controller |
| Database indexes | None | Compound index on `published + createdAt`; single indexes on `location`, `published`, `createdAt` |
| Unused models | `BinSetting.js`, `NotificationSetting.js`, `ThemeSetting.js` existed with no routes | Removed entirely |
| Tracked `.env` file | `public/.env` committed to git history | Removed and added to `.gitignore` |
| Reporting endpoints | Basic entry listing only | Aggregation pipelines for: totals by location, daily trend, monthly trend, waste per user, waste per food type, compost diversion rate |

### Schema Validation Ranges

Added to `FoodWasteEntry.js`:

| Field | Constraint |
|---|---|
| `pH` | `min: 0`, `max: 14` |
| `humidity` | `min: 0`, `max: 100` |
| `binFullness` | `min: 0`, `max: 100` |
| `weight` | `min: 0` |
| `gas` | `min: 0` |
| `compostWeight` | `min: 0` |
| `foodType` | `required`, `maxlength: 100` |
| `location` | `required`, `maxlength: 100` |
| `notes` | `maxlength: 500` |

### Index Strategy

Indexes were chosen to match the application's actual query patterns:

- `{ published: 1, createdAt: -1 }` — covers the student dashboard query (`find({ published: true }).sort({ createdAt: -1 })`)
- `{ location: 1 }` — supports the by-location aggregation grouping
- `{ published: 1 }` and `{ createdAt: -1 }` — support single-field filter and sort queries

### Aggregation Pipelines

The `/api/waste/reports/summary` endpoint returns six computed datasets in one request, all calculated inside MongoDB:

- **Overall totals** — total waste, total compost, average bin fullness, humidity, pH
- **By location** — total waste and compost per dining hall
- **Daily trend** — 14-day rolling window of waste entries grouped by date
- **By user** — total waste submitted per staff member (joined from the users collection)
- **By food type** — total waste per food category
- **Monthly trend** — month-over-month waste volume for long-term reporting

---

## Code Links

### Before Enhancement
- [before-enhancement/snhu-foodwaste-backend/models/](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/tree/milestone-two/before-enhancement/snhu-foodwaste-backend/models) — original models without validation

### After Enhancement
- [snhu-foodwaste-backend/models/FoodWasteEntry.js](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/blob/milestone-two/snhu-foodwaste-backend/models/FoodWasteEntry.js) — schema with validation and indexes
- [snhu-foodwaste-backend/controllers/wasteEntryController.js](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/blob/milestone-two/snhu-foodwaste-backend/controllers/wasteEntryController.js) — `submittedBy` assigned from JWT
- [snhu-foodwaste-backend/routes/foodWasteRoutes.js](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/blob/milestone-two/snhu-foodwaste-backend/routes/foodWasteRoutes.js) — aggregation endpoint (`/reports/summary`)

---

[← Enhancement Two](enhancement-two.md) | [↑ Back to Home](/)
