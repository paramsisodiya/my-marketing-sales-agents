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

// src/core/tools/web-analyzer.tool.ts
import dns from "node:dns/promises";
import { URL as URL2 } from "node:url";
var WebAnalyzerTool = class {
  name = "web_analyzer";
  description = "Safely performs real HTTP analysis of a public website URL, extracting SEO metadata, mobile signals, schema markup, and performance metrics.";
  parameters = [
    { name: "url", type: "string", description: "The public website URL to audit", required: true },
    { name: "businessName", type: "string", description: "Optional business name for local verification" },
    { name: "timeoutMs", type: "number", description: "Optional timeout in ms (default 6000)" }
  ];
  MAX_REDIRECTS = 5;
  MAX_BODY_BYTES = 2 * 1024 * 1024;
  // 2 MB cap
  async execute(args) {
    if (!args.url || typeof args.url !== "string") {
      return { success: false, error: "Invalid URL: A non-empty string URL is required." };
    }
    let targetUrlString = args.url.trim();
    if (!targetUrlString.includes("://")) {
      targetUrlString = `https://${targetUrlString}`;
    }
    let parsedUrl;
    try {
      parsedUrl = new URL2(targetUrlString);
    } catch {
      return { success: false, error: `Invalid URL format: '${args.url}'` };
    }
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return { success: false, error: `Unsupported protocol: '${parsedUrl.protocol}'. Only http and https are permitted.` };
    }
    const ssrfError = await this.validateSafeHost(parsedUrl.hostname);
    if (ssrfError) {
      return { success: false, error: `Security restriction: ${ssrfError}` };
    }
    const timeoutMs = args.timeoutMs || 6e3;
    const startTime = Date.now();
    try {
      let currentUrl = parsedUrl.toString();
      let redirectCount = 0;
      let finalResponse = null;
      while (redirectCount <= this.MAX_REDIRECTS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch(currentUrl, {
            method: "GET",
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PrimeSoulAudit/1.0",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9"
            },
            redirect: "manual",
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (res.status >= 300 && res.status < 400) {
            const location = res.headers.get("location");
            if (!location) {
              finalResponse = res;
              break;
            }
            const nextUrl = new URL2(location, currentUrl);
            if (nextUrl.protocol !== "http:" && nextUrl.protocol !== "https:") {
              return { success: false, error: `Redirect to unsupported protocol blocked: '${nextUrl.protocol}'` };
            }
            const nextHostSsrf = await this.validateSafeHost(nextUrl.hostname);
            if (nextHostSsrf) {
              return { success: false, error: `Redirect to unsafe internal host blocked: ${nextHostSsrf}` };
            }
            currentUrl = nextUrl.toString();
            redirectCount++;
            continue;
          }
          finalResponse = res;
          break;
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          if (fetchErr.name === "AbortError") {
            return { success: false, error: `Request timed out after ${timeoutMs}ms while connecting to ${targetUrlString}` };
          }
          throw fetchErr;
        }
      }
      if (!finalResponse) {
        return { success: false, error: `Exceeded maximum redirect limit (${this.MAX_REDIRECTS})` };
      }
      const responseTimeMs = Date.now() - startTime;
      const httpStatus = finalResponse.status;
      const compressionType = finalResponse.headers.get("content-encoding") || "none";
      const arrayBuf = await finalResponse.arrayBuffer();
      const contentSizeBytes = arrayBuf.byteLength;
      const decoder = new TextDecoder("utf-8");
      const htmlText = decoder.decode(arrayBuf.slice(0, this.MAX_BODY_BYTES));
      let robotsTxtStatus = "UNCHECKED";
      let sitemapStatus = "UNCHECKED";
      try {
        const robotsUrl = new URL2("/robots.txt", currentUrl).toString();
        const rRes = await fetch(robotsUrl, { method: "HEAD", signal: AbortSignal.timeout(2e3) });
        robotsTxtStatus = rRes.status === 200 ? "AVAILABLE" : "MISSING";
      } catch {
        robotsTxtStatus = "MISSING";
      }
      if (htmlText.includes("sitemap.xml") || htmlText.includes("sitemap_index.xml")) {
        sitemapStatus = "AVAILABLE";
      } else {
        sitemapStatus = "UNCHECKED";
      }
      const report = this.parseHtmlMetadata({
        originalUrl: targetUrlString,
        finalUrl: currentUrl,
        httpStatus,
        responseTimeMs,
        contentSizeBytes,
        compressionType,
        isHttps: currentUrl.startsWith("https://"),
        redirectCount,
        html: htmlText,
        robotsTxtStatus,
        sitemapStatus,
        businessName: args.businessName
      });
      return {
        success: true,
        data: report
      };
    } catch (err) {
      return {
        success: false,
        error: `Failed to analyze website: ${err.message || String(err)}`
      };
    }
  }
  /**
   * Validates that the hostname is safe and does not resolve to private / loopback IP ranges (SSRF defense).
   */
  async validateSafeHost(hostname) {
    const lowerHost = hostname.toLowerCase();
    if (lowerHost === "localhost" || lowerHost.endsWith(".localhost") || lowerHost.endsWith(".local") || lowerHost.endsWith(".internal") || lowerHost === "0.0.0.0" || lowerHost === "127.0.0.1" || lowerHost === "::1") {
      return `Target host '${hostname}' is a local loopback/internal address.`;
    }
    if (this.isPrivateIp(lowerHost)) {
      return `Target IP '${hostname}' belongs to a reserved private or link-local network.`;
    }
    try {
      const lookupResult = await dns.lookup(hostname, { all: true });
      for (const addr of lookupResult) {
        if (this.isPrivateIp(addr.address)) {
          return `Target host '${hostname}' resolved to a private/internal IP address (${addr.address}).`;
        }
      }
    } catch (dnsErr) {
      if (dnsErr.code === "ENOTFOUND") {
        return `Domain name could not be resolved (ENOTFOUND): '${hostname}'`;
      }
    }
    return null;
  }
  isPrivateIp(ip) {
    if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;
    const match172 = ip.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
    if (match172) {
      const secondOctet = parseInt(match172[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) return true;
    }
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;
    if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;
    if (/^0\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;
    if (ip === "::1" || ip === "::" || ip.toLowerCase().startsWith("fc") || ip.toLowerCase().startsWith("fd") || ip.toLowerCase().startsWith("fe80")) {
      return true;
    }
    return false;
  }
  /**
   * Parses HTML content to extract meta tags, structured data, headings, contacts, and SEO gap signals.
   */
  parseHtmlMetadata(params) {
    const { html, originalUrl, finalUrl, httpStatus, responseTimeMs, contentSizeBytes, compressionType, isHttps, redirectCount } = params;
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? this.cleanHtmlEntities(titleMatch[1].trim()) : void 0;
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
    const metaDescription = descMatch ? this.cleanHtmlEntities(descMatch[1].trim()) : void 0;
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
    const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : void 0;
    const viewportMatch = html.match(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["']/i);
    const hasViewport = !!viewportMatch;
    const viewportContent = viewportMatch ? viewportMatch[1].trim() : void 0;
    const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
    const robotsDirective = robotsMatch ? robotsMatch[1].trim() : void 0;
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i);
    const openGraph = {
      title: ogTitleMatch ? this.cleanHtmlEntities(ogTitleMatch[1].trim()) : void 0,
      description: ogDescMatch ? this.cleanHtmlEntities(ogDescMatch[1].trim()) : void 0,
      image: ogImageMatch ? ogImageMatch[1].trim() : void 0
    };
    const h1Matches = this.extractHeadingTags(html, "h1");
    const h2Matches = this.extractHeadingTags(html, "h2");
    const h3Matches = this.extractHeadingTags(html, "h3");
    const schemaRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const schemaTypes = /* @__PURE__ */ new Set();
    let hasLocalBusinessSchema = false;
    let match;
    while ((match = schemaRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        this.extractSchemaTypes(parsed, schemaTypes);
      } catch {
      }
    }
    const localBusinessKeywords = [
      "LocalBusiness",
      "MedicalBusiness",
      "DentalClinic",
      "LegalService",
      "Store",
      "Restaurant",
      "ProfessionalService",
      "AutomotiveBusiness",
      "HomeAndConstructionBusiness",
      "HealthAndBeautyBusiness",
      "RealEstateAgent",
      "Dentist",
      "Physician",
      "Attorney"
    ];
    for (const st of schemaTypes) {
      if (localBusinessKeywords.some((k) => st.includes(k))) {
        hasLocalBusinessSchema = true;
        break;
      }
    }
    const hasWhatsAppLink = /wa\.me\/|api\.whatsapp\.com\/|whatsapp:\/\//i.test(html);
    const hasTelLink = /href=["']tel:[^"']+["']/i.test(html);
    const phonesSet = /* @__PURE__ */ new Set();
    const telHrefRegex = /href=["']tel:([^"']+)["']/gi;
    while ((match = telHrefRegex.exec(html)) !== null) {
      const cleanPhone = match[1].replace(/[^\d+]/g, "").trim();
      if (cleanPhone.length >= 7) phonesSet.add(match[1].trim());
    }
    const emailsSet = /* @__PURE__ */ new Set();
    const mailtoRegex = /href=["']mailto:([^"?#]+)[^"']*["']/gi;
    while ((match = mailtoRegex.exec(html)) !== null) {
      const emailCandidate = match[1].trim().toLowerCase();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCandidate) && !emailCandidate.endsWith(".png") && !emailCandidate.endsWith(".jpg")) {
        emailsSet.add(emailCandidate);
      }
    }
    const bookingLinksSet = /* @__PURE__ */ new Set();
    const bookingPattern = /href=["'](https?:\/\/[^"']*(?:calendly\.com|cal\.com|zocdoc\.com|fresha\.com|jane\.app|acuityscheduling\.com|mindbodyonline\.com|square\.site|hubspot\.com\/meetings)[^"']*)["']/gi;
    while ((match = bookingPattern.exec(html)) !== null) {
      bookingLinksSet.add(match[1]);
    }
    const contactPagesSet = /* @__PURE__ */ new Set();
    const contactPagePattern = /href=["']([^"']*(?:\/contact|\/contact-us|\/reach-us|\/get-in-touch|\/location)[^"']*)["']/gi;
    while ((match = contactPagePattern.exec(html)) !== null) {
      contactPagesSet.add(match[1]);
    }
    const socialProfiles = {};
    const socialPatterns = [
      { key: "linkedin", regex: /href=["'](https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[^"'\s]+)["']/i },
      { key: "facebook", regex: /href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'\s]+)["']/i },
      { key: "instagram", regex: /href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'\s]+)["']/i },
      { key: "twitter", regex: /href=["'](https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[^"'\s]+)["']/i },
      { key: "youtube", regex: /href=["'](https?:\/\/(?:www\.)?youtube\.com\/(?:@|channel\/|user\/)[^"'\s]+)["']/i }
    ];
    for (const sp of socialPatterns) {
      const sMatch = html.match(sp.regex);
      if (sMatch) {
        socialProfiles[sp.key] = sMatch[1];
      }
    }
    const imgRegex = /<img\b([^>]*)>/gi;
    let totalImages = 0;
    let missingAltCount = 0;
    while ((match = imgRegex.exec(html)) !== null) {
      totalImages++;
      const attrs = match[1];
      if (!attrs.includes("alt=") || /alt=["']\s*["']/.test(attrs)) {
        missingAltCount++;
      }
    }
    const detectedCms = this.detectCms(html);
    const gaps = [];
    if (!isHttps) gaps.push("Website is not secured with HTTPS/SSL.");
    if (!title) gaps.push("Missing HTML <title> tag.");
    if (title && (title.length < 15 || title.length > 70)) gaps.push(`Title length (${title.length} chars) is outside optimal 15-60 character range.`);
    if (!metaDescription) gaps.push("Missing meta description tag.");
    if (h1Matches.length === 0) gaps.push("No <h1> heading tag found on page.");
    if (h1Matches.length > 1) gaps.push(`Multiple <h1> heading tags detected (${h1Matches.length}), which diffuses SEO keyword focus.`);
    if (!canonicalUrl) gaps.push("Missing canonical URL tag.");
    if (!hasViewport) gaps.push("Missing mobile viewport meta tag (site may not render properly on smartphones).");
    if (!hasLocalBusinessSchema) gaps.push("Missing Schema.org LocalBusiness JSON-LD markup for Google local 3-pack optimization.");
    if (!hasWhatsAppLink) gaps.push("No instant WhatsApp lead capture trigger detected on page.");
    if (bookingLinksSet.size === 0 && phonesSet.size === 0) gaps.push("No direct online booking or visible telephone call triggers found.");
    if (missingAltCount > 3) gaps.push(`${missingAltCount} images are missing descriptive alt attributes for SEO and accessibility.`);
    if (responseTimeMs > 2500) gaps.push(`Initial HTML server response time (${(responseTimeMs / 1e3).toFixed(1)}s) is slower than Google 1.0s target.`);
    let readinessScore = 35;
    if (isHttps) readinessScore += 10;
    if (hasViewport) readinessScore += 15;
    if (title && metaDescription) readinessScore += 15;
    if (h1Matches.length === 1) readinessScore += 10;
    if (hasLocalBusinessSchema) readinessScore += 10;
    if (hasWhatsAppLink || hasTelLink) readinessScore += 10;
    if (responseTimeMs < 1500) readinessScore += 10;
    readinessScore = Math.min(100, readinessScore);
    const recommendedPrimeSoulActions = [
      hasLocalBusinessSchema ? "Maintain local schema and expand service catalog markup" : "Implement custom Schema.org LocalBusiness JSON-LD markup",
      !hasWhatsAppLink ? "Deploy automated WhatsApp lead routing widget" : "Optimize WhatsApp conversion copy & intake workflow",
      responseTimeMs > 1500 || detectedCms.includes("WordPress") ? "Rebuild high-performance web architecture for sub-second load times" : "Conduct technical Core Web Vitals optimization sprint",
      !canonicalUrl || !metaDescription ? "Fix fundamental on-page SEO meta architecture" : "Expand local 3-pack geographic citations"
    ];
    const techStack = [detectedCms];
    if (isHttps) techStack.push("HTTPS SSL Certificate");
    if (hasWhatsAppLink) techStack.push("WhatsApp Click-to-Chat Integration");
    if (hasTelLink || phonesSet.size > 0) techStack.push("Direct Tel Calling Links");
    if (bookingLinksSet.size > 0) techStack.push("Direct Appointment Booking Integration");
    if (schemaTypes.size > 0) techStack.push(`Schema.org (${Array.from(schemaTypes).join(", ")})`);
    return {
      url: originalUrl,
      finalUrl,
      isAccessible: httpStatus >= 200 && httpStatus < 400,
      httpStatus,
      measured: {
        httpStatus,
        responseTimeMs,
        contentSizeBytes,
        isHttps,
        redirectCount,
        compressionType
      },
      detected: {
        title,
        metaDescription,
        canonicalUrl,
        hasViewport,
        viewportContent,
        robotsDirective,
        robotsTxtStatus: params.robotsTxtStatus || "UNCHECKED",
        sitemapStatus: params.sitemapStatus || "UNCHECKED",
        openGraph,
        headings: {
          h1: h1Matches,
          h2Count: h2Matches.length,
          sampleH2s: h2Matches.slice(0, 5),
          h3Count: h3Matches.length,
          sampleH3s: h3Matches.slice(0, 5)
        },
        detectedCms,
        hasWhatsAppLink,
        hasTelLink,
        publicPhones: Array.from(phonesSet),
        publicEmails: Array.from(emailsSet),
        bookingLinks: Array.from(bookingLinksSet),
        contactPageUrls: Array.from(contactPagesSet),
        socialProfiles,
        imageOptimization: {
          totalImages,
          missingAltCount
        },
        schemaTypes: Array.from(schemaTypes),
        hasLocalBusinessSchema
      },
      inferred: {
        mobileFriendlinessEstimate: hasViewport ? "LIKELY_RESPONSIVE" : "POTENTIALLY_NON_RESPONSIVE",
        localBusinessReadinessScore: readinessScore,
        detectedTechStack: techStack,
        identifiedGaps: gaps,
        recommendedPrimeSoulActions
      },
      unknown: {
        realUserCoreWebVitals: "Unknown without Chrome User Experience Report (CrUX) API or Google Search Console connection.",
        organicSearchVolume: "Unknown without Google Analytics / Search Console direct access.",
        internalServerArchitecture: "Unknown without hosting server inspection."
      }
    };
  }
  extractHeadingTags(html, tag) {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
    const results = [];
    let m;
    while ((m = regex.exec(html)) !== null) {
      const text = this.stripTags(m[1]).trim();
      if (text) results.push(text);
    }
    return results;
  }
  detectCms(html) {
    if (/wp-content|wp-includes|wordpress/i.test(html)) {
      if (/elementor/i.test(html)) return "WordPress / Elementor Builder";
      if (/divi/i.test(html)) return "WordPress / Divi Builder";
      return "WordPress CMS";
    }
    if (/cdn\.shopify\.com|shopify/i.test(html)) return "Shopify E-Commerce";
    if (/wix\.com|wixsite\.com/i.test(html)) return "Wix Website Builder";
    if (/squarespace\.com/i.test(html)) return "Squarespace";
    if (/webflow\.com|data-wf-page/i.test(html)) return "Webflow";
    if (/__NEXT_DATA__|next\/router/i.test(html)) return "Next.js React Framework";
    if (/__NUXT__|nuxt/i.test(html)) return "Nuxt.js Vue Framework";
    return "Custom Web Application / Static HTML";
  }
  extractSchemaTypes(data, types) {
    if (!data) return;
    if (Array.isArray(data)) {
      for (const item of data) this.extractSchemaTypes(item, types);
      return;
    }
    if (typeof data === "object") {
      if (data["@type"]) {
        if (Array.isArray(data["@type"])) {
          data["@type"].forEach((t) => types.add(String(t)));
        } else {
          types.add(String(data["@type"]));
        }
      }
      if (data["@graph"] && Array.isArray(data["@graph"])) {
        this.extractSchemaTypes(data["@graph"], types);
      }
    }
  }
  stripTags(str) {
    return str.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  cleanHtmlEntities(str) {
    return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
  }
};

// src/core/tools/web-search.tool.ts
var WebSearchTool = class {
  name = "web_search";
  description = "Searches for business leads, industry competitor data, and buying signals.";
  parameters = [
    { name: "query", type: "string", description: "The search query or company name", required: true },
    { name: "limit", type: "number", description: "Number of results to return" }
  ];
  async execute(args) {
    const q = args.query.toLowerCase();
    const limit = args.limit || 5;
    const results = [
      {
        title: `Search Result: ${args.query} - Digital Profile`,
        url: `https://example.com/search?q=${encodeURIComponent(args.query)}`,
        snippet: `Business listings and public activity for ${args.query}. Showing recent local citations, online reviews, and domain details.`,
        signals: [
          "Unverified local directory listings detected",
          "Competitors actively advertising on primary service keywords"
        ]
      },
      {
        title: `${args.query} - Reviews & Map Visibility`,
        url: `https://maps.google.com/?q=${encodeURIComponent(args.query)}`,
        snippet: `Google Maps presence for ${args.query}. Review rating 3.8/5 with unaddressed customer feedback.`,
        signals: [
          "Low review volume relative to local geographic competitors"
        ]
      }
    ].slice(0, limit);
    return {
      success: true,
      data: {
        query: args.query,
        resultCount: results.length,
        results
      }
    };
  }
};

// src/core/provenance/provenance.service.ts
var ProvenanceService = class _ProvenanceService {
  static instance;
  static getInstance() {
    if (!_ProvenanceService.instance) {
      _ProvenanceService.instance = new _ProvenanceService();
    }
    return _ProvenanceService.instance;
  }
  /**
   * Extracts verified, typed provenance facts from a live WebAnalyzer report.
   */
  extractFromWebAnalysis(report) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const facts = {};
    if (!report || !report.measured) {
      return facts;
    }
    const source = report.finalUrl || report.url;
    facts["httpStatus"] = {
      field: "httpStatus",
      value: report.measured.httpStatus,
      source,
      sourceType: "LIVE_WEBSITE",
      confidence: "HIGH",
      evidence: `Live HTTP GET returned status code ${report.measured.httpStatus}`,
      timestamp,
      stage: "web_analysis"
    };
    facts["responseTimeMs"] = {
      field: "responseTimeMs",
      value: report.measured.responseTimeMs,
      source,
      sourceType: "LIVE_WEBSITE",
      confidence: "HIGH",
      evidence: `Initial HTML response time measured at ${report.measured.responseTimeMs}ms`,
      timestamp,
      stage: "web_analysis"
    };
    facts["isHttps"] = {
      field: "isHttps",
      value: report.measured.isHttps,
      source,
      sourceType: "LIVE_WEBSITE",
      confidence: "HIGH",
      evidence: report.measured.isHttps ? "HTTPS SSL certificate detected" : "Insecure HTTP connection",
      timestamp,
      stage: "web_analysis"
    };
    if (report.detected.title) {
      facts["websiteTitle"] = {
        field: "websiteTitle",
        value: report.detected.title,
        source,
        sourceType: "LIVE_WEBSITE",
        confidence: "HIGH",
        evidence: `Extracted from <title> tag: "${report.detected.title}"`,
        timestamp,
        stage: "web_analysis"
      };
    } else {
      facts["websiteTitle"] = {
        field: "websiteTitle",
        value: "UNKNOWN",
        source,
        sourceType: "UNKNOWN",
        confidence: "NONE",
        evidence: "HTML <title> tag was missing on the scanned webpage",
        timestamp,
        stage: "web_analysis"
      };
    }
    if (report.detected.headings.h1.length > 0) {
      facts["h1Heading"] = {
        field: "h1Heading",
        value: report.detected.headings.h1[0],
        source,
        sourceType: "LIVE_WEBSITE",
        confidence: "HIGH",
        evidence: `Found <h1> tag: "${report.detected.headings.h1[0]}"`,
        timestamp,
        stage: "web_analysis"
      };
    }
    facts["hasMetaDescription"] = {
      field: "hasMetaDescription",
      value: !!report.detected.metaDescription,
      source,
      sourceType: "LIVE_WEBSITE",
      confidence: "HIGH",
      evidence: report.detected.metaDescription ? `Description: "${report.detected.metaDescription}"` : 'Missing <meta name="description"> tag',
      timestamp,
      stage: "web_analysis"
    };
    facts["hasLocalBusinessSchema"] = {
      field: "hasLocalBusinessSchema",
      value: report.detected.hasLocalBusinessSchema,
      source,
      sourceType: "LIVE_WEBSITE",
      confidence: "HIGH",
      evidence: report.detected.hasLocalBusinessSchema ? `Found Schema.org types: ${report.detected.schemaTypes.join(", ")}` : "Zero LocalBusiness JSON-LD markup found in DOM",
      timestamp,
      stage: "web_analysis"
    };
    facts["hasWhatsAppWidget"] = {
      field: "hasWhatsAppWidget",
      value: report.detected.hasWhatsAppLink,
      source,
      sourceType: "LIVE_WEBSITE",
      confidence: "HIGH",
      evidence: report.detected.hasWhatsAppLink ? "WhatsApp click-to-chat link detected" : "No WhatsApp lead capture links detected",
      timestamp,
      stage: "web_analysis"
    };
    if (report.inferred.identifiedGaps && report.inferred.identifiedGaps.length > 0) {
      facts["identifiedGaps"] = {
        field: "identifiedGaps",
        value: report.inferred.identifiedGaps,
        source,
        sourceType: "INFERENCE",
        confidence: "HIGH",
        evidence: `Inferred directly from observable HTML missing tags (${report.inferred.identifiedGaps.length} gaps)`,
        timestamp,
        stage: "web_analysis"
      };
    }
    return facts;
  }
  /**
   * Extracts verified provenance facts from user-supplied CRM lead input.
   */
  extractFromLeadData(lead, sourceName = "User CRM Input") {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const facts = {};
    if (!lead || typeof lead !== "object") {
      return facts;
    }
    if (lead.businessName && lead.businessName.trim() && lead.businessName !== "UNKNOWN") {
      facts["businessName"] = {
        field: "businessName",
        value: lead.businessName.trim(),
        source: sourceName,
        sourceType: "USER_CRM",
        confidence: "HIGH",
        evidence: `Explicitly provided in lead record: "${lead.businessName}"`,
        timestamp,
        stage: "crm_input"
      };
    } else {
      facts["businessName"] = {
        field: "businessName",
        value: "UNKNOWN",
        source: sourceName,
        sourceType: "UNKNOWN",
        confidence: "NONE",
        evidence: "Business name was not provided in input context",
        timestamp,
        stage: "crm_input"
      };
    }
    if (lead.contactName && lead.contactName.trim() && lead.contactName !== "UNKNOWN") {
      facts["contactName"] = {
        field: "contactName",
        value: lead.contactName.trim(),
        source: sourceName,
        sourceType: "USER_CRM",
        confidence: "HIGH",
        evidence: `Explicitly provided in lead record: "${lead.contactName}"`,
        timestamp,
        stage: "crm_input"
      };
    } else {
      facts["contactName"] = {
        field: "contactName",
        value: "UNKNOWN",
        source: sourceName,
        sourceType: "UNKNOWN",
        confidence: "NONE",
        evidence: "Contact person name was not provided in lead data",
        timestamp,
        stage: "crm_input"
      };
    }
    if (lead.location && lead.location.trim() && lead.location !== "UNKNOWN") {
      facts["location"] = {
        field: "location",
        value: lead.location.trim(),
        source: sourceName,
        sourceType: "USER_CRM",
        confidence: "HIGH",
        evidence: `Explicitly provided in lead record: "${lead.location}"`,
        timestamp,
        stage: "crm_input"
      };
    } else {
      facts["location"] = {
        field: "location",
        value: "UNKNOWN",
        source: sourceName,
        sourceType: "UNKNOWN",
        confidence: "NONE",
        evidence: "Location was not provided in lead data",
        timestamp,
        stage: "crm_input"
      };
    }
    if (lead.website && lead.website.trim()) {
      facts["websiteUrl"] = {
        field: "websiteUrl",
        value: lead.website.trim(),
        source: sourceName,
        sourceType: "USER_CRM",
        confidence: "HIGH",
        evidence: `Explicitly provided target domain: "${lead.website}"`,
        timestamp,
        stage: "crm_input"
      };
    }
    if (lead.industry && lead.industry.trim() && lead.industry !== "UNKNOWN") {
      facts["industry"] = {
        field: "industry",
        value: lead.industry.trim(),
        source: sourceName,
        sourceType: "USER_CRM",
        confidence: "HIGH",
        evidence: `Explicitly provided industry sector: "${lead.industry}"`,
        timestamp,
        stage: "crm_input"
      };
    } else {
      facts["industry"] = {
        field: "industry",
        value: "UNKNOWN",
        source: sourceName,
        sourceType: "UNKNOWN",
        confidence: "NONE",
        evidence: "Industry niche was not provided in lead data",
        timestamp,
        stage: "crm_input"
      };
    }
    return facts;
  }
  /**
   * Merges multiple provenance collections into a unified provenance store.
   */
  mergeProvenance(...records) {
    const merged = {};
    for (const rec of records) {
      if (rec && typeof rec === "object") {
        Object.assign(merged, rec);
      }
    }
    return merged;
  }
};

