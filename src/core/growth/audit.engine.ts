import { IAuditCheck, IAuditResultData, BusinessCategory } from '../types/growth.types';

export class AuditEngine {
  /**
   * SSRF Protection Validator.
   * Ensures the target URL is a safe, public web address.
   */
  public static isSafeUrl(rawUrl: string): { safe: boolean; reason?: string; normalizedUrl?: string } {
    try {
      const trimmed = rawUrl.trim();
      if (!trimmed) {
        return { safe: false, reason: 'URL is required.' };
      }

      // Explicitly reject non-http/https schemes
      if (trimmed.includes('://')) {
        const scheme = trimmed.split('://')[0].toLowerCase();
        if (scheme !== 'http' && scheme !== 'https') {
          return { safe: false, reason: 'Only HTTP and HTTPS protocols are allowed.' };
        }
      }

      let urlStr = trimmed;
      if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
        urlStr = 'https://' + urlStr;
      }

      const parsed = new URL(urlStr);

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { safe: false, reason: 'Only HTTP and HTTPS protocols are allowed.' };
      }

      const hostname = parsed.hostname.toLowerCase();

      // Block local/private hostnames
      if (
        hostname === 'localhost' ||
        hostname.endsWith('.localhost') ||
        hostname.endsWith('.local') ||
        hostname.endsWith('.internal') ||
        hostname === '0.0.0.0'
      ) {
        return { safe: false, reason: 'Localhost and internal hostnames cannot be audited.' };
      }

      // Block private IPv4 ranges & cloud metadata
      const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
      const match = hostname.match(ipv4Regex);
      if (match) {
        const octet1 = parseInt(match[1], 10);
        const octet2 = parseInt(match[2], 10);

        // 127.0.0.0/8
        if (octet1 === 127) return { safe: false, reason: 'Loopback IP addresses are blocked.' };
        // 10.0.0.0/8
        if (octet1 === 10) return { safe: false, reason: 'Private network addresses are blocked.' };
        // 172.16.0.0/12
        if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return { safe: false, reason: 'Private network addresses are blocked.' };
        // 192.168.0.0/16
        if (octet1 === 192 && octet2 === 168) return { safe: false, reason: 'Private network addresses are blocked.' };
        // 169.254.0.0/16 (Link local / AWS/GCP metadata)
        if (octet1 === 169 && octet2 === 254) return { safe: false, reason: 'Cloud metadata IP addresses are blocked.' };
      }

      // Block IPv6 loopback / private
      if (hostname.includes('::') || hostname.startsWith('[') || hostname.endsWith(']')) {
        return { safe: false, reason: 'Direct IPv6 addresses are blocked.' };
      }

