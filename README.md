# PrimeSoul AI — Marketing & Sales Operating System

> **Production-grade, multi-agent AI Operating System engineered specifically for PrimeSoul Web Solutions.**

PrimeSoul AI functions as a centralized internal AI department that coordinates lead research, digital footprint analysis, signal-based cold outreach, discovery call coaching (SPIN & Gap Selling), deal strategy (8-point MEDDPICC), 3-Act persuasive proposal generation, technical & local SEO audits, and multi-platform content creation.

---

## 🏗 Architecture & Core Components

```
                                  ┌────────────────────────┐
                                  │      PRIMESOUL AI      │
                                  │    (Web UI + REST)     │
                                  └───────────┬────────────┘
                                              │
                                  ┌───────────▼────────────┐
                                  │   PrimeSoul Manager    │
                                  │  (Central Orchestrator)│
                                  └───────────┬────────────┘
                                              │
                 ┌────────────────────────────┼────────────────────────────┐
                 │                            │                            │
        ┌────────▼────────┐          ┌────────▼────────┐          ┌────────▼────────┐
        │  Research Div.  │          │   Sales Div.    │          │ Marketing Div.  │
        ├─────────────────┤          ├─────────────────┤          ├─────────────────┤
        │ Lead Researcher │          │ Outbound Sales  │          │ Growth Strateg  │
        │ SEO / Local SEO │          │ Discovery Coach │          │ Content & Social│
        │                 │          │ Deal Strategist │          │                 │
        │                 │          │ Proposal Agent  │          │                 │
        └────────┬────────┘          └────────┬────────┘          └────────┬────────┘
                 │                            │                            │
                 └────────────────────────────┼────────────────────────────┘
                                              │
                       ┌──────────────────────┼──────────────────────┐
                       │                      │                      │
              ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
              │ Knowledge Base  │    │ Human Approval  │    │ Modular Tools   │
              │  (12 MD Docs)   │    │  (State Gate)   │    │ (Web/SEO/CRM)   │
              └─────────────────┘    └─────────────────┘    └─────────────────┘
                                              │
                                     ┌────────▼────────┐
                                     │ Memory & SQLite │
                                     │  (State/Logs)   │
                                     └─────────────────┘
```

---

## 🤖 The 9 Specialized AI Agents

1. **PrimeSoul Manager** (`primesoul_manager`): Central brain analyzing business intent, task decomposition, agent routing, and quality gatekeeping.
2. **Lead Researcher** (`lead_researcher`): Audits target websites, Core Web Vitals (LCP > 2.5s), CMS stacks, and Google Business Profile local 3-pack gaps.
3. **Growth Strategist** (`growth_strategist`): Architects grand-slam offers using the Hormozi Value Equation and designs diagnostic lead magnets (Solve / Educate / Sample).
4. **Content & Social Agent** (`content_social`): Creates multi-platform content suites (LinkedIn thought leadership, Instagram carousels, WhatsApp updates).
5. **SEO & Local SEO Agent** (`seo_local`): Executes technical audits, local 3-pack rank roadmaps, keyword clusters, and pre-GSC cannibalization checks.
6. **Outbound Sales Agent** (`outbound_sales`): Crafts signal-based 8–10 touch cold outreach sequences across Email and WhatsApp.
7. **Discovery Agent** (`discovery`): Coaches sales calls using SPIN Selling, Gap Selling, Sandler 3-level pain funnels, and AECR objection handling.
8. **Deal Strategist** (`deal_strategist`): Scores B2B opportunities against the 8-point MEDDPICC framework and creates competitive battlecards.
9. **Proposal Agent** (`proposal`): Architects 3-Act persuasive proposals (Understanding The Challenge → The Solution Journey → The Transformed State) and Win Theme matrices.

---

## 📚 Centralized Knowledge Layer (`knowledge/`)

Agents reference structured, verifiable business context from centralized markdown documents:
- `company.md`: Identity, mission, and technical capabilities.
- `services.md`: 12+ approved digital services catalog.
- `products.md`: Proprietary platforms including PrimeOMS SaaS.
- `pricing.md`: Standard pricing models, tiers, and retainer guides.
- `portfolio.md`: Verified case study structures.
- `target-customers.md`: ICPs for local SMBs, D2C brands, and B2B enterprises.
- `industries.md`: High-leverage verticals (Healthcare, Real Estate, E-Commerce, Professional Services, Hospitality).
- `brand-voice.md`: Tone, style, and messaging guidelines.
- `sales-playbook.md`: Outbound cadence, SPIN call architecture, MEDDPICC criteria.
- `marketing-playbook.md`: Growth frameworks, lead magnet typologies, Core Four acquisition.
- `proposal-guidelines.md`: 3-Act proposal narrative standards.
- `business-rules.md`: Zero-hallucination rules, Fact vs Assumption tagging, and human approval mandates.

---

## 🔒 Human-in-the-Loop Approval Gateway

To prevent unauthorized external actions or hallucinated promises:
- Outbound cold emails, WhatsApp messages, proposals, and public social posts pause in a stateful `WAITING_APPROVAL` gate.
- The **Approval Center** in the UI allows 1-click **Approve**, **Revise inline**, or **Reject**.
- Approving an item automatically resumes paused workflow state machines.

---

## 💰 ₹0 Development / AI Provider Architecture

PrimeSoul AI includes a universal provider abstraction layer:
- **₹0 Offline Mock Provider** *(Default)*: Deterministic, domain-accurate heuristic engine requiring zero external API keys.
- **Google Gemini API**: Free tier inference using standard `GEMINI_API_KEY`.
- **Local Ollama**: Local open-source model execution (Llama 3, Mistral, Qwen) via `http://localhost:11434`.
- Change providers anytime via UI Settings or `.env` without rewriting any business logic.

---

## 🚀 Getting Started

### 1. Installation
```bash
cd primesoul-ai
npm install
```

### 2. Running the Full-Stack Application
Start the backend server and frontend concurrently:
```bash
# Start backend API (Port 3001)
npm run dev

# In another terminal (or development mode), start Vite frontend (Port 5173)
npm run dev:client
```

Open `http://localhost:5173` (or `http://localhost:3001` once built).

### 3. Running Automated Tests
```bash
npm test
```
All unit and integration tests verify agent routing, workflow state transitions, approval gates, knowledge injection, and lead scoring.

---

## 📊 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/agents` | `GET` | List all 9 specialized agents and metadata |
| `/api/agents/:id/execute` | `POST` | Execute a standalone agent task |
| `/api/workflows` | `GET` | List all workflow pipeline definitions |
| `/api/workflows/start` | `POST` | Launch a multi-agent workflow |
| `/api/workflows/instances` | `GET` | List running and completed workflow instances |
| `/api/leads` | `GET`, `POST` | Read / Create / Filter CRM leads |
| `/api/approvals` | `GET` | Get pending human approval tickets |
| `/api/approvals/:id/action` | `POST` | Approve, Revise, or Reject an action item |
| `/api/knowledge` | `GET` | List all knowledge documents |
| `/api/knowledge/:slug` | `GET`, `POST` | View or edit knowledge base documents |
| `/api/tools/web-analyze` | `POST` | Audit website speed and tech stack |
| `/api/settings` | `GET`, `POST` | Toggle AI Provider (Mock, Gemini, Ollama) |
| `/api/logs` | `GET` | Real-time observability event stream |

---

## 🛡 Security & Observability
- Untrusted web inputs are sanitized.
- No hardcoded secrets or committed API keys.
- Full execution telemetry with timestamps, durations, agent IDs, and token metadata recorded in structured logs.