// src/core/research/identity-resolver.service.ts
var IdentityResolverService = class _IdentityResolverService {
  static instance;
  static getInstance() {
    if (!_IdentityResolverService.instance) {
      _IdentityResolverService.instance = new _IdentityResolverService();
    }
    return _IdentityResolverService.instance;
  }
  /**
   * Resolves business identity by cross-referencing input parameters, live website DOM data, and search signals.
   */
  resolveIdentity(params) {
    const { inputName, inputLocation, inputUrl, webReport, searchResults } = params;
    const ambiguityReasons = [];
    const evidence = [];
    const verifiedLocations = [];
    let domain = "";
    if (webReport?.finalUrl || inputUrl) {
      try {
        const u = new URL(webReport?.finalUrl || inputUrl);
        domain = u.hostname.replace(/^www\./, "");
      } catch {
        domain = "";
      }
    }
    let resolvedName = "";
    const title = webReport?.detected?.title || "";
    const cleanTitle = title.replace(/^Home\s*[-–|:]\s*/i, "").replace(/\s*[-–|:]\s*Home$/i, "").replace(/\s*[-–|:]\s*(?:Official Site|Welcome|Website)$/i, "").trim();
    if (inputName && inputName !== "UNKNOWN") {
      resolvedName = inputName.trim();
      evidence.push(`Input business name provided: "${inputName}"`);
    } else if (cleanTitle) {
      resolvedName = cleanTitle;
      evidence.push(`Derived business name from website title: "${cleanTitle}"`);
    } else if (domain) {
      resolvedName = domain.split(".")[0].replace(/[-_]/g, " ").toUpperCase();
      evidence.push(`Derived default business name from domain: "${resolvedName}"`);
    } else {
      resolvedName = "UNKNOWN";
      ambiguityReasons.push("No business name provided and unable to derive from website metadata.");
    }
    if (inputLocation && inputLocation !== "UNKNOWN") {
      verifiedLocations.push(inputLocation.trim());
      evidence.push(`Input geographic market provided: "${inputLocation}"`);
    }
    if (title) {
      const usStateRegex = /\b([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})\b/;
      const match = title.match(usStateRegex);
      if (match && !verifiedLocations.includes(match[0])) {
        verifiedLocations.push(match[0]);
        evidence.push(`Geographic marker detected in page title: "${match[0]}"`);
      }
    }
    if (searchResults && searchResults.length > 0) {
      evidence.push(`Cross-referenced ${searchResults.length} public web search results.`);
      const distinctNames = /* @__PURE__ */ new Set();
      for (const res of searchResults) {
        if (res.title) distinctNames.add(res.title);
      }
      if (distinctNames.size > 3 && !domain) {
        ambiguityReasons.push(`Search query returned multiple disparate business entities without a confirmed domain anchor.`);
      }
    }
    let status = "CONFIDENT";
    if (ambiguityReasons.length > 0) {
      status = "AMBIGUOUS";
    } else if (domain && resolvedName && resolvedName !== "UNKNOWN") {
      status = "CONFIDENT";
    } else if (resolvedName && resolvedName !== "UNKNOWN" && verifiedLocations.length > 0) {
      status = "PROBABLE";
    } else {
      status = "AMBIGUOUS";
      ambiguityReasons.push("Insufficient authoritative signals to resolve unique business identity.");
    }
    return {
      status,
      resolvedName,
      domain,
      verifiedLocations,
      ambiguityReasons,
      evidence
    };
  }
};

