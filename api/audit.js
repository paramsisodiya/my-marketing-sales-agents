import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/core/growth/audit.engine.ts
var AuditEngine = class {
  /**
   * SSRF Protection Validator.
   * Ensures the target URL is a safe, public web address.
   */
  static isSafeUrl(rawUrl) {
    try {
      const trimmed = rawUrl.trim();
      if (!trimmed) {
        return { safe: false, reason: "URL is required." };
      }
      if (trimmed.includes("://")) {
        const scheme = trimmed.split("://")[0].toLowerCase();
        if (scheme !== "http" && scheme !== "https") {
          return { safe: false, reason: "Only HTTP and HTTPS protocols are allowed." };
        }
      }
      let urlStr = trimmed;
      if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
        urlStr = "https://" + urlStr;
      }
      const parsed = new URL(urlStr);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { safe: false, reason: "Only HTTP and HTTPS protocols are allowed." };
      }
      const hostname = parsed.hostname.toLowerCase();
      if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal") || hostname === "0.0.0.0") {
        return { safe: false, reason: "Localhost and internal hostnames cannot be audited." };
      }
      const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
      const match = hostname.match(ipv4Regex);
      if (match) {
        const octet1 = parseInt(match[1], 10);
        const octet2 = parseInt(match[2], 10);
        if (octet1 === 127) return { safe: false, reason: "Loopback IP addresses are blocked." };
        if (octet1 === 10) return { safe: false, reason: "Private network addresses are blocked." };
        if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return { safe: false, reason: "Private network addresses are blocked." };
        if (octet1 === 192 && octet2 === 168) return { safe: false, reason: "Private network addresses are blocked." };
        if (octet1 === 169 && octet2 === 254) return { safe: false, reason: "Cloud metadata IP addresses are blocked." };
      }
      if (hostname.includes("::") || hostname.startsWith("[") || hostname.endsWith("]")) {
        return { safe: false, reason: "Direct IPv6 addresses are blocked." };
      }
      return { safe: true, normalizedUrl: parsed.toString() };
    } catch {
      return { safe: false, reason: "Invalid website URL format." };
    }
  }
  /**
   * Executes a deterministic digital audit against a business.
   */
  static async executeAudit(params) {
    const checks = [];
    const strengths = [];
    const issues = [];
    const opportunities = [];
    const recommendedActions = [];
    let rawHtml = "";
    let responseTimeMs = 0;
    let isHttps = false;
    let isAccessible = false;
    if (params.websiteUrl && params.websiteUrl.trim().length > 0) {
      const urlCheck = this.isSafeUrl(params.websiteUrl);
      if (!urlCheck.safe) {
        issues.push(`Website URL error: ${urlCheck.reason}`);
      } else {
        const targetUrl = urlCheck.normalizedUrl;
        isHttps = targetUrl.startsWith("https://");
        const startTime = Date.now();
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8e3);
          const res = await fetch(targetUrl, {
            method: "GET",
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PrimeSoul-AuditEngine/1.0",
              "Accept": "text/html,application/xhtml+xml"
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          responseTimeMs = Date.now() - startTime;
          if (res.ok) {
            isAccessible = true;
            const fullText = await res.text();
            rawHtml = fullText.substring(0, 15e5);
          } else {
            issues.push(`Website returned HTTP status ${res.status}`);
          }
        } catch (fetchErr) {
          responseTimeMs = Date.now() - startTime;
          issues.push(`Website connection failed: ${fetchErr.name === "AbortError" ? "Server timed out after 8s" : "Domain unreachable"}`);
        }
      }
    }
    if (isAccessible) {
      checks.push({
        id: "chk-accessibility",
        name: "Website Live & Accessible",
        category: "Technical",
        passed: true,
        score: 15,
        maxScore: 15,
        details: `Website is active and responded in ${responseTimeMs}ms.`,
        severity: "GOOD"
      });
      strengths.push(`Online presence active with live website (${responseTimeMs}ms response time).`);
    } else if (params.websiteUrl) {
      checks.push({
        id: "chk-accessibility",
        name: "Website Accessibility",
        category: "Technical",
        passed: false,
        score: 0,
        maxScore: 15,
        details: "Website could not be reached or returned an error status.",
        severity: "CRITICAL"
      });
      issues.push("Website is currently inaccessible or experiencing downtime.");
      opportunities.push("Deploy a high-speed, reliable cloud-hosted website.");
      recommendedActions.push("Website Development & Cloud Hosting Setup");
    } else {
      checks.push({
        id: "chk-accessibility",
        name: "Digital Website Presence",
        category: "Technical",
        passed: false,
        score: 0,
        maxScore: 15,
        details: "No website URL was provided for this business.",
        severity: "WARNING"
      });
      issues.push("Business has no official website for customers to discover.");
      opportunities.push("Build a mobile-friendly business website to capture local searches.");
      recommendedActions.push("Launch Official Website & Google Business Profile");
    }
    if (isHttps && isAccessible) {
      checks.push({
        id: "chk-https",
        name: "SSL / HTTPS Security",
        category: "Technical",
        passed: true,
        score: 10,
        maxScore: 10,
        details: "Secure SSL certificate is active (https://).",
        severity: "GOOD"
      });
      strengths.push("Secure HTTPS connection builds customer trust.");
    } else if (isAccessible) {
      checks.push({
        id: "chk-https",
        name: "SSL / HTTPS Security",
        category: "Technical",
        passed: false,
        score: 0,
        maxScore: 10,
        details: "Website does not use SSL encryption (http://). Browsers mark this as Not Secure.",
        severity: "CRITICAL"
      });
      issues.push('Website lacks SSL security \u2014 visitors see a "Not Secure" warning in Chrome.');
      opportunities.push("Enable free automated SSL encryption.");
      recommendedActions.push("SSL Certificate & Domain Security Setup");
    } else {
      checks.push({
        id: "chk-https",
        name: "SSL Security",
        category: "Technical",
        passed: false,
        score: 0,
        maxScore: 10,
        details: "Unverified security status.",
        severity: "INFO"
      });
    }
    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(rawHtml);
    if (hasViewport) {
      checks.push({
        id: "chk-mobile",
        name: "Mobile Viewport Optimization",
        category: "Technical",
        passed: true,
        score: 15,
        maxScore: 15,
        details: "Mobile viewport meta tag configured for smartphone screens.",
        severity: "GOOD"
      });
      strengths.push("Optimized layout for mobile and tablet smartphone screens.");
    } else if (isAccessible) {
      checks.push({
        id: "chk-mobile",
        name: "Mobile Viewport Optimization",
        category: "Technical",
        passed: false,
        score: 0,
        maxScore: 15,
        details: "Missing viewport meta tag. Website will render zoomed-out on mobile devices.",
        severity: "CRITICAL"
      });
      issues.push("Missing mobile viewport tag \u2014 site is hard to read on mobile phones.");
      opportunities.push("Implement a responsive, mobile-first design.");
      recommendedActions.push("Mobile UI/UX Optimization");
    } else {
      checks.push({
        id: "chk-mobile",
        name: "Mobile Responsiveness",
        category: "Technical",
        passed: false,
        score: 5,
        maxScore: 15,
        details: "Requires verification on real devices.",
        severity: "INFO"
      });
    }
    const titleMatch = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    const titleText = titleMatch ? titleMatch[1].trim() : "";
    if (titleText.length >= 10) {
      checks.push({
        id: "chk-title",
        name: "Search Engine Title Tag",
        category: "SEO",
        passed: true,
        score: 10,
        maxScore: 10,
        details: `Title: "${titleText.substring(0, 50)}${titleText.length > 50 ? "..." : ""}" (${titleText.length} chars).`,
        severity: "GOOD"
      });
      strengths.push(`Clear page title configured for Google Search ("${titleText.substring(0, 40)}...").`);
    } else if (isAccessible) {
      checks.push({
        id: "chk-title",
        name: "Search Engine Title Tag",
        category: "SEO",
        passed: false,
        score: 2,
        maxScore: 10,
        details: titleText ? "Title tag is too short (< 10 chars)." : "Missing <title> tag.",
        severity: "WARNING"
      });
      issues.push("Page title tag is missing or too short for good Google search rankings.");
      opportunities.push("Optimize title tags with target local keywords.");
      recommendedActions.push("Local SEO & Title Tag Optimization");
    } else {
      checks.push({
        id: "chk-title",
        name: "Search Title Tag",
        category: "SEO",
        passed: false,
        score: 0,
        maxScore: 10,
        details: "No title tag detected.",
        severity: "INFO"
      });
    }
    const metaDescMatch = rawHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || rawHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : "";
    if (metaDesc.length >= 40) {
      checks.push({
        id: "chk-meta-desc",
        name: "Search Snippet Description",
        category: "SEO",
        passed: true,
        score: 10,
        maxScore: 10,
        details: `Meta description present (${metaDesc.length} chars).`,
        severity: "GOOD"
      });
      strengths.push("Search snippet description is configured for Google click-throughs.");
    } else if (isAccessible) {
      checks.push({
        id: "chk-meta-desc",
        name: "Search Snippet Description",
        category: "SEO",
        passed: false,
        score: 0,
        maxScore: 10,
        details: metaDesc ? "Meta description is too short (< 40 chars)." : "Missing meta description tag.",
        severity: "WARNING"
      });
      issues.push("Missing search meta description \u2014 Google displays arbitrary page snippets.");
      opportunities.push("Write compelling meta descriptions to increase search click-through rate.");
      recommendedActions.push("On-Page SEO Meta Description Tuning");
    } else {
      checks.push({
        id: "chk-meta-desc",
        name: "Meta Description",
        category: "SEO",
        passed: false,
        score: 0,
        maxScore: 10,
        details: "Not configured.",
        severity: "INFO"
      });
    }
    const hasTel = /href=["']tel:[^"']+["']/i.test(rawHtml) || /(\+91|0)?[6-9]\d{9}/.test(rawHtml);
    if (hasTel) {
      checks.push({
        id: "chk-phone",
        name: "Direct Call / Contact Link",
        category: "Conversion",
        passed: true,
        score: 10,
        maxScore: 10,
        details: "Click-to-call or direct phone number detected on page.",
        severity: "GOOD"
      });
      strengths.push("Direct click-to-call contact link allows mobile visitors to enquire instantly.");
    } else if (isAccessible) {
      checks.push({
        id: "chk-phone",
        name: "Direct Call / Contact Link",
        category: "Conversion",
        passed: false,
        score: 0,
        maxScore: 10,
        details: "No click-to-call (tel:) links or prominent phone numbers found.",
        severity: "WARNING"
      });
      issues.push("No direct click-to-call link for customers browsing on smartphones.");
      opportunities.push("Add prominent click-to-call buttons in the website header & footer.");
      recommendedActions.push("Conversion CTA & Click-to-Call Setup");
    } else {
      checks.push({
        id: "chk-phone",
        name: "Direct Contact Link",
        category: "Conversion",
        passed: false,
        score: 0,
        maxScore: 10,
        details: "No contact link verified.",
        severity: "INFO"
      });
    }
    const hasWhatsApp = /wa\.me\/|api\.whatsapp\.com|whatsapp/i.test(rawHtml);
    if (hasWhatsApp) {
      checks.push({
        id: "chk-whatsapp",
        name: "WhatsApp Chat Integration",
        category: "Conversion",
        passed: true,
        score: 15,
        maxScore: 15,
        details: "WhatsApp click-to-chat link or widget detected.",
        severity: "GOOD"
      });
      strengths.push("WhatsApp direct chat link makes customer inquiries effortless for Indian buyers.");
    } else if (isAccessible) {
      checks.push({
        id: "chk-whatsapp",
        name: "WhatsApp Chat Integration",
        category: "Conversion",
        passed: false,
        score: 0,
        maxScore: 15,
        details: "No WhatsApp direct chat button or widget found on the website.",
        severity: "WARNING"
      });
      issues.push("No WhatsApp chat button \u2014 Indian consumers prefer inquiring via WhatsApp.");
      opportunities.push("Add a floating WhatsApp chat widget with pre-filled inquiry messages.");
      recommendedActions.push("WhatsApp Business Setup & Direct Chat Widget");
    } else {
      checks.push({
        id: "chk-whatsapp",
        name: "WhatsApp Integration",
        category: "Conversion",
        passed: false,
        score: 0,
        maxScore: 15,
        details: "No WhatsApp integration found.",
        severity: "INFO"
      });
    }
    const hasSchema = /schema\.org|application\/ld\+json/i.test(rawHtml);
    if (hasSchema) {
      checks.push({
        id: "chk-schema",
        name: "Schema.org Structured Data",
        category: "Local",
        passed: true,
        score: 15,
        maxScore: 15,
        details: "Structured JSON-LD schema markup detected for Google rich snippets.",
        severity: "GOOD"
      });
      strengths.push("Structured Schema.org data helps Google display your business in the Local 3-Pack.");
    } else if (isAccessible) {
      checks.push({
        id: "chk-schema",
        name: "Schema.org Structured Data",
        category: "Local",
        passed: false,
        score: 0,
        maxScore: 15,
        details: "Missing LocalBusiness JSON-LD markup.",
        severity: "WARNING"
      });
      issues.push("Missing Schema.org structured data for Google Maps & Local search snippets.");
      opportunities.push("Add LocalBusiness Schema markup with opening hours, address, and ratings.");
      recommendedActions.push("Google Local 3-Pack Schema.org Setup");
    } else {
      checks.push({
        id: "chk-schema",
        name: "Local Search Schema",
        category: "Local",
        passed: false,
        score: 0,
        maxScore: 15,
        details: "Not configured.",
        severity: "INFO"
      });
    }
    const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
    let grade = "Major Opportunities";
    if (totalScore >= 90) {
      grade = "Excellent";
    } else if (totalScore >= 75) {
      grade = "Good";
    } else if (totalScore >= 50) {
      grade = "Needs Improvement";
    } else {
      grade = "Major Opportunities";
    }
    if (params.category === "Restaurant" || params.category === "Cafe") {
      opportunities.push("Provide a QR code digital menu for tables and online orders.");
      recommendedActions.push("PrimeOMS Free QR Digital Menu & Table Ordering Setup");
    } else if (params.category === "School" || params.category === "Coaching") {
      opportunities.push("Build a dedicated admission landing page with WhatsApp enquiry capture.");
      recommendedActions.push("Admission Landing Page & Parent Enquiry Automation");
    } else if (params.category === "Clinic" || params.category === "Salon") {
      opportunities.push("Add instant appointment booking directly from Google Search.");
      recommendedActions.push("Online Appointment Booking & Google Business Profile Setup");
    }
    if (recommendedActions.length < 2) {
      recommendedActions.push("Google Business Profile Setup & Local SEO");
      recommendedActions.push("WhatsApp Business Integration & Website Redesign");
    }
    return {
      score: totalScore,
      grade,
      checks,
      strengths,
      issues,
      opportunities: Array.from(new Set(opportunities)),
      recommendedActions: Array.from(new Set(recommendedActions)),
      metrics: {
        responseTimeMs,
        isHttps,
        hasViewport,
        contentSizeBytes: rawHtml.length
      }
    };
  }
};

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

