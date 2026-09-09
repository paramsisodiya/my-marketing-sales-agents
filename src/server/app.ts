import express, { Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { AgentRegistry } from '../core/agents/agent.registry';
import { DatabaseService } from '../core/database/db.service';
import { KnowledgeService } from '../core/knowledge/knowledge.service';
import { LoggerService } from '../core/observability/logger.service';
import { WorkflowEngine } from '../core/workflows/workflow.engine';
import { WORKFLOW_DEFINITIONS } from '../core/workflows/workflow.definitions';
import { LlmFactory } from '../core/llm/llm.factory';
import { WebAnalyzerTool } from '../core/tools/web-analyzer.tool';
import { DocumentGeneratorTool } from '../core/tools/doc-generator.tool';
import { LeadIntelligenceService } from '../core/research/lead-intelligence.service';

dotenv.config();

const app = express();

// Security & Parsing Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Core Subsystems
AgentRegistry.initialize();
const db = DatabaseService.getInstance();
const knowledgeService = new KnowledgeService();
const logger = LoggerService.getInstance();
const workflowEngine = WorkflowEngine.getInstance();
const webAnalyzer = new WebAnalyzerTool();
const docGenerator = new DocumentGeneratorTool();
const leadIntelligenceService = LeadIntelligenceService.getInstance();

const router = Router();

// ==========================================
// 1. AI Agents Routes
// ==========================================
router.get('/agents', (_req: Request, res: Response) => {
  try {
    const metadata = AgentRegistry.getAllMetadata();
    res.json({ success: true, agents: metadata });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/agents/:id/execute', async (req: Request, res: Response) => {
  try {
    const agentId = req.params.id as any;
    const agent = AgentRegistry.getAgent(agentId);

    if (!agent) {
      return res.status(404).json({ success: false, error: `Agent ${agentId} not found` });
    }

    const { task, objective, context, leadData, constraints } = req.body;
    const output = await agent.execute({
      task: task || 'Execute specialist task',
      objective: objective || 'Generate high-quality output for PrimeSoul',
      context,
      leadData,
      constraints,
    });

    res.json({ success: true, output });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. Workflows Routes
// ==========================================
router.get('/workflows', (_req: Request, res: Response) => {
  res.json({ success: true, workflows: WORKFLOW_DEFINITIONS });
});

router.get('/workflows/instances', (_req: Request, res: Response) => {
  const instances = db.getWorkflows();
  res.json({ success: true, instances });
});

router.get('/workflows/instances/:id', (req: Request, res: Response) => {
  const instance = db.getWorkflowById(req.params.id);
  if (!instance) {
    return res.status(404).json({ success: false, error: 'Workflow instance not found' });
  }
  res.json({ success: true, instance });
});

router.post('/workflows/start', async (req: Request, res: Response) => {
  try {
    const { workflowId, leadId, context } = req.body;
    const def = WORKFLOW_DEFINITIONS.find(w => w.id === workflowId);

    if (!def) {
      return res.status(404).json({ success: false, error: `Workflow definition ${workflowId} not found` });
    }

    const initialContext = context || {};
    if (leadId) {
      const lead = db.getLeadById(leadId);
      if (lead) {
        initialContext.businessName = lead.businessName;
        initialContext.industry = lead.industry;
        initialContext.website = lead.website;
        initialContext.location = lead.location;
      }
    }

    const instance = await workflowEngine.startWorkflow(def, initialContext, leadId);
    res.json({ success: true, instance });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/workflows/instances/:id/resume', async (req: Request, res: Response) => {
  try {
    const { approvalId, approved, feedback } = req.body;
    const updated = await workflowEngine.resumeWorkflowAfterApproval(req.params.id, approvalId, approved, feedback);
    res.json({ success: true, instance: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. Leads CRM Routes
// ==========================================
router.get('/leads', (req: Request, res: Response) => {
  try {
    const filter: any = {};
    if (req.query.industry) filter.industry = String(req.query.industry);
    if (req.query.qualificationStatus) filter.qualificationStatus = String(req.query.qualificationStatus);
    if (req.query.outreachStatus) filter.outreachStatus = String(req.query.outreachStatus);
    if (req.query.search) filter.searchQuery = String(req.query.search);

    const leads = db.getLeads(filter);
    res.json({ success: true, count: leads.length, leads });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/leads/:id', (req: Request, res: Response) => {
  const lead = db.getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  res.json({ success: true, lead });
});

router.post('/leads', (req: Request, res: Response) => {
  try {
    const saved = db.saveLead(req.body);
    logger.info(`Lead saved: ${saved.businessName} (${saved.id})`);
    res.json({ success: true, lead: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/leads/:id', (req: Request, res: Response) => {
  try {
    const ok = db.deleteLead(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. Approvals Gateway Routes
// ==========================================
router.get('/approvals', (req: Request, res: Response) => {
  try {
    const status = req.query.status as any;
    const approvals = db.getApprovals(status);
    res.json({ success: true, count: approvals.length, approvals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/approvals/:id/action', async (req: Request, res: Response) => {
  try {
    const { action, comment, modifiedContent } = req.body;
    const statusMap: any = {
      APPROVE: 'APPROVED',
      REVISE: 'REVISED',
      REJECT: 'REJECTED',
    };

    const targetStatus = statusMap[action] || 'APPROVED';
    const updated = db.updateApprovalStatus(req.params.id, targetStatus, comment, modifiedContent);

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Approval item not found' });
    }

    if (updated.workflowInstanceId) {
      await workflowEngine.resumeWorkflowAfterApproval(
        updated.workflowInstanceId,
        updated.id,
        action === 'APPROVE',
        comment
      );
    }

    logger.info(`Approval item ${updated.id} status updated to ${targetStatus}`);
    res.json({ success: true, approval: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. Knowledge Base Routes
// ==========================================
router.get('/knowledge', (_req: Request, res: Response) => {
  try {
    const docs = knowledgeService.getAll();
    res.json({ success: true, documents: docs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/knowledge/:slug', (req: Request, res: Response) => {
  const doc = knowledgeService.getBySlug(req.params.slug);
  if (!doc) return res.status(404).json({ success: false, error: 'Knowledge document not found' });
  res.json({ success: true, document: doc });
});

router.post('/knowledge/:slug', (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'Content required' });
    const saved = knowledgeService.saveDocument(req.params.slug, content);
    logger.info(`Knowledge document updated: ${saved.title} (${saved.slug})`);
    res.json({ success: true, document: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. Observability & Logs Routes
// ==========================================
router.get('/logs', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const agentId = req.query.agentId as string | undefined;
    const workflowId = req.query.workflowId as string | undefined;
    const level = req.query.level as any;

    const logs = logger.getRecentLogs(limit, { agentId, workflowId, level });
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. Settings & Provider Configuration
// ==========================================
router.get('/settings', (_req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to retrieve settings' });
  }
});

router.post('/settings', (req: Request, res: Response) => {
  try {
    const { aiProvider, geminiApiKey, ollamaBaseUrl, ollamaModel } = req.body || {};

    if (aiProvider && !['mock', 'gemini', 'ollama'].includes(aiProvider)) {
      return res.status(400).json({
        success: false,
        error: `Invalid AI Provider '${aiProvider}'. Must be 'mock', 'gemini', or 'ollama'.`,
      });
    }

    const updated = db.updateSettings({
      aiProvider,
      geminiApiKey,
      ollamaBaseUrl,
      ollamaModel,
    });

    const rawSettings = db.getRawSettings();
    if (rawSettings.aiProvider) {
      LlmFactory.setProvider(rawSettings.aiProvider, {
        apiKey: rawSettings.geminiApiKey,
        baseUrl: rawSettings.ollamaBaseUrl,
        model: rawSettings.ollamaModel,
      });
    }

    const hasKey = Boolean(rawSettings.geminiApiKey && rawSettings.geminiApiKey.trim().length > 0);
    logger.info(`Settings updated. Active AI Provider: ${updated.aiProvider}, Gemini Configured: ${hasKey}`);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error('Settings save error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to save settings' });
  }
});

// ==========================================
// 8. Tools & Research Routes
// ==========================================
router.post('/tools/web-analyze', async (req: Request, res: Response) => {
  try {
    const result = await webAnalyzer.execute(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/tools/doc-generate', async (req: Request, res: Response) => {
  try {
    const result = await docGenerator.execute(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/research/run', async (req: Request, res: Response) => {
  try {
    const result = await leadIntelligenceService.executeResearch(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/research/runs/:leadId', (req: Request, res: Response) => {
  try {
    const runs = db.getResearchRuns(req.params.leadId);
    res.json({ success: true, runs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/research/profile/:leadId', (req: Request, res: Response) => {
  try {
    const lead = db.getLeadById(req.params.leadId);
    if (!lead || !lead.intelligenceProfile) {
      return res.status(404).json({ success: false, error: 'Lead intelligence profile not found' });
    }
    res.json({ success: true, profile: lead.intelligenceProfile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 9. Growth Engine — Free Business Audit
// ==========================================
router.post('/audit', async (req: Request, res: Response) => {
  try {
    const { businessName, websiteUrl, category, city, phone, email, googleBusinessUrl, referralCode } = req.body;
    if (!businessName || businessName.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Business name is required.' });
    }

    const { AuditEngine } = await import('../core/growth/audit.engine');
    const { EventService } = await import('../core/growth/event.service');
    const eventService = EventService.getInstance();

    eventService.logEvent('audit_started', { metadata: { businessName, category, city } });

    const auditResult = await AuditEngine.executeAudit({ businessName, websiteUrl, category, city });

    const auditRecord = db.saveAudit({
      businessName,
      websiteUrl,
      category: category || 'Other',
      city: city || 'India',
      phone,
      email,
      googleBusinessUrl,
      score: auditResult.score,
      grade: auditResult.grade,
      resultsJson: auditResult,
    });

    let leadRecord = null;
    if (phone || email) {
      leadRecord = db.saveLead({
        businessName,
        businessCategory: category || 'Other',
        website: websiteUrl,
        phone,
        email,
        city,
        location: city || 'India',
        source: referralCode ? 'REFERRAL' : 'AUDIT',
        sourceDetail: referralCode ? `referral_${referralCode}` : 'website_audit',
        referralCode,
        auditId: auditRecord.id,
        digitalPresenceScore: auditResult.score,
        painPoints: auditResult.issues,
        opportunities: auditResult.opportunities,
        recommendedServices: auditResult.recommendedActions,
        growthStatus: 'NEW',
      });

      if (referralCode) {
        db.trackReferralLead(referralCode);
      }
    }

    eventService.logEvent('audit_completed', {
      leadId: leadRecord?.id,
      metadata: { auditId: auditRecord.id, score: auditResult.score },
    });

    res.json({ success: true, audit: auditRecord, lead: leadRecord });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/audit', (req: Request, res: Response) => {
  try {
    const audits = db.getAudits();
    res.json({ success: true, count: audits.length, audits });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/audit/:id', (req: Request, res: Response) => {
  try {
    const audit = db.getAuditById(req.params.id);
    if (!audit) return res.status(404).json({ success: false, error: 'Audit not found' });
    res.json({ success: true, audit });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 10. Growth Engine — Free QR Menus
// ==========================================
router.get('/menus', (_req: Request, res: Response) => {
  try {
    const restaurants = db.getRestaurants();
    res.json({ success: true, count: restaurants.length, restaurants });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/menus/:slug', (req: Request, res: Response) => {
  try {
    const restaurant = db.getRestaurantBySlug(req.params.slug);
    if (!restaurant) return res.status(404).json({ success: false, error: 'Restaurant not found' });
    res.json({ success: true, restaurant });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/menus/:slug/qr', async (req: Request, res: Response) => {
  try {
    const { QrMenuEngine } = await import('../core/growth/qr-menu.engine');
    const { siteConfig } = await import('../core/growth/site.config');
    const publicUrl = `${siteConfig.url}/qr-menu/${req.params.slug}`;
    const svg = QrMenuEngine.generateQrCodeSvg(publicUrl, 280);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/menus', async (req: Request, res: Response) => {
  try {
    const { businessName, phone, city, logoUrl, customSlug, referralCode } = req.body;
    if (!businessName || !phone) {
      return res.status(400).json({ success: false, error: 'Restaurant name and phone are required.' });
    }

    const { QrMenuEngine } = await import('../core/growth/qr-menu.engine');
    const { EventService } = await import('../core/growth/event.service');
    const eventService = EventService.getInstance();

    const existingRestaurants = db.getRestaurants();
    const existingSlugs = existingRestaurants.map(r => r.slug);
    const slug = customSlug
      ? QrMenuEngine.generateSlug(customSlug, existingSlugs)
      : QrMenuEngine.generateSlug(businessName, existingSlugs);

    const restaurant = db.saveRestaurant({
      businessName,
      slug,
      phone,
      city: city || 'India',
      logoUrl,
      isPublished: true,
    });

    const defaultMenu = QrMenuEngine.createDefaultMenu(restaurant.id);
    for (const cat of defaultMenu.categories) db.saveCategory(cat);
    for (const item of defaultMenu.items) db.saveMenuItem(item);

    const lead = db.saveLead({
      businessName,
      businessCategory: 'Restaurant',
      industry: 'Hospitality',
      location: city || 'India',
      city: city || 'India',
      phone,
      source: referralCode ? 'REFERRAL' : 'QR_MENU',
      sourceDetail: referralCode ? `referral_${referralCode}` : 'qr_menu_creation',
      requirement: 'Restaurant QR Menu',
      timeline: 'Immediately',
      growthStatus: 'QUALIFIED',
      restaurantId: restaurant.id,
      referralCode,
      notes: `Created free QR digital menu at /qr-menu/${slug}`,
    });

    if (referralCode) {
      db.trackReferralLead(referralCode);
    }

    eventService.logEvent('qr_menu_created', {
      leadId: lead.id,
      metadata: { restaurantId: restaurant.id, slug },
    });

    const full = db.getRestaurantBySlug(slug);
    res.json({ success: true, restaurant: full, lead });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/menus/:slug/categories', (req: Request, res: Response) => {
  try {
    const restaurant = db.getRestaurantBySlug(req.params.slug);
    if (!restaurant) return res.status(404).json({ success: false, error: 'Restaurant not found' });
    const { name, sortOrder } = req.body;
    const cat = db.saveCategory({ restaurantId: restaurant.id, name, sortOrder });
    res.json({ success: true, category: cat });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/menus/:slug/items', (req: Request, res: Response) => {
  try {
    const restaurant = db.getRestaurantBySlug(req.params.slug);
    if (!restaurant) return res.status(404).json({ success: false, error: 'Restaurant not found' });
    const { categoryId, name, description, price, imageUrl, isAvailable, isVegetarian, sortOrder, id } = req.body;
    const item = db.saveMenuItem({
      id,
      restaurantId: restaurant.id,
      categoryId,
      name,
      description,
      price: Number(price),
      imageUrl,
      isAvailable: isAvailable !== false,
      isVegetarian: isVegetarian !== false,
      sortOrder,
    });
    res.json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/menus/categories/:id', (req: Request, res: Response) => {
  try {
    const ok = db.deleteCategory(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/menus/items/:id', (req: Request, res: Response) => {
  try {
    const ok = db.deleteMenuItem(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 11. Growth Engine — Referrals
// ==========================================
router.get('/referrals', (_req: Request, res: Response) => {
  try {
    const referrals = db.getReferrals();
    res.json({ success: true, count: referrals.length, referrals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/referrals/:code', (req: Request, res: Response) => {
  try {
    const ref = db.getReferralByCode(req.params.code);
    if (!ref) return res.status(404).json({ success: false, error: 'Referral code not found' });
    res.json({ success: true, referral: ref });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/referrals', async (req: Request, res: Response) => {
  try {
    const { referrerName, referrerContact, customCode, referredBusiness } = req.body;
    if (!referrerName) return res.status(400).json({ success: false, error: 'referrerName is required' });

    const { ReferralEngine } = await import('../core/growth/referral.engine');
    const referralCode = customCode
      ? ReferralEngine.normalizeCode(customCode)
      : ReferralEngine.generateCode(referrerName);

    const ref = db.saveReferral({ referralCode, referrerName, referrerContact, referredBusiness });
    res.json({ success: true, referral: ref });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/referrals/:code/track', async (req: Request, res: Response) => {
  try {
    const ok = db.trackReferralClick(req.params.code);
    const { EventService } = await import('../core/growth/event.service');
    EventService.getInstance().logEvent('referral_clicked', { metadata: { code: req.params.code } });
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 12. Growth Engine — Events & Site Config
// ==========================================
router.get('/events', async (_req: Request, res: Response) => {
  try {
    const { EventService } = await import('../core/growth/event.service');
    const stats = EventService.getInstance().getEventStats();
    const events = db.getEvents();
    res.json({ success: true, stats, totalEvents: events.length, recentEvents: events.slice(0, 25) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/events', async (req: Request, res: Response) => {
  try {
    const { eventName, anonymousId, leadId, metadata } = req.body;
    if (!eventName) return res.status(400).json({ success: false, error: 'eventName is required' });
    const { EventService } = await import('../core/growth/event.service');
    const event = EventService.getInstance().logEvent(eventName, { anonymousId, leadId, metadata });
    res.json({ success: true, event });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/config', async (_req: Request, res: Response) => {
  try {
    const { siteConfig } = await import('../core/growth/site.config');
    res.json({ success: true, config: siteConfig });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mount router on both /api and / for maximum compatibility with Vercel rewrites
app.use('/api', router);
app.use('/', router);

// Serve frontend static assets if built locally
const clientDist = path.resolve(process.cwd(), 'dist');
app.use(express.static(clientDist));

// 404 JSON Fallback for any unmatched /api/* route
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}`,
  });
});

// Global Error Handler guaranteeing JSON responses
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    success: false,
    error: err?.message || 'Internal server error occurred',
  });
});

export default app;