// src/core/research/scoring.service.ts
var ScoringService = class _ScoringService {
  static instance;
  static getInstance() {
    if (!_ScoringService.instance) {
      _ScoringService.instance = new _ScoringService();
    }
    return _ScoringService.instance;
  }
  /**
   * Calculates transparent dimensional health scores with granular reason codes and evidence.
   */
  calculateDimensionalScores(report) {
    const dimensions = [];
    let techScore = 0;
    const techReasons = [];
    if (report.measured.isHttps) {
      techScore += 25;
      techReasons.push({ type: "BONUS", points: 25, description: "HTTPS SSL certificate active", evidence: "Verified https:// protocol" });
    } else {
      techReasons.push({ type: "DEDUCTION", points: 0, description: "Missing HTTPS security", evidence: "Insecure http:// connection" });
    }
    if (report.detected.hasViewport) {
      techScore += 25;
      techReasons.push({ type: "BONUS", points: 25, description: "Mobile responsive viewport configured", evidence: `Viewport: "${report.detected.viewportContent || "standard"}"` });
    } else {
      techReasons.push({ type: "DEDUCTION", points: 0, description: "Missing mobile viewport tag", evidence: "Zero viewport meta tags in DOM" });
    }
    if (report.measured.responseTimeMs < 1200) {
      techScore += 30;
      techReasons.push({ type: "BONUS", points: 30, description: "Sub-second fast server response", evidence: `Measured initial response: ${report.measured.responseTimeMs}ms` });
    } else if (report.measured.responseTimeMs < 2500) {
      techScore += 15;
      techReasons.push({ type: "BONUS", points: 15, description: "Moderate server latency", evidence: `Measured initial response: ${report.measured.responseTimeMs}ms` });
    } else {
      techReasons.push({ type: "DEDUCTION", points: 0, description: "Slow initial server response (>2.5s)", evidence: `Measured latency: ${report.measured.responseTimeMs}ms exceeds Google 1.0s target` });
    }
    if (report.measured.compressionType && report.measured.compressionType !== "none") {
      techScore += 20;
      techReasons.push({ type: "BONUS", points: 20, description: `HTTP compression active (${report.measured.compressionType})`, evidence: `Content-Encoding: ${report.measured.compressionType}` });
    } else {
      techReasons.push({ type: "DEDUCTION", points: 0, description: "No HTTP gzip/brotli compression detected", evidence: "Uncompressed raw HTML payload" });
    }
    techScore = Math.min(100, techScore);
    dimensions.push({ name: "Technical Health", score: techScore, weight: 0.2, reasons: techReasons });
    let seoScore = 0;
    const seoReasons = [];
    if (report.detected.title) {
      const len = report.detected.title.length;
      if (len >= 15 && len <= 65) {
        seoScore += 25;
        seoReasons.push({ type: "BONUS", points: 25, description: "Optimal title length (15-65 chars)", evidence: `Title (${len} chars): "${report.detected.title}"` });
      } else {
        seoScore += 10;
        seoReasons.push({ type: "BONUS", points: 10, description: "Title tag present but outside optimal 15-65 char range", evidence: `Title (${len} chars): "${report.detected.title}"` });
      }
    } else {
      seoReasons.push({ type: "DEDUCTION", points: 0, description: "Missing HTML <title> tag", evidence: "Zero <title> elements found" });
    }
    if (report.detected.metaDescription) {
      seoScore += 25;
      seoReasons.push({ type: "BONUS", points: 25, description: "Meta description tag present", evidence: `Description: "${report.detected.metaDescription.slice(0, 50)}..."` });
    } else {
      seoReasons.push({ type: "DEDUCTION", points: 0, description: "Missing meta description tag", evidence: "Zero meta description tags in DOM" });
    }
    if (report.detected.headings.h1.length === 1) {
      seoScore += 25;
      seoReasons.push({ type: "BONUS", points: 25, description: "Single, focused <h1> heading tag", evidence: `H1: "${report.detected.headings.h1[0]}"` });
    } else if (report.detected.headings.h1.length > 1) {
      seoScore += 10;
      seoReasons.push({ type: "DEDUCTION", points: 10, description: `Multiple <h1> tags detected (${report.detected.headings.h1.length})`, evidence: `Found ${report.detected.headings.h1.length} separate H1 headings` });
    } else {
      seoReasons.push({ type: "DEDUCTION", points: 0, description: "Missing <h1> primary heading", evidence: "Zero <h1> tags in DOM" });
    }
    if (report.detected.canonicalUrl) {
      seoScore += 15;
      seoReasons.push({ type: "BONUS", points: 15, description: "Canonical URL defined", evidence: `Canonical: ${report.detected.canonicalUrl}` });
    } else {
      seoReasons.push({ type: "DEDUCTION", points: 0, description: "Missing canonical URL link tag", evidence: 'No link rel="canonical" in DOM' });
    }
    if (report.detected.imageOptimization.missingAltCount === 0 && report.detected.imageOptimization.totalImages > 0) {
      seoScore += 10;
      seoReasons.push({ type: "BONUS", points: 10, description: "All images contain descriptive alt text", evidence: `${report.detected.imageOptimization.totalImages} images checked` });
    } else if (report.detected.imageOptimization.missingAltCount > 0) {
      seoReasons.push({ type: "DEDUCTION", points: 0, description: `${report.detected.imageOptimization.missingAltCount} images missing alt text`, evidence: `${report.detected.imageOptimization.missingAltCount} of ${report.detected.imageOptimization.totalImages} images lack alt attributes` });
    }
    seoScore = Math.min(100, seoScore);
    dimensions.push({ name: "SEO Health", score: seoScore, weight: 0.25, reasons: seoReasons });
    let localSeoScore = 0;
    const localReasons = [];
    if (report.detected.hasLocalBusinessSchema) {
      localSeoScore += 45;
      localReasons.push({ type: "BONUS", points: 45, description: "Schema.org LocalBusiness structured data present", evidence: `Found schema types: ${report.detected.schemaTypes.join(", ")}` });
    } else {
      localReasons.push({ type: "DEDUCTION", points: 0, description: "Missing Schema.org LocalBusiness JSON-LD markup", evidence: "Zero LocalBusiness / DentalClinic / MedicalBusiness schema in DOM" });
    }
    if (report.detected.schemaTypes.length > 0 && !report.detected.hasLocalBusinessSchema) {
      localSeoScore += 15;
      localReasons.push({ type: "BONUS", points: 15, description: "Generic structured data detected (WebPage / BreadcrumbList)", evidence: `Types: ${report.detected.schemaTypes.join(", ")}` });
    }
    if (report.detected.robotsTxtStatus === "AVAILABLE") {
      localSeoScore += 20;
      localReasons.push({ type: "BONUS", points: 20, description: "robots.txt crawler configuration verified", evidence: "Accessible at /robots.txt" });
    } else {
      localReasons.push({ type: "DEDUCTION", points: 0, description: "robots.txt not detected or inaccessible", evidence: "Status: " + report.detected.robotsTxtStatus });
    }
    if (report.detected.sitemapStatus === "AVAILABLE") {
      localSeoScore += 20;
      localReasons.push({ type: "BONUS", points: 20, description: "XML Sitemap detected", evidence: "Referenced in HTML or standard index" });
    } else {
      localReasons.push({ type: "DEDUCTION", points: 0, description: "XML Sitemap unverified", evidence: "No standard sitemap reference in DOM" });
    }
    localSeoScore = Math.min(100, localSeoScore);
    dimensions.push({ name: "Local SEO Readiness", score: localSeoScore, weight: 0.2, reasons: localReasons });
    let conversionScore = 0;
    const convReasons = [];
    if (report.detected.hasWhatsAppLink) {
      conversionScore += 35;
      convReasons.push({ type: "BONUS", points: 35, description: "Direct WhatsApp click-to-chat conversion trigger present", evidence: "WhatsApp API / wa.me link found" });
    } else {
      convReasons.push({ type: "DEDUCTION", points: 0, description: "Missing instant WhatsApp intake trigger", evidence: "Zero WhatsApp links in DOM" });
    }
    if (report.detected.hasTelLink || report.detected.publicPhones.length > 0) {
      conversionScore += 30;
      convReasons.push({ type: "BONUS", points: 30, description: "Direct telephone calling triggers verified", evidence: `Detected numbers: ${report.detected.publicPhones.slice(0, 2).join(", ") || "tel: link"}` });
    } else {
      convReasons.push({ type: "DEDUCTION", points: 0, description: "No direct click-to-call phone links found", evidence: "Missing tel: links in DOM" });
    }
    if (report.detected.bookingLinks.length > 0) {
      conversionScore += 25;
      convReasons.push({ type: "BONUS", points: 25, description: "Direct appointment booking software detected", evidence: `Booking link: ${report.detected.bookingLinks[0]}` });
    }
    if (report.detected.contactPageUrls.length > 0) {
      conversionScore += 10;
      convReasons.push({ type: "BONUS", points: 10, description: "Dedicated contact page available", evidence: `Contact URL: ${report.detected.contactPageUrls[0]}` });
    }
    conversionScore = Math.min(100, conversionScore);
    dimensions.push({ name: "Conversion Readiness", score: conversionScore, weight: 0.15, reasons: convReasons });
    let socialScore = 0;
    const socialReasons = [];
    const profiles = report.detected.socialProfiles;
    let profilesCount = 0;
    if (profiles.linkedin) {
      socialScore += 25;
      profilesCount++;
      socialReasons.push({ type: "BONUS", points: 25, description: "LinkedIn company profile connected", evidence: profiles.linkedin });
    }
    if (profiles.facebook) {
      socialScore += 25;
      profilesCount++;
      socialReasons.push({ type: "BONUS", points: 25, description: "Facebook page connected", evidence: profiles.facebook });
    }
    if (profiles.instagram) {
      socialScore += 25;
      profilesCount++;
      socialReasons.push({ type: "BONUS", points: 25, description: "Instagram account connected", evidence: profiles.instagram });
    }
    if (profiles.twitter) {
      socialScore += 15;
      profilesCount++;
      socialReasons.push({ type: "BONUS", points: 15, description: "Twitter/X profile connected", evidence: profiles.twitter });
    }
    if (profiles.youtube) {
      socialScore += 10;
      profilesCount++;
      socialReasons.push({ type: "BONUS", points: 10, description: "YouTube channel connected", evidence: profiles.youtube });
    }
    if (profilesCount === 0) {
      socialReasons.push({ type: "DEDUCTION", points: 0, description: "Zero official social media profiles connected on homepage", evidence: "No social profile links found in DOM" });
    }
    socialScore = Math.min(100, socialScore);
    dimensions.push({ name: "Social Presence", score: socialScore, weight: 0.1, reasons: socialReasons });
    const overallScore = Math.round(
      techScore * 0.2 + seoScore * 0.25 + localSeoScore * 0.2 + conversionScore * 0.15 + socialScore * 0.1 + (report.measured.isHttps ? 80 : 40) * 0.1
    );
    return {
      overallScore,
      technicalHealth: techScore,
      seoHealth: seoScore,
      localSeoReadiness: localSeoScore,
      conversionReadiness: conversionScore,
      socialPresenceScore: socialScore,
      websiteQuality: Math.round((techScore + seoScore) / 2),
      dimensions
    };
  }
  /**
   * Calculates explainable Lead Score based on technical urgency and transformation upside.
   */
  calculateLeadScore(params) {
    const { report, dimensionalScores } = params;
    const scoreBreakdown = [];
    let leadScore = 40;
    scoreBreakdown.push({ factor: "Base Target Opportunity", points: 40, evidence: "Standard qualification baseline" });
    if (report.measured.responseTimeMs > 2500) {
      leadScore += 20;
      scoreBreakdown.push({ factor: "Critical Latency Friction (>2.5s)", points: 20, evidence: `Server response: ${report.measured.responseTimeMs}ms requires performance rebuild` });
    }
    if (!report.detected.hasLocalBusinessSchema) {
      leadScore += 15;
      scoreBreakdown.push({ factor: "Missing LocalBusiness Schema", points: 15, evidence: "Local 3-Pack rank upside via Schema.org implementation" });
    }
    if (!report.detected.hasWhatsAppLink) {
      leadScore += 15;
      scoreBreakdown.push({ factor: "Absent WhatsApp Conversion Trigger", points: 15, evidence: "High-intent local mobile intake upside" });
    }
    if (!report.detected.metaDescription || report.detected.headings.h1.length === 0) {
      leadScore += 10;
      scoreBreakdown.push({ factor: "On-Page SEO Gaps (Meta/H1)", points: 10, evidence: "Clear on-page SEO remediation package candidate" });
    }
    leadScore = Math.min(100, leadScore);
    let qualification = "QUALIFIED";
    if (leadScore >= 75) qualification = "QUALIFIED";
    else if (leadScore >= 55) qualification = "OPPORTUNITY";
    else qualification = "UNQUALIFIED";
    return {
      leadScore,
      qualification,
      confidence: "HIGH",
      scoreBreakdown
    };
  }
  /**
   * Maps verified gaps to tailored PrimeSoul service recommendations.
   */
  matchServices(gaps, report) {
    const matches = [];
    if (report.measured.responseTimeMs > 2e3 || report.detected.detectedCms.includes("WordPress") || !report.measured.isHttps) {
      matches.push({
        serviceName: "Website Design & Development",
        priority: "HIGH",
        rationale: "Rebuild monolithic CMS storefront with sub-second responsive architecture to eliminate mobile bounce friction.",
        matchedGaps: gaps.filter((g) => g.includes("response time") || g.includes("HTTPS") || g.includes("viewport"))
      });
    }
    if (!report.detected.hasLocalBusinessSchema || !report.detected.metaDescription || report.detected.headings.h1.length !== 1) {
      matches.push({
        serviceName: "Google Business Profile & Local SEO",
        priority: "HIGH",
        rationale: "Implement Schema.org JSON-LD structured markup and optimize on-page SEO meta architecture for Google 3-Pack rank dominance.",
        matchedGaps: gaps.filter((g) => g.includes("Schema.org") || g.includes("meta description") || g.includes("<h1>"))
      });
    }
    if (!report.detected.hasWhatsAppLink) {
      matches.push({
        serviceName: "WhatsApp Business Setup & Conversion Capture",
        priority: "MEDIUM",
        rationale: "Deploy automated WhatsApp lead routing widget to convert high-intent local visitors directly into intake staff.",
        matchedGaps: gaps.filter((g) => g.includes("WhatsApp"))
      });
    }
    return matches;
  }
};

