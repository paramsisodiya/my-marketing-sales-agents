import express, { Request, Response, NextFunction } from 'express';
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

// ==========================================
// 1. AI Agents Routes
// ==========================================
app.get('/api/agents', (_req: Request, res: Response) => {
  try {
    const metadata = AgentRegistry.getAllMetadata();
    res.json({ success: true, agents: metadata });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/agents/:id/execute', async (req: Request, res: Response) => {
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
app.get('/api/workflows', (_req: Request, res: Response) => {
  res.json({ success: true, workflows: WORKFLOW_DEFINITIONS });
});

app.get('/api/workflows/instances', (_req: Request, res: Response) => {
  const instances = db.getWorkflows();
  res.json({ success: true, instances });
});

app.get('/api/workflows/instances/:id', (req: Request, res: Response) => {
  const instance = db.getWorkflowById(req.params.id);
  if (!instance) {
    return res.status(404).json({ success: false, error: 'Workflow instance not found' });
  }
  res.json({ success: true, instance });
});

app.post('/api/workflows/start', async (req: Request, res: Response) => {
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

app.post('/api/workflows/instances/:id/resume', async (req: Request, res: Response) => {
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
app.get('/api/leads', (req: Request, res: Response) => {
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

app.get('/api/leads/:id', (req: Request, res: Response) => {
  const lead = db.getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  res.json({ success: true, lead });
});

app.post('/api/leads', (req: Request, res: Response) => {
  try {
    const saved = db.saveLead(req.body);
    logger.info(`Lead saved: ${saved.businessName} (${saved.id})`);
    res.json({ success: true, lead: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/leads/:id', (req: Request, res: Response) => {
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
app.get('/api/approvals', (req: Request, res: Response) => {
  try {
    const status = req.query.status as any;
    const approvals = db.getApprovals(status);
    res.json({ success: true, count: approvals.length, approvals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/approvals/:id/action', async (req: Request, res: Response) => {
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
app.get('/api/knowledge', (_req: Request, res: Response) => {
  try {
    const docs = knowledgeService.getAll();
    res.json({ success: true, documents: docs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/knowledge/:slug', (req: Request, res: Response) => {
  const doc = knowledgeService.getBySlug(req.params.slug);
  if (!doc) return res.status(404).json({ success: false, error: 'Knowledge document not found' });
  res.json({ success: true, document: doc });
});

app.post('/api/knowledge/:slug', (req: Request, res: Response) => {
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
app.get('/api/logs', (req: Request, res: Response) => {
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
app.get('/api/settings', (_req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to retrieve settings' });
  }
});

app.post('/api/settings', (req: Request, res: Response) => {
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
app.post('/api/tools/web-analyze', async (req: Request, res: Response) => {
  try {
    const result = await webAnalyzer.execute(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tools/doc-generate', async (req: Request, res: Response) => {
  try {
    const result = await docGenerator.execute(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/research/run', async (req: Request, res: Response) => {
  try {
    const result = await leadIntelligenceService.executeResearch(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/research/runs/:leadId', (req: Request, res: Response) => {
  try {
    const runs = db.getResearchRuns(req.params.leadId);
    res.json({ success: true, runs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/research/profile/:leadId', (req: Request, res: Response) => {
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
