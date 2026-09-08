import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseService } from '../src/core/database/db.service';
import { LeadStoreTool } from '../src/core/tools/lead-store.tool';

describe('PrimeSoul AI Leads & Database Suite', () => {
  let db: DatabaseService;
  let tool: LeadStoreTool;

  beforeEach(() => {
    db = DatabaseService.getInstance();
    tool = new LeadStoreTool();
  });

  it('should retrieve seeded leads and filter by industry', () => {
    const leads = db.getLeads();
    expect(leads.length).toBeGreaterThanOrEqual(3);

    const healthcareLeads = db.getLeads({ industry: 'Healthcare' });
    expect(healthcareLeads.length).toBeGreaterThanOrEqual(1);
    expect(healthcareLeads[0].businessName).toContain('Apex Dental');
  });

  it('should calculate weighted score for a lead', async () => {
    const result = await tool.execute({
      action: 'score',
      leadId: 'lead-001',
    });

    expect(result.success).toBe(true);
    expect(result.data.leadScore).toBeGreaterThanOrEqual(50);
  });

  it('should update human approval status', () => {
    const approvals = db.getApprovals();
    expect(approvals.length).toBeGreaterThanOrEqual(1);

    const targetId = approvals[0].id;
    const updated = db.updateApprovalStatus(targetId, 'APPROVED', 'Looks good to send');
    expect(updated).toBeDefined();
    expect(updated?.status).toBe('APPROVED');
    expect(updated?.feedbackHistory?.length).toBeGreaterThan(0);
  });
});