// src/core/research/change-detector.service.ts
var ChangeDetectorService = class _ChangeDetectorService {
  static instance;
  static getInstance() {
    if (!_ChangeDetectorService.instance) {
      _ChangeDetectorService.instance = new _ChangeDetectorService();
    }
    return _ChangeDetectorService.instance;
  }
  /**
   * Compares the previous intelligence profile with current findings to detect meaningful shifts.
   */
  detectChanges(previous, current) {
    if (!previous) {
      return {
        hasChanges: false,
        changesCount: 0,
        changes: []
      };
    }
    const changes = [];
    if (previous.seo?.title && current.seo.title && previous.seo.title !== current.seo.title) {
      changes.push({
        field: "seo.title",
        previousValue: previous.seo.title,
        newValue: current.seo.title,
        significance: "INFORMATIONAL",
        description: `Page title changed from "${previous.seo.title}" to "${current.seo.title}"`
      });
    }
    const prevLatency = previous.website?.responseTimeMs;
    const currLatency = current.website.responseTimeMs;
    if (prevLatency !== void 0 && currLatency !== void 0) {
      const delta = Math.abs(currLatency - prevLatency);
      const percentChange = delta / prevLatency;
      if (percentChange > 0.5 && delta > 500) {
        changes.push({
          field: "website.responseTimeMs",
          previousValue: `${prevLatency}ms`,
          newValue: `${currLatency}ms`,
          significance: "MAJOR",
          description: `Server response latency changed significantly from ${prevLatency}ms to ${currLatency}ms (${(percentChange * 100).toFixed(0)}% shift)`
        });
      }
    }
    const prevSchema = previous.localSearch?.hasLocalBusinessSchema;
    const currSchema = current.localSearch.hasLocalBusinessSchema;
    if (prevSchema !== void 0 && prevSchema !== currSchema) {
      changes.push({
        field: "localSearch.hasLocalBusinessSchema",
        previousValue: prevSchema,
        newValue: currSchema,
        significance: "MAJOR",
        description: currSchema ? "New Schema.org LocalBusiness structured data implemented on website" : "Schema.org LocalBusiness structured data was removed from website"
      });
    }
    const prevWhatsApp = previous.conversion?.hasWhatsAppWidget;
    const currWhatsApp = current.conversion.hasWhatsAppWidget;
    if (prevWhatsApp !== void 0 && prevWhatsApp !== currWhatsApp) {
      changes.push({
        field: "conversion.hasWhatsAppWidget",
        previousValue: prevWhatsApp,
        newValue: currWhatsApp,
        significance: "MAJOR",
        description: currWhatsApp ? "WhatsApp click-to-chat trigger added to website" : "WhatsApp click-to-chat trigger was removed from website"
      });
    }
    const prevCms = previous.website?.detectedCms;
    const currCms = current.website.detectedCms;
    if (prevCms && currCms && prevCms !== currCms) {
      changes.push({
        field: "website.detectedCms",
        previousValue: prevCms,
        newValue: currCms,
        significance: "MAJOR",
        description: `Underlying website CMS changed from ${prevCms} to ${currCms}`
      });
    }
    const prevPhones = (previous.contact?.publicPhones || []).map((p) => p.value).sort().join(", ");
    const currPhones = current.contact.publicPhones.map((p) => p.value).sort().join(", ");
    if (prevPhones && currPhones && prevPhones !== currPhones) {
      changes.push({
        field: "contact.publicPhones",
        previousValue: prevPhones,
        newValue: currPhones,
        significance: "MAJOR",
        description: `Detected public telephone numbers updated: "${currPhones}"`
      });
    }
    const prevScore = previous.leadScoring?.leadScore;
    const currScore = current.leadScoring.leadScore;
    if (prevScore !== void 0 && Math.abs(currScore - prevScore) >= 5) {
      changes.push({
        field: "leadScoring.leadScore",
        previousValue: prevScore,
        newValue: currScore,
        significance: "MINOR",
        description: `Lead Qualification Score shifted by ${currScore - prevScore > 0 ? "+" : ""}${currScore - prevScore} points (now ${currScore}/100)`
      });
    }
    return {
      hasChanges: changes.length > 0,
      changesCount: changes.length,
      changes,
      previousRunTimestamp: previous.researchTimestamp
    };
  }
};

