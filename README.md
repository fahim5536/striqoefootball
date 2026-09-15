<div align="center">

# ⚽ STRIQO eFootball™
### *Next-Gen Autonomous Esports Tournament Platform*

<p align="center">
  <b>Built for competitive eFootball communities • Automated brackets • Gemini AI score extraction • Instant multiplayer lobbies</b>
</p>

<!-- Primary Status Badges -->
<p align="center">
  <a href="https://github.com/fahim5536/striqoefootball/actions">
    <img src="https://img.shields.io/badge/Build-Passing-00E5FF?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=090d16" alt="Build Status" />
  </a>
  <a href="https://striqoefootball.onrender.com">
    <img src="https://img.shields.io/badge/Deployment-Live%20on%20Render-46E3B7?style=for-the-badge&logo=render&logoColor=white&labelColor=090d16" alt="Live Demo" />
  </a>
  <a href="https://github.com/fahim5536/striqoefootball/releases">
    <img src="https://img.shields.io/badge/Version-2.0.0_Golden-7928CA?style=for-the-badge&logo=semver&logoColor=white&labelColor=090d16" alt="Version 2.0.0" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-F5A623?style=for-the-badge&logo=open-source-initiative&logoColor=white&labelColor=090d16" alt="License MIT" />
  </a>
  <a href="https://github.com/fahim5536/striqoefootball/pulls">
    <img src="https://img.shields.io/badge/PRs-Welcome-22C55E?style=for-the-badge&logo=git&logoColor=white&labelColor=090d16" alt="PRs Welcome" />
  </a>
</p>

<!-- Tech Stack Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=0d1117" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=0d1117" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black&labelColor=0d1117" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=0d1117" alt="Vite" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white&labelColor=0d1117" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=0d1117" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socketdotio&logoColor=white&labelColor=0d1117" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Google_Gemini-Vision_AI-FF6F00?style=for-the-badge&logo=google&logoColor=white&labelColor=0d1117" alt="Gemini AI" />
</p>

---

### 🌐 [Live Production App](https://striqoefootball.onrender.com) • 📡 [API Health Check](https://striqoefootball.onrender.com/api/health) • 🐛 [Report Issues](https://github.com/fahim5536/striqoefootball/issues)

---

</div>

## 📌 Table of Contents

