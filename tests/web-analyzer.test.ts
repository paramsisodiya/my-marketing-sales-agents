import { describe, it, expect } from 'vitest';
import { WebAnalyzerTool } from '../src/core/tools/web-analyzer.tool';

describe('P0 #1: Real HTTP Web Analyzer Suite', () => {
  const analyzer = new WebAnalyzerTool();

  describe('SSRF & Private IP Protection', () => {
    it('should block localhost and 127.0.0.1 loopback addresses', async () => {
      const res1 = await analyzer.execute({ url: 'http://localhost:3000' });
      expect(res1.success).toBe(false);
      expect(res1.error).toMatch(/local loopback|internal address|Security restriction/i);

      const res2 = await analyzer.execute({ url: 'http://127.0.0.1:8080/admin' });
      expect(res2.success).toBe(false);
      expect(res2.error).toMatch(/local loopback|reserved private|Security restriction/i);
    });

    it('should block private network IP ranges (10.x, 192.168.x, 172.16.x)', async () => {
      const res1 = await analyzer.execute({ url: 'http://10.0.0.1/dashboard' });
      expect(res1.success).toBe(false);
      expect(res1.error).toMatch(/reserved private|Security restriction/i);

      const res2 = await analyzer.execute({ url: 'http://192.168.1.1/setup' });
      expect(res2.success).toBe(false);
      expect(res2.error).toMatch(/reserved private|Security restriction/i);

      const res3 = await analyzer.execute({ url: 'http://172.20.0.1/api' });
      expect(res3.success).toBe(false);
      expect(res3.error).toMatch(/reserved private|Security restriction/i);
    });

    it('should block cloud metadata IP (169.254.169.254)', async () => {
      const res = await analyzer.execute({ url: 'http://169.254.169.254/latest/meta-data/' });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/reserved private|link-local|Security restriction/i);
    });

    it('should block IPv6 loopback [::1]', async () => {
      const res = await analyzer.execute({ url: 'http://[::1]:8080' });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/reserved private|loopback|Security restriction/i);
    });

    it('should reject non-HTTP/HTTPS protocols', async () => {
      const res = await analyzer.execute({ url: 'ftp://ftp.example.com/file.txt' });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/unsupported protocol|invalid url/i);
    });
  });

  describe('URL Validation & Error Handling', () => {
    it('should handle malformed and empty URLs gracefully', async () => {
      const res1 = await analyzer.execute({ url: '' });
      expect(res1.success).toBe(false);
      expect(res1.error).toContain('Invalid URL');

      const res2 = await analyzer.execute({ url: 'not-a-valid-url-at-all-!!' });
      expect(res2.success).toBe(false);
    });

    it('should handle unresolvable domains gracefully without crashing', async () => {
      const res = await analyzer.execute({ url: 'https://this-domain-definitely-does-not-exist-xyz999.org' });
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe('HTML Metadata & Schema Parsing with Explicit Classifications', () => {
    it('should parse HTML metadata, headings, schema, and mobile signals accurately', () => {
      const sampleHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Apex Dental Clinic | Premier Dental Care in Mumbai</title>
          <meta name="description" content="Expert cosmetic and restorative dentistry in Bandra, Mumbai. Book an appointment online.">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="canonical" href="https://apexdental.com">
          <meta property="og:title" content="Apex Dental Clinic">
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "DentalClinic",
            "name": "Apex Dental Clinic",
            "telephone": "+919876543210"
          }
          </script>
        </head>
        <body>
          <h1>Welcome to Apex Dental Clinic</h1>
          <h2>Our Services</h2>
          <h2>Patient Reviews</h2>
          <a href="https://wa.me/919876543210">Chat on WhatsApp</a>
          <a href="tel:+919876543210">Call Us</a>
        </body>
        </html>
      `;

      const report = analyzer.parseHtmlMetadata({
        originalUrl: 'https://apexdental.com',
        finalUrl: 'https://apexdental.com',
        httpStatus: 200,
        responseTimeMs: 320,
        contentSizeBytes: sampleHtml.length,
        compressionType: 'gzip',
        isHttps: true,
        redirectCount: 0,
        html: sampleHtml,
        businessName: 'Apex Dental Clinic',
      });

      // 1. [MEASURED]
      expect(report.measured.httpStatus).toBe(200);
      expect(report.measured.responseTimeMs).toBe(320);
      expect(report.measured.isHttps).toBe(true);

      // 2. [DETECTED]
      expect(report.detected.title).toBe('Apex Dental Clinic | Premier Dental Care in Mumbai');
      expect(report.detected.metaDescription).toContain('Expert cosmetic and restorative dentistry');
      expect(report.detected.canonicalUrl).toBe('https://apexdental.com');
      expect(report.detected.hasViewport).toBe(true);
      expect(report.detected.headings.h1).toEqual(['Welcome to Apex Dental Clinic']);
      expect(report.detected.headings.h2Count).toBe(2);
      expect(report.detected.hasWhatsAppLink).toBe(true);
      expect(report.detected.hasTelLink).toBe(true);
      expect(report.detected.hasLocalBusinessSchema).toBe(true);
      expect(report.detected.schemaTypes).toContain('DentalClinic');

      // 3. [INFERRED]
      expect(report.inferred.mobileFriendlinessEstimate).toBe('LIKELY_RESPONSIVE');
      expect(report.inferred.localBusinessReadinessScore).toBeGreaterThanOrEqual(80);

      // 4. [UNKNOWN]
      expect(report.unknown.realUserCoreWebVitals).toContain('CrUX');
    });

    it('should flag SEO gaps when viewport, H1, or schema are missing', () => {
      const badHtml = `
        <html>
        <head>
          <title>Home</title>
        </head>
        <body>
          <p>Welcome to our unoptimized site</p>
        </body>
        </html>
      `;

      const report = analyzer.parseHtmlMetadata({
        originalUrl: 'http://slow-unsecured-site.com',
        finalUrl: 'http://slow-unsecured-site.com',
        httpStatus: 200,
        responseTimeMs: 3500,
        contentSizeBytes: badHtml.length,
        compressionType: 'none',
        isHttps: false,
        redirectCount: 0,
        html: badHtml,
      });

      expect(report.measured.isHttps).toBe(false);
      expect(report.detected.hasViewport).toBe(false);
      expect(report.detected.hasLocalBusinessSchema).toBe(false);
      expect(report.inferred.identifiedGaps).toEqual(
        expect.arrayContaining([
          expect.stringContaining('HTTPS/SSL'),
          expect.stringContaining('meta description'),
          expect.stringContaining('<h1> heading'),
          expect.stringContaining('mobile viewport'),
          expect.stringContaining('LocalBusiness JSON-LD'),
          expect.stringContaining('WhatsApp lead capture'),
        ])
      );
      expect(report.inferred.mobileFriendlinessEstimate).toBe('POTENTIALLY_NON_RESPONSIVE');
    });
  });
});