      return { safe: true, normalizedUrl: parsed.toString() };
    } catch {
      return { safe: false, reason: 'Invalid website URL format.' };
    }
  }

  /**
   * Executes a deterministic digital audit against a business.
   */
  public static async executeAudit(params: {
    businessName: string;
    websiteUrl?: string;
    category?: BusinessCategory | string;
    city?: string;
  }): Promise<IAuditResultData> {
    const checks: IAuditCheck[] = [];
    const strengths: string[] = [];
    const issues: string[] = [];
    const opportunities: string[] = [];
    const recommendedActions: string[] = [];

    let rawHtml = '';
    let responseTimeMs = 0;
    let isHttps = false;
    let isAccessible = false;

    // 1. If website provided, fetch and analyze HTML safely
    if (params.websiteUrl && params.websiteUrl.trim().length > 0) {
      const urlCheck = this.isSafeUrl(params.websiteUrl);
      if (!urlCheck.safe) {
        issues.push(`Website URL error: ${urlCheck.reason}`);
      } else {
        const targetUrl = urlCheck.normalizedUrl!;
        isHttps = targetUrl.startsWith('https://');

        const startTime = Date.now();
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

          const res = await fetch(targetUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PrimeSoul-AuditEngine/1.0',
              'Accept': 'text/html,application/xhtml+xml',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          responseTimeMs = Date.now() - startTime;

          if (res.ok) {
            isAccessible = true;
            // Limit HTML size to 1.5MB to prevent memory exhaustion
            const fullText = await res.text();
            rawHtml = fullText.substring(0, 1500000);
          } else {
            issues.push(`Website returned HTTP status ${res.status}`);
          }
        } catch (fetchErr: any) {
          responseTimeMs = Date.now() - startTime;
          issues.push(`Website connection failed: ${fetchErr.name === 'AbortError' ? 'Server timed out after 8s' : 'Domain unreachable'}`);
        }
      }
    }

    // --- CHECK 1: Website Availability (15 pts) ---
    if (isAccessible) {
      checks.push({
        id: 'chk-accessibility',
        name: 'Website Live & Accessible',
        category: 'Technical',
        passed: true,
        score: 15,
        maxScore: 15,
        details: `Website is active and responded in ${responseTimeMs}ms.`,
        severity: 'GOOD',
      });
      strengths.push(`Online presence active with live website (${responseTimeMs}ms response time).`);
    } else if (params.websiteUrl) {
      checks.push({
        id: 'chk-accessibility',
        name: 'Website Accessibility',
        category: 'Technical',
        passed: false,
        score: 0,
        maxScore: 15,
        details: 'Website could not be reached or returned an error status.',
        severity: 'CRITICAL',
      });
      issues.push('Website is currently inaccessible or experiencing downtime.');
      opportunities.push('Deploy a high-speed, reliable cloud-hosted website.');
      recommendedActions.push('Website Development & Cloud Hosting Setup');
    } else {
      checks.push({
        id: 'chk-accessibility',
        name: 'Digital Website Presence',
        category: 'Technical',
        passed: false,
        score: 0,
        maxScore: 15,
        details: 'No website URL was provided for this business.',
        severity: 'WARNING',
      });
      issues.push('Business has no official website for customers to discover.');
      opportunities.push('Build a mobile-friendly business website to capture local searches.');
      recommendedActions.push('Launch Official Website & Google Business Profile');
    }

    // --- CHECK 2: HTTPS Security (10 pts) ---
    if (isHttps && isAccessible) {
      checks.push({
        id: 'chk-https',
        name: 'SSL / HTTPS Security',
        category: 'Technical',
        passed: true,
        score: 10,
        maxScore: 10,
        details: 'Secure SSL certificate is active (https://).',
        severity: 'GOOD',
      });
      strengths.push('Secure HTTPS connection builds customer trust.');
    } else if (isAccessible) {
      checks.push({
        id: 'chk-https',
        name: 'SSL / HTTPS Security',
        category: 'Technical',
        passed: false,
        score: 0,
        maxScore: 10,
        details: 'Website does not use SSL encryption (http://). Browsers mark this as Not Secure.',
        severity: 'CRITICAL',
      });
      issues.push('Website lacks SSL security — visitors see a "Not Secure" warning in Chrome.');
      opportunities.push('Enable free automated SSL encryption.');
      recommendedActions.push('SSL Certificate & Domain Security Setup');
    } else {
      checks.push({
        id: 'chk-https',
        name: 'SSL Security',
        category: 'Technical',
        passed: false,
        score: 0,
        maxScore: 10,
        details: 'Unverified security status.',
        severity: 'INFO',
      });
    }

    // --- CHECK 3: Mobile Viewport Responsiveness (15 pts) ---
    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(rawHtml);
    if (hasViewport) {
      checks.push({
        id: 'chk-mobile',
        name: 'Mobile Viewport Optimization',
        category: 'Technical',
        passed: true,
        score: 15,
        maxScore: 15,
        details: 'Mobile viewport meta tag configured for smartphone screens.',
        severity: 'GOOD',
      });
      strengths.push('Optimized layout for mobile and tablet smartphone screens.');
    } else if (isAccessible) {
      checks.push({
        id: 'chk-mobile',
        name: 'Mobile Viewport Optimization',
        category: 'Technical',
        passed: false,
        score: 0,
        maxScore: 15,
        details: 'Missing viewport meta tag. Website will render zoomed-out on mobile devices.',
        severity: 'CRITICAL',
      });
      issues.push('Missing mobile viewport tag — site is hard to read on mobile phones.');
      opportunities.push('Implement a responsive, mobile-first design.');
      recommendedActions.push('Mobile UI/UX Optimization');
    } else {
      checks.push({
        id: 'chk-mobile',
        name: 'Mobile Responsiveness',
        category: 'Technical',
        passed: false,
        score: 5,
        maxScore: 15,
        details: 'Requires verification on real devices.',
        severity: 'INFO',
      });
    }

    // --- CHECK 4: SEO Title Tag (10 pts) ---
    const titleMatch = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    const titleText = titleMatch ? titleMatch[1].trim() : '';
    if (titleText.length >= 10) {
      checks.push({
        id: 'chk-title',
        name: 'Search Engine Title Tag',
        category: 'SEO',
        passed: true,
        score: 10,
        maxScore: 10,
        details: `Title: "${titleText.substring(0, 50)}${titleText.length > 50 ? '...' : ''}" (${titleText.length} chars).`,
        severity: 'GOOD',
      });
      strengths.push(`Clear page title configured for Google Search ("${titleText.substring(0, 40)}...").`);
    } else if (isAccessible) {
      checks.push({
        id: 'chk-title',
        name: 'Search Engine Title Tag',
        category: 'SEO',
        passed: false,
        score: 2,
        maxScore: 10,
        details: titleText ? 'Title tag is too short (< 10 chars).' : 'Missing <title> tag.',
        severity: 'WARNING',
      });
      issues.push('Page title tag is missing or too short for good Google search rankings.');
      opportunities.push('Optimize title tags with target local keywords.');
      recommendedActions.push('Local SEO & Title Tag Optimization');
    } else {
      checks.push({
        id: 'chk-title',
        name: 'Search Title Tag',
        category: 'SEO',
        passed: false,
        score: 0,
        maxScore: 10,
        details: 'No title tag detected.',
        severity: 'INFO',
      });
    }

    // --- CHECK 5: Meta Description (10 pts) ---
    const metaDescMatch = rawHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                          rawHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';
    if (metaDesc.length >= 40) {
      checks.push({
        id: 'chk-meta-desc',
        name: 'Search Snippet Description',
        category: 'SEO',
        passed: true,
        score: 10,
        maxScore: 10,
        details: `Meta description present (${metaDesc.length} chars).`,
        severity: 'GOOD',
      });
      strengths.push('Search snippet description is configured for Google click-throughs.');
    } else if (isAccessible) {
      checks.push({
        id: 'chk-meta-desc',
        name: 'Search Snippet Description',
        category: 'SEO',
        passed: false,
        score: 0,
        maxScore: 10,
        details: metaDesc ? 'Meta description is too short (< 40 chars).' : 'Missing meta description tag.',
        severity: 'WARNING',
      });
      issues.push('Missing search meta description — Google displays arbitrary page snippets.');
      opportunities.push('Write compelling meta descriptions to increase search click-through rate.');
      recommendedActions.push('On-Page SEO Meta Description Tuning');
    } else {
      checks.push({
        id: 'chk-meta-desc',
        name: 'Meta Description',
        category: 'SEO',
        passed: false,
        score: 0,
        maxScore: 10,
        details: 'Not configured.',
        severity: 'INFO',
      });
    }

    // --- CHECK 6: Click-to-Call / Phone Contact Link (10 pts) ---
    const hasTel = /href=["']tel:[^"']+["']/i.test(rawHtml) || /(\+91|0)?[6-9]\d{9}/.test(rawHtml);
    if (hasTel) {
      checks.push({
        id: 'chk-phone',
        name: 'Direct Call / Contact Link',
        category: 'Conversion',
        passed: true,
        score: 10,
        maxScore: 10,
        details: 'Click-to-call or direct phone number detected on page.',
        severity: 'GOOD',
      });
      strengths.push('Direct click-to-call contact link allows mobile visitors to enquire instantly.');
    } else if (isAccessible) {
      checks.push({
        id: 'chk-phone',
        name: 'Direct Call / Contact Link',
        category: 'Conversion',
        passed: false,
        score: 0,
        maxScore: 10,
        details: 'No click-to-call (tel:) links or prominent phone numbers found.',
        severity: 'WARNING',
      });
      issues.push('No direct click-to-call link for customers browsing on smartphones.');
      opportunities.push('Add prominent click-to-call buttons in the website header & footer.');
      recommendedActions.push('Conversion CTA & Click-to-Call Setup');
    } else {
      checks.push({
        id: 'chk-phone',
        name: 'Direct Contact Link',
        category: 'Conversion',
        passed: false,
        score: 0,
        maxScore: 10,
        details: 'No contact link verified.',
        severity: 'INFO',
      });
    }

    // --- CHECK 7: WhatsApp Business Integration (15 pts) ---
    const hasWhatsApp = /wa\.me\/|api\.whatsapp\.com|whatsapp/i.test(rawHtml);
    if (hasWhatsApp) {
      checks.push({
        id: 'chk-whatsapp',
        name: 'WhatsApp Chat Integration',
        category: 'Conversion',
        passed: true,
        score: 15,
        maxScore: 15,
        details: 'WhatsApp click-to-chat link or widget detected.',
        severity: 'GOOD',
      });
      strengths.push('WhatsApp direct chat link makes customer inquiries effortless for Indian buyers.');
    } else if (isAccessible) {
      checks.push({
        id: 'chk-whatsapp',
        name: 'WhatsApp Chat Integration',
        category: 'Conversion',
        passed: false,
        score: 0,
        maxScore: 15,
        details: 'No WhatsApp direct chat button or widget found on the website.',
        severity: 'WARNING',
      });
      issues.push('No WhatsApp chat button — Indian consumers prefer inquiring via WhatsApp.');
      opportunities.push('Add a floating WhatsApp chat widget with pre-filled inquiry messages.');
      recommendedActions.push('WhatsApp Business Setup & Direct Chat Widget');
    } else {
      checks.push({
        id: 'chk-whatsapp',
        name: 'WhatsApp Integration',
        category: 'Conversion',
        passed: false,
        score: 0,
        maxScore: 15,
        details: 'No WhatsApp integration found.',
        severity: 'INFO',
      });
    }

    // --- CHECK 8: Local Business Schema & Structured Data (15 pts) ---
    const hasSchema = /schema\.org|application\/ld\+json/i.test(rawHtml);
    if (hasSchema) {
      checks.push({
        id: 'chk-schema',
        name: 'Schema.org Structured Data',
        category: 'Local',
        passed: true,
        score: 15,
        maxScore: 15,
        details: 'Structured JSON-LD schema markup detected for Google rich snippets.',
        severity: 'GOOD',
      });
      strengths.push('Structured Schema.org data helps Google display your business in the Local 3-Pack.');
    } else if (isAccessible) {
      checks.push({
        id: 'chk-schema',
        name: 'Schema.org Structured Data',
        category: 'Local',
        passed: false,
        score: 0,
        maxScore: 15,
        details: 'Missing LocalBusiness JSON-LD markup.',
        severity: 'WARNING',
      });
      issues.push('Missing Schema.org structured data for Google Maps & Local search snippets.');
      opportunities.push('Add LocalBusiness Schema markup with opening hours, address, and ratings.');
      recommendedActions.push('Google Local 3-Pack Schema.org Setup');
    } else {
      checks.push({
        id: 'chk-schema',
        name: 'Local Search Schema',
        category: 'Local',
        passed: false,
        score: 0,
        maxScore: 15,
        details: 'Not configured.',
        severity: 'INFO',
      });
    }

    // Calculate Total Score (Sum of all check scores)
    const totalScore = checks.reduce((sum, c) => sum + c.score, 0);

    // Determine Grade
    let grade: IAuditResultData['grade'] = 'Major Opportunities';
    if (totalScore >= 90) {
      grade = 'Excellent';
    } else if (totalScore >= 75) {
      grade = 'Good';
    } else if (totalScore >= 50) {
      grade = 'Needs Improvement';
    } else {
      grade = 'Major Opportunities';
    }

    // Category-specific recommendations
    if (params.category === 'Restaurant' || params.category === 'Cafe') {
      opportunities.push('Provide a QR code digital menu for tables and online orders.');
      recommendedActions.push('PrimeOMS Free QR Digital Menu & Table Ordering Setup');
    } else if (params.category === 'School' || params.category === 'Coaching') {
      opportunities.push('Build a dedicated admission landing page with WhatsApp enquiry capture.');
      recommendedActions.push('Admission Landing Page & Parent Enquiry Automation');
    } else if (params.category === 'Clinic' || params.category === 'Salon') {
      opportunities.push('Add instant appointment booking directly from Google Search.');
      recommendedActions.push('Online Appointment Booking & Google Business Profile Setup');
    }

    // Always ensure at least 2 recommended actions
    if (recommendedActions.length < 2) {
      recommendedActions.push('Google Business Profile Setup & Local SEO');
      recommendedActions.push('WhatsApp Business Integration & Website Redesign');
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
        contentSizeBytes: rawHtml.length,
      },
    };
  }
}
