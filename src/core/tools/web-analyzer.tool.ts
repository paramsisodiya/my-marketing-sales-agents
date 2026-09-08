import { ITool } from './tool.interface';
import dns from 'node:dns/promises';
import { URL } from 'node:url';

export interface IWebAnalysisReport {
  url: string;
  finalUrl: string;
  isAccessible: boolean;
  httpStatus?: number;
  measured: {
    httpStatus: number;
    responseTimeMs: number;
    contentSizeBytes: number;
    isHttps: boolean;
    redirectCount: number;
    compressionType?: string;
  };
  detected: {
    title?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    hasViewport: boolean;
    viewportContent?: string;
    robotsDirective?: string;
    robotsTxtStatus: 'AVAILABLE' | 'MISSING' | 'UNCHECKED';
    sitemapStatus: 'AVAILABLE' | 'MISSING' | 'UNCHECKED';
    openGraph: {
      title?: string;
      description?: string;
      image?: string;
    };
    headings: {
      h1: string[];
      h2Count: number;
      sampleH2s: string[];
      h3Count: number;
      sampleH3s: string[];
    };
    detectedCms: string;
    hasWhatsAppLink: boolean;
    hasTelLink: boolean;
    publicPhones: string[];
    publicEmails: string[];
    bookingLinks: string[];
    contactPageUrls: string[];
    socialProfiles: {
      linkedin?: string;
      facebook?: string;
      instagram?: string;
      twitter?: string;
      youtube?: string;
    };
    imageOptimization: {
      totalImages: number;
      missingAltCount: number;
    };
    schemaTypes: string[];
    hasLocalBusinessSchema: boolean;
  };
  inferred: {
    mobileFriendlinessEstimate: 'LIKELY_RESPONSIVE' | 'POTENTIALLY_NON_RESPONSIVE' | 'UNKNOWN';
    localBusinessReadinessScore: number; // 0 - 100
    detectedTechStack: string[];
    identifiedGaps: string[];
    recommendedPrimeSoulActions: string[];
  };
  unknown: {
    realUserCoreWebVitals: string;
    organicSearchVolume: string;
    internalServerArchitecture: string;
  };
}

export class WebAnalyzerTool implements ITool {
  public name = 'web_analyzer';
  public description = 'Safely performs real HTTP analysis of a public website URL, extracting SEO metadata, mobile signals, schema markup, and performance metrics.';
  public parameters = [
    { name: 'url', type: 'string' as const, description: 'The public website URL to audit', required: true },
    { name: 'businessName', type: 'string' as const, description: 'Optional business name for local verification' },
    { name: 'timeoutMs', type: 'number' as const, description: 'Optional timeout in ms (default 6000)' }
  ];

  private readonly MAX_REDIRECTS = 5;
  private readonly MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB cap

