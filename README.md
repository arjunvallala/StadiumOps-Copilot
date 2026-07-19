# StadiumOps Copilot — Explainable AI Assistant for Stadium Volunteers & Staff

**Challenge**: PromptWars Virtual Challenge 4 — Smart Stadiums & Tournament Operations (FIFA World Cup 2026)  
**Vertical**: Smart Stadiums & Tournament Operations — Volunteer/Staff Operations Copilot  
**Author**: DeepMind Agentic Pair Programming  

---

## 1. Vertical & Problem Statement

### The Problem
During massive international sporting events like the **FIFA World Cup 2026**, stadiums host 80,000+ spectators per match. Ops command centers face hundreds of concurrent alerts (crowd bottlenecks at gates, medical fainting, lost children, facilities issues), while thousands of temporary volunteers and stewards on the ground need immediate, unambiguous operational guidance.

### Persona Choice: Why Field Volunteers & Ground Staff?
- **Over Fan-Facing Apps**: Fan apps suffer from low battery, poor cellular connectivity inside dense concrete bowl structures, and fragmented user adoption. Volunteers are equipped and stationed at key bottlenecks.
- **Over Organizer Executive Dashboards**: High-level executive dashboards provide macro metrics but fail to provide field-level micro-actions ("Reallocate 10% of Gate A scanning staff to Gate B immediately due to a 94% occupancy surge").
- **Field-First Focus**: Field staff require an instant, accessible tool that categorizes reports in real-time, explains **why** a decision was made, and suggests concrete next steps without requiring them to decipher raw sensor streams.

---

## 2. Architecture Overview

StadiumOps Copilot is designed as a high-performance monorepo with separation of concerns:

```
stadiumops-copilot/
├── .github/
│   └── workflows/
│       └── test.yml           # Automated CI GitHub Actions workflow
├── backend/                    # Lightweight Node.js Express REST Service
│   ├── src/
│   │   ├── app.js             # Express app setup, rate-limiting, CORS & routing
│   │   ├── index.js           # Server startup script
│   │   ├── logic/             # Pure, deterministic decision-logic modules
│   │   │   ├── incidentClassifier.js  # Keyword rule engine (Medical/Security/Crowd/Facilities)
│   │   │   ├── gateAdvisory.js        # Occupancy threshold analysis & flags
│   │   │   ├── shiftSuggestions.js    # Tournament phase & crowd alert force allocation
│   │   │   └── sanitization.js        # XSS HTML stripping & input length validation
│   │   ├── services/
│   │   │   └── llm.js         # Gemini API integration with session caching & rate-limiting
│   │   └── data/
│   │       ├── gates.json     # Mock stadium gate sensor dataset
│   │       └── incidents.json # Seed incident log dataset
│   └── tests/                 # Vitest test suite (33 tests across 5 test suites)
│       ├── sanitization.test.js
│       ├── incidentClassifier.test.js
│       ├── gateAdvisory.test.js
│       ├── shiftSuggestions.test.js
│       └── app.test.js
└── frontend/                   # Accessible React + Vite + Tailwind CSS UI
    └── src/
        ├── App.jsx            # Main view switcher with skip-to-content accessibility
        ├── api/client.js      # Frontend API service layer
        └── components/
            ├── Header.jsx           # Accessible navigation & online status indicator
            ├── IncidentTriage.jsx   # Report submission & ARIA live triage feed
            ├── GateAdvisory.jsx     # Gate occupancy visual cards & simulation triggers
            ├── FanCommHelper.jsx    # Multilingual translation tool with clipboard copy
            └── ShiftSuggestions.jsx # Volunteer positioning recommendations
```

---

## 3. Explainable AI & Hybrid Decision Logic

Instead of routing every request through a black-box LLM (which is slow, costly, non-deterministic, and prone to hallucinations), StadiumOps Copilot uses a **Hybrid Rules-First + LLM Fallback** architecture:

```
                    [ Field Incident Report ]
                               │
                               ▼
                ┌─────────────────────────────┐
                │ Input Validation & XSS      │
                │ Sanitization                │
                └──────────────┬──────────────┘
                               │
                               ▼
                ┌─────────────────────────────┐
                │ 1. Deterministic Rule       │
                │    Keyword Engine           │
                └──────────────┬──────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
      [ Rule Match ]                        [ No Rule Match ]
            │                                     │
            ▼                                     ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│ Instant Rule Output       │         │ 2. Gemini LLM Fallback    │
│  - Category & Severity    │         │    - Structured JSON      │
│  - Recommended Action     │         │    - In-Memory Cache      │
│  - Explainable Rule ID    │         │    - LLM Reasoning        │
└───────────────────────────┘         └───────────────────────────┘
```

