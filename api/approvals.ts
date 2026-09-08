import { DatabaseService } from '../src/core/database/db.service';
import { WorkflowEngine } from '../src/core/workflows/workflow.engine';
import { LoggerService } from '../src/core/observability/logger.service';

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
  const logger = LoggerService.getInstance();

  if (req.method === 'GET') {
    try {
      const status = req.query?.status as any;
      const approvals = db.getApprovals(status);
      return res.status(200).json({ success: true, count: approvals.length, approvals });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const id = req.query?.id || req.body?.id;
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { action, comment, modifiedContent } = body;

      const statusMap: any = {
        APPROVE: 'APPROVED',
        REVISE: 'REVISED',
        REJECT: 'REJECTED',
      };

      const targetStatus = statusMap[action] || 'APPROVED';
      const updated = db.updateApprovalStatus(id, targetStatus, comment, modifiedContent);

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
      return res.status(200).json({ success: true, approval: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}
