import { DatabaseService } from '../core/database/db.service';
import { WorkflowEngine } from '../core/workflows/workflow.engine';
import { WORKFLOW_DEFINITIONS } from '../core/workflows/workflow.definitions';

function sendJson(res: any, status: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const db = DatabaseService.getInstance();
  const workflowEngine = WorkflowEngine.getInstance();

  if (req.method === 'GET') {
    try {
      const instances = db.getWorkflows();
      return sendJson(res, 200, { success: true, workflows: WORKFLOW_DEFINITIONS, instances });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      body = body || {};
      const { workflowId, leadId, context } = body;
      const def = WORKFLOW_DEFINITIONS.find(w => w.id === workflowId);

      if (!def) {
        return sendJson(res, 404, { success: false, error: `Workflow definition ${workflowId} not found` });
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
      return sendJson(res, 200, { success: true, instance });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