- [Executive Summary](#-executive-summary)
- [System Architecture](#-system-architecture)
- [Feature Matrix](#-feature-matrix)
- [Interactive Quick Start](#-interactive-quick-start)
- [Environment Configuration](#-environment-configuration)
- [API & Health Check Reference](#-api--health-check-reference)
- [Cloud Deployment](#-cloud-deployment)
- [License & Contributions](#-license--contributions)

---

## ⚡ Executive Summary

**STRIQO eFootball** is a tournament management infrastructure created for esports leagues, creators, and gaming organizations. It eliminates up to 95% of tournament administrative friction by combining:

1. **Automated Bracket Orchestration**: Single & double-elimination, Swiss format, and round-robin structures with automatic byes and progression.
2. **Multimodal Gemini Vision OCR**: Players take a snapshot of their mobile or console match completion screen; Google Gemini Flash extracts scores, user tags, and penalties in sub-second latency.
3. **Low-Latency Multiplexing**: Distributed Socket.IO broadcasting ensures live matches, coin tosses, and dispute notifications sync instantly without refreshing.

---

## 🔮 System Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ CLIENT TIER (Progressive Web App)"]
        UI["React 18 + Vite 6 UI"]
        SW["Service Worker (Offline Cache)"]
        SC["Socket.IO Client (Live Updates)"]
    end

    subgraph Gateway["🛡️ SECURITY & GATEWAY TIER"]
        RP["Reverse Proxy / SSL (Render / NGINX)"]
        SEC["Helmet + Rate Limiter + XSS Sanitizer"]
        STATIC["Static Asset & Dynamic SPA Routing"]
    end

    subgraph Backend["⚙️ APPLICATION BACKEND (Node.js + Express)"]
        API["REST API Controllers"]
        AUTH["JWT Authentication & RBAC Guards"]
        SOCK["Socket.IO Server (Rooms & Events)"]
        JOBS["Automated Match Timer & Cleanup Jobs"]
    end

    subgraph AI["🧠 ARTIFICIAL INTELLIGENCE TIER"]
        GEMINI["Google Gemini 2.5 Flash Vision"]
        OCR["Multimodal Score & Gamertag OCR"]
        SUMM["Editorial Match Recap Generator"]
    end

    subgraph Data["💾 PERSISTENCE & CACHING TIER"]
        PRISMA["Prisma ORM Client"]
        PG[("PostgreSQL Database")]
        REDIS[("Upstash Redis REST Cache")]
        CDN[("Cloudinary Media CDN")]
    end

    UI <--> |HTTPS / REST| RP
    SC <--> |WSS / Realtime| RP
    RP --> SEC --> STATIC --> API
    API --> AUTH
    API <--> SOCK
    API --> JOBS
    
    API <--> |Multimodal Prompts| GEMINI
    GEMINI --> OCR & SUMM

    API <--> PRISMA <--> PG
    API <--> REDIS
    API <--> CDN

    classDef client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef gateway fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
    classDef backend fill:#022c22,stroke:#34d399,stroke-width:2px,color:#f8fafc;
    classDef ai fill:#451a03,stroke:#fb923c,stroke-width:2px,color:#f8fafc;
    classDef data fill:#18181b,stroke:#a1a1aa,stroke-width:2px,color:#f8fafc;

    class UI,SW,SC client;
    class RP,SEC,STATIC gateway;
    class API,AUTH,SOCK,JOBS backend;
    class GEMINI,OCR,SUMM ai;
    class PRISMA,PG,REDIS,CDN data;
```

---

## 💎 Feature Matrix

<table>
<tr>
<td width="50%" valign="top">

### ⚡ Real-Time Engine
> **Low-latency live state synchronization across brackets, chats, and matches.**
- 🔄 **Live Bracket Progression**: Automatic node resolution on match conclusion.
- 💬 **Match Room Chat**: Ephemeral participant-to-participant messaging with read states.
- 🪙 **Virtual Coin Toss**: Fair, cryptographically balanced side & host allocation.
- 🔔 **Push Notifications**: Real-time reminders when opponent enters lobby.

</td>
<td width="50%" valign="top">

### 🤖 Gemini AI Integration
> **Computer vision and multimodal analysis powering fraud-free tournaments.**
- 📸 **Instant Screenshot OCR**: Automatic extraction of Home/Away scorelines and stats.
- ⚖️ **Dispute Auto-Referee**: Detects mismatched claim uploads and alerts staff.
- 📝 **Editorial Match Summaries**: Auto-generated recaps spotlighting clutch moments.
- 🏷️ **Gamertag Verification**: Validates player in-game names against registration.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🛡️ Enterprise Security Perimeter
> **Multi-tiered protection against brute-force, injection, and unauthorized data access.**
- 🔒 **Defense in Depth**: Strict XSS filters, HTTP Parameter Pollution (HPP) defense.
- ⏱️ **Tiered Rate Limiting**: Independent thresholds for Auth, AI, and Public APIs.
- 🔑 **Dual-Token Auth**: Short-lived JWTs (15m) paired with secure Refresh Tokens (30d).
- 📜 **Security Audit Trail**: Database-backed logging of all administrative actions.

</td>
<td width="50%" valign="top">

### 🏆 Tournament Operations
> **Turnkey management tools designed for high-scale esports leagues.**
- 👥 **Team & Roster Control**: Captain delegations, player invitations, and substitute slots.
- 🥇 **Elo & Global Leaderboard**: Automated rank calculation and seasonal stats.
- 💰 **Prize Pool Distribution**: Automated escrow tracking and coin payouts.
- 📱 **Mobile PWA First**: Installable, fluid viewport scaling across all screen sizes.

</td>
</tr>
</table>

---

## 🚀 Interactive Quick Start

### 1. Prerequisites Check
Ensure you have installed:
- **Node.js**: `>= 18.0.0`
- **PostgreSQL**: `>= 14.0` (or Neon / Supabase connection URL)
- **Redis**: Local or Upstash Redis REST token

### 2. Installation & Database Sync
```bash
# Clone the repository
git clone https://github.com/fahim5536/striqoefootball.git
cd striqoefootball

# Install dependencies
npm install

# Push database schema to PostgreSQL via Prisma
npx prisma db push
```

### 3. Launch Development Server
```bash
# Starts both Vite client and backend API on port 3000
npm run dev
```

Visit [`http://localhost:3000`](http://localhost:3000) in your browser.

---

## 🔑 Environment Configuration

Create a `.env` file in the root directory:

```env
# =================================================================
# ⚽ STRIQO eFootball - Environment Configuration Template
# =================================================================

# --- Application Server ---
APP_NAME="STRIQO eFootball"
NODE_ENV="development"
PORT="3000"
CLIENT_URL="http://localhost:3000"
TZ="Asia/Dhaka"

# --- PostgreSQL & Prisma Connection ---
DATABASE_URL=""
DIRECT_URL=""

# --- Upstash Redis REST ---
UPSTASH_REDIS_REST_URL="https://your-upstash-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"

# --- Security & JWT Authentication ---
JWT_SECRET="super-secret-jwt-signing-key-32-chars-minimum"
JWT_REFRESH_SECRET="super-secret-refresh-signing-key-32-chars-minimum"
COOKIE_SECRET="super-secret-cookie-signing-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"
BCRYPT_ROUNDS="12"

# --- Artificial Intelligence (Google Gemini) ---
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
GOOGLE_VISION_API_KEY="AIzaSyYourGoogleVisionKeyHere"

# --- Cloudinary Media Engine ---
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
CLOUDINARY_URL="cloudinary://key:secret@cloud-name"

# --- Observability & Sentry ---
SENTRY_DSN="https://example@sentry.io/123456"
LOG_LEVEL="debug"
```

---

## 📡 API & Health Check Reference

All backend endpoints are scoped under `/api` and protected by CORS and Rate Limiting.

```
GET /api/health
```
```json
{
  "status": "ok",
  "timestamp": "2026-09-15T15:00:00.000Z",
  "uptime": 1420,
  "environment": "production"
}
```

### Core Endpoints Summary

| Method | Route | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Service uptime and readiness verification | Public |
| `POST` | `/api/auth/register` | Create player profile & assign unique ID | Public |
| `POST` | `/api/auth/login` | Authenticate credentials & return JWT | Public |
| `GET` | `/api/tournaments` | Query all scheduled, active & past tournaments | Public |
| `POST` | `/api/tournaments/:id/join` | Register squad or solo player into bracket | User |
| `POST` | `/api/matches/:id/submit-score`| Submit manual score or dispute claim | Participant |
| `POST` | `/api/matches/:id/verify-ocr` | Analyze match screenshot using Gemini AI | Participant |
| `GET` | `/api/admin/metrics` | Retrieve platform throughput & active users | Admin |

---

## ☁️ Cloud Deployment

The repository is built for native deployment to **Render**, **Railway**, or **Docker** containers.

```bash
# 1. Build Client & Backend Bundle
npm run build

# 2. Production Start Command
npm run start
# Executes: node dist/server.cjs
```

### Render Deployment Configuration
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm run start`
- **Health Check Path**: `/api/health`

---

## 📄 License & Community

This project is licensed under the **MIT License**. See the [`LICENSE`](./LICENSE) file for details.

<div align="center">

**Built with ❤️ for the global eFootball esports community.**

[⭐ Star on GitHub](https://github.com/fahim5536/striqoefootball) • [💬 Join Community](https://striqoefootball.onrender.com)

</div>
