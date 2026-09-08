import fs from 'fs';
import path from 'path';
import { ILead, ILeadFilter } from '../types/lead.types';
import { IWorkflowInstance } from '../types/workflow.types';
import { IApprovalItem, ApprovalStatus } from '../types/approval.types';
import { IResearchRun } from '../types/lead-intelligence.types';
import { SEED_LEADS, SEED_APPROVALS } from './seed.data';

export interface IDatabaseSchema {
  leads: ILead[];
  workflows: IWorkflowInstance[];
  approvals: IApprovalItem[];
  researchRuns: IResearchRun[];
  proposals: any[];
  contentPosts: any[];
  settings: {
    aiProvider: 'mock' | 'gemini' | 'ollama';
    geminiApiKey?: string;
    ollamaBaseUrl?: string;
    ollamaModel?: string;
  };
}

export class DatabaseService {
  private static instance: DatabaseService;
  private filePath: string;
  private data: IDatabaseSchema;

  private constructor(customPath?: string) {
    this.filePath = customPath || path.resolve(process.cwd(), 'primesoul_data.json');
    this.data = this.loadData();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private loadData(): IDatabaseSchema {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.researchRuns) parsed.researchRuns = [];
        return parsed;
      } catch (err) {
        console.error('Failed to parse primesoul_data.json, initializing defaults:', err);
      }
    }

    const defaultData: IDatabaseSchema = {
      leads: [...SEED_LEADS],
      workflows: [],
      approvals: [...SEED_APPROVALS],
      researchRuns: [],
      proposals: [],
      contentPosts: [],
      settings: {
        aiProvider: (process.env.AI_PROVIDER as any) || 'mock',
        geminiApiKey: process.env.GEMINI_API_KEY || '',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        ollamaModel: process.env.OLLAMA_MODEL || 'llama3:8b',
      },
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: IDatabaseSchema = this.data): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write to primesoul_data.json:', err);
    }
  }

  // --- Leads CRUD ---
  public getLeads(filter?: ILeadFilter): ILead[] {
    let list = this.data.leads;
    if (!filter) return list;

    if (filter.industry) {
      list = list.filter(l => l.industry.toLowerCase() === filter.industry?.toLowerCase());
    }
    if (filter.qualificationStatus) {
      list = list.filter(l => l.qualificationStatus === filter.qualificationStatus);
    }
    if (filter.outreachStatus) {
      list = list.filter(l => l.outreachStatus === filter.outreachStatus);
    }
    if (filter.minScore !== undefined) {
      list = list.filter(l => l.leadScore >= filter.minScore!);
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      list = list.filter(l =>
        l.businessName.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        (l.contactName && l.contactName.toLowerCase().includes(q))
      );
    }
    return list;
  }

  public getLeadById(id: string): ILead | undefined {
    return this.data.leads.find(l => l.id === id);
  }

  public saveLead(lead: Partial<ILead> & { businessName: string; industry: string; location: string; source: string }): ILead {
    const existingIndex = lead.id ? this.data.leads.findIndex(l => l.id === lead.id) : -1;

    if (existingIndex >= 0) {
      const existing = this.data.leads[existingIndex];
      const updated: ILead = {
        ...existing,
        ...lead,
        // Non-destructive preservation of verified contact details
        contactName: (lead.contactName && lead.contactName !== 'UNKNOWN') ? lead.contactName : existing.contactName,
        location: (lead.location && lead.location !== 'UNKNOWN') ? lead.location : existing.location,
        phone: lead.phone || existing.phone,
        email: lead.email || existing.email,
        website: lead.website || existing.website,
        socialProfiles: {
          ...existing.socialProfiles,
          ...lead.socialProfiles,
        },
        updatedAt: new Date().toISOString(),
      };
      this.data.leads[existingIndex] = updated;
      this.saveData();
      return updated;
    }

    const newLead: ILead = {
      id: lead.id || `lead-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      businessName: lead.businessName,
      industry: lead.industry,
      location: lead.location,
      source: lead.source,
      website: lead.website || '',
      contactName: lead.contactName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      socialProfiles: lead.socialProfiles || {},
      leadScore: lead.leadScore ?? 50,
      qualificationStatus: lead.qualificationStatus || 'UNQUALIFIED',
      digitalPresenceScore: lead.digitalPresenceScore ?? 40,
      painPoints: lead.painPoints || [],
      opportunities: lead.opportunities || [],
      recommendedServices: lead.recommendedServices || [],
      outreachStatus: lead.outreachStatus || 'NOT_STARTED',
      notes: lead.notes || '',
      meddpicc: lead.meddpicc || { totalScore: 0 },
      intelligenceProfile: lead.intelligenceProfile,
      lastResearchAt: lead.lastResearchAt,
      researchStatus: lead.researchStatus,
      researchRunId: lead.researchRunId,
      identityConfidence: lead.identityConfidence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.leads.unshift(newLead);
    this.saveData();
    return newLead;
  }

  public deleteLead(id: string): boolean {
    const initialLen = this.data.leads.length;
    this.data.leads = this.data.leads.filter(l => l.id !== id);
    if (this.data.leads.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Research Runs CRUD ---
  public getResearchRuns(leadId?: string): IResearchRun[] {
    if (!this.data.researchRuns) this.data.researchRuns = [];
    if (leadId) {
      return this.data.researchRuns.filter(r => r.leadId === leadId);
    }
    return this.data.researchRuns;
  }

  public getResearchRunById(runId: string): IResearchRun | undefined {
    if (!this.data.researchRuns) this.data.researchRuns = [];
    return this.data.researchRuns.find(r => r.runId === runId);
  }

  public saveResearchRun(run: IResearchRun): IResearchRun {
    if (!this.data.researchRuns) this.data.researchRuns = [];
    const idx = this.data.researchRuns.findIndex(r => r.runId === run.runId);
    if (idx >= 0) {
      this.data.researchRuns[idx] = run;
    } else {
      this.data.researchRuns.unshift(run);
    }
    this.saveData();
    return run;
  }

  // --- Workflows CRUD ---
  public getWorkflows(): IWorkflowInstance[] {
    return this.data.workflows;
  }

  public getWorkflowById(id: string): IWorkflowInstance | undefined {
    return this.data.workflows.find(w => w.id === id);
  }

  public saveWorkflow(wf: IWorkflowInstance): IWorkflowInstance {
    const idx = this.data.workflows.findIndex(w => w.id === wf.id);
    if (idx >= 0) {
      this.data.workflows[idx] = wf;
    } else {
      this.data.workflows.unshift(wf);
    }
    this.saveData();
    return wf;
  }

  // --- Approvals CRUD ---
  public getApprovals(status?: ApprovalStatus): IApprovalItem[] {
    if (status) {
      return this.data.approvals.filter(a => a.status === status);
    }
    return this.data.approvals;
  }

  public getApprovalById(id: string): IApprovalItem | undefined {
    return this.data.approvals.find(a => a.id === id);
  }

  public saveApproval(item: Partial<IApprovalItem> & { title: string; summary: string; draftContent: string; agentId: any; type: any }): IApprovalItem {
    const idx = item.id ? this.data.approvals.findIndex(a => a.id === item.id) : -1;
    if (idx >= 0) {
      const updated: IApprovalItem = {
        ...this.data.approvals[idx],
        ...item,
        updatedAt: new Date().toISOString(),
      };
      this.data.approvals[idx] = updated;
      this.saveData();
      return updated;
    }

    const newItem: IApprovalItem = {
      id: item.id || `appr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      workflowInstanceId: item.workflowInstanceId,
      stepId: item.stepId,
      leadId: item.leadId,
      agentId: item.agentId,
      type: item.type,
      title: item.title,
      summary: item.summary,
      draftContent: item.draftContent,
      revisedContent: item.revisedContent,
      status: item.status || 'REVIEW',
      feedbackHistory: item.feedbackHistory || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.approvals.unshift(newItem);
    this.saveData();
    return newItem;
  }

  public updateApprovalStatus(id: string, status: ApprovalStatus, comment?: string, modifiedContent?: string): IApprovalItem | null {
    const item = this.getApprovalById(id);
    if (!item) return null;

    item.status = status;
    item.updatedAt = new Date().toISOString();
    if (modifiedContent) {
      item.revisedContent = modifiedContent;
    }
    if (!item.feedbackHistory) {
      item.feedbackHistory = [];
    }
    item.feedbackHistory.push({
      timestamp: new Date().toISOString(),
      action: status === 'APPROVED' ? 'APPROVE' : status === 'REVISED' ? 'REVISE' : status === 'REJECTED' ? 'REJECT' : 'REVIEW',
      comment,
      modifiedContent,
    });

    this.saveData();
    return item;
  }

  // --- Settings ---
  public getSettings() {
    return this.data.settings;
  }

  public resetData(): void {
    this.data = {
      leads: [...SEED_LEADS],
      workflows: [],
      approvals: [...SEED_APPROVALS],
      researchRuns: [],
      proposals: [],
      contentPosts: [],
      settings: {
        aiProvider: (process.env.AI_PROVIDER as any) || 'mock',
        geminiApiKey: process.env.GEMINI_API_KEY || '',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        ollamaModel: process.env.OLLAMA_MODEL || 'llama3:8b',
      },
    };
    this.saveData();
  }
}
