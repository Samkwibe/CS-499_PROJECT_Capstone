---
layout: page
title: "Enhancement Two — Algorithms and Data Structures"
permalink: /enhancement-two/
---

# Enhancement Two: Algorithms and Data Structures

**Course Outcome Addressed:** *Design and evaluate computing solutions that solve a given problem using algorithmic principles and computer science practices and standards appropriate to its solution, while managing the trade-offs involved in design choices.*

---

## Narrative

[Download PDF Narrative](narratives/milestone-three-narrative.pdf)

---

## Summary of Changes

| Area | Before | After |
|---|---|---|
| Bin pickup priority | No algorithm — staff had no data-driven prioritization | Weighted scoring function producing a 0–100 priority score per entry |
| Priority data source | N/A | Live MongoDB data via `/api/waste/priority` |
| Chart behavior | Charts rebuilt from scratch on every poll (caused flicker) | Charts update in place using `.update()` — instances reused |
| API URL | Hardcoded to `localhost:5001` in frontend JS | Relative path `/api/waste` — works locally and deployed |
| Empty states | No handling — page showed broken charts on empty data | Graceful message shown when no entries exist |
| Unit tests | None for algorithm | `tests/wastePriority.test.js` — 100% function coverage |

### Key Algorithm: Weighted Priority Scoring

`utils/wastePriority.js` implements a deterministic, multi-factor scoring function. Each waste entry receives a score on a 0–100 scale based on:

| Factor | Weight | Rationale |
|---|---|---|
| Bin fullness (0–100%) | 45 points max | Strongest pickup signal — a full bin can't accept new waste |
| Gas reading (capped at 10) | 20 points max | Elevated gas indicates decomposition and odor risk |
| pH deviation from neutral 7 | 15 points max | pH outside 5.5–8.5 indicates compost imbalance |
| Entry age (0–72 hours) | 10 points max | Old readings become more urgent over time |
| Waste weight | 7 points max | Heavy loads affect transport logistics |
| Compost weight | 3 points max | Compostable material is time-sensitive |

Scores map to four human-readable labels: **Low** (< 25), **Medium** (25–44), **High** (45–69), **Critical** (≥ 70).

The `rankWasteEntries()` function applies `scoreWasteEntry()` to every entry and sorts descending, so the entry most urgently needing pickup always appears first in the staff dashboard.

---

## Code Links

### Before Enhancement
- [before-enhancement/snhu-foodwaste-backend/](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/tree/milestone-two/before-enhancement/snhu-foodwaste-backend) — no wastePriority file present
- [before-enhancement/public/js/](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/tree/milestone-two/before-enhancement/public/js) — original frontend JS

### After Enhancement
- [snhu-foodwaste-backend/utils/wastePriority.js](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/blob/milestone-two/snhu-foodwaste-backend/utils/wastePriority.js) — scoring algorithm
- [snhu-foodwaste-backend/tests/wastePriority.test.js](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/blob/milestone-two/snhu-foodwaste-backend/tests/wastePriority.test.js) — unit tests
- [snhu-foodwaste-backend/routes/foodWasteRoutes.js](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/blob/milestone-two/snhu-foodwaste-backend/routes/foodWasteRoutes.js) — `/api/waste/priority` route
- [public/js/app.js](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/blob/milestone-two/public/js/app.js) — chart update-in-place logic

---

[← Enhancement One](enhancement-one.md) | [Enhancement Three →](enhancement-three.md)
