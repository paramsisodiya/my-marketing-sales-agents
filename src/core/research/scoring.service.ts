import { IWebAnalysisReport } from '../tools/web-analyzer.tool';
import {
  IDigitalPresenceDimension,
  ILeadScoreBreakdown,
  IRecommendedServiceMatch,
} from '../types/lead-intelligence.types';

export class ScoringService {
  private static instance: ScoringService;

  public static getInstance(): ScoringService {
    if (!ScoringService.instance) {
      ScoringService.instance = new ScoringService();
    }
    return ScoringService.instance;
  }

  /**
   * Calculates transparent dimensional health scores with granular reason codes and evidence.
   */
  public calculateDimensionalScores(report: IWebAnalysisReport): {
    overallScore: number;
    technicalHealth: number;
    seoHealth: number;
    localSeoReadiness: number;
    conversionReadiness: number;
    socialPresenceScore: number;
    websiteQuality: number;
    dimensions: IDigitalPresenceDimension[];
  } {
    const dimensions: IDigitalPresenceDimension[] = [];

    // 1. Technical Health (Weight 20%)
    let techScore = 0;
    const techReasons: IDigitalPresenceDimension['reasons'] = [];

    if (report.measured.isHttps) {
      techScore += 25;
      techReasons.push({ type: 'BONUS', points: 25, description: 'HTTPS SSL certificate active', evidence: 'Verified https:// protocol' });
    } else {
      techReasons.push({ type: 'DEDUCTION', points: 0, description: 'Missing HTTPS security', evidence: 'Insecure http:// connection' });
    }

    if (report.detected.hasViewport) {
      techScore += 25;
      techReasons.push({ type: 'BONUS', points: 25, description: 'Mobile responsive viewport configured', evidence: `Viewport: "${report.detected.viewportContent || 'standard'}"` });
    } else {
      techReasons.push({ type: 'DEDUCTION', points: 0, description: 'Missing mobile viewport tag', evidence: 'Zero viewport meta tags in DOM' });
    }

    if (report.measured.responseTimeMs < 1200) {
      techScore += 30;
      techReasons.push({ type: 'BONUS', points: 30, description: 'Sub-second fast server response', evidence: `Measured initial response: ${report.measured.responseTimeMs}ms` });
    } else if (report.measured.responseTimeMs < 2500) {
      techScore += 15;
      techReasons.push({ type: 'BONUS', points: 15, description: 'Moderate server latency', evidence: `Measured initial response: ${report.measured.responseTimeMs}ms` });
    } else {
      techReasons.push({ type: 'DEDUCTION', points: 0, description: 'Slow initial server response (>2.5s)', evidence: `Measured latency: ${report.measured.responseTimeMs}ms exceeds Google 1.0s target` });
    }

    if (report.measured.compressionType && report.measured.compressionType !== 'none') {
      techScore += 20;
      techReasons.push({ type: 'BONUS', points: 20, description: `HTTP compression active (${report.measured.compressionType})`, evidence: `Content-Encoding: ${report.measured.compressionType}` });
    } else {
      techReasons.push({ type: 'DEDUCTION', points: 0, description: 'No HTTP gzip/brotli compression detected', evidence: 'Uncompressed raw HTML payload' });
    }

    techScore = Math.min(100, techScore);
    dimensions.push({ name: 'Technical Health', score: techScore, weight: 0.20, reasons: techReasons });

    // 2. SEO Health (Weight 25%)
    let seoScore = 0;
    const seoReasons: IDigitalPresenceDimension['reasons'] = [];

    if (report.detected.title) {
      const len = report.detected.title.length;
      if (len >= 15 && len <= 65) {
        seoScore += 25;
        seoReasons.push({ type: 'BONUS', points: 25, description: 'Optimal title length (15-65 chars)', evidence: `Title (${len} chars): "${report.detected.title}"` });
      } else {
        seoScore += 10;
        seoReasons.push({ type: 'BONUS', points: 10, description: 'Title tag present but outside optimal 15-65 char range', evidence: `Title (${len} chars): "${report.detected.title}"` });
      }
    } else {
      seoReasons.push({ type: 'DEDUCTION', points: 0, description: 'Missing HTML <title> tag', evidence: 'Zero <title> elements found' });
    }

    if (report.detected.metaDescription) {
      seoScore += 25;
      seoReasons.push({ type: 'BONUS', points: 25, description: 'Meta description tag present', evidence: `Description: "${report.detected.metaDescription.slice(0, 50)}..."` });
    } else {
      seoReasons.push({ type: 'DEDUCTION', points: 0, description: 'Missing meta description tag', evidence: 'Zero meta description tags in DOM' });
    }

    if (report.detected.headings.h1.length === 1) {
      seoScore += 25;
      seoReasons.push({ type: 'BONUS', points: 25, description: 'Single, focused <h1> heading tag', evidence: `H1: "${report.detected.headings.h1[0]}"` });
    } else if (report.detected.headings.h1.length > 1) {
      seoScore += 10;
      seoReasons.push({ type: 'DEDUCTION', points: 10, description: `Multiple <h1> tags detected (${report.detected.headings.h1.length})`, evidence: `Found ${report.detected.headings.h1.length} separate H1 headings` });
    } else {
      seoReasons.push({ type: 'DEDUCTION', points: 0, description: 'Missing <h1> primary heading', evidence: 'Zero <h1> tags in DOM' });
    }

    if (report.detected.canonicalUrl) {
      seoScore += 15;
      seoReasons.push({ type: 'BONUS', points: 15, description: 'Canonical URL defined', evidence: `Canonical: ${report.detected.canonicalUrl}` });
    } else {
      seoReasons.push({ type: 'DEDUCTION', points: 0, description: 'Missing canonical URL link tag', evidence: 'No link rel="canonical" in DOM' });
    }

    if (report.detected.imageOptimization.missingAltCount === 0 && report.detected.imageOptimization.totalImages > 0) {
      seoScore += 10;
      seoReasons.push({ type: 'BONUS', points: 10, description: 'All images contain descriptive alt text', evidence: `${report.detected.imageOptimization.totalImages} images checked` });
    } else if (report.detected.imageOptimization.missingAltCount > 0) {
      seoReasons.push({ type: 'DEDUCTION', points: 0, description: `${report.detected.imageOptimization.missingAltCount} images missing alt text`, evidence: `${report.detected.imageOptimization.missingAltCount} of ${report.detected.imageOptimization.totalImages} images lack alt attributes` });
    }

    seoScore = Math.min(100, seoScore);
    dimensions.push({ name: 'SEO Health', score: seoScore, weight: 0.25, reasons: seoReasons });

    // 3. Local SEO Readiness (Weight 20%)
    let localSeoScore = 0;
    const localReasons: IDigitalPresenceDimension['reasons'] = [];

    if (report.detected.hasLocalBusinessSchema) {
      localSeoScore += 45;
      localReasons.push({ type: 'BONUS', points: 45, description: 'Schema.org LocalBusiness structured data present', evidence: `Found schema types: ${report.detected.schemaTypes.join(', ')}` });
    } else {
      localReasons.push({ type: 'DEDUCTION', points: 0, description: 'Missing Schema.org LocalBusiness JSON-LD markup', evidence: 'Zero LocalBusiness / DentalClinic / MedicalBusiness schema in DOM' });
    }

    if (report.detected.schemaTypes.length > 0 && !report.detected.hasLocalBusinessSchema) {
      localSeoScore += 15;
      localReasons.push({ type: 'BONUS', points: 15, description: 'Generic structured data detected (WebPage / BreadcrumbList)', evidence: `Types: ${report.detected.schemaTypes.join(', ')}` });
    }

    if (report.detected.robotsTxtStatus === 'AVAILABLE') {
      localSeoScore += 20;
      localReasons.push({ type: 'BONUS', points: 20, description: 'robots.txt crawler configuration verified', evidence: 'Accessible at /robots.txt' });
    } else {
      localReasons.push({ type: 'DEDUCTION', points: 0, description: 'robots.txt not detected or inaccessible', evidence: 'Status: ' + report.detected.robotsTxtStatus });
    }

    if (report.detected.sitemapStatus === 'AVAILABLE') {
      localSeoScore += 20;
      localReasons.push({ type: 'BONUS', points: 20, description: 'XML Sitemap detected', evidence: 'Referenced in HTML or standard index' });
    } else {
      localReasons.push({ type: 'DEDUCTION', points: 0, description: 'XML Sitemap unverified', evidence: 'No standard sitemap reference in DOM' });
    }

    localSeoScore = Math.min(100, localSeoScore);
    dimensions.push({ name: 'Local SEO Readiness', score: localSeoScore, weight: 0.20, reasons: localReasons });

    // 4. Conversion Readiness (Weight 15%)
    let conversionScore = 0;
    const convReasons: IDigitalPresenceDimension['reasons'] = [];

    if (report.detected.hasWhatsAppLink) {
      conversionScore += 35;
      convReasons.push({ type: 'BONUS', points: 35, description: 'Direct WhatsApp click-to-chat conversion trigger present', evidence: 'WhatsApp API / wa.me link found' });
    } else {
      convReasons.push({ type: 'DEDUCTION', points: 0, description: 'Missing instant WhatsApp intake trigger', evidence: 'Zero WhatsApp links in DOM' });
    }

    if (report.detected.hasTelLink || report.detected.publicPhones.length > 0) {
      conversionScore += 30;
      convReasons.push({ type: 'BONUS', points: 30, description: 'Direct telephone calling triggers verified', evidence: `Detected numbers: ${report.detected.publicPhones.slice(0, 2).join(', ') || 'tel: link'}` });
    } else {
      convReasons.push({ type: 'DEDUCTION', points: 0, description: 'No direct click-to-call phone links found', evidence: 'Missing tel: links in DOM' });
    }

    if (report.detected.bookingLinks.length > 0) {
      conversionScore += 25;
      convReasons.push({ type: 'BONUS', points: 25, description: 'Direct appointment booking software detected', evidence: `Booking link: ${report.detected.bookingLinks[0]}` });
    }

    if (report.detected.contactPageUrls.length > 0) {
      conversionScore += 10;
      convReasons.push({ type: 'BONUS', points: 10, description: 'Dedicated contact page available', evidence: `Contact URL: ${report.detected.contactPageUrls[0]}` });
    }

    conversionScore = Math.min(100, conversionScore);
    dimensions.push({ name: 'Conversion Readiness', score: conversionScore, weight: 0.15, reasons: convReasons });

    // 5. Social Presence (Weight 10%)
    let socialScore = 0;
    const socialReasons: IDigitalPresenceDimension['reasons'] = [];
    const profiles = report.detected.socialProfiles;
    let profilesCount = 0;

    if (profiles.linkedin) { socialScore += 25; profilesCount++; socialReasons.push({ type: 'BONUS', points: 25, description: 'LinkedIn company profile connected', evidence: profiles.linkedin }); }
    if (profiles.facebook) { socialScore += 25; profilesCount++; socialReasons.push({ type: 'BONUS', points: 25, description: 'Facebook page connected', evidence: profiles.facebook }); }
    if (profiles.instagram) { socialScore += 25; profilesCount++; socialReasons.push({ type: 'BONUS', points: 25, description: 'Instagram account connected', evidence: profiles.instagram }); }
    if (profiles.twitter) { socialScore += 15; profilesCount++; socialReasons.push({ type: 'BONUS', points: 15, description: 'Twitter/X profile connected', evidence: profiles.twitter }); }
    if (profiles.youtube) { socialScore += 10; profilesCount++; socialReasons.push({ type: 'BONUS', points: 10, description: 'YouTube channel connected', evidence: profiles.youtube }); }

    if (profilesCount === 0) {
      socialReasons.push({ type: 'DEDUCTION', points: 0, description: 'Zero official social media profiles connected on homepage', evidence: 'No social profile links found in DOM' });
    }

    socialScore = Math.min(100, socialScore);
    dimensions.push({ name: 'Social Presence', score: socialScore, weight: 0.10, reasons: socialReasons });

    // 6. Overall Weighted Score
    const overallScore = Math.round(
      techScore * 0.20 +
      seoScore * 0.25 +
      localSeoScore * 0.20 +
      conversionScore * 0.15 +
      socialScore * 0.10 +
      (report.measured.isHttps ? 80 : 40) * 0.10
    );

    return {
      overallScore,
      technicalHealth: techScore,
      seoHealth: seoScore,
      localSeoReadiness: localSeoScore,
      conversionReadiness: conversionScore,
      socialPresenceScore: socialScore,
      websiteQuality: Math.round((techScore + seoScore) / 2),
      dimensions,
    };
  }

