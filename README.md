# PrimeSoul Growth Engine & AI Operating System — V1 Foundation

> **Internal + Customer-Facing Inbound Growth Platform for PrimeSoul Web Solutions and PrimeOMS.**
> *Core Engineering Philosophy: "First make it work. Then make it beautiful."*

---

## 🎯 Purpose & Business Context

PrimeSoul Web Solutions provides digital services (Websites, Google Business Profile, Local SEO, Meta/Google Ads, WhatsApp Setup, Branding) and PrimeOMS (Restaurant QR Digital Menus, Table Ordering, Kitchen Order Management, Loyalty, Digital Receipts, Analytics).

The PrimeSoul Growth Engine replaces cold door-to-door sales with a **self-serve, value-first inbound acquisition flywheel**:

```
TRAFFIC 
  ↓
FREE VALUE (Free Website Health Audit / Free QR Digital Menu)
  ↓
PROBLEM DISCOVERY (Deterministic 0–100 Digital Health Score / Live Menu Preview)
  ↓
LEAD CAPTURE & QUALIFICATION (Inquiry Form / Restaurant Onboarding)
  ↓
DETERMINISTIC LEAD SCORING (HOT / WARM / COOL / COLD Tiers)
  ↓
INTERNAL CRM & OPERATIONS (Status Updates, Chronological Notes, Follow-up Tracking)
  ↓
PRIMEOMS / SERVICE CONVERSION & REFERRALS (30-Day Attributed Referral Links)
```

---

## 📦 V1 Foundation Architecture & Modules

### 🌐 Public Customer-Facing Modules

1. **PrimeSoul Marketing Website (`/`)**
   - Value Proposition: *"Build Your Digital Presence. Get More Customers."*
   - Positioning: **Get Online** (Websites, GBP, WhatsApp), **Get Customers** (SEO, Ads, Landing Pages), **Automate** (PrimeOMS, CRM, Workflows).
   - Niche Landing Pages:
     - `/for-restaurants`: Restaurant ordering, QR menus, kitchen workflow.
     - `/for-schools`: School admission journey and parent enquiry capture.
     - `/for-local-businesses`: Clinics, salons, gyms, retail, and real estate.
   - Legal Pages: `/privacy` and `/terms`.

2. **Free Business Digital Audit (`/audit` & `/audit/result/:id`)**
   - **Zero Friction**: Enter business name, category, city, and website to get an immediate assessment.
   - **Deterministic 0–100 Digital Health Score** (No slow or hallucinated AI required).
   - **SSRF Protection**: Hardened validator blocking localhost, loopback (`127.0.0.0/8`), private RFC1918 subnets (`10.x`, `172.16-31.x`, `192.168.x`), cloud metadata (`169.254.169.254`), and non-HTTP(S) protocols.
   - Actionable Breakdown: *What's Working*, *Needs Attention*, *Opportunities*, and *Recommended Actions*.
   - Consultation CTA: 1-click lead capture and pre-filled WhatsApp inquiry link.

3. **Free Restaurant QR Digital Menu (`/qr-menu` & `/qr-menu/:slug`)**
   - Fast restaurant registration with automated URL-safe slug generation and collision avoidance.
   - Interactive Menu Editor: categories, menu items, INR (`₹`) prices, descriptions, and veg/non-veg tags.
   - High-reliability SVG QR code generator with 1-click download/print.
   - **Mobile-First Public Menu View**: Clean, lightning-fast digital menu accessible without login.
   - Natural PrimeOMS upsell: *"Want customers to order directly from the table? Explore PrimeOMS."*

4. **Referral Program Foundation (`/r/:code`)**
   - 30-day attribution tracking stored in localStorage/cookies.
   - Auto-generated referral codes (e.g. `RAHUL10`, `PRIME10`).
   - Seamless redirection to Free Audit or Free QR Menu with attributed source tracking.

---

### 💼 Internal Operations & CRM (`/dashboard`)

1. **Growth Overview Dashboard**
   - Live metrics: Total Inbound Leads, Hot Leads (`HOT` 80–100), Demos Scheduled, Deals Won, Active Audits, Deployed QR Menus, and Active Referrals.
2. **Inbound Leads CRM (`/dashboard/leads`)**
   - Multi-field search (Business, Contact, Phone, Email, Website).
   - Dynamic filters: Status (`NEW`, `QUALIFIED`, `CONTACTED`, `DEMO`, `PROPOSAL`, `WON`, `LOST`), Temperature (`HOT`, `WARM`, `COOL`, `COLD`), Category, Source (`AUDIT`, `QR_MENU`, `REFERRAL`, `WEBSITE`).
   - Lead Detail Drawer: complete business profile, requirement, timeline, audit summary, status switcher, and chronological team notes feed.
3. **Business Audits Manager (`/dashboard/audits`)**
   - Searchable directory of all generated digital audits with full report inspect modal.
4. **Restaurant QR Menus Manager (`/dashboard/menus`)**
   - View, edit, launch public menu, or download high-resolution QR codes.
5. **Customer Referrals Manager (`/dashboard/referrals`)**
   - Create and track referral codes, clicks, qualified leads, and rewards.

---

### 🤖 Specialist AI Department & Automation Hub

