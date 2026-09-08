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

// src/core/llm/mock.provider.ts
var MockProvider = class {
  name = "mock";
  async isAvailable() {
    return true;
  }
  async generate(prompt, systemPrompt, options) {
    const s = systemPrompt || "";
    const ctx = this.extractContextFromPrompt(prompt);
    const businessName = ctx.business_name || ctx.title || "your business";
    const hasExplicitBusinessName = ctx.business_name && ctx.business_name !== "UNKNOWN";
    const contactName = ctx.contact_name && ctx.contact_name !== "UNKNOWN" ? ctx.contact_name : "";
    const location = ctx.location && ctx.location !== "UNKNOWN" ? ctx.location : "your local market";
    const industry = ctx.industry && ctx.industry !== "UNKNOWN" ? ctx.industry : "business";
    const website = ctx.website || ctx.url || "your website";
    const responseTimeMs = ctx.response_time_ms ? Number(ctx.response_time_ms) : ctx.load_time_ms ? Number(ctx.load_time_ms) : null;
    const measuredTimeText = responseTimeMs ? `${responseTimeMs}ms` : "under 2.0s";
    const hasMeasuredSpeed = responseTimeMs !== null;
    let clientTerm = "clients";
    let entityTerm = "business";
    if (/dental|clinic|doctor|hospital|health|physio/i.test(industry)) {
      clientTerm = "patients";
      entityTerm = "practice";
    } else if (/law|legal|attorney|advocate/i.test(industry)) {
      clientTerm = "clients";
      entityTerm = "firm";
    } else if (/real\s*estate|property|realt/i.test(industry)) {
      clientTerm = "buyers & sellers";
      entityTerm = "agency";
    }
    let observableGapTrigger = "missing Schema.org LocalBusiness structured markup and direct WhatsApp appointment triggers";
    if (ctx.identified_gaps && Array.isArray(ctx.identified_gaps) && ctx.identified_gaps.length > 0) {
      observableGapTrigger = ctx.identified_gaps.slice(0, 2).join(" and ");
    }
    if (s.includes("CURRENT_AGENT_ID: outbound_sales")) {
      const greeting = contactName ? `Hi ${contactName},` : `Hi ${hasExplicitBusinessName ? businessName + " Team" : "there"},`;
      const speedLine = hasMeasuredSpeed ? `We conducted a technical scan of ${website} (server response time: ${measuredTimeText}).` : `We conducted a digital presence scan for ${businessName}.`;
      const draft = {
        summary: `Crafted signal-based 3-touch outreach sequence anchored in verified technical gaps for ${businessName}.`,
        content: `### Touch 1 (Day 1 - Email)
Subject: quick observation on ${businessName} digital presence

${greeting}

${speedLine} We identified key opportunities for growth: specifically ${observableGapTrigger}.

According to Google mobile web performance research, local mobile visitors leave unoptimized pages within seconds, directing high-intent local ${clientTerm} to nearby competitors in ${location}.

At PrimeSoul, we engineer high-performance web platforms and Google 3-Pack local ranking architectures to capture qualified inquiries.

Open to seeing a 2-minute diagnostic breakdown of these opportunities for ${businessName}?

Best,  
PrimeSoul Web Solutions Team

---
### Touch 2 (Day 4 - WhatsApp Follow-Up)
${greeting} Following up on my note regarding ${businessName}'s search visibility in ${location}. We mapped 3 concrete optimizations for your local ranking. Worth a brief 5-minute conversation this week?

---
### Touch 3 (Day 8 - Breakup Email)
Subject: closing the loop / ${businessName}

${greeting} I assume upgrading ${businessName}'s digital infrastructure is not a current priority. If timing changes down the road and you want to scale local ${clientTerm} intake in ${location}, feel free to reach back out.`,
        facts: [
          `Outreach references verified target domain: ${website}`,
          hasMeasuredSpeed ? `Referenced measured server response time (${measuredTimeText})` : "Mobile Core Web Vitals marked as unmeasured / field audit required",
          `Referenced observable gaps: ${observableGapTrigger}`,
          "Subject line complies with 3-5 word lowercase standard"
        ],
        assumptions: [
          `Target audience in ${location} values instant WhatsApp response and mobile speed`,
          "Google industry research benchmark (40%+ bounce on unoptimized pages) applies to local search traffic"
        ],
        recommendations: [
          "Submit Touch 1 to Human Review before dispatching",
          contactName ? `Personalized to confirmed contact: ${contactName}` : "Notice: Contact name is UNKNOWN; using neutral greeting"
        ],
        unknowns: [
          contactName ? "Preferred communication channel of economic buyer" : "Economic buyer / contact person name is UNKNOWN",
          "Current monthly organic search visitor count (requires Google Search Console access)"
        ],
        requiresApproval: true
      };
      return JSON.stringify(draft);
    }
    if (s.includes("CURRENT_AGENT_ID: deal_strategist")) {
      const economicBuyerName = contactName || "[UNKNOWN: Decision Maker to be identified in discovery]";
      const draft = {
        summary: `Completed 8-point MEDDPICC qualification assessment for ${businessName}.`,
        content: `### MEDDPICC Opportunity Assessment: ${businessName}
- **Metrics (4/5)**: [TARGET] Increase qualified monthly ${clientTerm} inquiries by 30-50% within 90 days.
- **Economic Buyer (${contactName ? "4/5" : "2/5"})**: ${economicBuyerName}.
- **Decision Criteria (4/5)**: [SPECIFICATION] Sub-second mobile load time, Google 3-Pack rank proof, fixed milestone pricing.
- **Decision Process (3/5)**: Discovery review -> Proposal presentation -> Milestone agreement sign-off.
- **Paper Process (3/5)**: Standard PrimeSoul service agreement + 50% advance invoice terms.
- **Identify Pain (4/5)**: [OBSERVED GAPS] ${observableGapTrigger}.
- **Champion (3/5)**: Operational / Marketing lead advocating for digital modernization.
- **Competition (4/5)**: Generic local freelancers vs in-house status quo.

**Deal Positioning**: BATTLING \u2014 Strong win probability when proposal demonstrates verified technical gaps and transparent PrimeSoul SLAs.`,
        facts: [
          `Evaluated MEDDPICC criteria for target: ${businessName}`,
          `Identified observable technical pain points: ${observableGapTrigger}`
        ],
        assumptions: [
          `Competitors in ${location} compete primarily on price without engineering performance guarantees`
        ],
        recommendations: [
          "Anchor proposal firmly on PrimeSoul engineering standards and post-launch maintenance SLA",
          `Confirm Economic Buyer sign-off criteria during discovery call`
        ],
        unknowns: [
          contactName ? "Exact internal budget authorization milestones" : "Identity of the Economic Buyer is UNKNOWN",
          "Current monthly digital marketing ad spend if any"
        ],
        requiresApproval: false
      };
      return JSON.stringify(draft);
    }
    if (s.includes("CURRENT_AGENT_ID: discovery")) {
      const contactGreeting = contactName ? contactName : "there";
      const draft = {
        summary: `Prepared customized SPIN & Gap discovery call blueprint for ${businessName}.`,
        content: `### Discovery Call Architecture (30-Min Blueprint): ${businessName}

#### 1. Upfront Contract (First 2 Mins)
"Thanks for connecting today, ${contactGreeting}. In our 30 minutes, I want to understand how ${businessName} currently handles digital intake in ${location}, and examine the technical bottlenecks on ${website}. At the end, we will determine if there is a strong fit to partner or agree it is not the right timing \u2014 both outcomes are completely fine. Does that sound fair?"

#### 2. SPIN Diagnostic Sequence
- **Situation**: "How do prospective ${clientTerm} currently find and contact ${businessName} online in ${location}?"
- **Problem**: "We observed that ${website} is currently ${observableGapTrigger}. Where do you notice inquiries dropping off before reaching your team?"
- **Implication**: "When high-intent local ${clientTerm} visit on mobile and cannot instantly connect via WhatsApp or find structured local details, what does losing those inquiries cost ${businessName} in monthly revenue?"
- **Need-Payoff**: "If your platform loaded instantly and converted 15-25 additional qualified inquiries each month directly into your team, what impact would that have on your growth?"

#### 3. Gap Mapping
- **Current State**: ${observableGapTrigger}, unverified local map ranking.
- **Future State**: [TARGET] Sub-second mobile response time, top 3 local Google rank, automated WhatsApp intake.
- **The Gap**: Modern, high-performance digital infrastructure.`,
        facts: [
          "Structured using Neil Rackham's SPIN model and Keenan's Gap Selling methodology",
          `Personalized to verified prospect domain: ${website}`
        ],
        assumptions: [
          `Decision maker at ${businessName} is willing to quantify the revenue impact of lost digital inquiries`
        ],
        recommendations: [
          "Maintain a 60/40 listen-to-talk ratio during discovery",
          "Anchor implication questions on lost revenue rather than technical jargon"
        ],
        unknowns: [
          contactName ? "Additional members of the decision-making committee" : "Confirmed identity of primary contact person is UNKNOWN",
          "Current monthly client acquisition cost (CAC)"
        ],
        requiresApproval: false
      };
      return JSON.stringify(draft);
    }
    if (s.includes("CURRENT_AGENT_ID: proposal")) {
      const draft = {
        summary: `Architected 3-Act Persuasion Proposal blueprint for ${businessName}.`,
        content: `### PrimeSoul Proposal: Digital Infrastructure & Growth Transformation
**Client**: ${businessName}  
**Target Market**: ${location}  
**Prepared By**: PrimeSoul Web Solutions

#### Act I: Understanding the Challenge
${businessName} has established operations in ${location}, but your current digital presence on ${website} exhibits critical friction points: specifically ${observableGapTrigger}. High-intent local ${clientTerm} searching for your services encounter friction before reaching your intake team.

#### Act II: The Solution Journey
1. **High-Performance Web Platform**: Custom responsive architecture with SSL, clean semantic HTML, and Core Web Vitals optimization.
2. **Google Business Profile & Local SEO Sprint**: Full optimization, 50+ local citations in ${location}, and automated review capture.
3. **Instant WhatsApp Intake Routing**: Direct lead routing connecting high-intent visitors directly into your intake staff.

#### Act III: Transformed State & Investment
- **[DELIVERABLE SLA TARGETS]**:
  - Target Mobile Speed: <1.5s initial response time.
  - Conversion Architecture: Direct WhatsApp intake routing.
  - Search Visibility: Local 3-Pack optimization sprint.
- **Investment Tier**: **Standard Transformation Package [\u20B935,000 - \u20B955,000 / $700 - $1,100]** (Strictly adhering to PrimeSoul published pricing guidelines).
- **Project Timeline**: 3-4 Weeks from kickoff to production deployment.`,
        facts: [
          "Follows 3-Act narrative architecture (Understanding -> Solution Journey -> Transformed State)",
          "Pricing strictly grounded in PrimeSoul published pricing guidelines (knowledge/pricing.md)",
          `Grounded in verified observable gaps: ${observableGapTrigger}`
        ],
        assumptions: [
          `Client has core branding assets ready for the development sprint`
        ],
        recommendations: [
          "Route proposal through Human Approval before dispatching to client",
          "Follow up within 48 hours of client receiving the proposal"
        ],
        unknowns: [
          "Any third-party custom API integrations required beyond standard web/WhatsApp"
        ],
        requiresApproval: true
      };
      return JSON.stringify(draft);
    }
    if (s.includes("CURRENT_AGENT_ID: growth_strategist")) {
      const draft = {
        summary: `Engineered Grand Slam offer and diagnostic lead magnet blueprint for ${businessName}.`,
        content: `### Growth Offer & Lead Magnet Blueprint: ${businessName}

#### 1. Hormozi Value Equation Architecture
- **Dream Outcome**: Top 3 Google Local Rank in ${location} + 25+ new qualified ${clientTerm} monthly.
- **Perceived Likelihood**: 100% transparent technical audit + verified PrimeSoul case studies in ${industry}.
- **Time Delay (Minimized)**: 21-Day rapid sprint delivery.
- **Effort & Sacrifice (Minimized)**: 100% Done-For-You technical development & WhatsApp routing.

#### 2. Diagnostic Lead Magnet: 'Local Digital Health & Speed Scorecard'
- **Type**: Solve a Problem (Diagnostic Tool).
- **Core Promise**: Instant breakdown of technical bottlenecks and local search ranking gaps in ${location}.
- **Capture Hook**: Direct contact to receive customized action report.`,
        facts: [
          "Applied Alex Hormozi Value Equation framework",
          `Tailored to industry sector: ${industry}`
        ],
        assumptions: [
          `Prospects in ${industry} respond highest to objective diagnostic scorecards`
        ],
        recommendations: [
          "Promote lead magnet via organic LinkedIn case studies and Instagram carousels"
        ],
        unknowns: [
          "Allocated monthly ad budget for paid traffic amplification"
        ],
        requiresApproval: false
      };
      return JSON.stringify(draft);
    }
    if (s.includes("CURRENT_AGENT_ID: content_social")) {
      const draft = {
        summary: `Created platform-specific content package for ${businessName} (${industry}).`,
        content: `### Multi-Platform Content Suite: ${businessName}

#### 1. LinkedIn Thought Leadership Post
**Hook**: 80% of local ${industry} websites lose prospective ${clientTerm} within the first 3 seconds. Here is why technical performance equals revenue:

When your mobile site takes seconds to respond or lacks local search schema:
1. Mobile visitors bounce back to search results.
2. Search engines demote your local map ranking.
3. Your acquisition cost per lead doubles.

At PrimeSoul Web Solutions, we engineer platforms built for sub-second speed and conversion capture.

---
#### 2. Instagram Carousel Slide Outline
- Slide 1: Is your ${industry} website secretly losing ${clientTerm}? (Swipe \u27A1\uFE0F)
- Slide 2: The Speed Rule: Why attention drops when pages hesitate.
- Slide 3: Google 3-Pack: Why local map rankings drive 70% of inbound calls.
- Slide 4: WhatsApp Automation: Turn passive visitors into instant chats.
- Slide 5: Ready to upgrade? DM 'AUDIT' for a free technical scorecard.`,
        facts: [
          "Adheres to PrimeSoul Brand Voice standards (clear, confident, outcome-driven)",
          "Provides distinct formats for B2B LinkedIn and visual Instagram"
        ],
        assumptions: [
          `Target audience in ${industry} browses primarily on mobile devices`
        ],
        recommendations: [
          "Queue posts for human approval before scheduling in social scheduler"
        ],
        unknowns: [
          "Exact client brand typography and primary HEX color codes"
        ],
        requiresApproval: true
      };
      return JSON.stringify(draft);
    }
    if (s.includes("CURRENT_AGENT_ID: seo_local")) {
      const draft = {
        summary: `Formulated technical SEO audit and local 3-pack roadmap for ${businessName}.`,
        content: `### Technical & Local SEO Audit: ${businessName}
1. **Technical Foundation**:
   - Resolve identified gaps on ${website}: ${observableGapTrigger}.
   - Deploy Schema.org LocalBusiness JSON-LD markup with geo-coordinates in ${location}.
   - Configure canonical tags and mobile viewport directives.

2. **Google Business Profile 3-Pack Roadmap**:
   - Claim and verify primary category for ${industry} in ${location}.
   - Upload 15+ high-res, geo-tagged workplace photos.
   - Implement review generation and weekly update cadence.

3. **Keyword Topic Cluster**:
   - Pillar Page: \`[Primary Service] in ${location}\` (Transactional Intent).
   - Satellite 1: \`Best [Service] costs & options in ${location}\` (Commercial Intent).
   - Satellite 2: \`When to consult a [Specialist]\` (Informational Intent).`,
        facts: [
          `Target domain: ${website}`,
          `Identified on-page gaps: ${observableGapTrigger}`
        ],
        assumptions: [
          `Local search volume in ${location} has commercial purchase intent`
        ],
        recommendations: [
          "Complete pre-GSC cannibalization check before launching local landing pages",
          "Ensure NAP (Name, Address, Phone) consistency across local directories"
        ],
        unknowns: [
          "Google Search Console verified indexation status"
        ],
        requiresApproval: false
      };
      return JSON.stringify(draft);
    }
    if (s.includes("CURRENT_AGENT_ID: lead_researcher")) {
      const measuredFact = hasMeasuredSpeed ? `Measured initial server response time: ${measuredTimeText}` : "Initial response time unmeasured / field audit required";
      const draft = {
        summary: `Analyzed digital presence for ${businessName}. Verified technical infrastructure and local visibility signals.`,
        content: `### Digital Presence Analysis Report: ${businessName}
- **Website Audit**: Scanned ${website}. ${measuredFact}.
- **Observed Gaps**: ${observableGapTrigger}.
- **Local Visibility**: Local presence in ${location} requires Google Business Profile verification and LocalBusiness JSON-LD schema.`,
        facts: [
          `Target website: ${website}`,
          measuredFact,
          `Identified gaps: ${observableGapTrigger}`
        ],
        assumptions: [
          `Unoptimized local metadata in ${location} reduces search discovery compared to optimized competitors`
        ],
        recommendations: [
          "Implement Schema.org LocalBusiness JSON-LD markup",
          "Deploy direct WhatsApp conversion capture widget",
          "Conduct technical Core Web Vitals optimization sprint"
        ],
        unknowns: [
          "Exact monthly organic search visitor count (requires Google Search Console access)",
          "Active advertising spend budget if any"
        ],
        requiresApproval: false
      };
      return JSON.stringify(draft);
    }
    const defaultPlan = {
      summary: `PrimeSoul Manager analyzed objective for ${businessName}, decomposed tasks, and routed specialist agents.`,
      content: `### PrimeSoul Manager Execution Plan: ${businessName}
1. **Task Intent**: Decomposed business objective across sales and marketing divisions.
2. **Agent Routing**: Orchestrated research, strategy, and deliverable creation.
3. **Quality & Provenance Gate**: Verified zero-hallucination compliance against PrimeSoul knowledge base.
4. **Outcome**: Deliverables synthesized with explicit Fact / Inference / Recommendation separation.`,
      facts: ["Task structured into multi-agent execution graph"],
      assumptions: ["Standard PrimeSoul service frameworks apply"],
      recommendations: ["Proceed to human approval review for external communication deliverables"],
      unknowns: ["Any unstated client-specific technical constraints"],
      requiresApproval: false
    };
    return JSON.stringify(defaultPlan);
  }
  async generateStructured(prompt, systemPrompt, options) {
    const raw = await this.generate(prompt, systemPrompt, { ...options, jsonMode: true });
    try {
      return JSON.parse(raw);
    } catch {
      return {
        summary: "Processed request",
        content: raw,
        facts: [],
        assumptions: [],
        recommendations: [],
        unknowns: [],
        requiresApproval: false
      };
    }
  }
  /**
   * Extracts contextual prospect variables and live analysis metrics from the user prompt.
   */
  extractContextFromPrompt(prompt) {
    const ctx = {
      business_name: "",
      contact_name: "",
      website: "",
      location: "",
      industry: "",
      title: "",
      response_time_ms: null,
      load_time_ms: null,
      identified_gaps: []
    };
    const xmlMatches = prompt.match(/<untrusted_external_data[^>]*>([\s\S]*?)<\/untrusted_external_data>/g);
    if (xmlMatches) {
      for (const xml of xmlMatches) {
        const inner = xml.replace(/<untrusted_external_data[^>]*>/, "").replace(/<\/untrusted_external_data>/, "").trim();
        try {
          const parsed = JSON.parse(inner);
          this.populateCtxFromObject(ctx, parsed);
        } catch {
        }
      }
    }
    const bizMatch = prompt.match(/"businessName"\s*:\s*"([^"]+)"/i) || prompt.match(/"business_name"\s*:\s*"([^"]+)"/i) || prompt.match(/Target Lead:\s*([^\n\r(]+)/i) || prompt.match(/(?:call with|audit for|plan for|proposal for|review for)\s+([A-Z][A-Za-z0-9\s&.'-]+?)(?:\s+in|\s+team|\s*\n|\s*\.|\s*\(|$)/i);
    if (bizMatch && !ctx.business_name && bizMatch[1].trim() !== "UNKNOWN") {
      ctx.business_name = bizMatch[1].trim();
    }
    const contactMatch = prompt.match(/"contactName"\s*:\s*"([^"]+)"/i) || prompt.match(/"contact_name"\s*:\s*"([^"]+)"/i) || prompt.match(/Contact Person:\s*([^\n\r]+)/i);
    if (contactMatch && !ctx.contact_name && contactMatch[1].trim() !== "UNKNOWN") {
      ctx.contact_name = contactMatch[1].trim();
    }
    const locationMatch = prompt.match(/"location"\s*:\s*"([^"]+)"/i) || prompt.match(/Location:\s*([^\n\r]+)/i);
    if (locationMatch && !ctx.location && locationMatch[1].trim() !== "UNKNOWN") {
      ctx.location = locationMatch[1].trim();
    }
    const industryMatch = prompt.match(/"industry"\s*:\s*"([^"]+)"/i) || prompt.match(/Industry:\s*([^\n\r]+)/i);
    if (industryMatch && !ctx.industry && industryMatch[1].trim() !== "UNKNOWN") {
      ctx.industry = industryMatch[1].trim();
    }
    const websiteMatch = prompt.match(/https?:\/\/[^\s"'><\)\],]+/i);
    if (websiteMatch && !ctx.website) {
      ctx.website = websiteMatch[0];
    }
    const responseTimeMatch = prompt.match(/(?:responseTimeMs|response_time_ms|Response Time|response time)[\s":=]+(\d+)/i) || prompt.match(/(\d+)\s*ms/i);
    if (responseTimeMatch && ctx.response_time_ms === null) {
      ctx.response_time_ms = Number(responseTimeMatch[1]);
    }
    return ctx;
  }
  populateCtxFromObject(ctx, obj) {
    if (!obj || typeof obj !== "object") return;
    if (obj.businessName && obj.businessName !== "UNKNOWN") ctx.business_name = obj.businessName;
    if (obj.business_name && obj.business_name !== "UNKNOWN") ctx.business_name = obj.business_name;
    if (obj.contactName && obj.contactName !== "UNKNOWN") ctx.contact_name = obj.contactName;
    if (obj.contact_name && obj.contact_name !== "UNKNOWN") ctx.contact_name = obj.contact_name;
    if (obj.website) ctx.website = obj.website;
    if (obj.url) ctx.website = obj.url;
    if (obj.location && obj.location !== "UNKNOWN") ctx.location = obj.location;
    if (obj.industry && obj.industry !== "UNKNOWN") ctx.industry = obj.industry;
    if (obj.measured?.responseTimeMs) ctx.response_time_ms = obj.measured.responseTimeMs;
    if (obj.responseTimeMs) ctx.response_time_ms = obj.responseTimeMs;
    if (obj.loadTimeMs) ctx.load_time_ms = obj.loadTimeMs;
    if (obj.detected?.title) ctx.title = obj.detected.title;
    if (obj.inferred?.identifiedGaps && Array.isArray(obj.inferred.identifiedGaps)) ctx.identified_gaps = obj.inferred.identifiedGaps;
    if (obj.identifiedGaps && Array.isArray(obj.identifiedGaps)) ctx.identified_gaps = obj.identifiedGaps;
    if (obj.painPoints && Array.isArray(obj.painPoints)) ctx.identified_gaps = obj.painPoints;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        this.populateCtxFromObject(ctx, obj[key]);
      }
    }
  }
};

// src/core/llm/gemini.provider.ts
var GeminiProvider = class {
  name = "gemini";
  apiKey;
  model;
  constructor(apiKey, model = "gemini-1.5-flash") {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    this.model = model;
  }
  async isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }
  async generate(prompt, systemPrompt, options) {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const contents = [];
    if (systemPrompt) {
      contents.push({
        role: "user",
        parts: [{ text: `SYSTEM INSTRUCTIONS:
${systemPrompt}` }]
      });
      contents.push({
        role: "model",
        parts: [{ text: "Understood. I will strictly follow these system instructions and output format." }]
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });
    const generationConfig = {
      temperature: options?.temperature ?? 0.4,
      maxOutputTokens: options?.maxTokens ?? 2048
    };
    if (options?.jsonMode) {
      generationConfig.responseMimeType = "application/json";
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }
    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error("No candidate content returned from Gemini API.");
    }
    return candidate;
  }
  async generateStructured(prompt, systemPrompt, options) {
    const raw = await this.generate(
      `${prompt}

You MUST respond strictly in valid JSON matching this schema:
{
  "summary": "1-2 sentence executive summary",
  "content": "detailed markdown response",
  "facts": ["list of verified facts"],
  "assumptions": ["list of assumptions"],
  "recommendations": ["list of recommendations"],
  "unknowns": ["list of unknowns"],
  "requiresApproval": false
}`,
      systemPrompt,
      { ...options, jsonMode: true }
    );
    try {
      return JSON.parse(raw);
    } catch {
      const cleaned = raw.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      return JSON.parse(cleaned);
    }
  }
};

// src/core/llm/ollama.provider.ts
var OllamaProvider = class {
  name = "ollama";
  baseUrl;
  model;
  constructor(baseUrl = "http://localhost:11434", model = "llama3:8b") {
    this.baseUrl = baseUrl;
    this.model = model;
  }
  async isAvailable() {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }
  async generate(prompt, systemPrompt, options) {
    const url = `${this.baseUrl}/api/generate`;
    const body = {
      model: this.model,
      prompt,
      system: systemPrompt,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.3,
        num_predict: options?.maxTokens ?? 2048
      }
    };
    if (options?.jsonMode) {
      body.format = "json";
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      throw new Error(`Ollama API Error (${res.status}): ${await res.text()}`);
    }
    const data = await res.json();
    return data.response;
  }
  async generateStructured(prompt, systemPrompt, options) {
    const raw = await this.generate(
      `${prompt}

Respond strictly in valid JSON matching this structure:
{
  "summary": "1-2 sentence summary",
  "content": "detailed markdown deliverable",
  "facts": ["list of facts"],
  "assumptions": ["list of assumptions"],
  "recommendations": ["list of recommendations"],
  "unknowns": ["list of unknowns"],
  "requiresApproval": false
}`,
      systemPrompt,
      { ...options, jsonMode: true }
    );
    try {
      return JSON.parse(raw);
    } catch {
      const cleaned = raw.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      return JSON.parse(cleaned);
    }
  }
};

// src/core/llm/llm.factory.ts
var LlmFactory = class {
  static instance = null;
  static currentProviderType = "mock";
  static getProvider(type) {
    const selectedType = type || process.env.AI_PROVIDER || "mock";
    if (this.instance && this.currentProviderType === selectedType) {
      return this.instance;
    }
    this.currentProviderType = selectedType;
    switch (selectedType) {
      case "gemini":
        this.instance = new GeminiProvider(process.env.GEMINI_API_KEY);
        break;
      case "ollama":
        this.instance = new OllamaProvider(process.env.OLLAMA_BASE_URL, process.env.OLLAMA_MODEL);
        break;
      case "mock":
      default:
        this.instance = new MockProvider();
        break;
    }
    return this.instance;
  }
  static setProvider(type, config) {
    this.currentProviderType = type;
    switch (type) {
      case "gemini":
        this.instance = new GeminiProvider(config?.apiKey, config?.model || "gemini-1.5-flash");
        break;
      case "ollama":
        this.instance = new OllamaProvider(config?.baseUrl, config?.model || "llama3:8b");
        break;
      case "mock":
      default:
        this.instance = new MockProvider();
        break;
    }
    return this.instance;
  }
  static getCurrentProviderType() {
    return this.currentProviderType;
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

// src/api/settings.ts
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
      const settings = db.getSettings();
      return sendJson(res, 200, { success: true, settings });
    } catch (err) {
      console.error("Settings GET error:", err);
      return sendJson(res, 500, { success: false, error: err.message || "Failed to retrieve settings" });
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
      const { aiProvider, geminiApiKey, ollamaBaseUrl, ollamaModel } = body;
      if (aiProvider && !["mock", "gemini", "ollama"].includes(aiProvider)) {
        return sendJson(res, 400, {
          success: false,
          error: `Invalid AI Provider '${aiProvider}'. Must be 'mock', 'gemini', or 'ollama'.`
        });
      }
      const updated = db.updateSettings({
        aiProvider,
        geminiApiKey,
        ollamaBaseUrl,
        ollamaModel
      });
      const rawSettings = db.getRawSettings();
      if (rawSettings.aiProvider) {
        LlmFactory.setProvider(rawSettings.aiProvider, {
          apiKey: rawSettings.geminiApiKey,
          baseUrl: rawSettings.ollamaBaseUrl,
          model: rawSettings.ollamaModel
        });
      }
      const hasKey = Boolean(rawSettings.geminiApiKey && rawSettings.geminiApiKey.trim().length > 0);
      logger.info(`Settings updated. Active AI Provider: ${updated.aiProvider}, Gemini Configured: ${hasKey}`);
      return sendJson(res, 200, { success: true, settings: updated });
    } catch (err) {
      console.error("Settings POST error:", err);
      return sendJson(res, 500, { success: false, error: err.message || "Failed to save settings" });
    }
  }
  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
export {
  handler as default
};
