---
layout: page
title: "Code Review"
permalink: /code-review/
---

# Code Review

**Category:** Pre-Enhancement Walkthrough

---

## Video

> **[Paste your code review video link here]**
>
> *(Upload to YouTube or Kaltura, then replace this line with the embedded link or URL)*

---

## What the Code Review Covers

The code review walks through the original MunchiesSNHU Food Waste Tracker codebase (preserved in the [`before-enhancement/`](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/tree/milestone-two/before-enhancement) folder) and identifies specific areas targeted for improvement across all three enhancement milestones:

### Software Design and Engineering (Enhancement One)
- Business logic mixed directly into route handlers instead of controllers
- `generateToken` function duplicated across multiple files
- No security middleware (no Helmet, no rate limiting, no input sanitization)
- Empty placeholder files with no functionality

### Algorithms and Data Structures (Enhancement Two)
- No bin priority algorithm — staff had no data-driven way to prioritize pickups
- Charts rebuilt from scratch on every poll, causing flicker and wasted resources
- API URL hardcoded to `localhost:5001` instead of a relative path

### Databases (Enhancement Three)
- Schema fields with no validation constraints (negative pH values accepted, humidity over 100% allowed)
- `submittedBy` field accepted from user input rather than being assigned from the JWT
- No database indexes on commonly queried fields
- Duplicate settings models (`BinSetting`, `NotificationSetting`, `ThemeSetting`) with no corresponding routes
- Credentials file (`.env`) accidentally tracked in version control

---

## Original Codebase

The pre-enhancement code is preserved unchanged in the repository for comparison:

- [before-enhancement/snhu-foodwaste-backend/](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/tree/milestone-two/before-enhancement/snhu-foodwaste-backend)
- [before-enhancement/public/](https://github.com/Samkwibe/MunchiesSNHU-Food_waste_Trucker/tree/milestone-two/before-enhancement/public)

---

[← Back to Home](/)
