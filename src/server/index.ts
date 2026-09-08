import express, { Request, Response } from 'express';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// ==========================================
// 1. AI Agents Routes
// ==========================================
app.get('/api/agents', (req: Request, res: Response) => {
  const metadata = AgentRegistry.getAllMetadata();
  res.json({ success: true, agents: metadata });
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
app.get('/api/workflows', (req: Request, res: Response) => {
  res.json({ success: true, workflows: WORKFLOW_DEFINITIONS });
});

app.get('/api/workflows/instances', (req: Request, res: Response) => {
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
  const filter: any = {};
  if (req.query.industry) filter.industry = String(req.query.industry);
  if (req.query.qualificationStatus) filter.qualificationStatus = String(req.query.qualificationStatus);
  if (req.query.outreachStatus) filter.outreachStatus = String(req.query.outreachStatus);
  if (req.query.search) filter.searchQuery = String(req.query.search);

  const leads = db.getLeads(filter);
  res.json({ success: true, count: leads.length, leads });
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
  const ok = db.deleteLead(req.params.id);
  res.json({ success: ok });
});

// ==========================================
// 4. Approvals Gateway Routes
// ==========================================
app.get('/api/approvals', (req: Request, res: Response) => {
  const status = req.query.status as any;
  const approvals = db.getApprovals(status);
  res.json({ success: true, count: approvals.length, approvals });
});

app.post('/api/approvals/:id/action', async (req: Request, res: Response) => {
  try {
    const { action, comment, modifiedContent } = req.body; // 'APPROVE' | 'REVISE' | 'REJECT'
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

    // If item was part of an active paused workflow, resume the workflow
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
app.get('/api/knowledge', (req: Request, res: Response) => {
  const docs = knowledgeService.getAll();
  res.json({ success: true, documents: docs });
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
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const agentId = req.query.agentId as string | undefined;
  const workflowId = req.query.workflowId as string | undefined;
  const level = req.query.level as any;

  const logs = logger.getRecentLogs(limit, { agentId, workflowId, level });
  res.json({ success: true, logs });
});

// ==========================================
// 7. Settings & Provider Configuration
// ==========================================
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({ success: true, settings: db.getSettings() });
});

app.post('/api/settings', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  if (req.body.aiProvider) {
    LlmFactory.setProvider(req.body.aiProvider, {
      apiKey: req.body.geminiApiKey,
      baseUrl: req.body.ollamaBaseUrl,
      model: req.body.ollamaModel,
    });
  }
  logger.info(`Settings updated. Active AI Provider: ${updated.aiProvider}`);
  res.json({ success: true, settings: updated });
});

// ==========================================
// 8. Tools Routes
// ==========================================
app.post('/api/tools/web-analyze', async (req: Request, res: Response) => {
  const result = await webAnalyzer.execute(req.body);
  res.json(result);
});

app.post('/api/tools/doc-generate', async (req: Request, res: Response) => {
  const result = await docGenerator.execute(req.body);
  res.json(result);
});

// Serve frontend static assets if built
const clientDist = path.resolve(process.cwd(), 'dist');
app.use(express.static(clientDist));

app.listen(PORT, () => {
  logger.info(`PrimeSoul AI Server running on http://localhost:${PORT}`);
  console.log(`\n🚀 PrimeSoul AI Operating System active at http://localhost:${PORT}`);
  console.log(`🤖 AI Provider: ${LlmFactory.getCurrentProviderType().toUpperCase()}`);
});
