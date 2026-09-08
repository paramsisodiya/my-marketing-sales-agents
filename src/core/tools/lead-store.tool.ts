import { ITool } from './tool.interface';
import { DatabaseService } from '../database/db.service';
import { ILead } from '../types/lead.types';

export class LeadStoreTool implements ITool {
  public name = 'lead_store';
  public description = 'Reads, scores, updates, or creates lead records in the PrimeSoul database.';
  public parameters = [
    { name: 'action', type: 'string' as const, description: 'get | save | list | score', required: true },
    { name: 'leadId', type: 'string' as const, description: 'Target lead ID' },
    { name: 'payload', type: 'object' as const, description: 'Lead data payload for save/update' }
  ];

  public async execute(args: { action: 'get' | 'save' | 'list' | 'score'; leadId?: string; payload?: any }) {
    const db = DatabaseService.getInstance();

    switch (args.action) {
      case 'get': {
        if (!args.leadId) return { success: false, error: 'leadId required for get action' };
        const lead = db.getLeadById(args.leadId);
        return { success: !!lead, data: lead, error: lead ? undefined : 'Lead not found' };
      }
      case 'list': {
        const leads = db.getLeads(args.payload);
        return { success: true, data: { count: leads.length, leads } };
      }
      case 'save': {
        if (!args.payload || !args.payload.businessName) {
          return { success: false, error: 'businessName required in payload' };
        }
        const saved = db.saveLead(args.payload);
        return { success: true, data: saved };
      }
      case 'score': {
        if (!args.leadId) return { success: false, error: 'leadId required for score action' };
        const lead = db.getLeadById(args.leadId);
        if (!lead) return { success: false, error: 'Lead not found' };

        // Calculate weighted score based on digital presence, pain points, and decision access
        let score = 50;
        if (lead.painPoints && lead.painPoints.length > 2) score += 20;
        if (lead.digitalPresenceScore && lead.digitalPresenceScore < 60) score += 15;
        if (lead.email || lead.phone) score += 10;
        if (lead.meddpicc && lead.meddpicc.totalScore && lead.meddpicc.totalScore > 25) score += 15;

        score = Math.min(100, score);
        const updated = db.saveLead({ ...lead, leadScore: score, qualificationStatus: score > 70 ? 'QUALIFIED' : 'RESEARCHED' });
        return { success: true, data: updated };
      }
      default:
        return { success: false, error: `Unsupported action: ${args.action}` };
    }
  }
}
