import { describe, it, expect, beforeEach } from 'vitest';
import { GrowthScoringEngine } from '../src/core/growth/scoring.engine';
import { AuditEngine } from '../src/core/growth/audit.engine';
import { QrMenuEngine } from '../src/core/growth/qr-menu.engine';
import { ReferralEngine } from '../src/core/growth/referral.engine';
import { EventService } from '../src/core/growth/event.service';
import { dbService } from '../src/core/database/db.service';

describe('PrimeSoul Growth Engine V1 Core Suite', () => {
  // --------------------------------------------------------------------------
  // 1. LEAD SCORING ENGINE
  // --------------------------------------------------------------------------
  describe('Deterministic Lead Scoring Engine', () => {
    it('calculates baseline score for cold leads with minimal info', () => {
      const result = GrowthScoringEngine.calculateScore({});
      expect(result.score).toBe(0);
      expect(result.temperature).toBe('COLD');
    });

    it('awards correct points for phone, email, immediate timeline and requirement', () => {
      const result = GrowthScoringEngine.calculateScore({
        phone: '+91 9876543210',
        email: 'rahul@rajputrestaurant.com',
        timeline: 'Immediately',
        requirement: 'PrimeOMS',
        hasViewedAuditResult: true,
        hasClickedContactCta: true,
      });
      // 20 (phone) + 10 (email) + 20 (immediate) + 15 (requirement) + 10 (audit) + 15 (contact) = 90
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.temperature).toBe('HOT');
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('caps the maximum score at 100', () => {
      const result = GrowthScoringEngine.calculateScore({
        phone: '+91 9999999999',
        email: 'max@example.com',
        timeline: 'Immediately',
        requirement: 'PrimeOMS',
        hasViewedAuditResult: true,
        hasClickedContactCta: true,
        hasCreatedQrMenu: true,
        hasRequestedDemo: true,
        isTableOrderingInterested: true,
      });
      expect(result.score).toBe(100);
      expect(result.temperature).toBe('HOT');
    });
  });

  // --------------------------------------------------------------------------
  // 2. AUDIT ENGINE & SSRF PROTECTION
  // --------------------------------------------------------------------------
  describe('SSRF Protection & Audit Security', () => {
    it('blocks dangerous private loopback and local IP addresses', () => {
      expect(AuditEngine.isSafeUrl('http://localhost:3000').safe).toBe(false);
      expect(AuditEngine.isSafeUrl('http://127.0.0.1:8080').safe).toBe(false);
      expect(AuditEngine.isSafeUrl('http://0.0.0.0').safe).toBe(false);
      expect(AuditEngine.isSafeUrl('http://192.168.1.1/admin').safe).toBe(false);
      expect(AuditEngine.isSafeUrl('http://10.0.0.5/api').safe).toBe(false);
      expect(AuditEngine.isSafeUrl('http://172.16.0.1').safe).toBe(false);
    });

    it('blocks cloud metadata endpoint 169.254.169.254 and invalid protocols', () => {
      expect(AuditEngine.isSafeUrl('http://169.254.169.254/latest/meta-data').safe).toBe(false);
      expect(AuditEngine.isSafeUrl('file:///etc/passwd').safe).toBe(false);
      expect(AuditEngine.isSafeUrl('ftp://example.com/file').safe).toBe(false);
      expect(AuditEngine.isSafeUrl('gopher://example.com').safe).toBe(false);
    });

    it('allows valid public HTTP and HTTPS domains', () => {
      expect(AuditEngine.isSafeUrl('https://example.com').safe).toBe(true);
      expect(AuditEngine.isSafeUrl('http://my-restaurant-delhi.in').safe).toBe(true);
      expect(AuditEngine.isSafeUrl('https://www.primesoul.in/solutions').safe).toBe(true);
    });

    it('performs fallback deterministic audit when website is empty or offline', async () => {
      const result = await AuditEngine.executeAudit({
        businessName: 'Apex Dental Care',
        category: 'Clinic',
        city: 'Jaipur',
      });

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.checks.length).toBeGreaterThan(0);
      expect(result.opportunities.length).toBeGreaterThan(0);
      expect(result.recommendedActions.length).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // 3. QR DIGITAL MENU ENGINE
  // --------------------------------------------------------------------------
  describe('QR Digital Menu Engine', () => {
    it('generates clean URL-safe slugs with collision avoidance', () => {
      const slug1 = QrMenuEngine.generateSlug('Royal Spice Restaurant & Bar');
      expect(slug1).toBe('royal-spice-restaurant-bar');

      const uniqueSlug = QrMenuEngine.generateSlug('royal-spice-restaurant-bar', [
        'royal-spice-restaurant-bar',
        'royal-spice-restaurant-bar-2',
      ]);
      expect(uniqueSlug).toBe('royal-spice-restaurant-bar-3');
    });

    it('creates starter menu categories and items for Indian restaurants', () => {
      const { categories, items } = QrMenuEngine.createDefaultMenu('rest-123');
      expect(categories.length).toBeGreaterThanOrEqual(3);
      expect(items.length).toBeGreaterThanOrEqual(4);

      // Verify vegetarian flags and INR prices
      const vegItem = items.find(i => i.isVegetarian);
      expect(vegItem).toBeDefined();
      expect(vegItem?.price).toBeGreaterThan(0);
    });

    it('generates valid SVG QR code string pointing to menu URL', () => {
      const svg = QrMenuEngine.generateQrCodeSvg('https://primesoul.in/qr-menu/royal-spice');
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('viewBox');
    });
  });

  // --------------------------------------------------------------------------
  // 4. REFERRAL ENGINE
  // --------------------------------------------------------------------------
  describe('Referral Engine', () => {
    it('generates clean and uppercase referral codes', () => {
      const code1 = ReferralEngine.generateCode('Rohit');
      expect(code1).toMatch(/^ROHIT\d{3}$/);

      const normalized = ReferralEngine.normalizeCode(' rahul20 ');
      expect(normalized).toBe('RAHUL20');
    });
  });

  // --------------------------------------------------------------------------
  // 5. EVENT ANALYTICS SERVICE
  // --------------------------------------------------------------------------
  describe('Event Analytics Service', () => {
    it('records events and computes aggregated counts', () => {
      const eventService = EventService.getInstance();
      eventService.logEvent('homepage_view');
      eventService.logEvent('audit_started');
      eventService.logEvent('audit_completed');
      eventService.logEvent('qr_menu_created');

      const stats = eventService.getEventStats();
      expect(stats['homepage_view']).toBeGreaterThanOrEqual(1);
      expect(stats['audit_completed']).toBeGreaterThanOrEqual(1);
      expect(stats['qr_menu_created']).toBeGreaterThanOrEqual(1);
    });
  });

  // --------------------------------------------------------------------------
  // 6. DATABASE SERVICE GROWTH ENGINE CRUD
  // --------------------------------------------------------------------------
  describe('Database Service Growth Engine Persistence', () => {
    it('persists and retrieves digital audit records', () => {
      const audit = dbService.saveAudit({
        businessName: 'St. Xavier Global Academy',
        category: 'School',
        city: 'Indore',
        websiteUrl: 'https://stxavier-indore.edu',
        score: 68,
        resultsJson: {
          score: 68,
          grade: 'Good',
          overallScore: 68,
          healthGrade: 'GOOD',
          summary: 'Good digital baseline',
          strengths: ['SSL Secured'],
          issues: ['No WhatsApp Enquiry Widget'],
          opportunities: ['Add Online Admission Enquiry Flow'],
          checks: [],
          recommendedActions: ['PrimeSoul WhatsApp Integration'],
        } as any,
      });

      expect(audit.id).toBeDefined();
      const retrieved = dbService.getAuditById(audit.id);
      expect(retrieved?.businessName).toBe('St. Xavier Global Academy');
      expect(retrieved?.score).toBe(68);
    });

    it('creates restaurant, adds categories and items, and retrieves full menu', () => {
      const rest = dbService.saveRestaurant({
        businessName: 'Haveli Rasoi',
        phone: '+91 9829012345',
        city: 'Jaipur',
        slug: 'haveli-rasoi-jaipur',
      });

      expect(rest.slug).toBe('haveli-rasoi-jaipur');

      // Add a category and item
      const cat = dbService.saveCategory({
        restaurantId: rest.id,
        name: 'Beverages',
      });

      const item = dbService.saveMenuItem({
        restaurantId: rest.id,
        categoryId: cat.id,
        name: 'Masala Chaas',
        price: 49,
        isVegetarian: true,
      });

      const fullRest = dbService.getRestaurantBySlug('haveli-rasoi-jaipur');
      expect(fullRest?.categories?.some(c => c.name === 'Beverages')).toBe(true);
      expect(fullRest?.items?.some(i => i.name === 'Masala Chaas')).toBe(true);
    });

    it('handles lead status changes and chronological note logging', () => {
      const lead = dbService.saveLead({
        businessName: 'Mehta Ortho Clinic',
        contactName: 'Sunil Mehta',
        email: 'sunil@mehtaclinic.in',
        phone: '+91 9811122233',
        source: 'AUDIT',
        businessCategory: 'Clinic',
      });

      const updated = dbService.updateLeadStatus(lead.id, 'QUALIFIED', 'Qualified through free digital audit');
      expect(updated?.growthStatus).toBe('QUALIFIED');

      const note = dbService.addLeadNote(lead.id, 'Spoke with Dr. Sunil. Requested quote for Local SEO & Website overhaul.', 'Agent Ravi');
      expect(note?.content).toContain('Dr. Sunil');

      const freshLead = dbService.getLeadById(lead.id);
      expect(freshLead?.notesList?.length).toBeGreaterThanOrEqual(1);
    });
  });
});