  /**
   * Calculates explainable Lead Score based on technical urgency and transformation upside.
   */
  public calculateLeadScore(params: {
    report: IWebAnalysisReport;
    dimensionalScores: { overallScore: number; technicalHealth: number; seoHealth: number; localSeoReadiness: number; conversionReadiness: number };
  }): ILeadScoreBreakdown {
    const { report, dimensionalScores } = params;
    const scoreBreakdown: ILeadScoreFactor[] = [];
    let leadScore = 40; // Base baseline
    scoreBreakdown.push({ factor: 'Base Target Opportunity', points: 40, evidence: 'Standard qualification baseline' });

    // High Urgency Factors (more points for clear addressable gaps)
    if (report.measured.responseTimeMs > 2500) {
      leadScore += 20;
      scoreBreakdown.push({ factor: 'Critical Latency Friction (>2.5s)', points: 20, evidence: `Server response: ${report.measured.responseTimeMs}ms requires performance rebuild` });
    }

    if (!report.detected.hasLocalBusinessSchema) {
      leadScore += 15;
      scoreBreakdown.push({ factor: 'Missing LocalBusiness Schema', points: 15, evidence: 'Local 3-Pack rank upside via Schema.org implementation' });
    }

    if (!report.detected.hasWhatsAppLink) {
      leadScore += 15;
      scoreBreakdown.push({ factor: 'Absent WhatsApp Conversion Trigger', points: 15, evidence: 'High-intent local mobile intake upside' });
    }

    if (!report.detected.metaDescription || report.detected.headings.h1.length === 0) {
      leadScore += 10;
      scoreBreakdown.push({ factor: 'On-Page SEO Gaps (Meta/H1)', points: 10, evidence: 'Clear on-page SEO remediation package candidate' });
    }

    leadScore = Math.min(100, leadScore);

    let qualification: ILeadScoreBreakdown['qualification'] = 'QUALIFIED';
    if (leadScore >= 75) qualification = 'QUALIFIED';
    else if (leadScore >= 55) qualification = 'OPPORTUNITY';
    else qualification = 'UNQUALIFIED';

    return {
      leadScore,
      qualification,
      confidence: 'HIGH',
      scoreBreakdown,
    };
  }

