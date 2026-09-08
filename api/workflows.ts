import { DatabaseService } from '../src/core/database/db.service';
import { WorkflowEngine } from '../src/core/workflows/workflow.engine';
import { WORKFLOW_DEFINITIONS } from '../src/core/workflows/workflow.definitions';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const db = DatabaseService.getInstance();
  const workflowEngine = WorkflowEngine.getInstance();

  if (req.method === 'GET') {
    try {
      const instances = db.getWorkflows();
      return res.status(200).json({ success: true, workflows: WORKFLOW_DEFINITIONS, instances });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { workflowId, leadId, context } = body;
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
      return res.status(200).json({ success: true, instance });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}