// src/core/research/lead-intelligence.service.ts
var LeadIntelligenceService = class _LeadIntelligenceService {
  static instance;
  webAnalyzer;
  webSearch;
  provenanceService;
  identityResolver;
  scoringService;
  changeDetector;
  db;
  constructor() {
    this.webAnalyzer = new WebAnalyzerTool();
    this.webSearch = new WebSearchTool();
    this.provenanceService = ProvenanceService.getInstance();
    this.identityResolver = IdentityResolverService.getInstance();
    this.scoringService = ScoringService.getInstance();
    this.changeDetector = ChangeDetectorService.getInstance();
    this.db = DatabaseService.getInstance();
  }
  static getInstance() {
    if (!_LeadIntelligenceService.instance) {
      _LeadIntelligenceService.instance = new _LeadIntelligenceService();
    }
    return _LeadIntelligenceService.instance;
  }
  /**
   * Executes the full end-to-end Lead Intelligence Research Pipeline.
   */
  async executeResearch(params) {
    const runId = `run-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const errors = [];
    const unknownFields = [];
    const sources = [];
    let targetUrl = params.url?.trim() || "";
    const inputBusinessName = params.businessName?.trim() || "";
    const inputLocation = params.location?.trim() || "";
    let existingLead;
    if (params.leadId) {
      existingLead = this.db.getLeadById(params.leadId);
      if (existingLead) {
        if (!targetUrl && existingLead.website) targetUrl = existingLead.website;
      }
    }
    if (!targetUrl && !inputBusinessName) {
      return {
        success: false,
        error: "Invalid input: Either a website URL or a business name is required to conduct research."
      };
    }
    let webReport;
    if (targetUrl) {
      const scanStart = Date.now();
      const webResult = await this.webAnalyzer.execute({
        url: targetUrl,
        businessName: inputBusinessName || existingLead?.businessName
      });
      if (webResult.success && webResult.data) {
        webReport = webResult.data;
        sources.push({
          url: webReport.finalUrl || targetUrl,
          sourceType: "LIVE_WEBSITE",
          status: "SUCCESS",
          timestamp,
          latencyMs: Date.now() - scanStart
        });
      } else {
        errors.push(`Website scan issue: ${webResult.error}`);
        sources.push({
          url: targetUrl,
          sourceType: "LIVE_WEBSITE",
          status: "FAILED",
          timestamp,
          latencyMs: Date.now() - scanStart
        });
      }
    } else {
      unknownFields.push("websiteUrl");
    }
    const searchQuery = inputBusinessName ? `${inputBusinessName} ${inputLocation}`.trim() : webReport?.detected?.title || targetUrl;
    let searchResults = [];
    try {
      const searchRes = await this.webSearch.execute({ query: searchQuery, limit: 4 });
      if (searchRes.success && searchRes.data?.results) {
        searchResults = searchRes.data.results;
        sources.push({
          url: `https://search.engine/?q=${encodeURIComponent(searchQuery)}`,
          sourceType: "PUBLIC_WEB",
          status: "SUCCESS",
          timestamp
        });
      }
    } catch (sErr) {
      errors.push(`Public search lookup failed: ${sErr.message}`);
    }
    const identityResult = this.identityResolver.resolveIdentity({
      inputName: inputBusinessName || existingLead?.businessName,
      inputLocation: inputLocation || existingLead?.location,
      inputUrl: targetUrl,
      webReport,
      searchResults
    });
    if (identityResult.status === "AMBIGUOUS") {
      unknownFields.push("identity.ambiguity");
    }
    const reportToScore = webReport || {
      url: targetUrl,
      finalUrl: targetUrl,
      isAccessible: false,
      measured: { httpStatus: 0, responseTimeMs: 0, contentSizeBytes: 0, isHttps: targetUrl.startsWith("https://"), redirectCount: 0 },
      detected: {
        title: inputBusinessName,
        hasViewport: false,
        robotsTxtStatus: "UNCHECKED",
        sitemapStatus: "UNCHECKED",
        openGraph: {},
        headings: { h1: [], h2Count: 0, sampleH2s: [], h3Count: 0, sampleH3s: [] },
        detectedCms: "Unknown / Offline",
        hasWhatsAppLink: false,
        hasTelLink: false,
        publicPhones: [],
        publicEmails: [],
        bookingLinks: [],
        contactPageUrls: [],
        socialProfiles: {},
        imageOptimization: { totalImages: 0, missingAltCount: 0 },
        schemaTypes: [],
        hasLocalBusinessSchema: false
      },
      inferred: {
        mobileFriendlinessEstimate: "UNKNOWN",
        localBusinessReadinessScore: 30,
        detectedTechStack: ["Unverified"],
        identifiedGaps: ["Website was inaccessible during audit or no URL provided."],
        recommendedPrimeSoulActions: ["Conduct manual business discovery and website verification"]
      },
      unknown: {
        realUserCoreWebVitals: "Unknown",
        organicSearchVolume: "Unknown",
        internalServerArchitecture: "Unknown"
      }
    };
    const dimensionalScores = this.scoringService.calculateDimensionalScores(reportToScore);
    const leadScoring = this.scoringService.calculateLeadScore({ report: reportToScore, dimensionalScores });
    const recommendedServices = this.scoringService.matchServices(reportToScore.inferred.identifiedGaps, reportToScore);
    const publicPhones = reportToScore.detected.publicPhones.map((phone) => ({
      value: phone,
      type: "PHONE",
      source: reportToScore.finalUrl || targetUrl,
      sourceType: "LIVE_WEBSITE",
      confidence: "HIGH",
      evidence: `Extracted from direct tel: link on ${reportToScore.finalUrl || targetUrl}`
    }));
    const publicEmails = reportToScore.detected.publicEmails.map((email) => ({
      value: email,
      type: "EMAIL",
      source: reportToScore.finalUrl || targetUrl,
      sourceType: "LIVE_WEBSITE",
      confidence: "HIGH",
      evidence: `Extracted from direct mailto: link on ${reportToScore.finalUrl || targetUrl}`
    }));
    if (publicPhones.length === 0) unknownFields.push("contact.publicPhones");
    if (publicEmails.length === 0) unknownFields.push("contact.publicEmails");
    const webFacts = this.provenanceService.extractFromWebAnalysis(reportToScore);
    const crmFacts = this.provenanceService.extractFromLeadData({
      businessName: identityResult.resolvedName,
      location: identityResult.verifiedLocations[0] || "UNKNOWN",
      website: targetUrl,
      industry: existingLead?.industry || "UNKNOWN"
    });
    const provenanceDictionary = this.provenanceService.mergeProvenance(webFacts, crmFacts);
    const profile = {
      identity: {
        resolvedName: identityResult.resolvedName,
        legalName: identityResult.legalName,
        domain: identityResult.domain,
        verifiedLocations: identityResult.verifiedLocations,
        confidence: identityResult.status,
        ambiguityReasons: identityResult.ambiguityReasons.length > 0 ? identityResult.ambiguityReasons : void 0
      },
      business: {
        category: existingLead?.industry || "Local Business & Professional Services",
        summary: reportToScore.detected.metaDescription || `Business profile for ${identityResult.resolvedName}`,
        operationalStatus: reportToScore.isAccessible ? "OPERATIONAL" : "REQUIRES_MANUAL_CHECK"
      },
      contact: {
        publicPhones,
        publicEmails,
        contactPages: reportToScore.detected.contactPageUrls,
        bookingLinks: reportToScore.detected.bookingLinks,
        address: identityResult.verifiedLocations[0]
      },
      website: {
        finalUrl: reportToScore.finalUrl,
        isHttps: reportToScore.measured.isHttps,
        httpStatus: reportToScore.measured.httpStatus,
        responseTimeMs: reportToScore.measured.responseTimeMs,
        contentSizeBytes: reportToScore.measured.contentSizeBytes,
        compressionType: reportToScore.measured.compressionType,
        detectedCms: reportToScore.detected.detectedCms,
        detectedTechStack: reportToScore.inferred.detectedTechStack
      },
      seo: {
        title: reportToScore.detected.title,
        metaDescription: reportToScore.detected.metaDescription,
        canonicalUrl: reportToScore.detected.canonicalUrl,
        h1Count: reportToScore.detected.headings.h1.length,
        sampleH1s: reportToScore.detected.headings.h1,
        h2Count: reportToScore.detected.headings.h2Count,
        sampleH2s: reportToScore.detected.headings.sampleH2s,
        h3Count: reportToScore.detected.headings.h3Count,
        robotsTxtStatus: reportToScore.detected.robotsTxtStatus,
        sitemapStatus: reportToScore.detected.sitemapStatus,
        imageOptimization: reportToScore.detected.imageOptimization,
        score: dimensionalScores.seoHealth,
        reasons: dimensionalScores.dimensions.find((d) => d.name === "SEO Health")?.reasons.map((r) => r.description) || []
      },
      localSearch: {
        hasLocalBusinessSchema: reportToScore.detected.hasLocalBusinessSchema,
        schemaTypes: reportToScore.detected.schemaTypes,
        googleMapsPresence: !!searchResults.find((r) => r.url?.includes("maps.google.com")),
        score: dimensionalScores.localSeoReadiness,
        reasons: dimensionalScores.dimensions.find((d) => d.name === "Local SEO Readiness")?.reasons.map((r) => r.description) || []
      },
      conversion: {
        hasWhatsAppWidget: reportToScore.detected.hasWhatsAppLink,
        hasTelLink: reportToScore.detected.hasTelLink,
        hasBookingWidget: reportToScore.detected.bookingLinks.length > 0,
        hasLeadForm: reportToScore.detected.contactPageUrls.length > 0,
        score: dimensionalScores.conversionReadiness,
        reasons: dimensionalScores.dimensions.find((d) => d.name === "Conversion Readiness")?.reasons.map((r) => r.description) || []
      },
      socialPresence: {
        ...reportToScore.detected.socialProfiles,
        score: dimensionalScores.socialPresenceScore,
        reasons: dimensionalScores.dimensions.find((d) => d.name === "Social Presence")?.reasons.map((r) => r.description) || []
      },
      digitalPresence: dimensionalScores,
      leadScoring,
      verifiedGaps: reportToScore.inferred.identifiedGaps,
      opportunities: [
        "Sub-second responsive website rebuild",
        "Local 3-Pack Schema.org JSON-LD structured data",
        "Direct WhatsApp conversion capture integration",
        "On-page SEO meta architecture remediation"
      ],
      unknowns: unknownFields,
      recommendedServices,
      provenance: provenanceDictionary,
      researchRunId: runId,
      researchTimestamp: timestamp
    };
    const changesReport = this.changeDetector.detectChanges(
      existingLead?.intelligenceProfile,
      profile
    );
    const leadToSave = {
      id: existingLead?.id,
      businessName: identityResult.resolvedName !== "UNKNOWN" ? identityResult.resolvedName : existingLead?.businessName || "UNKNOWN",
      website: targetUrl || existingLead?.website,
      location: identityResult.verifiedLocations[0] || existingLead?.location || "UNKNOWN",
      industry: existingLead?.industry || "Healthcare / Local Services",
      leadScore: leadScoring.leadScore,
      qualificationStatus: leadScoring.qualification,
      digitalPresenceScore: dimensionalScores.overallScore,
      painPoints: reportToScore.inferred.identifiedGaps,
      opportunities: profile.opportunities,
      recommendedServices: recommendedServices.map((s) => s.serviceName),
      socialProfiles: {
        ...existingLead?.socialProfiles,
        ...reportToScore.detected.socialProfiles
      },
      // Preserve verified contacts if new scan found none
      phone: publicPhones[0]?.value || existingLead?.phone,
      email: publicEmails[0]?.value || existingLead?.email,
      intelligenceProfile: profile,
      lastResearchAt: timestamp,
      researchStatus: webReport ? "COMPLETED" : "PARTIAL",
      researchRunId: runId,
      identityConfidence: identityResult.status
    };
    const savedLead = this.db.saveLead(leadToSave);
    const runRecord = {
      runId,
      leadId: savedLead.id,
      input: {
        url: targetUrl,
        businessName: inputBusinessName,
        location: inputLocation
      },
      status: webReport ? "COMPLETED" : targetUrl ? "PARTIAL" : "FAILED",
      sources,
      extractedFacts: provenanceDictionary,
      changesFromPrevious: changesReport,
      unknownFields,
      errors: errors.length > 0 ? errors : void 0,
      timestamp,
      profileSnapshot: profile
    };
    this.db.saveResearchRun(runRecord);
    return {
      success: true,
      profile,
      run: runRecord,
      lead: savedLead
    };
  }
};

// api/research.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  const db = DatabaseService.getInstance();
  const leadIntelligenceService = LeadIntelligenceService.getInstance();
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const result = await leadIntelligenceService.executeResearch(body);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  if (req.method === "GET") {
    try {
      const leadId = req.query?.leadId;
      const type = req.query?.type;
      if (!leadId) {
        return res.status(400).json({ success: false, error: "leadId is required" });
      }
      if (type === "profile") {
        const lead = db.getLeadById(leadId);
        if (!lead || !lead.intelligenceProfile) {
          return res.status(404).json({ success: false, error: "Lead profile not found" });
        }
        return res.status(200).json({ success: true, profile: lead.intelligenceProfile });
      }
      const runs = db.getResearchRuns(leadId);
      return res.status(200).json({ success: true, runs });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}
export {
  handler as default
};