  /**
   * Maps verified gaps to tailored PrimeSoul service recommendations.
   */
  public matchServices(gaps: string[], report: IWebAnalysisReport): IRecommendedServiceMatch[] {
    const matches: IRecommendedServiceMatch[] = [];

    // 1. High-Performance Website Rebuild
    if (report.measured.responseTimeMs > 2000 || report.detected.detectedCms.includes('WordPress') || !report.measured.isHttps) {
      matches.push({
        serviceName: 'Website Design & Development',
        priority: 'HIGH',
        rationale: 'Rebuild monolithic CMS storefront with sub-second responsive architecture to eliminate mobile bounce friction.',
        matchedGaps: gaps.filter(g => g.includes('response time') || g.includes('HTTPS') || g.includes('viewport')),
      });
    }

    // 2. Google Business Profile & Local SEO
    if (!report.detected.hasLocalBusinessSchema || !report.detected.metaDescription || report.detected.headings.h1.length !== 1) {
      matches.push({
        serviceName: 'Google Business Profile & Local SEO',
        priority: 'HIGH',
        rationale: 'Implement Schema.org JSON-LD structured markup and optimize on-page SEO meta architecture for Google 3-Pack rank dominance.',
        matchedGaps: gaps.filter(g => g.includes('Schema.org') || g.includes('meta description') || g.includes('<h1>')),
      });
    }

    // 3. WhatsApp Business Automation
    if (!report.detected.hasWhatsAppLink) {
      matches.push({
        serviceName: 'WhatsApp Business Setup & Conversion Capture',
        priority: 'MEDIUM',
        rationale: 'Deploy automated WhatsApp lead routing widget to convert high-intent local visitors directly into intake staff.',
        matchedGaps: gaps.filter(g => g.includes('WhatsApp')),
      });
    }

    return matches;
  }
}
