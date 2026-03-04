# 🗑️ KleonUrban — Smart Garbage Management System

> An AI-powered, end-to-end urban waste management platform connecting citizens, field workers, and municipal admins on a single real-time system.

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [AI Modules](#ai-modules)
- [Features by Role](#features-by-role)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Workflow](#workflow)
- [Real-Time System](#real-time-system)

---

## Overview

KleonUrban is a multi-role smart city waste management platform. Citizens report garbage via photo, voice, or text. Multiple AI layers instantly validate the report, estimate recyclable value, assess flood risk using live weather data, and assign a priority — all before a human ever touches it. Admins broadcast geo-clustered jobs to the nearest available worker, monitor everything on a live map, and use AI to verify cleanup quality by comparing before/after photos. Workers follow a guided step-by-step workflow and cannot falsely mark a job complete — every submission goes through admin AI approval first.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│              Next.js 16 + TypeScript + Tailwind                  │
│                                                                  │
│   /citizen/dashboard   /admin/dashboard   /worker/dashboard      │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API + Supabase Realtime
┌────────────────────────────▼────────────────────────────────────┐
│                         BACKEND                                  │
│                    Express.js (ES Modules)                       │
│                         Port 5000                                │
│                                                                  │
│  /api/auth   /api/reports   /api/jobs   /api/verify   /api/process│
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
┌─────────▼──────┐  ┌───────▼────────┐  ┌──────▼──────────────┐
│  Supabase DB   │  │ Supabase       │  │   External APIs      │
│  PostgreSQL    │  │ Storage        │  │                      │
│                │  │ (Images)       │  │  Groq (Llama 4)      │
│  tickets       │  │                │  │  Deepgram Nova-2     │
│  jobs          │  │  reports/      │  │  OpenWeatherMap      │
│  job_tickets   │  │  report-images/│  └──────────────────────┘
│  profiles      │  └────────────────┘
└────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.0.10 | React framework with SSR/ISR |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3+ | Utility-first styling |
| shadcn/ui | Latest | Component library (Radix UI) |
| Leaflet + OpenStreetMap | Latest | Interactive map (free, no API key) |
| Recharts | Latest | Analytics charts |
| Supabase JS | 2.98.0 | DB client + Realtime subscriptions |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Express.js | 5.2.1 | REST API server |
| Node.js | 20+ | Runtime (ES Modules) |
| Multer | 2.1.0 | File upload handling |
| Sharp | 0.34.5 | Image compression before AI calls |
| Axios | 1.13.6 | HTTP client for external APIs |
| dotenv | 17.3.1 | Environment variable management |

### Database & Storage
| Service | Purpose |
|---|---|
| Supabase PostgreSQL | Primary database |
| Supabase Storage (`reports/`) | Before images |
| Supabase Storage (`report-images/`) | After images |
| Supabase Realtime | WebSocket live updates |

### AI & External APIs
| Service | Model | Purpose |
|---|---|---|
| Groq | `meta-llama/llama-4-scout-17b-16e-instruct` | Vision AI (image analysis) |
| Groq | `llama-3.3-70b-versatile` | NLP (text validation) |
| Deepgram | `nova-2` | Speech-to-text transcription |
| OpenWeatherMap | 5-day forecast API | Rain & flood probability |

---

## AI Modules

### Module 1 — Vision AI Gate (`visionService.js`)
- **Model:** Groq Llama 4 Scout 17B (Vision)
- **Trigger:** Every new citizen report submission
- **Function:** Detects if garbage is actually present in the photo
- **Gate:** Report is auto-rejected if no garbage detected
- **Output:** `waste_type`, `severity`, `drain_blocked`, `confidence`

### Module 2 — Waste-to-Wealth Estimator (`visionService.js → estimateWasteValue()`)
- **Model:** Groq Llama 4 Scout 17B (Vision)
- **Trigger:** Runs right after Vision AI on every report
- **Function:** Identifies recyclable materials and estimates ₹ revenue
- **Rates:** PET ₹12/kg · Aluminium ₹180/kg · Cardboard ₹8/kg · Glass ₹2/kg
- **Output:** `recyclable_materials`, `estimated_weight_kg`, `estimated_revenue_inr`, `breakdown`

### Module 3 — NLP Text Validator (`nlpService.js`)
- **Model:** Groq LLaMA 3.3 70B (Text)
- **Trigger:** When citizen provides a text description
- **Function:** Validates spam/gibberish, translates regional languages to English
- **Output:** `is_valid`, `waste_type`, `severity`, `drain_mentioned`, `translated_text`

### Module 4 — Speech-to-Text (`speechService.js`)
- **Model:** Deepgram Nova-2
- **Trigger:** When citizen submits a voice note
- **Function:** Transcribes audio to text with auto language detection
- **Output:** Transcript string → fed into NLP module

### Module 5 — Rain & Flood Forecasting (`weatherService.js`)
- **API:** OpenWeatherMap 5-day/3-hour forecast
- **Trigger:** Every new report submission
- **Function:** Fetches rain probability for exact GPS coordinates of the report
- **Output:** `rain_probability` (max % over next 24 hours)

### Module 6 — Environmental Risk Engine (`riskEngine.js`)
- **Type:** Rule-based scoring (uses Vision + Weather outputs)
- **Trigger:** After Vision AI + Weather run

| Condition | Priority |
|---|---|
| Drain blocked + rain ≥ 60% | CRITICAL |
| Drain blocked + high severity + rain ≥ 35% | CRITICAL |
| Any drain blocked | HIGH |
| Rain ≥ 75% + high severity | HIGH |
| Rain ≥ 60% | MEDIUM |
| Rain ≥ 35% | LOW |
| Default | NORMAL |

### Module 7 — AI Verification Auditor (`verificationService.js`)
- **Model:** Groq Llama 4 Scout 17B (Vision)
- **Trigger:** Admin clicks "AI Verify & Approve" after worker submits cleanup
- **Function:** Compares BEFORE photo vs AFTER photo for same location + garbage cleared
- **Hard rules:** `CLOSED` only if `landmarks_match=true` AND `is_clean=true` AND `confidence ≥ 0.85`
- **On rejection:** Clears `completed_at` → job returns to worker's active dashboard
- **Image compression:** `sharp` resizes to 768px/60% JPEG before sending (prevents 413 errors)

### Module 8 — Geospatial Job Routing (`jobs.js`)
- **Algorithm:** Haversine formula (great-circle distance)
- **Trigger:** Worker opens available jobs tab
- **Function:** Sorts all OPEN jobs by distance from worker's GPS location
- **Output:** `distance_km`, `center_lat`, `center_lon`, `top_priority`, `drain_blocked_count`

---

## Features by Role

### 👤 Citizen
- Submit garbage report (photo + GPS + text/voice)
- AI auto-rejects reports with no visible garbage
- Voice note recording → auto-transcribed by Deepgram
- Real-time ticket status tracking
- Coin & points system (50 coins/report, streak multiplier)
- Achievement badges (First Reporter, Eco Champion, etc.)
- Neighbourhood ranking leaderboard
- Social media sharing at milestone points (3000, 5000 points)
- Daily streak tracking

### 🛡️ Admin
- Live ticket table with filters (status, priority, date)
- Real-time updates via Supabase subscriptions
- Interactive Leaflet map with all ticket locations
- Create jobs by selecting tickets and naming them
- Job management panel (status, worker, ticket count)
- AI Verify & Approve (bulk before/after comparison on all job tickets)
- Per-ticket AI Re-Verify button
- Manual approve fallback
- Pending review detection (yellow badge for submitted jobs)
- Waste analytics panel (total ₹ value, weight, material breakdown)
- Analytics page (charts: status, priority, daily trends, KPIs)

### 👷 Worker
- Available jobs tab sorted nearest-first by GPS distance
- Job details: ticket count, top priority, drain-blocked count, distance km
- Accept job (locks to worker; one active job at a time)
- Real-time job broadcast alerts (Supabase subscription)
- Step-by-step guided workflow:
  1. Navigate to site (opens Google Maps)
  2. Upload before photo per ticket
  3. Upload after photo per ticket
  4. Send for Admin Review
- Replace after photo at any time (↺ Replace button)
- Rejected ticket handling: red warning + "Re-upload After Photo" prompt
- Submit blocked until all rejected tickets are re-uploaded
- Job history tab with completed and pending review jobs

---

## Project Structure

```
Smart-Garbage-Management-/
├── README.md
│
├── frontend/                          # Next.js application
│   ├── app/
│   │   ├── page.tsx                   # Landing page
│   │   ├── layout.tsx                 # Root layout
│   │   ├── get-started/page.tsx       # Role selection
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── citizen/
│   │   │   ├── dashboard/page.tsx     # Citizen dashboard
│   │   │   ├── report/                # Report submission
│   │   │   └── reports/               # My reports
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx     # Admin control centre
│   │   │   ├── analytics/page.tsx     # Charts & KPIs
│   │   │   └── reports/               # Reports management
│   │   └── worker/
│   │       └── dashboard/page.tsx     # Worker job flow
│   ├── components/
│   │   ├── dashboard-layout.tsx       # Shared layout (navbar + footer)
│   │   ├── enhanced-navbar.tsx
│   │   ├── footer.tsx
│   │   ├── admin/
│   │   │   └── admin-map-view.tsx     # Leaflet map component
│   │   └── ui/                        # shadcn/ui components
│   ├── lib/
│   │   ├── supabase.ts                # Supabase client + types
│   │   ├── auth.ts                    # Auth helpers
│   │   └── utils.ts
│   └── hooks/
│       ├── use-mobile.ts
│       └── use-toast.ts
│
└── backend/                           # Express.js API
    ├── server.js                      # Entry point (port 5000)
    ├── config/
    │   └── supabaseClient.js          # Supabase admin client
    ├── routes/
    │   ├── auth.js                    # /api/auth
    │   ├── reports.js                 # /api/reports — full AI pipeline
    │   ├── jobs.js                    # /api/jobs — worker job lifecycle
    │   ├── verify.js                  # /api/verify — per-ticket AI audit
    │   └── processor.js               # /api/process
    ├── services/
    │   ├── visionService.js           # Vision AI + Waste estimator
    │   ├── nlpService.js              # NLP text validation
    │   ├── speechService.js           # Deepgram transcription
    │   ├── weatherService.js          # OpenWeatherMap rain forecast
    │   ├── riskEngine.js              # Priority calculation logic
    │   └── verificationService.js     # Before/after AI comparator
    └── middleware/
        └── auth.js
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm 9+
- Supabase account (free tier works)
- Groq API key ([console.groq.com](https://console.groq.com) — free)
- Deepgram API key ([deepgram.com](https://deepgram.com) — free: 12,000 mins/year)
- OpenWeatherMap API key ([openweathermap.org](https://openweathermap.org) — free: 1,000 calls/day)

### 1. Clone the Repository
```bash
git clone https://github.com/DikshaP-2506/Smart-Garbage-Management-.git
cd Smart-Garbage-Management-
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env and fill in your API keys (see Environment Variables below)
node server.js
# Server running on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create .env.local and fill in your keys (see Environment Variables below)
npm run dev
# App running on http://localhost:3000
```

### 4. If Port 5000 is Already in Use (Windows)
```powershell
# Find PID
netstat -ano | findstr :5000
# Kill it
taskkill /PID <PID> /F
```

---

## Environment Variables

### `backend/.env`
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Groq AI (Vision + NLP + Verification)
GROQ_API_KEY=gsk_...

# Deepgram (Speech-to-Text)
DEEPGRAM_API_KEY=your-deepgram-api-key

# OpenWeatherMap (Rain Forecast)
OPENWEATHER_API_KEY=your-openweather-api-key

# Server
PORT=5000
```

### `frontend/.env.local`
```env
# Supabase (public keys — safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Workflow

```
CITIZEN                    ADMIN                      WORKER
  │                          │                           │
  │ 1. Submit Report         │                           │
  │    photo + GPS + text    │                           │
  │    or voice note         │                           │
  │                          │                           │
  │──── AI Pipeline ────────►│                           │
  │    Vision AI (gate)      │                           │
  │    Waste-to-Wealth       │                           │
  │    NLP / Deepgram        │                           │
  │    Weather forecast      │                           │
  │    Risk Engine           │                           │
  │                          │                           │
  │    Ticket: OPEN          │                           │
  │                          │                           │
  │              2. Admin creates Job                    │
  │                 (clusters nearby tickets)────────►   │
  │                          │           3. Worker sees  │
  │                          │              job (nearest │
  │                          │              first)       │
  │                          │           4. Accept Job   │
  │                          │           5. Upload Before│
  │                          │           6. Clean site   │
  │                          │           7. Upload After │
  │                          │           8. Send for     │
  │                          │◄─────────── Review        │
  │                          │                           │
  │              9. AI Verify & Approve                  │
  │                 (before vs after)                    │
  │                          │                           │
  │              ┌── PASS ───┤                           │
  │              │  COMPLETED│                           │
  │              │  CLOSED   │                           │
  │              │           │                           │
  │              └── FAIL ───────────────────────────►  │
  │                  completed_at cleared                │
  │                  Ticket → REJECTED                   │
  │                  Worker: Re-upload prompt            │
  │                  (loop back to step 7)               │
  │                          │                           │
 ◄── Realtime status update  │                           │
```

## License

MIT