  public async execute(args: { url: string; businessName?: string; timeoutMs?: number }): Promise<{ success: boolean; data?: IWebAnalysisReport; error?: string }> {
    if (!args.url || typeof args.url !== 'string') {
      return { success: false, error: 'Invalid URL: A non-empty string URL is required.' };
    }

    let targetUrlString = args.url.trim();
    if (!targetUrlString.includes('://')) {
      targetUrlString = `https://${targetUrlString}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrlString);
    } catch {
      return { success: false, error: `Invalid URL format: '${args.url}'` };
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return { success: false, error: `Unsupported protocol: '${parsedUrl.protocol}'. Only http and https are permitted.` };
    }

    // SSRF Check for initial host
    const ssrfError = await this.validateSafeHost(parsedUrl.hostname);
    if (ssrfError) {
      return { success: false, error: `Security restriction: ${ssrfError}` };
    }

    const timeoutMs = args.timeoutMs || 6000;
    const startTime = Date.now();

    try {
      let currentUrl = parsedUrl.toString();
      let redirectCount = 0;
      let finalResponse: Response | null = null;

      while (redirectCount <= this.MAX_REDIRECTS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const res = await fetch(currentUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PrimeSoulAudit/1.0',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            redirect: 'manual',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Handle redirects
          if (res.status >= 300 && res.status < 400) {
            const location = res.headers.get('location');
            if (!location) {
              finalResponse = res;
              break;
            }

            const nextUrl = new URL(location, currentUrl);
            if (nextUrl.protocol !== 'http:' && nextUrl.protocol !== 'https:') {
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
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          if (fetchErr.name === 'AbortError') {
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
      const compressionType = finalResponse.headers.get('content-encoding') || 'none';

      // Read body up to MAX_BODY_BYTES
      const arrayBuf = await finalResponse.arrayBuffer();
      const contentSizeBytes = arrayBuf.byteLength;
      const decoder = new TextDecoder('utf-8');
      const htmlText = decoder.decode(arrayBuf.slice(0, this.MAX_BODY_BYTES));

      // Fast check for robots.txt
      let robotsTxtStatus: 'AVAILABLE' | 'MISSING' | 'UNCHECKED' = 'UNCHECKED';
      let sitemapStatus: 'AVAILABLE' | 'MISSING' | 'UNCHECKED' = 'UNCHECKED';

      try {
        const robotsUrl = new URL('/robots.txt', currentUrl).toString();
        const rRes = await fetch(robotsUrl, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
        robotsTxtStatus = rRes.status === 200 ? 'AVAILABLE' : 'MISSING';
      } catch {
        robotsTxtStatus = 'MISSING';
      }

      if (htmlText.includes('sitemap.xml') || htmlText.includes('sitemap_index.xml')) {
        sitemapStatus = 'AVAILABLE';
      } else {
        sitemapStatus = 'UNCHECKED';
      }

      const report = this.parseHtmlMetadata({
        originalUrl: targetUrlString,
        finalUrl: currentUrl,
        httpStatus,
        responseTimeMs,
        contentSizeBytes,
        compressionType,
        isHttps: currentUrl.startsWith('https://'),
        redirectCount,
        html: htmlText,
        robotsTxtStatus,
        sitemapStatus,
        businessName: args.businessName,
      });

      return {
        success: true,
        data: report,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to analyze website: ${err.message || String(err)}`,
      };
    }
  }

  /**
   * Validates that the hostname is safe and does not resolve to private / loopback IP ranges (SSRF defense).
   */
  public async validateSafeHost(hostname: string): Promise<string | null> {
    const lowerHost = hostname.toLowerCase();

    if (
      lowerHost === 'localhost' ||
      lowerHost.endsWith('.localhost') ||
      lowerHost.endsWith('.local') ||
      lowerHost.endsWith('.internal') ||
      lowerHost === '0.0.0.0' ||
      lowerHost === '127.0.0.1' ||
      lowerHost === '::1'
    ) {
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
    } catch (dnsErr: any) {
      if (dnsErr.code === 'ENOTFOUND') {
        return `Domain name could not be resolved (ENOTFOUND): '${hostname}'`;
      }
    }

    return null;
  }

  public isPrivateIp(ip: string): boolean {
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

    if (ip === '::1' || ip === '::' || ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd') || ip.toLowerCase().startsWith('fe80')) {
      return true;
    }

    return false;
  }

  /**
   * Parses HTML content to extract meta tags, structured data, headings, contacts, and SEO gap signals.
   */
  public parseHtmlMetadata(params: {
    originalUrl: string;
    finalUrl: string;
    httpStatus: number;
    responseTimeMs: number;
    contentSizeBytes: number;
    compressionType: string;
    isHttps: boolean;
    redirectCount: number;
    html: string;
    robotsTxtStatus?: 'AVAILABLE' | 'MISSING' | 'UNCHECKED';
    sitemapStatus?: 'AVAILABLE' | 'MISSING' | 'UNCHECKED';
    businessName?: string;
  }): IWebAnalysisReport {
    const { html, originalUrl, finalUrl, httpStatus, responseTimeMs, contentSizeBytes, compressionType, isHttps, redirectCount } = params;

    // 1. Title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? this.cleanHtmlEntities(titleMatch[1].trim()) : undefined;

    // 2. Meta description
    const descMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
    const metaDescription = descMatch ? this.cleanHtmlEntities(descMatch[1].trim()) : undefined;

    // 3. Canonical
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
    const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : undefined;

    // 4. Viewport & Robots
    const viewportMatch = html.match(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["']/i);
    const hasViewport = !!viewportMatch;
    const viewportContent = viewportMatch ? viewportMatch[1].trim() : undefined;

    const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
    const robotsDirective = robotsMatch ? robotsMatch[1].trim() : undefined;

    // 5. OpenGraph
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i);

    const openGraph = {
      title: ogTitleMatch ? this.cleanHtmlEntities(ogTitleMatch[1].trim()) : undefined,
      description: ogDescMatch ? this.cleanHtmlEntities(ogDescMatch[1].trim()) : undefined,
      image: ogImageMatch ? ogImageMatch[1].trim() : undefined,
    };

    // 6. Headings (H1, H2, and H3)
    const h1Matches = this.extractHeadingTags(html, 'h1');
    const h2Matches = this.extractHeadingTags(html, 'h2');
    const h3Matches = this.extractHeadingTags(html, 'h3');

    // 7. Structured Data (JSON-LD)
    const schemaRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const schemaTypes: Set<string> = new Set();
    let hasLocalBusinessSchema = false;
    let match: RegExpExecArray | null;

    while ((match = schemaRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        this.extractSchemaTypes(parsed, schemaTypes);
      } catch {
        // ignored
      }
    }

    const localBusinessKeywords = [
      'LocalBusiness', 'MedicalBusiness', 'DentalClinic', 'LegalService', 'Store',
      'Restaurant', 'ProfessionalService', 'AutomotiveBusiness', 'HomeAndConstructionBusiness',
      'HealthAndBeautyBusiness', 'RealEstateAgent', 'Dentist', 'Physician', 'Attorney'
    ];
    for (const st of schemaTypes) {
      if (localBusinessKeywords.some(k => st.includes(k))) {
        hasLocalBusinessSchema = true;
        break;
      }
    }

    // 8. Mobile, Contact & Booking Signals
    const hasWhatsAppLink = /wa\.me\/|api\.whatsapp\.com\/|whatsapp:\/\//i.test(html);
    const hasTelLink = /href=["']tel:[^"']+["']/i.test(html);

    // Extract Public Phones
    const phonesSet = new Set<string>();
    const telHrefRegex = /href=["']tel:([^"']+)["']/gi;
    while ((match = telHrefRegex.exec(html)) !== null) {
      const cleanPhone = match[1].replace(/[^\d+]/g, '').trim();
      if (cleanPhone.length >= 7) phonesSet.add(match[1].trim());
    }

    // Extract Public Emails
    const emailsSet = new Set<string>();
    const mailtoRegex = /href=["']mailto:([^"?#]+)[^"']*["']/gi;
    while ((match = mailtoRegex.exec(html)) !== null) {
      const emailCandidate = match[1].trim().toLowerCase();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCandidate) && !emailCandidate.endsWith('.png') && !emailCandidate.endsWith('.jpg')) {
        emailsSet.add(emailCandidate);
      }
    }

    // Extract Booking Links
    const bookingLinksSet = new Set<string>();
    const bookingPattern = /href=["'](https?:\/\/[^"']*(?:calendly\.com|cal\.com|zocdoc\.com|fresha\.com|jane\.app|acuityscheduling\.com|mindbodyonline\.com|square\.site|hubspot\.com\/meetings)[^"']*)["']/gi;
    while ((match = bookingPattern.exec(html)) !== null) {
      bookingLinksSet.add(match[1]);
    }

    // Extract Contact Pages
    const contactPagesSet = new Set<string>();
    const contactPagePattern = /href=["']([^"']*(?:\/contact|\/contact-us|\/reach-us|\/get-in-touch|\/location)[^"']*)["']/gi;
    while ((match = contactPagePattern.exec(html)) !== null) {
      contactPagesSet.add(match[1]);
    }

    // Extract Social Profiles
    const socialProfiles: { linkedin?: string; facebook?: string; instagram?: string; twitter?: string; youtube?: string } = {};
    const socialPatterns = [
      { key: 'linkedin', regex: /href=["'](https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[^"'\s]+)["']/i },
      { key: 'facebook', regex: /href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'\s]+)["']/i },
      { key: 'instagram', regex: /href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'\s]+)["']/i },
      { key: 'twitter', regex: /href=["'](https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[^"'\s]+)["']/i },
      { key: 'youtube', regex: /href=["'](https?:\/\/(?:www\.)?youtube\.com\/(?:@|channel\/|user\/)[^"'\s]+)["']/i },
    ];
    for (const sp of socialPatterns) {
      const sMatch = html.match(sp.regex);
      if (sMatch) {
        (socialProfiles as any)[sp.key] = sMatch[1];
      }
    }

    // Image Optimization Signals
    const imgRegex = /<img\b([^>]*)>/gi;
    let totalImages = 0;
    let missingAltCount = 0;
    while ((match = imgRegex.exec(html)) !== null) {
      totalImages++;
      const attrs = match[1];
      if (!attrs.includes('alt=') || /alt=["']\s*["']/.test(attrs)) {
        missingAltCount++;
      }
    }

    // 9. CMS & Framework Detection
    const detectedCms = this.detectCms(html);

    // 10. Gap Analysis & Inferences
    const gaps: string[] = [];
    if (!isHttps) gaps.push('Website is not secured with HTTPS/SSL.');
    if (!title) gaps.push('Missing HTML <title> tag.');
    if (title && (title.length < 15 || title.length > 70)) gaps.push(`Title length (${title.length} chars) is outside optimal 15-60 character range.`);
    if (!metaDescription) gaps.push('Missing meta description tag.');
    if (h1Matches.length === 0) gaps.push('No <h1> heading tag found on page.');
    if (h1Matches.length > 1) gaps.push(`Multiple <h1> heading tags detected (${h1Matches.length}), which diffuses SEO keyword focus.`);
    if (!canonicalUrl) gaps.push('Missing canonical URL tag.');
    if (!hasViewport) gaps.push('Missing mobile viewport meta tag (site may not render properly on smartphones).');
    if (!hasLocalBusinessSchema) gaps.push('Missing Schema.org LocalBusiness JSON-LD markup for Google local 3-pack optimization.');
    if (!hasWhatsAppLink) gaps.push('No instant WhatsApp lead capture trigger detected on page.');
    if (bookingLinksSet.size === 0 && phonesSet.size === 0) gaps.push('No direct online booking or visible telephone call triggers found.');
    if (missingAltCount > 3) gaps.push(`${missingAltCount} images are missing descriptive alt attributes for SEO and accessibility.`);
    if (responseTimeMs > 2500) gaps.push(`Initial HTML server response time (${(responseTimeMs / 1000).toFixed(1)}s) is slower than Google 1.0s target.`);

    // Local readiness score calculation
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
      hasLocalBusinessSchema ? 'Maintain local schema and expand service catalog markup' : 'Implement custom Schema.org LocalBusiness JSON-LD markup',
      !hasWhatsAppLink ? 'Deploy automated WhatsApp lead routing widget' : 'Optimize WhatsApp conversion copy & intake workflow',
      responseTimeMs > 1500 || detectedCms.includes('WordPress') ? 'Rebuild high-performance web architecture for sub-second load times' : 'Conduct technical Core Web Vitals optimization sprint',
      !canonicalUrl || !metaDescription ? 'Fix fundamental on-page SEO meta architecture' : 'Expand local 3-pack geographic citations'
    ];

    const techStack: string[] = [detectedCms];
    if (isHttps) techStack.push('HTTPS SSL Certificate');
    if (hasWhatsAppLink) techStack.push('WhatsApp Click-to-Chat Integration');
    if (hasTelLink || phonesSet.size > 0) techStack.push('Direct Tel Calling Links');
    if (bookingLinksSet.size > 0) techStack.push('Direct Appointment Booking Integration');
    if (schemaTypes.size > 0) techStack.push(`Schema.org (${Array.from(schemaTypes).join(', ')})`);

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
        compressionType,
      },
      detected: {
        title,
        metaDescription,
        canonicalUrl,
        hasViewport,
        viewportContent,
        robotsDirective,
        robotsTxtStatus: params.robotsTxtStatus || 'UNCHECKED',
        sitemapStatus: params.sitemapStatus || 'UNCHECKED',
        openGraph,
        headings: {
          h1: h1Matches,
          h2Count: h2Matches.length,
          sampleH2s: h2Matches.slice(0, 5),
          h3Count: h3Matches.length,
          sampleH3s: h3Matches.slice(0, 5),
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
          missingAltCount,
        },
        schemaTypes: Array.from(schemaTypes),
        hasLocalBusinessSchema,
      },
      inferred: {
        mobileFriendlinessEstimate: hasViewport ? 'LIKELY_RESPONSIVE' : 'POTENTIALLY_NON_RESPONSIVE',
        localBusinessReadinessScore: readinessScore,
        detectedTechStack: techStack,
        identifiedGaps: gaps,
        recommendedPrimeSoulActions,
      },
      unknown: {
        realUserCoreWebVitals: 'Unknown without Chrome User Experience Report (CrUX) API or Google Search Console connection.',
        organicSearchVolume: 'Unknown without Google Analytics / Search Console direct access.',
        internalServerArchitecture: 'Unknown without hosting server inspection.',
      }
    };
  }

  private extractHeadingTags(html: string, tag: 'h1' | 'h2' | 'h3'): string[] {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const results: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(html)) !== null) {
      const text = this.stripTags(m[1]).trim();
      if (text) results.push(text);
    }
    return results;
  }

  private detectCms(html: string): string {
    if (/wp-content|wp-includes|wordpress/i.test(html)) {
      if (/elementor/i.test(html)) return 'WordPress / Elementor Builder';
      if (/divi/i.test(html)) return 'WordPress / Divi Builder';
      return 'WordPress CMS';
    }
    if (/cdn\.shopify\.com|shopify/i.test(html)) return 'Shopify E-Commerce';
    if (/wix\.com|wixsite\.com/i.test(html)) return 'Wix Website Builder';
    if (/squarespace\.com/i.test(html)) return 'Squarespace';
    if (/webflow\.com|data-wf-page/i.test(html)) return 'Webflow';
    if (/__NEXT_DATA__|next\/router/i.test(html)) return 'Next.js React Framework';
    if (/__NUXT__|nuxt/i.test(html)) return 'Nuxt.js Vue Framework';
    return 'Custom Web Application / Static HTML';
  }

  private extractSchemaTypes(data: any, types: Set<string>): void {
    if (!data) return;
    if (Array.isArray(data)) {
      for (const item of data) this.extractSchemaTypes(item, types);
      return;
    }
    if (typeof data === 'object') {
      if (data['@type']) {
        if (Array.isArray(data['@type'])) {
          data['@type'].forEach((t: string) => types.add(String(t)));
        } else {
          types.add(String(data['@type']));
        }
      }
      if (data['@graph'] && Array.isArray(data['@graph'])) {
        this.extractSchemaTypes(data['@graph'], types);
      }
    }
  }

  private stripTags(str: string): string {
    return str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private cleanHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ');
  }
}
