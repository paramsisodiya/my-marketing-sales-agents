import { DatabaseService } from '../core/database/db.service';
import { WorkflowEngine } from '../core/workflows/workflow.engine';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
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
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const id = (req.query && req.query.id) || urlObj.searchParams.get('id');

  if (req.method === 'GET') {
    const status = (req.query && req.query.status) || urlObj.searchParams.get('status');
    const approvals = db.getApprovals(status as any);
    return sendJson(res, 200, { success: true, approvals, count: approvals.length });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const approvalId = id || body.approvalId || body.id;
      const { action, reviewerNotes, revisedContent, reviewer } = body;

      if (!approvalId || !action) {
        return sendJson(res, 400, { success: false, error: 'approvalId and action are required' });
      }

      if (!['APPROVE', 'REJECT', 'REVISE'].includes(action)) {
        return sendJson(res, 400, { success: false, error: 'Invalid action. Must be APPROVE, REJECT, or REVISE' });
      }

      const updated = await workflowEngine.processApprovalAction(
        approvalId,
        action,
        reviewerNotes,
        revisedContent,
        reviewer || 'Team Admin'
      );

      return sendJson(res, 200, { success: true, approval: updated });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to process approval action' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