// src/core/growth/event.service.ts
var EventService = class _EventService {
  static instance;
  db;
  constructor() {
    this.db = DatabaseService.getInstance();
  }
  static getInstance() {
    if (!_EventService.instance) {
      _EventService.instance = new _EventService();
    }
    return _EventService.instance;
  }
  logEvent(eventName, params) {
    const event = {
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      eventName,
      anonymousId: params?.anonymousId,
      leadId: params?.leadId,
      metadata: params?.metadata,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.db.saveEvent(event);
    return event;
  }
  getEventStats() {
    const events = this.db.getEvents();
    const stats = {};
    for (const evt of events) {
      stats[evt.eventName] = (stats[evt.eventName] || 0) + 1;
    }
    return stats;
  }
};

// src/api/audit.ts
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
  const eventService = EventService.getInstance();
  if (req.method === "GET") {
    const id = req.query && req.query.id || req.url && new URL(req.url, "http://localhost").searchParams.get("id");
    if (id) {
      const audit = db.getAuditById(id);
      if (!audit) return sendJson(res, 404, { success: false, error: "Audit record not found" });
      return sendJson(res, 200, { success: true, audit });
    }
    const audits = db.getAudits();
    return sendJson(res, 200, { success: true, audits, count: audits.length });
  }
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { businessName, websiteUrl, category, city, phone, email, googleBusinessUrl, referralCode } = body;
      if (!businessName || typeof businessName !== "string") {
        return sendJson(res, 400, { success: false, error: "Business name is required." });
      }
      eventService.logEvent("audit_started", {
        metadata: { businessName, category, city, websiteUrl }
      });
      const auditResult = await AuditEngine.executeAudit({
        businessName: businessName.trim(),
        websiteUrl: websiteUrl ? websiteUrl.trim() : void 0,
        category,
        city
      });
      const auditRecord = db.saveAudit({
        businessName: businessName.trim(),
        websiteUrl: websiteUrl ? websiteUrl.trim() : void 0,
        category: category || "Other",
        city: city ? city.trim() : "India",
        phone: phone ? phone.trim() : void 0,
        email: email ? email.trim() : void 0,
        googleBusinessUrl: googleBusinessUrl ? googleBusinessUrl.trim() : void 0,
        score: auditResult.score,
        grade: auditResult.grade,
        resultsJson: auditResult
      });
      let leadRecord = null;
      if (phone || email) {
        leadRecord = db.saveLead({
          businessName: businessName.trim(),
          contactName: businessName.trim() + " Owner",
          phone: phone ? phone.trim() : void 0,
          email: email ? email.trim() : void 0,
          city: city ? city.trim() : "India",
          location: city ? city.trim() : "India",
          website: websiteUrl ? websiteUrl.trim() : void 0,
          businessCategory: category,
          industry: category || "Local Business",
          source: "AUDIT",
          sourceDetail: `website_audit_${auditRecord.id}`,
          auditId: auditRecord.id,
          referralCode: referralCode || void 0,
          growthStatus: "NEW",
          digitalPresenceScore: auditResult.score
        });
        eventService.logEvent("lead_created", {
          leadId: leadRecord.id,
          metadata: { source: "AUDIT", score: leadRecord.leadScore, temperature: leadRecord.leadTemperature }
        });
      }
      eventService.logEvent("audit_completed", {
        leadId: leadRecord?.id,
        metadata: { auditId: auditRecord.id, score: auditRecord.score }
      });
      return sendJson(res, 200, {
        success: true,
        audit: auditRecord,
        lead: leadRecord
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message || "Failed to complete digital audit" });
    }
  }
  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
export {
  handler as default
};
