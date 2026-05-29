# ScamRadar X 🛡️ — Hackathon Free-Tier MVP

ScamRadar X is a production-ready, full-stack AI-powered scam detection platform and threat intelligence database. It runs on a lightweight, zero-dependency, free-tier stack ideal for rapid hackathon deployment and high-fidelity protection against emails, SMS, WhatsApp, phishing URLs, and voice recordings.

---

## 🌟 Key Features

1. **AI Message Threat Analyzer**: Pasted text (emails, SMS, WhatsApp) is parsed with Google Gemini 2.5 Flash, extracting threat scores, confidence metrics, red flags, and suggestions. Falls back to a local Regex Heuristics engine if Gemini is offline/unconfigured.
2. **AI Domain & URL Scanner**: Inspects active SSL security layers, TLD threat risks, brand typosquatting attempts, and domain ages using heuristic evaluation.
3. **Voice Note Scam Scanner**: Cloud speech-to-text pipeline using AssemblyAI Cloud APIs to transcribe uploaded MP3, WAV, or M4A audio. The resulting script is audited via the Gemini core. Supports sandbox audio presets to simulate calls immediately.
4. **Reputation Search**: Live search queries inside reported phone logs, Web3 wallets, and domain blacklists.
5. **Community Reporting Hub**: Form submission logs threat targets directly to Supabase/PostgreSQL.
6. **Threat Intelligence Telemetry**: SVG dials and interactive telemetry metrics graphs powered by Recharts.
7. **Web3 Polygon Amoy Sandbox**: Prepared client integration blocks allowing Metamask connectivity mock simulations.

---

## 📂 Architecture Layout

```text
lnctHackathon/
├── README.md                  # Project startup guide
├── database/
│   └── schema.sql             # Reference SQL database setup structure
├── backend/
│   ├── main.py                # FastAPI core router
│   ├── config.py              # Environment settings and fallback configurations
│   ├── database.py            # SQLAlchemy drivers pool
│   ├── models.py              # Database models mapping
│   ├── schemas.py             # Request/Response schemas
│   ├── services/
│   │   ├── gemini.py          # Gemini AI API client wrapper
│   │   ├── whisper.py         # AssemblyAI transcribing wrapper
│   │   ├── url_intel.py       # Domain evaluation heuristics
│   │   └── scam_rules.py      # Rule-based fallback engine
│   └── requirements.txt       # Python manifests
└── frontend/                  # React Vite Client
    ├── tailwind.config.js     # System tokens map
    ├── src/
        ├── App.tsx            # Navigation coordinator
        ├── api.ts             # Fetch communications layer
        ├── components/        # Custom styled UI units (RiskScore SVG circle)
        └── pages/             # Layout panels (Overview, scanners, analytics, search)
```

---

## 🚀 Quick Start Guide (Local Execution)

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)

---

### 2. Backend Setup (FastAPI)

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment and activate it:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your `.env` configuration file from the template:
   ```bash
   copy .env.example .env   # Windows
   cp .env.example .env     # macOS/Linux
   ```

5. **API Keys Configuration (Optional but Recommended)**:
   - Edit the new `.env` file and insert your `GEMINI_API_KEY` (Free Tier) and `ASSEMBLYAI_API_KEY` (Free Tier).
   - *Note*: If you leave them blank, **ScamRadar X** automatically falls back to its robust regular-expression heuristics analyzer and mock audio presets so the entire platform is instantly functional without API tokens!
   - *Database*: By default, `DATABASE_URL` is omitted, which triggers the backend to create and seed a local SQLite database (`scamradar.db`) automatically at startup. You can drop in your Supabase connection string to go live!

6. Fire up the backend development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *Your backend API will now be running at `http://localhost:8000`. You can inspect the Swagger documentation at `http://localhost:8000/docs`.*

---

### 3. Frontend Setup (React + Vite)

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the frontend dependencies (Node modules):
   ```bash
   npm install
   ```

3. Fire up the Vite development server:
   ```bash
   npm run dev
   ```
   *The client dashboard will launch at `http://localhost:5173`. Open this URL in your web browser to access ScamRadar X!*

---

## 🛡️ Telemetry & System Verifications

### Rule-Based Fallback Assertions
If no `GEMINI_API_KEY` is set inside the backend `.env` file, the message analyzer uses regular-expression rules to look for credential requests, banking terms, urgency signals, job commissions, and guaranteed crypto giveaways. Try scanning these texts to test:
- *"Immediate action required: Chase security noticed suspicious access. Reply with your OTP code to avoid account suspension."*
- *"Earn $500/day by doing home tasks over Telegram reviews! No work experience needed. Message us now."*

### Audio Presets Simulation
On the **Audio Scanner** tab, you can click on any of the interactive preset panels (OTP Robocall, Double Crypto, Task Offer) which generates simulated binary voice note file-transfers to verify the transcription and threat detection flow.

---

## 🏗️ Polygon Amoy Web3 Architecture Preparation

To view the mock blockchain wallet payout capabilities:
1. Navigate to the top header on any dashboard subpage.
2. Click **Connect Amoy Wallet**.
3. It will simulate a Web3 metamask connection, logging the mock account coordinates (`0x71C7...476B`) to showcase how contributors can receive Polygon rewards in upcoming iterations.
