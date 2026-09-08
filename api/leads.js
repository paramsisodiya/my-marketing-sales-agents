// src/core/database/db.service.ts
import fs from "fs";
import path from "path";

// src/core/database/seed.data.ts
var SEED_LEADS = [
  {
    id: "lead-001",
    businessName: "Apex Dental Care & Implant Center",
    industry: "Healthcare",
    location: "Indore, MP, India",
    website: "https://apexdentalcare-sample.in",
    contactName: "Dr. Rajesh Sharma",
    email: "dr.sharma@apexdentalcare.in",
    phone: "+91 98260 12345",
    socialProfiles: {
      instagram: "instagram.com/apexdentalcare_indore",
      facebook: "facebook.com/apexdentalcare"
    },
    source: "Local Map Search Audit",
    leadScore: 82,
    qualificationStatus: "QUALIFIED",
    digitalPresenceScore: 42,
    painPoints: [
      "Mobile load time is 4.1s on WordPress/Elementor",
      "Google Business Profile is unverified with only 4 reviews",
      "No online WhatsApp appointment scheduling",
      "Losing local search visibility to newly opened dental clinic 1km away"
    ],
    opportunities: [
      "High conversion potential with Local 3-Pack SEO sprint",
      "Direct WhatsApp booking widget will capture after-hours inquiries",
      "Custom sub-second mobile landing page"
    ],
    recommendedServices: [
      "Website Design & Development",
      "Google Business Profile & Local SEO",
      "WhatsApp Business Setup"
    ],
    outreachStatus: "DRAFTED",
    notes: "High-intent prospect with 2 active clinic branches. Decision maker is Dr. Sharma.",
    meddpicc: {
      metrics: "Increase monthly booked implants from 8 to 20",
      economicBuyer: "Dr. Rajesh Sharma (Owner)",
      decisionCriteria: "Load speed < 1.5s, top 3 local ranking within 60 days, fixed package pricing",
      decisionProcess: "Initial proposal review -> Partner discussion -> Kickoff",
      paperProcess: "Standard agreement, 50% advance",
      identifyPain: "Estimated \u20B91.5L lost monthly revenue from mobile bounce",
      champion: "Clinic Manager (Pooja)",
      competition: "Freelancer web designer + Status Quo",
      totalScore: 31
    },
    createdAt: new Date(Date.now() - 3 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "lead-002",
    businessName: "Vanguard Realty & Luxury Estates",
    industry: "Real Estate",
    location: "Mumbai, MH, India",
    website: "https://vanguardrealty-demo.com",
    contactName: "Vikramaditya Mehta",
    email: "vikram@vanguardrealty.com",
    phone: "+91 98200 54321",
    socialProfiles: {
      linkedin: "linkedin.com/company/vanguard-realty-mumbai",
      instagram: "instagram.com/vanguard_realty"
    },
    source: "LinkedIn Executive Signal",
    leadScore: 91,
    qualificationStatus: "QUALIFIED",
    digitalPresenceScore: 58,
    painPoints: [
      "Property portfolio page is heavy with uncompressed images (LCP 5.8s)",
      "High bounce rate on Meta Ads lead forms",
      "Manual follow-ups in Excel spreadsheets leading to delayed lead contact"
    ],
    opportunities: [
      "Deploy PrimeOMS SaaS for automated lead routing and pipeline stages",
      "High-converting landing page with interactive 3D floorplan preview",
      "Google Search Ads for luxury high-intent buyers"
    ],
    recommendedServices: [
      "Landing Pages",
      "Google Ads",
      "Meta Ads",
      "PrimeOMS SaaS Implementation"
    ],
    outreachStatus: "IN_PROGRESS",
    lastContacted: new Date(Date.now() - 1 * 864e5).toISOString(),
    nextFollowUp: new Date(Date.now() + 2 * 864e5).toISOString(),
    notes: "Managing Director interested in improving CPL and integrating CRM pipeline automation.",
    meddpicc: {
      metrics: "Cut cost-per-qualified-buyer-lead by 35%",
      economicBuyer: "Vikramaditya Mehta (Managing Director)",
      decisionCriteria: "Proven real estate conversion architecture, fast deployment (<3 weeks)",
      decisionProcess: "Demo presentation -> Board signoff",
      paperProcess: "Corporate PO and vendor NDA",
      identifyPain: "High ad spend leakage with zero lead attribution",
      champion: "VP Sales (Rohit Verma)",
      competition: "In-house marketing team trying to code internally",
      totalScore: 35
    },
    createdAt: new Date(Date.now() - 7 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "lead-003",
    businessName: "Aura Organic Skincare & Wellness",
    industry: "E-Commerce",
    location: "Bangalore, KA, India",
    website: "https://auraorganics-test.store",
    contactName: "Ananya Sen",
    email: "ananya@auraorganics.in",
    phone: "+91 99000 88776",
    socialProfiles: {
      instagram: "instagram.com/aura_organics_in"
    },
    source: "Meta Ad Teardown Research",
    leadScore: 74,
    qualificationStatus: "RESEARCHED",
    digitalPresenceScore: 50,
    painPoints: [
      "Shopify storefront checkout drop-off rate is 68%",
      "Organic SEO traffic is stagnant due to keyword cannibalization on product categories",
      "No automated WhatsApp cart recovery flows"
    ],
    opportunities: [
      "Conversion Rate Optimization (CRO) on product detail pages",
      "Topic cluster SEO revamp for organic non-branded search",
      "Automated WhatsApp recovery sequences"
    ],
    recommendedServices: [
      "Website Design & Development",
      "SEO",
      "WhatsApp Business Setup"
    ],
    outreachStatus: "NOT_STARTED",
    notes: "D2C founder scaling SKUs, needs organic search and CRO help.",
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var SEED_APPROVALS = [
  {
    id: "appr-101",
    workflowInstanceId: "wf-outbound-apex-1",
    stepId: "step-outbound-craft",
    leadId: "lead-001",
    agentId: "outbound_sales",
    type: "COLD_EMAIL",
    title: "Touch 1 Cold Email: Apex Dental Care",
    summary: "Signal-based cold outreach email addressing 4.1s mobile load speed and missing Google Maps 3-Pack rank.",
    draftContent: `Subject: quick note on your website speed & local map listing

Hi Dr. Rajesh,

Noticed Apex Dental Care is expanding services in Indore, but your mobile website is currently taking 4.1s to load on smartphones, which typically causes 40%+ of local patients to bounce back to Google.

At PrimeSoul Web Solutions, we help medical practices rank in the Google 3-Pack and load in under 1 second to capture high-intent inquiries.

Open to seeing a 2-minute video breakdown of how to fix this?

Best,  
PrimeSoul Web Solutions Team`,
    status: "REVIEW",
    createdAt: new Date(Date.now() - 4 * 36e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "appr-102",
    workflowInstanceId: "wf-proposal-vanguard-2",
    stepId: "step-proposal-draft",
    leadId: "lead-002",
    agentId: "proposal",
    type: "PROPOSAL",
    title: "Client Proposal: Vanguard Realty Digital Growth & PrimeOMS Suite",
    summary: "3-Act Proposal for luxury real estate lead generation, high-speed landing pages, and PrimeOMS CRM deployment.",
    draftContent: `### PrimeSoul Proposal: Vanguard Realty Digital Growth Transformation

#### Act I: Understanding the Challenge
Vanguard Realty manages high-ticket luxury listings in Mumbai. However, heavy imagery (5.8s load time) and Excel-based lead tracking are causing lead response latency and high ad spend leakage.

#### Act II: The Solution Journey
1. **High-Speed Luxury Landing Pages**: Sub-second property pages with mobile WhatsApp CTAs.
2. **Targeted Google Search & Meta Performance Ads**: Capturing high-intent property investors.
3. **PrimeOMS Platform Deployment**: Automated lead routing, agent assignment, and pipeline stages.

#### Act III: Investment & Roadmap
- **Estimated Tier**: Full Growth & SaaS Suite [Estimated Range: \u20B975,000 - \u20B91,20,000 / $1,500 - $2,400]
- **Deployment Timeline**: 3 Weeks from kickoff.`,
    status: "REVIEW",
    createdAt: new Date(Date.now() - 2 * 36e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];

// src/core/database/db.service.ts
var DatabaseService = class _DatabaseService {
  static instance;
  filePath;
  data;
  constructor(customPath) {
    if (customPath) {
      this.filePath = customPath;
    } else if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      this.filePath = path.resolve("/tmp", "primesoul_data.json");
    } else {
      this.filePath = path.resolve(process.cwd(), "primesoul_data.json");
    }
    this.data = this.loadData();
  }
  static getInstance() {
    if (!_DatabaseService.instance) {
      _DatabaseService.instance = new _DatabaseService();
    }
    return _DatabaseService.instance;
  }
  loadData() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (!parsed.researchRuns) parsed.researchRuns = [];
        return parsed;
      } catch (err) {
        console.error("Failed to parse primary primesoul_data.json:", err);
      }
    }
    const rootPath = path.resolve(process.cwd(), "primesoul_data.json");
    if (this.filePath !== rootPath && fs.existsSync(rootPath)) {
      try {
        const raw = fs.readFileSync(rootPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (!parsed.researchRuns) parsed.researchRuns = [];
        this.saveData(parsed);
        return parsed;
      } catch (err) {
        console.error("Failed to parse bundled root primesoul_data.json:", err);
      }
    }
    const defaultData = {
      leads: [...SEED_LEADS],
      workflows: [],
      approvals: [...SEED_APPROVALS],
      researchRuns: [],
      proposals: [],
      contentPosts: [],
      settings: {
        aiProvider: process.env.AI_PROVIDER || "mock",
        geminiApiKey: process.env.GEMINI_API_KEY || "",
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        ollamaModel: process.env.OLLAMA_MODEL || "llama3:8b"
      }
    };
    this.saveData(defaultData);
    return defaultData;
  }
  saveData(data = this.data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.warn("Notice: Could not persist primesoul_data.json to disk (running in-memory):", err);
    }
  }
  // --- Leads CRUD ---
  getLeads(filter) {
    let list = this.data.leads;
    if (!filter) return list;
    if (filter.industry) {
      list = list.filter((l) => l.industry.toLowerCase() === filter.industry?.toLowerCase());
    }
    if (filter.qualificationStatus) {
      list = list.filter((l) => l.qualificationStatus === filter.qualificationStatus);
    }
    if (filter.outreachStatus) {
      list = list.filter((l) => l.outreachStatus === filter.outreachStatus);
    }
    if (filter.minScore !== void 0) {
      list = list.filter((l) => l.leadScore >= filter.minScore);
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      list = list.filter(
        (l) => l.businessName.toLowerCase().includes(q) || l.industry.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.contactName && l.contactName.toLowerCase().includes(q)
      );
    }
    return list;
  }
  getLeadById(id) {
    return this.data.leads.find((l) => l.id === id);
  }
  saveLead(lead) {
    const existingIndex = lead.id ? this.data.leads.findIndex((l) => l.id === lead.id) : -1;
    if (existingIndex >= 0) {
      const existing = this.data.leads[existingIndex];
      const updated = {
        ...existing,
        ...lead,
        // Non-destructive preservation of verified contact details
        contactName: lead.contactName && lead.contactName !== "UNKNOWN" ? lead.contactName : existing.contactName,
        location: lead.location && lead.location !== "UNKNOWN" ? lead.location : existing.location,
        phone: lead.phone || existing.phone,
        email: lead.email || existing.email,
        website: lead.website || existing.website,
        socialProfiles: {
          ...existing.socialProfiles,
          ...lead.socialProfiles
        },
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.data.leads[existingIndex] = updated;
      this.saveData();
      return updated;
    }
    const newLead = {
      id: lead.id || `lead-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      businessName: lead.businessName,
      industry: lead.industry,
      location: lead.location,
      source: lead.source,
      website: lead.website || "",
      contactName: lead.contactName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      socialProfiles: lead.socialProfiles || {},
      leadScore: lead.leadScore ?? 50,
      qualificationStatus: lead.qualificationStatus || "UNQUALIFIED",
      digitalPresenceScore: lead.digitalPresenceScore ?? 40,
      painPoints: lead.painPoints || [],
      opportunities: lead.opportunities || [],
      recommendedServices: lead.recommendedServices || [],
      outreachStatus: lead.outreachStatus || "NOT_STARTED",
      notes: lead.notes || "",
      meddpicc: lead.meddpicc || { totalScore: 0 },
      intelligenceProfile: lead.intelligenceProfile,
      lastResearchAt: lead.lastResearchAt,
      researchStatus: lead.researchStatus,
      researchRunId: lead.researchRunId,
      identityConfidence: lead.identityConfidence,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.leads.unshift(newLead);
    this.saveData();
    return newLead;
  }
  deleteLead(id) {
    const initialLen = this.data.leads.length;
    this.data.leads = this.data.leads.filter((l) => l.id !== id);
    if (this.data.leads.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }
  // --- Research Runs CRUD ---
  getResearchRuns(leadId) {
    if (!this.data.researchRuns) this.data.researchRuns = [];
    if (leadId) {
      return this.data.researchRuns.filter((r) => r.leadId === leadId);
    }
    return this.data.researchRuns;
  }
  getResearchRunById(runId) {
    if (!this.data.researchRuns) this.data.researchRuns = [];
    return this.data.researchRuns.find((r) => r.runId === runId);
  }
  saveResearchRun(run) {
    if (!this.data.researchRuns) this.data.researchRuns = [];
    const idx = this.data.researchRuns.findIndex((r) => r.runId === run.runId);
    if (idx >= 0) {
      this.data.researchRuns[idx] = run;
    } else {
      this.data.researchRuns.unshift(run);
    }
    this.saveData();
    return run;
  }
  // --- Workflows CRUD ---
  getWorkflows() {
    return this.data.workflows;
  }
  getWorkflowById(id) {
    return this.data.workflows.find((w) => w.id === id);
  }
  saveWorkflow(wf) {
    const idx = this.data.workflows.findIndex((w) => w.id === wf.id);
    if (idx >= 0) {
      this.data.workflows[idx] = wf;
    } else {
      this.data.workflows.unshift(wf);
    }
    this.saveData();
    return wf;
  }
  // --- Approvals CRUD ---
  getApprovals(status) {
    if (status) {
      return this.data.approvals.filter((a) => a.status === status);
    }
    return this.data.approvals;
  }
  getApprovalById(id) {
    return this.data.approvals.find((a) => a.id === id);
  }
  saveApproval(item) {
    const idx = item.id ? this.data.approvals.findIndex((a) => a.id === item.id) : -1;
    if (idx >= 0) {
      const updated = {
        ...this.data.approvals[idx],
        ...item,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.data.approvals[idx] = updated;
      this.saveData();
      return updated;
    }
    const newItem = {
      id: item.id || `appr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      workflowInstanceId: item.workflowInstanceId,
      stepId: item.stepId,
      leadId: item.leadId,
      agentId: item.agentId,
      type: item.type,
      title: item.title,
      summary: item.summary,
      draftContent: item.draftContent,
      revisedContent: item.revisedContent,
      status: item.status || "REVIEW",
      feedbackHistory: item.feedbackHistory || [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.approvals.unshift(newItem);
    this.saveData();
    return newItem;
  }
  updateApprovalStatus(id, status, comment, modifiedContent) {
    const item = this.getApprovalById(id);
    if (!item) return null;
    item.status = status;
    item.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (modifiedContent) {
      item.revisedContent = modifiedContent;
    }
    if (!item.feedbackHistory) {
      item.feedbackHistory = [];
    }
    item.feedbackHistory.push({
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      action: status === "APPROVED" ? "APPROVE" : status === "REVISED" ? "REVISE" : status === "REJECTED" ? "REJECT" : "REVIEW",
      comment,
      modifiedContent
    });
    this.saveData();
    return item;
  }
  // --- Settings & Provider Configuration ---
  getSettings() {
    const rawKey = this.data.settings.geminiApiKey || "";
    const hasGeminiKey = Boolean(rawKey && rawKey.trim().length > 0);
    const maskedGeminiKey = hasGeminiKey ? rawKey.length > 8 ? `${rawKey.substring(0, 6)}${"\u2022".repeat(Math.min(24, Math.max(12, rawKey.length - 10)))}${rawKey.substring(rawKey.length - 4)}` : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "";
    return {
      ...this.data.settings,
      geminiApiKey: maskedGeminiKey,
      hasGeminiKey,
      maskedGeminiKey
    };
  }
  getRawSettings() {
    return this.data.settings;
  }
  updateSettings(settings) {
    const current = this.data.settings;
    const newSettings = { ...current };
    if (settings.aiProvider) {
      newSettings.aiProvider = settings.aiProvider;
    }
    if (settings.ollamaBaseUrl !== void 0) {
      newSettings.ollamaBaseUrl = settings.ollamaBaseUrl;
    }
    if (settings.ollamaModel !== void 0) {
      newSettings.ollamaModel = settings.ollamaModel;
    }
    if (settings.geminiApiKey !== void 0) {
      const trimmed = settings.geminiApiKey.trim();
      if (trimmed.includes("\u2022") || trimmed.includes("*")) {
      } else {
        newSettings.geminiApiKey = trimmed;
      }
    }
    this.data.settings = newSettings;
    this.saveData();
    return this.getSettings();
  }
  resetData() {
    this.data = {
      leads: [...SEED_LEADS],
      workflows: [],
      approvals: [...SEED_APPROVALS],
      researchRuns: [],
      proposals: [],
      contentPosts: [],
      settings: {
        aiProvider: process.env.AI_PROVIDER || "mock",
        geminiApiKey: process.env.GEMINI_API_KEY || "",
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        ollamaModel: process.env.OLLAMA_MODEL || "llama3:8b"
      }
    };
    this.saveData();
  }
};

// src/core/observability/logger.service.ts
var LoggerService = class _LoggerService {
  static instance;
  logs = [];
  maxLogs = 1e3;
  constructor() {
  }
  static getInstance() {
    if (!_LoggerService.instance) {
      _LoggerService.instance = new _LoggerService();
    }
    return _LoggerService.instance;
  }
  log(level, message, data, context) {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      message,
      data,
      workflowId: context?.workflowId,
      taskId: context?.taskId,
      agentId: context?.agentId,
      durationMs: context?.durationMs
    };
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    const consolePrefix = `[${entry.timestamp}] [${level.toUpperCase()}]${entry.agentId ? ` [${entry.agentId}]` : ""}:`;
    if (level === "error") {
      console.error(consolePrefix, message, data || "");
    } else if (level === "warn") {
      console.warn(consolePrefix, message, data || "");
    } else {
      console.log(consolePrefix, message, data ? JSON.stringify(data).slice(0, 150) : "");
    }
    return entry;
  }
  info(message, data, context) {
    return this.log("info", message, data, context);
  }
  warn(message, data, context) {
    return this.log("warn", message, data, context);
  }
  error(message, data, context) {
    return this.log("error", message, data, context);
  }
  agentStep(agentId, message, data, context) {
    return this.log("agent_step", message, data, { ...context, agentId });
  }
  handoff(fromAgent, toAgent, task, context) {
    return this.log("handoff", `Handoff from ${fromAgent} -> ${toAgent}: ${task}`, { fromAgent, toAgent }, context);
  }
  getRecentLogs(limit = 100, filter) {
    let result = this.logs;
    if (filter?.agentId) {
      result = result.filter((l) => l.agentId === filter.agentId);
    }
    if (filter?.workflowId) {
      result = result.filter((l) => l.workflowId === filter.workflowId);
    }
    if (filter?.level) {
      result = result.filter((l) => l.level === filter.level);
    }
    return result.slice(0, limit);
  }
  clear() {
    this.logs = [];
  }
};

// api/leads.ts
function sendJson(res, status, data) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }
  const db = DatabaseService.getInstance();
  const logger = LoggerService.getInstance();
  if (req.method === "GET") {
    try {
      const filter = {};
      if (req.query?.industry) filter.industry = String(req.query.industry);
      if (req.query?.qualificationStatus) filter.qualificationStatus = String(req.query.qualificationStatus);
      if (req.query?.outreachStatus) filter.outreachStatus = String(req.query.outreachStatus);
      if (req.query?.search) filter.searchQuery = String(req.query.search);
      const leads = db.getLeads(filter);
      return sendJson(res, 200, { success: true, count: leads.length, leads });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }
  if (req.method === "POST") {
    try {
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }
      body = body || {};
      const saved = db.saveLead(body);
      logger.info(`Lead saved: ${saved.businessName} (${saved.id})`);
      return sendJson(res, 200, { success: true, lead: saved });
    } catch (err) {
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }
  if (req.method === "DELETE") {
    try {
      const id = req.query?.id;
      if (!id) return sendJson(res, 400, { success: false, error: "Lead ID required" });
      const ok = db.deleteLead(id);
      return sendJson(res, 200, { success: ok });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }
  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
export {
  handler as default
};
