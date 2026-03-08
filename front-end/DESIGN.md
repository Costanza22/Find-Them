# FindThem – Web interface design

## Overview

Simple web UI for:
- **Register** a missing person (photo + details)
- **Report a sighting** by uploading an image
- **View possible matches** with similarity scores

Built with the existing **React (CRA)** app and **React Router**. No backend yet; UI is ready for API integration.

---

## Data shapes (for API later)

```txt
MissingPerson
  id, name, photoUrl?, description?, dateMissing?, lastSeen?, contactInfo?

Sighting
  id, imageUrl, uploadedAt, notes?, location?

Match
  id, missingPersonId, sightingId, similarityScore (0–100), status?
```

---

## Pages & routes

| Route              | Page            | Purpose                                      |
|--------------------|-----------------|----------------------------------------------|
| `/`                | Home            | Brief intro + quick links to main actions    |
| `/register`        | Register Person | Form to register a missing person           |
| `/sighting`        | Report Sighting | Upload sighting image + optional notes       |
| `/matches`         | Matches         | List of possible matches with similarity     |

---

## Layout

- **Header**: Logo/app name “FindThem” + main nav (Home, Register, Report Sighting, Matches).
- **Main**: Single column, max-width container; each page renders in this area.
- **Footer** (optional): Short tagline or link to about/contact.

---

## UI components

### 1. Layout
- App shell with header, nav links, and main content area (Router outlet).
- Responsive: stacked nav on small screens if needed.

### 2. Register Missing Person (`/register`)
- **Form fields**: Full name (required), photo upload, description (textarea), date missing, last seen location, contact info.
- **Actions**: Submit, Clear. On submit → show success message; later POST to API.

### 3. Report Sighting (`/sighting`)
- **Image upload**: Drag-and-drop or file picker; show preview.
- **Optional**: Notes (textarea), location (text).
- **Actions**: Submit, Clear. Later POST image + metadata to API.

### 4. Matches (`/matches`)
- **List/Cards** of possible matches.
- **Each card**: Missing person thumbnail + name, sighting thumbnail, **similarity score** (e.g. 0–100% or “High/Medium/Low”).
- **Empty state**: “No matches yet” when list is empty.
- Later: filter by score, date, or status.

### 5. Home (`/`)
- Short intro text.
- **Call-to-action** buttons or links: Register a missing person, Report a sighting, View matches.

---

## Similarity score display

- **Numeric**: e.g. “87% match” with a progress bar or badge.
- **Tier (optional)**: High (≥80%), Medium (50–79%), Low (&lt;50%); use color (e.g. green / amber / gray).

---

## Tech stack (current)

- **React 19** + **Create React App**
- **React Router 7** for routes
- Plain CSS (no UI library); easy to add MUI, Chakra, or Tailwind later.

---

## Next steps (after UI)

1. Add backend API (e.g. Node/Express or Next.js API routes) for register, upload, and matches.
2. Replace mock data with real API calls and loading/error states.
3. Optional: image cropping/resize before upload; auth for reporters.
