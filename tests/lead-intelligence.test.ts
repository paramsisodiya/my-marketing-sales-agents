import { describe, it, expect, beforeEach } from 'vitest';
import { WebAnalyzerTool } from '../src/core/tools/web-analyzer.tool';
import { IdentityResolverService } from '../src/core/research/identity-resolver.service';
import { ScoringService } from '../src/core/research/scoring.service';
import { ChangeDetectorService } from '../src/core/research/change-detector.service';
import { LeadIntelligenceService } from '../src/core/research/lead-intelligence.service';
import { DatabaseService } from '../src/core/database/db.service';

describe('P2.1: Real Web Research & Lead Intelligence Suite', () => {
  const webAnalyzer = new WebAnalyzerTool();
  const identityResolver = IdentityResolverService.getInstance();
  const scoringService = ScoringService.getInstance();
  const changeDetector = ChangeDetectorService.getInstance();
  const leadIntelligenceService = LeadIntelligenceService.getInstance();
  const db = DatabaseService.getInstance();

  const mockHtmlComplete = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Elite Dental Care - Premier Family Dentistry in Charlotte, NC</title>
      <meta name="description" content="Elite Dental Care provides gentle cosmetic, restorative, and pediatric dental care in Charlotte, NC. Book your appointment today.">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="canonical" href="https://elitedentalnc.com/">
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "DentalClinic",
        "name": "Elite Dental Care",
        "telephone": "+1-704-555-0199",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Charlotte",
          "addressRegion": "NC"
        }
      }
      </script>
    </head>
    <body>
      <h1>Elite Dental Care in Charlotte</h1>
      <h2>Comprehensive Dental Treatments</h2>
      <h2>Our Preventative Care Plan</h2>
      <h3>Teeth Whitening</h3>
      <h3>Dental Implants</h3>
      <p>Contact our clinic at <a href="tel:+17045550199">(704) 555-0199</a> or email us at <a href="mailto:info@elitedentalnc.com">info@elitedentalnc.com</a>.</p>
      <p>Connect with us on WhatsApp: <a href="https://wa.me/17045550199">Chat on WhatsApp</a>.</p>
      <p>Book online: <a href="https://calendly.com/elitedental/consultation">Schedule Consultation</a>.</p>
      <p><a href="/contact-us">Visit our Contact Page</a></p>
      <a href="https://linkedin.com/company/elitedentalcare">LinkedIn</a>
      <a href="https://facebook.com/elitedentalcare">Facebook</a>
      <a href="https://instagram.com/elitedentalcare">Instagram</a>
      <img src="/logo.png" alt="Elite Dental Care Logo">
      <img src="/team.jpg" alt="Our Dental Team">
      <div class="elementor-section">Powered by WordPress and Elementor</div>
    </body>
    </html>
  `;

  const mockHtmlMinimal = `
    <!DOCTYPE html>
    <html>
    <head><title>Small Shop</title></head>
    <body><p>Hello world</p><img src="/banner.jpg"></body>
    </html>
  `;

  describe('1. WebAnalyzer DOM & Signal Extraction', () => {
    it('should extract full heading hierarchy, contacts, booking triggers, and schema types', () => {
      const report = webAnalyzer.parseHtmlMetadata({
        originalUrl: 'https://elitedentalnc.com',
        finalUrl: 'https://elitedentalnc.com/',
        httpStatus: 200,
        responseTimeMs: 850,
        contentSizeBytes: mockHtmlComplete.length,
        compressionType: 'br',
        isHttps: true,
        redirectCount: 0,
        html: mockHtmlComplete,
        robotsTxtStatus: 'AVAILABLE',
        sitemapStatus: 'AVAILABLE',
      });

      // Headings
      expect(report.detected.headings.h1).toEqual(['Elite Dental Care in Charlotte']);
      expect(report.detected.headings.h2Count).toBe(2);
      expect(report.detected.headings.h3Count).toBe(2);

      // Contacts & Bookings
      expect(report.detected.publicPhones).toContain('+17045550199');
      expect(report.detected.publicEmails).toContain('info@elitedentalnc.com');
      expect(report.detected.bookingLinks).toContain('https://calendly.com/elitedental/consultation');
      expect(report.detected.contactPageUrls).toContain('/contact-us');

      // Socials
      expect(report.detected.socialProfiles.linkedin).toBe('https://linkedin.com/company/elitedentalcare');
      expect(report.detected.socialProfiles.facebook).toBe('https://facebook.com/elitedentalcare');
      expect(report.detected.socialProfiles.instagram).toBe('https://instagram.com/elitedentalcare');

      // Structured Data
      expect(report.detected.hasLocalBusinessSchema).toBe(true);
      expect(report.detected.schemaTypes).toContain('DentalClinic');

      // CMS
      expect(report.detected.detectedCms).toContain('WordPress / Elementor');
    });

    it('should detect missing meta tags, missing H1, missing schema, and missing alt attributes', () => {
      const report = webAnalyzer.parseHtmlMetadata({
        originalUrl: 'https://smallshop.com',
        finalUrl: 'https://smallshop.com/',
        httpStatus: 200,
        responseTimeMs: 3200,
        contentSizeBytes: mockHtmlMinimal.length,
        compressionType: 'none',
        isHttps: false,
        redirectCount: 0,
        html: mockHtmlMinimal,
      });

      expect(report.detected.metaDescription).toBeUndefined();
      expect(report.detected.headings.h1.length).toBe(0);
      expect(report.detected.hasLocalBusinessSchema).toBe(false);
      expect(report.detected.hasWhatsAppLink).toBe(false);
      expect(report.detected.imageOptimization.missingAltCount).toBe(1);

      // Verified Gaps
      expect(report.inferred.identifiedGaps).toContain('Website is not secured with HTTPS/SSL.');
      expect(report.inferred.identifiedGaps).toContain('Missing meta description tag.');
      expect(report.inferred.identifiedGaps).toContain('No <h1> heading tag found on page.');
      expect(report.inferred.identifiedGaps).toContain('Missing Schema.org LocalBusiness JSON-LD markup for Google local 3-pack optimization.');
    });
  });

  describe('2. SSRF Security & URL Validation', () => {
    it('should block localhost, private IPs, and metadata endpoints', async () => {
      expect(await webAnalyzer.validateSafeHost('localhost')).not.toBeNull();
      expect(await webAnalyzer.validateSafeHost('127.0.0.1')).not.toBeNull();
      expect(await webAnalyzer.validateSafeHost('10.0.0.1')).not.toBeNull();
      expect(await webAnalyzer.validateSafeHost('192.168.1.1')).not.toBeNull();
      expect(await webAnalyzer.validateSafeHost('169.254.169.254')).not.toBeNull();
      expect(await webAnalyzer.validateSafeHost('::1')).not.toBeNull();
    });

    it('should reject invalid URL schemes and malformed strings', async () => {
      const fileRes = await webAnalyzer.execute({ url: 'file:///etc/passwd' });
      expect(fileRes.success).toBe(false);
      expect(fileRes.error).toContain('Unsupported protocol');

      const ftpRes = await webAnalyzer.execute({ url: 'ftp://ftp.example.com' });
      expect(ftpRes.success).toBe(false);
      expect(ftpRes.error).toContain('Unsupported protocol');
    });
  });

  describe('3. Business Identity Resolution', () => {
    it('should resolve CONFIDENT identity when domain and title align', () => {
      const report = webAnalyzer.parseHtmlMetadata({
        originalUrl: 'https://elitedentalnc.com',
        finalUrl: 'https://elitedentalnc.com/',
        httpStatus: 200,
        responseTimeMs: 800,
        contentSizeBytes: 1000,
        compressionType: 'gzip',
        isHttps: true,
        redirectCount: 0,
        html: mockHtmlComplete,
      });

      const res = identityResolver.resolveIdentity({
        inputName: 'Elite Dental Care',
        inputLocation: 'Charlotte, NC',
        inputUrl: 'https://elitedentalnc.com',
        webReport: report,
      });

      expect(res.status).toBe('CONFIDENT');
      expect(res.resolvedName).toBe('Elite Dental Care');
      expect(res.domain).toBe('elitedentalnc.com');
      expect(res.verifiedLocations).toContain('Charlotte, NC');
      expect(res.ambiguityReasons.length).toBe(0);
    });

    it('should flag AMBIGUOUS when searching generic name without domain anchor', () => {
      const res = identityResolver.resolveIdentity({
        inputName: 'UNKNOWN',
        searchResults: [
          { title: 'Apex Solutions - London, UK' },
          { title: 'Apex Solutions - Austin, TX' },
          { title: 'Apex Solutions - Sydney, AU' },
          { title: 'Apex Solutions - Toronto, CA' },
        ],
      });

      expect(res.status).toBe('AMBIGUOUS');
      expect(res.ambiguityReasons.length).toBeGreaterThan(0);
    });
  });

  describe('4. Transparent Dimensional & Lead Scoring', () => {
    it('should calculate explainable dimensional scores with granular reasons', () => {
      const report = webAnalyzer.parseHtmlMetadata({
        originalUrl: 'https://elitedentalnc.com',
        finalUrl: 'https://elitedentalnc.com/',
        httpStatus: 200,
        responseTimeMs: 850,
        contentSizeBytes: mockHtmlComplete.length,
        compressionType: 'br',
        isHttps: true,
        redirectCount: 0,
        html: mockHtmlComplete,
        robotsTxtStatus: 'AVAILABLE',
        sitemapStatus: 'AVAILABLE',
      });

      const scores = scoringService.calculateDimensionalScores(report);
      expect(scores.technicalHealth).toBeGreaterThanOrEqual(80);
      expect(scores.seoHealth).toBeGreaterThanOrEqual(80);
      expect(scores.localSeoReadiness).toBeGreaterThanOrEqual(80);
      expect(scores.conversionReadiness).toBeGreaterThanOrEqual(80);
      expect(scores.dimensions.length).toBe(5);

      // Verify reasons exist
      const techDim = scores.dimensions.find(d => d.name === 'Technical Health')!;
      expect(techDim.reasons.some(r => r.description.includes('HTTPS SSL'))).toBe(true);
    });

    it('should match PrimeSoul services accurately to identified gaps', () => {
      const report = webAnalyzer.parseHtmlMetadata({
        originalUrl: 'https://smallshop.com',
        finalUrl: 'https://smallshop.com/',
        httpStatus: 200,
        responseTimeMs: 3200,
        contentSizeBytes: mockHtmlMinimal.length,
        compressionType: 'none',
        isHttps: false,
        redirectCount: 0,
        html: mockHtmlMinimal,
      });

      const matches = scoringService.matchServices(report.inferred.identifiedGaps, report);
      expect(matches.some(m => m.serviceName.includes('Website Design'))).toBe(true);
      expect(matches.some(m => m.serviceName.includes('Local SEO'))).toBe(true);
      expect(matches.some(m => m.serviceName.includes('WhatsApp'))).toBe(true);
    });
  });

  describe('5. Change Detection & Historical Scans', () => {
    it('should detect significant shifts across consecutive scans', () => {
      const prevProfile: any = {
        researchTimestamp: '2026-09-01T10:00:00Z',
        seo: { title: 'Old Dental Title' },
        website: { responseTimeMs: 1200, detectedCms: 'WordPress CMS' },
        localSearch: { hasLocalBusinessSchema: false },
        conversion: { hasWhatsAppWidget: false },
        contact: { publicPhones: [{ value: '555-0100' }] },
        leadScoring: { leadScore: 60 },
      };

      const currProfile: any = {
        seo: { title: 'New Dental Title' },
        website: { responseTimeMs: 3100, detectedCms: 'Next.js React Framework' },
        localSearch: { hasLocalBusinessSchema: true },
        conversion: { hasWhatsAppWidget: true },
        contact: { publicPhones: [{ value: '555-9999' }] },
        leadScoring: { leadScore: 85 },
      };

      const report = changeDetector.detectChanges(prevProfile, currProfile);
      expect(report.hasChanges).toBe(true);
      expect(report.changesCount).toBeGreaterThanOrEqual(5);

      const fieldNames = report.changes.map(c => c.field);
      expect(fieldNames).toContain('seo.title');
      expect(fieldNames).toContain('website.responseTimeMs');
      expect(fieldNames).toContain('localSearch.hasLocalBusinessSchema');
      expect(fieldNames).toContain('conversion.hasWhatsAppWidget');
      expect(fieldNames).toContain('website.detectedCms');
      expect(fieldNames).toContain('contact.publicPhones');
      expect(fieldNames).toContain('leadScoring.leadScore');
    });
  });

  describe('6. Lead Intelligence End-to-End Pipeline & CRM Integration', () => {
    it('should execute full pipeline, attach provenance, and preserve verified CRM data non-destructively', async () => {
      // Create initial lead with verified contact name
      const initialLead = db.saveLead({
        businessName: 'Apex Dental Care',
        industry: 'Healthcare',
        location: 'Charlotte, NC',
        contactName: 'Dr. Sarah Jenkins',
        phone: '704-555-0123',
        source: 'manual_intake',
      });

      // Run research with empty contact name in scan input
      const result = await leadIntelligenceService.executeResearch({
        leadId: initialLead.id,
        businessName: 'Apex Dental Care',
        location: 'Charlotte, NC',
      });

      expect(result.success).toBe(true);
      expect(result.profile).toBeDefined();
      expect(result.lead).toBeDefined();

      // Non-destructive preservation check: Dr. Sarah Jenkins must NOT be wiped
      expect(result.lead?.contactName).toBe('Dr. Sarah Jenkins');
      expect(result.lead?.phone).toBe('704-555-0123');

      // Verify Research Run History recorded
      const history = db.getResearchRuns(initialLead.id);
      expect(history.length).toBeGreaterThanOrEqual(1);
      expect(history[0].runId).toBe(result.run?.runId);

      // Verify Provenance Envelope is attached
      expect(result.profile?.provenance).toBeDefined();
      expect(result.profile?.provenance['businessName']).toBeDefined();
    });
  });
});