### Why Explainability Matters in Stadium Operations
1. **Trust & Verification**: Volunteers need to know *why* an alert is classified as `CRITICAL` (e.g., "Report contains urgent medical indicator terms ('collapsed', 'unresponsive')").
2. **Speed & Determinism**: Rule evaluation executes in sub-millisecond time without waiting for external API latency.
3. **Transparency**: Every card explicitly displays its reasoning string and demarcates whether the decision originated from a **Deterministic Rule** or **LLM Fallback Reasoning**.

---

## 4. Local Setup & Execution Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Environment Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/stadiumops-copilot.git
   cd stadiumops-copilot
   ```
2. Copy the environment file template in `/backend`:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. *(Optional)* Edit `backend/.env` to include your Gemini API key:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
   *(Note: If no API key is set, the application continues operating seamlessly using deterministic rules and fallback mock triages).*

### Installation
Run the root setup command to install dependencies across root, backend, and frontend:
```bash
npm run setup
```

### Running Locally
Run both backend and frontend concurrently in dev mode:
```bash
npm run dev
```
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

Alternatively, run them in separate terminals:
```bash
# Terminal 1 (Backend)
npm run dev:backend

# Terminal 2 (Frontend)
npm run dev:frontend
```

---

## 5. Testing Suite

The repository features **33 automated tests** across 5 test suites covering pure logic functions and API endpoints.

### Running Tests
To run all tests once:
```bash
npm run test
```

To run only backend tests:
```bash
npm run test:backend
```

### What is Tested
1. **`sanitization.test.js`**: Verifies HTML tag stripping (XSS protection) and max string length validation.
2. **`incidentClassifier.test.js`**: Tests rule matching across Medical, Security, Crowd, Lost Person, and Facilities keywords.
3. **`gateAdvisory.test.js`**: Verifies threshold logic (`>=90% Critical`, `>=75% Warning`, `>=60% Rising Info`, `Normal`).
4. **`shiftSuggestions.test.js`**: Validates force allocation percentages across match phases and dynamic gate overload reallocations.
5. **`app.test.js`**: End-to-end REST API integration tests for status codes, headers, and validation error handling.

---

## 6. Security Measures Taken

- **Zero Hardcoded Secrets**: All API credentials reside in `.env` (excluded by `.gitignore`).
- **Strict `.gitignore`**: Excludes `node_modules`, `.env`, build artifacts (`dist/`), logs, and caches to keep repository size under 10MB.
- **XSS Prevention**: User inputs are stripped of HTML tags via regex sanitization prior to rendering or LLM processing. No `dangerouslySetInnerHTML` is used.
- **Payload & Input Limits**: Express body parser is capped at `50kb`, and input text is strictly validated (incident reports max 500 chars, translations max 250 chars).
- **In-Memory Rate Limiting**: LLM service enforces a maximum request cap per minute window to prevent API abuse or unexpected cost blowup.
- **Safe Code Execution**: Zero usage of `eval()`, `exec()`, or dangerous dynamic shell execution patterns.

---

## 7. Accessibility Features Implemented

- **Semantic HTML5**: Full usage of `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, and `<footer>` elements.
- **Keyboard Navigation**: High-contrast, custom 3px focus rings (`*:focus-visible`) ensure clear visual indicator states during keyboard navigation (`Tab` / `Shift+Tab`).
- **Screen Reader Support**:
  - ARIA Live Regions (`aria-live="polite"`) announce new incoming incident alerts and clipboard copying events without stealing screen reader focus.
  - Distinct `<label>` elements linked via `htmlFor` to all form controls.
- **Color Contrast & Dark Theme**: High-contrast text palettes (slate-100 on slate-950) meeting WCAG AA standards.
- **Skip-to-Content Link**: Hidden link rendered at the top of the DOM for screen reader and keyboard users to bypass header navigation.

---

## 8. Assumptions Made

1. **Mock Gate Occupancy Sensors**: Simulated real-time sensor streams via JSON data with background interval fluctuations (-3% to +3%) to emulate physical turnstile telemetry.
2. **Match Phase Workflow**: Assumed standard stadium match progression phases (`pre-match`, `live`, `halftime`, `post-match`).
3. **Session Cache Scope**: In-memory caching for LLM requests is stored per backend instance lifecycle.

---

## 9. Known Limitations & Future Roadmap

- **Known Limitations**:
  - LLM response cache is stored in memory and resets on backend restart (a production deployment would use Redis).
  - Gate positions are displayed in a clean responsive status card list rather than a full 3D WebGL stadium CAD map.
- **Future Enhancements with More Time**:
  - Integration with WebSockets for instant push updates across thousands of connected volunteer devices.
  - Audio text-to-speech output for multilingual translations so volunteers can play spoken phrases to international fans.
  - Offline ServiceWorker PWA support for zero-connectivity situations inside thick concrete stadium tunnels.
