// src/core/database/db.service.ts
import fs from "fs";
import path from "path";

// src/core/database/seed.data.ts
var SEED_LEADS = [
  {
    id: "lead-001",
    businessName: "Apex Dental Care & Implant Center",
    industry: "Healthcare",
    businessCategory: "Clinic",
    location: "Indore, MP, India",
    city: "Indore",
    website: "https://apexdentalcare-sample.in",
    contactName: "Dr. Rajesh Sharma",
    email: "dr.sharma@apexdentalcare.in",
    phone: "+91 98260 12345",
    socialProfiles: {
      instagram: "instagram.com/apexdentalcare_indore",
      facebook: "facebook.com/apexdentalcare"
    },
    source: "AUDIT",
    sourceDetail: "website_audit",
    requirement: "Google Business",
    timeline: "Immediately",
    leadScore: 85,
    leadTemperature: "HOT",
    qualificationStatus: "QUALIFIED",
    growthStatus: "QUALIFIED",
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
    notesList: [
      {
        id: "note-1",
        leadId: "lead-001",
        author: "Param Sisodiya",
        content: "Completed initial digital presence audit. High intent for Google Business Profile and WhatsApp booking.",
        createdAt: new Date(Date.now() - 2 * 864e5).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "lead-002",
    businessName: "Royal Spice Family Restaurant & Cafe",
    industry: "Hospitality",
    businessCategory: "Restaurant",
    location: "Jaipur, RJ, India",
    city: "Jaipur",
    website: "https://royalspice-jaipur-demo.in",
    contactName: "Karan Singh Rathore",
    email: "karan@royalspice.in",
    phone: "+91 98290 87654",
    source: "QR_MENU",
    sourceDetail: "qr_menu_creation",
    requirement: "Restaurant QR Menu",
    timeline: "Within 7 days",
    leadScore: 90,
    leadTemperature: "HOT",
    qualificationStatus: "QUALIFIED",
    growthStatus: "DEMO",
    digitalPresenceScore: 65,
    painPoints: [
      "Paper menus getting worn out and expensive to reprint on price changes",
      "Weekend rush creates delays in waiter taking orders at tables",
      "No customer database for WhatsApp promotions"
    ],
    opportunities: [
      "Deploy PrimeOMS QR digital menu with table ordering",
      "WhatsApp automated bill receipt and feedback loop",
      "Google Review QR cards on every table"
    ],
    recommendedServices: [
      "PrimeOMS",
      "Restaurant QR Menu",
      "WhatsApp Business Setup"
    ],
    outreachStatus: "IN_PROGRESS",
    notes: "Owner Karan requested demo of PrimeOMS kitchen display and table ordering.",
    notesList: [
      {
        id: "note-2",
        leadId: "lead-002",
        author: "PrimeSoul Team",
        content: "Created free QR menu for 18 tables. Scheduled PrimeOMS demo for tomorrow 3 PM.",
        createdAt: new Date(Date.now() - 1 * 864e5).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "lead-003",
    businessName: "Bright Future International School",
    industry: "Education",
    businessCategory: "School",
    location: "Udaipur, RJ, India",
    city: "Udaipur",
    website: "https://brightfuture-demo.edu.in",
    contactName: "Mrs. Suman Meena",
    email: "admissions@brightfuture.edu.in",
    phone: "+91 94140 33445",
    source: "WEBSITE",
    sourceDetail: "school_landing_page",
    requirement: "Lead Generation",
    timeline: "Within 30 days",
    leadScore: 70,
    leadTemperature: "WARM",
    qualificationStatus: "QUALIFIED",
    growthStatus: "CONTACTED",
    digitalPresenceScore: 52,
    painPoints: [
      "Admission inquiries down 25% year-over-year",
      "Website is not mobile friendly and has no online inquiry form",
      "Parents searching on Google cannot find admission criteria"
    ],
    opportunities: [
      "Build dedicated Admission 2026-27 Landing Page",
      "WhatsApp automated parent brochure download",
      "Local Google Search & Meta Ads campaign"
    ],
    recommendedServices: [
      "Website",
      "Lead Generation",
      "Google Business"
    ],
    outreachStatus: "NOT_STARTED",
    notes: "Principal interested in digital admission campaigns for primary wing.",
    createdAt: new Date(Date.now() - 4 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var SEED_AUDITS = [
  {
    id: "audit-001",
    businessName: "Apex Dental Care & Implant Center",
    websiteUrl: "https://apexdentalcare-sample.in",
    category: "Clinic",
    city: "Indore",
    phone: "+91 98260 12345",
    score: 65,
    grade: "Needs Improvement",
    resultsJson: {
      score: 65,
      grade: "Needs Improvement",
      checks: [
        { id: "chk-accessibility", name: "Website Live & Accessible", category: "Technical", passed: true, score: 15, maxScore: 15, details: "Website is active and responded in 410ms.", severity: "GOOD" },
        { id: "chk-https", name: "SSL / HTTPS Security", category: "Technical", passed: true, score: 10, maxScore: 10, details: "Secure SSL certificate is active (https://).", severity: "GOOD" },
        { id: "chk-mobile", name: "Mobile Viewport Optimization", category: "Technical", passed: true, score: 15, maxScore: 15, details: "Mobile viewport meta tag configured.", severity: "GOOD" },
        { id: "chk-title", name: "Search Engine Title Tag", category: "SEO", passed: true, score: 10, maxScore: 10, details: "Title tag present.", severity: "GOOD" },
        { id: "chk-meta-desc", name: "Search Snippet Description", category: "SEO", passed: false, score: 0, maxScore: 10, details: "Missing meta description tag.", severity: "WARNING" },
        { id: "chk-phone", name: "Direct Call / Contact Link", category: "Conversion", passed: true, score: 10, maxScore: 10, details: "Phone number found.", severity: "GOOD" },
        { id: "chk-whatsapp", name: "WhatsApp Chat Integration", category: "Conversion", passed: false, score: 0, maxScore: 15, details: "No WhatsApp direct chat button found.", severity: "WARNING" },
        { id: "chk-schema", name: "Schema.org Structured Data", category: "Local", passed: false, score: 0, maxScore: 15, details: "Missing LocalBusiness schema.", severity: "WARNING" }
      ],
      strengths: [
        "Online presence active with live website.",
        "Secure HTTPS connection builds customer trust.",
        "Mobile viewport optimization active."
      ],
      issues: [
        "Missing search meta description \u2014 Google displays arbitrary page snippets.",
        "No WhatsApp chat button \u2014 Indian patients prefer inquiring via WhatsApp.",
        "Missing Schema.org structured data for Google Maps & Local search snippets."
      ],
      opportunities: [
        "Add a floating WhatsApp chat widget with pre-filled inquiry messages.",
        "Implement LocalBusiness Schema markup with clinic timings and ratings.",
        "Add instant appointment booking directly from Google Search."
      ],
      recommendedActions: [
        "Google Business Profile Setup & Local SEO",
        "WhatsApp Business Integration & Direct Chat Widget"
      ],
      metrics: {
        responseTimeMs: 410,
        isHttps: true,
        hasViewport: true
      }
    },
    createdAt: new Date(Date.now() - 3 * 864e5).toISOString()
  }
];
var SEED_RESTAURANTS = [
  {
    id: "rest-001",
    businessName: "Royal Spice Family Restaurant",
    slug: "royal-spice-jaipur",
    phone: "+91 98290 87654",
    city: "Jaipur",
    logoUrl: "",
    isPublished: true,
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var SEED_CATEGORIES = [
  { id: "cat-001-1", restaurantId: "rest-001", name: "Starters & Appetizers", sortOrder: 1, createdAt: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "cat-001-2", restaurantId: "rest-001", name: "Main Course & Breads", sortOrder: 2, createdAt: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "cat-001-3", restaurantId: "rest-001", name: "Beverages & Desserts", sortOrder: 3, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
];
var SEED_MENU_ITEMS = [
  {
    id: "item-001-1",
    restaurantId: "rest-001",
    categoryId: "cat-001-1",
    name: "Paneer Malai Tikka",
    description: "Charcoal grilled cottage cheese marinated in rich cashew cream and cardamom.",
    price: 279,
    isAvailable: true,
    isVegetarian: true,
    sortOrder: 1,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "item-001-2",
    restaurantId: "rest-001",
    categoryId: "cat-001-1",
    name: "Crispy Corn Salt & Pepper",
    description: "Sweet corn kernels tossed with crunchy spring onions, garlic, and cracked pepper.",
    price: 199,
    isAvailable: true,
    isVegetarian: true,
    sortOrder: 2,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "item-001-3",
    restaurantId: "rest-001",
    categoryId: "cat-001-2",
    name: "Dal Makhani Special",
    description: "Our signature slow-cooked black lentils simmered overnight with fresh butter.",
    price: 299,
    isAvailable: true,
    isVegetarian: true,
    sortOrder: 1,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "item-001-4",
    restaurantId: "rest-001",
    categoryId: "cat-001-2",
    name: "Butter Naan",
    description: "Tandoor-baked flatbread glazed with pure Amul butter.",
    price: 60,
    isAvailable: true,
    isVegetarian: true,
    sortOrder: 2,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "item-001-5",
    restaurantId: "rest-001",
    categoryId: "cat-001-3",
    name: "Royal Masala Chaas",
    description: "Traditional spiced buttermilk with roasted jeera and mint leaves.",
    price: 79,
    isAvailable: true,
    isVegetarian: true,
    sortOrder: 1,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "item-001-6",
    restaurantId: "rest-001",
    categoryId: "cat-001-3",
    name: "Sizzling Brownie with Ice Cream",
    description: "Warm chocolate fudge brownie topped with vanilla ice cream and hot chocolate sauce.",
    price: 169,
    isAvailable: true,
    isVegetarian: true,
    sortOrder: 2,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var SEED_REFERRALS = [
  {
    id: "ref-001",
    referralCode: "PRIME10",
    referrerName: "Param Sisodiya",
    referrerContact: "param@primesoul.in",
    status: "QUALIFIED",
    clicksCount: 28,
    leadsCount: 5,
    wonCount: 1,
    createdAt: new Date(Date.now() - 10 * 864e5).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "ref-002",
    referralCode: "JAIPUR20",
    referrerName: "Karan Singh (Royal Spice)",
    referrerContact: "+91 98290 87654",
    status: "LEAD",
    clicksCount: 12,
    leadsCount: 2,
    wonCount: 0,
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
  }
];

// src/core/growth/scoring.engine.ts
var GrowthScoringEngine = class {
  /**
   * Calculates a deterministic 0-100 lead score and intent temperature.
   */
  static calculateScore(input) {
    let score = 0;
    const reasons = [];
    if (input.phone && input.phone.trim().length >= 8) {
      score += 20;
      reasons.push("Phone number provided (+20)");
    }
    if (input.email && input.email.includes("@") && input.email.includes(".")) {
      score += 10;
      reasons.push("Email address provided (+10)");
    }
    if (input.requirement && input.requirement !== "Not Sure") {
      score += 15;
      reasons.push(`Selected requirement: ${input.requirement} (+15)`);
    }
    if (input.timeline === "Immediately") {
      score += 20;
      reasons.push("Immediate deployment timeline (+20)");
    } else if (input.timeline === "Within 7 days") {
      score += 10;
      reasons.push("7-day start timeline (+10)");
    } else if (input.timeline === "Within 30 days") {
      score += 5;
      reasons.push("30-day timeline (+5)");
    }
    if (input.hasViewedAuditResult) {
      score += 10;
      reasons.push("Completed digital health audit (+10)");
    }
    if (input.hasClickedContactCta) {
      score += 15;
      reasons.push("Clicked consultation / contact CTA (+15)");
    }
    if (input.hasCreatedQrMenu) {
      score += 20;
      reasons.push("Created active QR digital menu (+20)");
    }
    if (input.isTableOrderingInterested) {
      score += 20;
      reasons.push("Interested in direct table ordering (+20)");
    }
    if (input.hasRequestedDemo) {
      score += 10;
      reasons.push("Requested personalized demo (+10)");
    }
    const finalScore = Math.min(100, Math.max(0, score));
    let temperature = "COLD";
    if (finalScore >= 80) {
      temperature = "HOT";
    } else if (finalScore >= 60) {
      temperature = "WARM";
    } else if (finalScore >= 40) {
      temperature = "COOL";
    } else {
      temperature = "COLD";
    }
    return {
      score: finalScore,
      temperature,
      reasons
    };
  }
};

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
        return this.ensureSchemaDefaults(parsed);
      } catch (err) {
        console.error("Failed to parse primary primesoul_data.json:", err);
      }
    }
    const rootPath = path.resolve(process.cwd(), "primesoul_data.json");
    if (this.filePath !== rootPath && fs.existsSync(rootPath)) {
      try {
        const raw = fs.readFileSync(rootPath, "utf-8");
        const parsed = JSON.parse(raw);
        const validated = this.ensureSchemaDefaults(parsed);
        this.saveData(validated);
        return validated;
      } catch (err) {
        console.error("Failed to parse bundled root primesoul_data.json:", err);
      }
    }
    const defaultData = {
      leads: [...SEED_LEADS],
      workflows: [],
      approvals: [...SEED_APPROVALS],
      researchRuns: [],
      audits: [...SEED_AUDITS],
      qrRestaurants: [...SEED_RESTAURANTS],
      qrCategories: [...SEED_CATEGORIES],
      qrMenuItems: [...SEED_MENU_ITEMS],
      referrals: [...SEED_REFERRALS],
      events: [],
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
  ensureSchemaDefaults(parsed) {
    if (!parsed.leads) parsed.leads = [...SEED_LEADS];
    if (!parsed.workflows) parsed.workflows = [];
    if (!parsed.approvals) parsed.approvals = [...SEED_APPROVALS];
    if (!parsed.researchRuns) parsed.researchRuns = [];
    if (!parsed.audits) parsed.audits = [...SEED_AUDITS];
    if (!parsed.qrRestaurants) parsed.qrRestaurants = [...SEED_RESTAURANTS];
    if (!parsed.qrCategories) parsed.qrCategories = [...SEED_CATEGORIES];
    if (!parsed.qrMenuItems) parsed.qrMenuItems = [...SEED_MENU_ITEMS];
    if (!parsed.referrals) parsed.referrals = [...SEED_REFERRALS];
    if (!parsed.events) parsed.events = [];
    if (!parsed.proposals) parsed.proposals = [];
    if (!parsed.contentPosts) parsed.contentPosts = [];
    if (!parsed.settings) {
      parsed.settings = {
        aiProvider: process.env.AI_PROVIDER || "mock",
        geminiApiKey: process.env.GEMINI_API_KEY || "",
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        ollamaModel: process.env.OLLAMA_MODEL || "llama3:8b"
      };
    }
    return parsed;
  }
  saveData(data = this.data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.warn("Notice: Could not persist primesoul_data.json to disk (running in-memory):", err);
    }
  }
  // ==========================================
  // 1. Leads CRUD & Management
  // ==========================================
  getLeads(filter) {
    let list = this.data.leads;
    if (!filter) return list;
    if (filter.industry) {
      list = list.filter((l) => l.industry.toLowerCase() === filter.industry?.toLowerCase());
    }
    if (filter.businessCategory) {
      list = list.filter((l) => l.businessCategory === filter.businessCategory || l.industry.toLowerCase().includes(filter.businessCategory.toLowerCase()));
    }
    if (filter.qualificationStatus) {
      list = list.filter((l) => l.qualificationStatus === filter.qualificationStatus);
    }
    if (filter.growthStatus) {
      list = list.filter((l) => l.growthStatus === filter.growthStatus);
    }
    if (filter.outreachStatus) {
      list = list.filter((l) => l.outreachStatus === filter.outreachStatus);
    }
    if (filter.temperature) {
      list = list.filter((l) => l.leadTemperature === filter.temperature);
    }
    if (filter.source) {
      list = list.filter((l) => l.source === filter.source || l.source.toLowerCase().includes(filter.source.toLowerCase()));
    }
    if (filter.minScore !== void 0) {
      list = list.filter((l) => l.leadScore >= filter.minScore);
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      list = list.filter(
        (l) => l.businessName.toLowerCase().includes(q) || l.industry.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.city && l.city.toLowerCase().includes(q) || l.contactName && l.contactName.toLowerCase().includes(q) || l.email && l.email.toLowerCase().includes(q) || l.phone && l.phone.toLowerCase().includes(q) || l.website && l.website.toLowerCase().includes(q)
      );
    }
    return list;
  }
  getLeadById(id) {
    return this.data.leads.find((l) => l.id === id);
  }
  saveLead(lead) {
    const existingIndex = lead.id ? this.data.leads.findIndex((l) => l.id === lead.id) : -1;
    const scoreResult = GrowthScoringEngine.calculateScore({
      phone: lead.phone,
      email: lead.email,
      requirement: lead.requirement,
      timeline: lead.timeline,
      hasViewedAuditResult: Boolean(lead.auditId || lead.source === "AUDIT"),
      hasClickedContactCta: Boolean(lead.requirement || lead.growthStatus === "QUALIFIED"),
      hasCreatedQrMenu: Boolean(lead.restaurantId || lead.source === "QR_MENU"),
      hasRequestedDemo: Boolean(lead.growthStatus === "DEMO" || lead.requirement === "PrimeOMS")
    });
    if (existingIndex >= 0) {
      const existing = this.data.leads[existingIndex];
      const updated = {
        ...existing,
        ...lead,
        industry: lead.industry || existing.industry || "Professional Services",
        location: lead.location && lead.location !== "UNKNOWN" ? lead.location : existing.location,
        city: lead.city || existing.city || existing.location,
        contactName: lead.contactName && lead.contactName !== "UNKNOWN" ? lead.contactName : existing.contactName,
        phone: lead.phone || existing.phone,
        email: lead.email || existing.email,
        website: lead.website || existing.website,
        requirement: lead.requirement || existing.requirement,
        timeline: lead.timeline || existing.timeline,
        growthStatus: lead.growthStatus || existing.growthStatus || "NEW",
        leadScore: lead.leadScore !== void 0 ? lead.leadScore : Math.max(existing.leadScore, scoreResult.score),
        leadTemperature: lead.leadTemperature || scoreResult.temperature,
        socialProfiles: {
          ...existing.socialProfiles,
          ...lead.socialProfiles
        },
        notesList: lead.notesList || existing.notesList || [],
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.data.leads[existingIndex] = updated;
      this.saveData();
      return updated;
    }
    const newLead = {
      id: lead.id || `lead-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      businessName: lead.businessName,
      industry: lead.industry || (lead.businessCategory ? String(lead.businessCategory) : "General Business"),
      businessCategory: lead.businessCategory,
      location: lead.location || lead.city || "India",
      city: lead.city || lead.location || "India",
      source: lead.source || "WEBSITE",
      sourceDetail: lead.sourceDetail,
      requirement: lead.requirement,
      timeline: lead.timeline,
      website: lead.website || "",
      contactName: lead.contactName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      socialProfiles: lead.socialProfiles || {},
      leadScore: lead.leadScore ?? scoreResult.score,
      leadTemperature: lead.leadTemperature || scoreResult.temperature,
      qualificationStatus: lead.qualificationStatus || "QUALIFIED",
      growthStatus: lead.growthStatus || "NEW",
      digitalPresenceScore: lead.digitalPresenceScore ?? 50,
      painPoints: lead.painPoints || [],
      opportunities: lead.opportunities || [],
      recommendedServices: lead.recommendedServices || [],
      outreachStatus: lead.outreachStatus || "NOT_STARTED",
      notes: lead.notes || "",
      notesList: lead.notesList || [],
      referralCode: lead.referralCode,
      auditId: lead.auditId,
      restaurantId: lead.restaurantId,
      assignedTo: lead.assignedTo,
      followUpDate: lead.followUpDate,
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
  updateLeadStatus(id, growthStatus, notes) {
    const lead = this.getLeadById(id);
    if (!lead) return null;
    lead.growthStatus = growthStatus;
    lead.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (notes) {
      if (!lead.notesList) lead.notesList = [];
      lead.notesList.unshift({
        id: `note-${Date.now().toString(36)}`,
        leadId: id,
        author: "PrimeSoul Team",
        content: notes,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      lead.notes = notes;
    }
    this.saveData();
    return lead;
  }
  addLeadNote(id, content, author = "Team Member") {
    const lead = this.getLeadById(id);
    if (!lead) return null;
    if (!lead.notesList) lead.notesList = [];
    const note = {
      id: `note-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      leadId: id,
      author,
      content,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    lead.notesList.unshift(note);
    lead.notes = content;
    lead.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.saveData();
    return note;
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
  // ==========================================
  // 2. Business Audits CRUD
  // ==========================================
  getAudits() {
    return this.data.audits || [];
  }
  getAuditById(id) {
    return (this.data.audits || []).find((a) => a.id === id);
  }
  saveAudit(audit) {
    if (!this.data.audits) this.data.audits = [];
    const newAudit = {
      id: audit.id || `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      businessName: audit.businessName,
      websiteUrl: audit.websiteUrl,
      category: audit.category || "Other",
      city: audit.city || "India",
      phone: audit.phone,
      email: audit.email,
      googleBusinessUrl: audit.googleBusinessUrl,
      score: audit.score,
      grade: audit.grade || (audit.score >= 90 ? "Excellent" : audit.score >= 75 ? "Good" : audit.score >= 50 ? "Needs Improvement" : "Major Opportunities"),
      resultsJson: audit.resultsJson,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.audits.unshift(newAudit);
    this.saveData();
    return newAudit;
  }
  // ==========================================
  // 3. Free QR Menus CRUD
  // ==========================================
  getRestaurants() {
    const restaurants = this.data.qrRestaurants || [];
    return restaurants.map((r) => ({
      ...r,
      categories: (this.data.qrCategories || []).filter((c) => c.restaurantId === r.id).sort((a, b) => a.sortOrder - b.sortOrder),
      items: (this.data.qrMenuItems || []).filter((i) => i.restaurantId === r.id).sort((a, b) => a.sortOrder - b.sortOrder)
    }));
  }
  getRestaurantBySlug(slug) {
    const r = (this.data.qrRestaurants || []).find((x) => x.slug === slug);
    if (!r) return void 0;
    return {
      ...r,
      categories: (this.data.qrCategories || []).filter((c) => c.restaurantId === r.id).sort((a, b) => a.sortOrder - b.sortOrder),
      items: (this.data.qrMenuItems || []).filter((i) => i.restaurantId === r.id).sort((a, b) => a.sortOrder - b.sortOrder)
    };
  }
  getRestaurantById(id) {
    const r = (this.data.qrRestaurants || []).find((x) => x.id === id);
    if (!r) return void 0;
    return {
      ...r,
      categories: (this.data.qrCategories || []).filter((c) => c.restaurantId === r.id).sort((a, b) => a.sortOrder - b.sortOrder),
      items: (this.data.qrMenuItems || []).filter((i) => i.restaurantId === r.id).sort((a, b) => a.sortOrder - b.sortOrder)
    };
  }
  saveRestaurant(rest) {
    if (!this.data.qrRestaurants) this.data.qrRestaurants = [];
    const idx = rest.id ? this.data.qrRestaurants.findIndex((r) => r.id === rest.id) : -1;
    if (idx >= 0) {
      const updated = {
        ...this.data.qrRestaurants[idx],
        ...rest,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.data.qrRestaurants[idx] = updated;
      this.saveData();
      return updated;
    }
    const newRest = {
      id: rest.id || `rest-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      businessName: rest.businessName,
      slug: rest.slug,
      phone: rest.phone,
      city: rest.city,
      logoUrl: rest.logoUrl,
      isPublished: rest.isPublished !== void 0 ? rest.isPublished : true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.qrRestaurants.unshift(newRest);
    this.saveData();
    return newRest;
  }
  saveCategory(cat) {
    if (!this.data.qrCategories) this.data.qrCategories = [];
    const idx = cat.id ? this.data.qrCategories.findIndex((c) => c.id === cat.id) : -1;
    if (idx >= 0) {
      const updated = { ...this.data.qrCategories[idx], ...cat };
      this.data.qrCategories[idx] = updated;
      this.saveData();
      return updated;
    }
    const newCat = {
      id: cat.id || `cat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      restaurantId: cat.restaurantId,
      name: cat.name,
      sortOrder: cat.sortOrder ?? this.data.qrCategories.filter((c) => c.restaurantId === cat.restaurantId).length + 1,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.qrCategories.push(newCat);
    this.saveData();
    return newCat;
  }
  deleteCategory(id) {
    if (!this.data.qrCategories) return false;
    const initialLen = this.data.qrCategories.length;
    this.data.qrCategories = this.data.qrCategories.filter((c) => c.id !== id);
    if (this.data.qrMenuItems) {
      this.data.qrMenuItems = this.data.qrMenuItems.filter((i) => i.categoryId !== id);
    }
    this.saveData();
    return this.data.qrCategories.length !== initialLen;
  }
  saveMenuItem(item) {
    if (!this.data.qrMenuItems) this.data.qrMenuItems = [];
    const idx = item.id ? this.data.qrMenuItems.findIndex((i) => i.id === item.id) : -1;
    if (idx >= 0) {
      const updated = { ...this.data.qrMenuItems[idx], ...item };
      this.data.qrMenuItems[idx] = updated;
      this.saveData();
      return updated;
    }
    const newItem = {
      id: item.id || `item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      restaurantId: item.restaurantId,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable !== void 0 ? item.isAvailable : true,
      isVegetarian: item.isVegetarian !== void 0 ? item.isVegetarian : true,
      sortOrder: item.sortOrder ?? this.data.qrMenuItems.filter((i) => i.categoryId === item.categoryId).length + 1,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.qrMenuItems.push(newItem);
    this.saveData();
    return newItem;
  }
  deleteMenuItem(id) {
    if (!this.data.qrMenuItems) return false;
    const initialLen = this.data.qrMenuItems.length;
    this.data.qrMenuItems = this.data.qrMenuItems.filter((i) => i.id !== id);
    this.saveData();
    return this.data.qrMenuItems.length !== initialLen;
  }
  // ==========================================
  // 4. Referrals System CRUD
  // ==========================================
  getReferrals() {
    return this.data.referrals || [];
  }
  getReferralByCode(code) {
    return (this.data.referrals || []).find((r) => r.referralCode.toUpperCase() === code.toUpperCase());
  }
  saveReferral(ref) {
    if (!this.data.referrals) this.data.referrals = [];
    const code = ref.referralCode.toUpperCase();
    const idx = this.data.referrals.findIndex((r) => r.referralCode === code);
    if (idx >= 0) {
      const updated = {
        ...this.data.referrals[idx],
        ...ref,
        referralCode: code,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.data.referrals[idx] = updated;
      this.saveData();
      return updated;
    }
    const newRef = {
      id: ref.id || `ref-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      referralCode: code,
      referrerName: ref.referrerName,
      referrerContact: ref.referrerContact,
      referredBusiness: ref.referredBusiness,
      status: ref.status || "LEAD",
      clicksCount: ref.clicksCount || 0,
      leadsCount: ref.leadsCount || 0,
      wonCount: ref.wonCount || 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.referrals.unshift(newRef);
    this.saveData();
    return newRef;
  }
  trackReferralClick(code) {
    const ref = this.getReferralByCode(code);
    if (!ref) return false;
    ref.clicksCount = (ref.clicksCount || 0) + 1;
    ref.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.saveData();
    return true;
  }
  trackReferralLead(code) {
    const ref = this.getReferralByCode(code);
    if (!ref) return false;
    ref.leadsCount = (ref.leadsCount || 0) + 1;
    ref.status = "QUALIFIED";
    ref.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.saveData();
    return true;
  }
  // ==========================================
  // 5. Events & Analytics
  // ==========================================
  getEvents() {
    return this.data.events || [];
  }
  saveEvent(event) {
    if (!this.data.events) this.data.events = [];
    this.data.events.unshift(event);
    if (this.data.events.length > 1e3) {
      this.data.events = this.data.events.slice(0, 1e3);
    }
    this.saveData();
    return event;
  }
  // ==========================================
  // 6. Research Runs CRUD
  // ==========================================
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
  // ==========================================
  // 7. Workflows CRUD
  // ==========================================
  getWorkflows() {
    return this.data.workflows || [];
  }
  getWorkflowById(id) {
    return (this.data.workflows || []).find((w) => w.id === id);
  }
  saveWorkflow(wf) {
    if (!this.data.workflows) this.data.workflows = [];
    const idx = this.data.workflows.findIndex((w) => w.id === wf.id);
    if (idx >= 0) {
      this.data.workflows[idx] = wf;
    } else {
      this.data.workflows.unshift(wf);
    }
    this.saveData();
    return wf;
  }
  // ==========================================
  // 8. Approvals CRUD
  // ==========================================
  getApprovals(status) {
    if (!this.data.approvals) this.data.approvals = [];
    if (status) {
      return this.data.approvals.filter((a) => a.status === status);
    }
    return this.data.approvals;
  }
  getApprovalById(id) {
    return (this.data.approvals || []).find((a) => a.id === id);
  }
  saveApproval(item) {
    if (!this.data.approvals) this.data.approvals = [];
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
  // ==========================================
  // 9. Settings & Provider Configuration
  // ==========================================
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
      audits: [...SEED_AUDITS],
      qrRestaurants: [...SEED_RESTAURANTS],
      qrCategories: [...SEED_CATEGORIES],
      qrMenuItems: [...SEED_MENU_ITEMS],
      referrals: [...SEED_REFERRALS],
      events: [],
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
var dbService = DatabaseService.getInstance();

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
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }
  const db = DatabaseService.getInstance();
  if (req.method === "GET") {
    try {
      const settings = db.getSettings();
      return sendJson(res, 200, { success: true, settings });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message || "Failed to retrieve settings" });
    }
  }
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { aiProvider, geminiApiKey, ollamaBaseUrl, ollamaModel } = body;
      if (aiProvider && !["mock", "gemini", "ollama"].includes(aiProvider)) {
        return sendJson(res, 400, {
          success: false,
          error: `Invalid AI Provider: ${aiProvider}. Supported providers: mock, gemini, ollama.`
        });
      }
      const updatedSettings = db.updateSettings({
        aiProvider,
        geminiApiKey,
        ollamaBaseUrl,
        ollamaModel
      });
      LlmFactory.resetInstance();
      return sendJson(res, 200, {
        success: true,
        message: "Settings updated successfully",
        settings: updatedSettings
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message || "Failed to update settings" });
    }
  }
  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
export {
  handler as default
};