- **9 Autonomous AI Agents**: PrimeSoul Manager, Lead Researcher, Growth Strategist, Content & Social Agent, SEO & Local SEO Agent, Outbound Sales Agent, Discovery Coach, Deal Strategist, and Proposal Agent.
- **Stateful Workflow Engine**: Lead qualification, diagnostic lead magnet generation, multi-channel outreach sequence builder, proposal drafting.
- **Human-in-the-Loop Approval Queue**: Enforces stateful pauses on outbound emails, WhatsApp messages, and proposals.
- **Zero-Hallucination Grounding**: All generated outputs are grounded in verifiable research facts and central knowledge docs (`knowledge/`).
- **AI Provider Switcher**: ₹0 Offline Mock Engine (default), Google Gemini API, or Local Ollama.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Lucide Icons, Vanilla CSS Design Tokens (Responsive, Mobile-First, Indian Business Friendly).
- **Backend & APIs**: Node.js / Express Server + Vercel Serverless Functions (`/api/*`).
- **Validation & Security**: Deterministic scoring algorithms, URL-safe slug generators, SSRF protection filters, prompt boundary detectors.
- **Database**: Local JSON persistence + Supabase / PostgreSQL schema compatibility.
- **Testing**: Vitest test suite with 68 automated unit and integration tests.

---

## 🚀 Local Development Setup

### 1. Installation
```bash
cd primesoul-ai
npm install
```

### 2. Run the Full Application
```bash
# Start backend Express server (Port 3001)
npm run dev

# In a second terminal, start Vite client dev server (Port 5173)
npm run dev:client
```
Visit `http://localhost:5173` to test the public customer-facing website, or click **Explore PrimeSoul CRM** / navigate to `/dashboard` to access the internal CRM.

### 3. Run Automated Tests
```bash
npm test
```
All 68 tests across 11 test suites run in under 7 seconds.

### 4. Build for Production
```bash
npm run build
```

---

## ⚙️ Environment Variables (`.env.example`)

```env
# AI Provider Configuration
AI_PROVIDER=mock
GEMINI_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3:8b

# PrimeSoul Brand & Contact Configuration
PORT=3001
NEXT_PUBLIC_PRIMESOUL_URL=https://primesoul.in
NEXT_PUBLIC_PRIMEOMS_URL=https://primeoms.com
PRIMESOUL_WHATSAPP_NUMBER=919876543210
PRIMESOUL_EMAIL=hello@primesoul.in

# Supabase Configuration (Optional for Cloud DB)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 📄 Key File Structure

```
primesoul-ai/
├── api/                             # Built serverless endpoints
├── src/
│   ├── api/                         # Serverless endpoint handlers
│   │   ├── audit.ts                 # Audit execution & retrieval
│   │   ├── config.ts                # Site settings & WhatsApp links
│   │   ├── events.ts                # Analytics event logger & stats
│   │   ├── leads.ts                 # Lead CRM CRUD, status, and notes
│   │   ├── menus.ts                 # Restaurant QR menu creation & items
│   │   └── referrals.ts             # Referral codes & click tracking
│   ├── client/
│   │   ├── components/
│   │   │   ├── Growth/              # Customer-Facing & CRM Growth Engine UI
│   │   │   │   ├── AuditPage.tsx
│   │   │   │   ├── AuditResultView.tsx
│   │   │   │   ├── AuditsManagerView.tsx
│   │   │   │   ├── GrowthLeadsView.tsx
│   │   │   │   ├── GrowthOverview.tsx
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── LegalPage.tsx
│   │   │   │   ├── LocalBusinessLandingPage.tsx
│   │   │   │   ├── PublicFooter.tsx
│   │   │   │   ├── PublicMenuView.tsx
│   │   │   │   ├── PublicNavbar.tsx
│   │   │   │   ├── QrMenuLandingPage.tsx
│   │   │   │   ├── QrMenusManagerView.tsx
│   │   │   │   ├── ReferralLandingPage.tsx
│   │   │   │   ├── ReferralsManagerView.tsx
│   │   │   │   ├── RestaurantLandingPage.tsx
│   │   │   │   └── SchoolLandingPage.tsx
│   │   │   ├── Layout/              # Sidebar & Header with mode toggles
│   │   │   └── ...                  # Workflows, Approvals, Proposals, etc.
│   │   ├── services/
│   │   │   └── api.service.ts       # Central frontend API client
│   │   ├── styles/
│   │   │   ├── design-tokens.css    # Colors, fonts, elevations
│   │   │   └── global.css           # Layouts, buttons, badges, dials
│   │   └── App.tsx                  # Dual router (Public Site ↔ Internal CRM)
│   ├── core/
│   │   ├── database/                # Persistence & seed data
│   │   ├── growth/                  # Audit, Scoring, QR, and Referral engines
│   │   └── types/                   # TypeScript interfaces & enums
│   └── server/
│       └── app.ts                   # Express server mounting API routes
└── tests/
    └── growth-engine.test.ts        # Comprehensive Growth Engine test suite
```

---

## 📈 Definition of Done Verified

- [x] **Audit Flow**: Visitor enters business name & URL → deterministic health score calculated → actionable result page displayed → consultation inquiry submitted → lead captured & scored in CRM.
- [x] **Restaurant Flow**: Restaurant creates digital menu → categories and items added with INR pricing → SVG QR code generated & downloadable → mobile-first public menu rendered → PrimeOMS demo CTA captures lead.
- [x] **Referral Flow**: Customer referral code generated → visitor visits `/r/:code` → click event tracked & attribution stored in cookie/localStorage → lead captures referrer code.
- [x] **Internal CRM**: Team can filter/search leads, update status, add chronological notes, view audits, and manage restaurant QR menus.
