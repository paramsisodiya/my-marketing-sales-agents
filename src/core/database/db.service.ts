import fs from 'fs';
import path from 'path';
import { ILead, ILeadFilter } from '../types/lead.types';
import { IWorkflowInstance } from '../types/workflow.types';
import { IApprovalItem, ApprovalStatus } from '../types/approval.types';
import { IResearchRun } from '../types/lead-intelligence.types';
import {
  IAuditRecord,
  IQRRestaurant,
  IQRCategory,
  IQRMenuItem,
  IReferralRecord,
  IEventRecord,
  ILeadNote,
  GrowthLeadStatus,
} from '../types/growth.types';
import {
  SEED_LEADS,
  SEED_APPROVALS,
  SEED_AUDITS,
  SEED_RESTAURANTS,
  SEED_CATEGORIES,
  SEED_MENU_ITEMS,
  SEED_REFERRALS,
} from './seed.data';
import { GrowthScoringEngine } from '../growth/scoring.engine';

export interface IDatabaseSchema {
  leads: ILead[];
  workflows: IWorkflowInstance[];
  approvals: IApprovalItem[];
  researchRuns: IResearchRun[];
  audits: IAuditRecord[];
  qrRestaurants: IQRRestaurant[];
  qrCategories: IQRCategory[];
  qrMenuItems: IQRMenuItem[];
  referrals: IReferralRecord[];
  events: IEventRecord[];
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
    if (customPath) {
      this.filePath = customPath;
    } else if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      this.filePath = path.resolve('/tmp', 'primesoul_data.json');
    } else {
      this.filePath = path.resolve(process.cwd(), 'primesoul_data.json');
    }
    this.data = this.loadData();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private loadData(): IDatabaseSchema {
    // 1. Try primary file path
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return this.ensureSchemaDefaults(parsed);
      } catch (err) {
        console.error('Failed to parse primary primesoul_data.json:', err);
      }
    }

    // 2. If in serverless and /tmp file not found, try reading from bundled project root
    const rootPath = path.resolve(process.cwd(), 'primesoul_data.json');
    if (this.filePath !== rootPath && fs.existsSync(rootPath)) {
      try {
        const raw = fs.readFileSync(rootPath, 'utf-8');
        const parsed = JSON.parse(raw);
        const validated = this.ensureSchemaDefaults(parsed);
        this.saveData(validated);
        return validated;
      } catch (err) {
        console.error('Failed to parse bundled root primesoul_data.json:', err);
      }
    }

    const defaultData: IDatabaseSchema = {
      leads: [...SEED_LEADS],
      workflows: [],
      approvals: [...SEED_APPROVALS],
      researchRuns: [],
      audits: [...SEED_AUDITS],
      qrRestaurants: [...SEED_RESTAURANTS],
      qrCategories: [...SEED_CATEGORIES],
      qrMenuItems: [...SEED_MENU_ITEMS],
      referrals: [...SEED_REFERRALS],
      events: [],
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

  private ensureSchemaDefaults(parsed: any): IDatabaseSchema {
    if (!parsed.leads) parsed.leads = [...SEED_LEADS];
    if (!parsed.workflows) parsed.workflows = [];
    if (!parsed.approvals) parsed.approvals = [...SEED_APPROVALS];
    if (!parsed.researchRuns) parsed.researchRuns = [];
    if (!parsed.audits) parsed.audits = [...SEED_AUDITS];
    if (!parsed.qrRestaurants) parsed.qrRestaurants = [...SEED_RESTAURANTS];
    if (!parsed.qrCategories) parsed.qrCategories = [...SEED_CATEGORIES];
    if (!parsed.qrMenuItems) parsed.qrMenuItems = [...SEED_MENU_ITEMS];
    if (!parsed.referrals) parsed.referrals = [...SEED_REFERRALS];
    if (!parsed.events) parsed.events = [];
    if (!parsed.proposals) parsed.proposals = [];
    if (!parsed.contentPosts) parsed.contentPosts = [];
    if (!parsed.settings) {
      parsed.settings = {
        aiProvider: (process.env.AI_PROVIDER as any) || 'mock',
        geminiApiKey: process.env.GEMINI_API_KEY || '',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        ollamaModel: process.env.OLLAMA_MODEL || 'llama3:8b',
      };
    }
    return parsed;
  }

  private saveData(data: IDatabaseSchema = this.data): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Notice: Could not persist primesoul_data.json to disk (running in-memory):', err);
    }
  }

  // ==========================================
  // 1. Leads CRUD & Management
  // ==========================================
  public getLeads(filter?: ILeadFilter): ILead[] {
    let list = this.data.leads;
    if (!filter) return list;

    if (filter.industry) {
      list = list.filter(l => l.industry.toLowerCase() === filter.industry?.toLowerCase());
    }
    if (filter.businessCategory) {
      list = list.filter(l => l.businessCategory === filter.businessCategory || l.industry.toLowerCase().includes(filter.businessCategory!.toLowerCase()));
    }
    if (filter.qualificationStatus) {
      list = list.filter(l => l.qualificationStatus === filter.qualificationStatus);
    }
    if (filter.growthStatus) {
      list = list.filter(l => l.growthStatus === filter.growthStatus);
    }
    if (filter.outreachStatus) {
      list = list.filter(l => l.outreachStatus === filter.outreachStatus);
    }
    if (filter.temperature) {
      list = list.filter(l => l.leadTemperature === filter.temperature);
    }
    if (filter.source) {
      list = list.filter(l => l.source === filter.source || l.source.toLowerCase().includes(filter.source!.toLowerCase()));
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
        (l.city && l.city.toLowerCase().includes(q)) ||
        (l.contactName && l.contactName.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.phone && l.phone.toLowerCase().includes(q)) ||
        (l.website && l.website.toLowerCase().includes(q))
      );
    }
    return list;
  }

  public getLeadById(id: string): ILead | undefined {
    return this.data.leads.find(l => l.id === id);
  }

  public saveLead(lead: Partial<ILead> & { businessName: string; industry?: string; location?: string; source?: string }): ILead {
    const existingIndex = lead.id ? this.data.leads.findIndex(l => l.id === lead.id) : -1;

    // Auto calculate lead intent score if not supplied or if intent fields are present
    const scoreResult = GrowthScoringEngine.calculateScore({
      phone: lead.phone,
      email: lead.email,
      requirement: lead.requirement,
      timeline: lead.timeline,
      hasViewedAuditResult: Boolean(lead.auditId || lead.source === 'AUDIT'),
      hasClickedContactCta: Boolean(lead.requirement || lead.growthStatus === 'QUALIFIED'),
      hasCreatedQrMenu: Boolean(lead.restaurantId || lead.source === 'QR_MENU'),
      hasRequestedDemo: Boolean(lead.growthStatus === 'DEMO' || lead.requirement === 'PrimeOMS'),
    });

    if (existingIndex >= 0) {
      const existing = this.data.leads[existingIndex];
      const updated: ILead = {
        ...existing,
        ...lead,
        industry: lead.industry || existing.industry || 'Professional Services',
        location: (lead.location && lead.location !== 'UNKNOWN') ? lead.location : existing.location,
        city: lead.city || existing.city || existing.location,
        contactName: (lead.contactName && lead.contactName !== 'UNKNOWN') ? lead.contactName : existing.contactName,
        phone: lead.phone || existing.phone,
        email: lead.email || existing.email,
        website: lead.website || existing.website,
        requirement: lead.requirement || existing.requirement,
        timeline: lead.timeline || existing.timeline,
        growthStatus: lead.growthStatus || existing.growthStatus || 'NEW',
        leadScore: lead.leadScore !== undefined ? lead.leadScore : Math.max(existing.leadScore, scoreResult.score),
        leadTemperature: lead.leadTemperature || scoreResult.temperature,
        socialProfiles: {
          ...existing.socialProfiles,
          ...lead.socialProfiles,
        },
        notesList: lead.notesList || existing.notesList || [],
        updatedAt: new Date().toISOString(),
      };
      this.data.leads[existingIndex] = updated;
      this.saveData();
      return updated;
    }

    const newLead: ILead = {
      id: lead.id || `lead-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      businessName: lead.businessName,
      industry: lead.industry || (lead.businessCategory ? String(lead.businessCategory) : 'General Business'),
      businessCategory: lead.businessCategory,
      location: lead.location || lead.city || 'India',
      city: lead.city || lead.location || 'India',
      source: lead.source || 'WEBSITE',
      sourceDetail: lead.sourceDetail,
      requirement: lead.requirement,
      timeline: lead.timeline,
      website: lead.website || '',
      contactName: lead.contactName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      socialProfiles: lead.socialProfiles || {},
      leadScore: lead.leadScore ?? scoreResult.score,
      leadTemperature: lead.leadTemperature || scoreResult.temperature,
      qualificationStatus: lead.qualificationStatus || 'QUALIFIED',
      growthStatus: lead.growthStatus || 'NEW',
      digitalPresenceScore: lead.digitalPresenceScore ?? 50,
      painPoints: lead.painPoints || [],
      opportunities: lead.opportunities || [],
      recommendedServices: lead.recommendedServices || [],
      outreachStatus: lead.outreachStatus || 'NOT_STARTED',
      notes: lead.notes || '',
      notesList: lead.notesList || [],
      referralCode: lead.referralCode,
      auditId: lead.auditId,
      restaurantId: lead.restaurantId,
      assignedTo: lead.assignedTo,
      followUpDate: lead.followUpDate,
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

  public updateLeadStatus(id: string, growthStatus: GrowthLeadStatus, notes?: string): ILead | null {
    const lead = this.getLeadById(id);
    if (!lead) return null;

    lead.growthStatus = growthStatus;
    lead.updatedAt = new Date().toISOString();

    if (notes) {
      if (!lead.notesList) lead.notesList = [];
      lead.notesList.unshift({
        id: `note-${Date.now().toString(36)}`,
        leadId: id,
        author: 'PrimeSoul Team',
        content: notes,
        createdAt: new Date().toISOString(),
      });
      lead.notes = notes;
    }

    this.saveData();
    return lead;
  }

  public addLeadNote(id: string, content: string, author = 'Team Member'): ILeadNote | null {
    const lead = this.getLeadById(id);
    if (!lead) return null;

    if (!lead.notesList) lead.notesList = [];
    const note: ILeadNote = {
      id: `note-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      leadId: id,
      author,
      content,
      createdAt: new Date().toISOString(),
    };

    lead.notesList.unshift(note);
    lead.notes = content;
    lead.updatedAt = new Date().toISOString();
    this.saveData();
    return note;
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

  // ==========================================
  // 2. Business Audits CRUD
  // ==========================================
  public getAudits(): IAuditRecord[] {
    return this.data.audits || [];
  }

  public getAuditById(id: string): IAuditRecord | undefined {
    return (this.data.audits || []).find(a => a.id === id);
  }

  public saveAudit(audit: Partial<IAuditRecord> & { businessName: string; score: number; resultsJson: any }): IAuditRecord {
    if (!this.data.audits) this.data.audits = [];
    const newAudit: IAuditRecord = {
      id: audit.id || `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      businessName: audit.businessName,
      websiteUrl: audit.websiteUrl,
      category: (audit.category as any) || 'Other',
      city: audit.city || 'India',
      phone: audit.phone,
      email: audit.email,
      googleBusinessUrl: audit.googleBusinessUrl,
      score: audit.score,
      grade: audit.grade || (audit.score >= 90 ? 'Excellent' : audit.score >= 75 ? 'Good' : audit.score >= 50 ? 'Needs Improvement' : 'Major Opportunities'),
      resultsJson: audit.resultsJson,
      createdAt: new Date().toISOString(),
    };

    this.data.audits.unshift(newAudit);
    this.saveData();
    return newAudit;
  }

  // ==========================================
  // 3. Free QR Menus CRUD
  // ==========================================
  public getRestaurants(): IQRRestaurant[] {
    const restaurants = this.data.qrRestaurants || [];
    return restaurants.map(r => ({
      ...r,
      categories: (this.data.qrCategories || []).filter(c => c.restaurantId === r.id).sort((a, b) => a.sortOrder - b.sortOrder),
      items: (this.data.qrMenuItems || []).filter(i => i.restaurantId === r.id).sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  }

  public getRestaurantBySlug(slug: string): IQRRestaurant | undefined {
    const r = (this.data.qrRestaurants || []).find(x => x.slug === slug);
    if (!r) return undefined;
    return {
      ...r,
      categories: (this.data.qrCategories || []).filter(c => c.restaurantId === r.id).sort((a, b) => a.sortOrder - b.sortOrder),
      items: (this.data.qrMenuItems || []).filter(i => i.restaurantId === r.id).sort((a, b) => a.sortOrder - b.sortOrder),
    };
  }

  public getRestaurantById(id: string): IQRRestaurant | undefined {
    const r = (this.data.qrRestaurants || []).find(x => x.id === id);
    if (!r) return undefined;
    return {
      ...r,
      categories: (this.data.qrCategories || []).filter(c => c.restaurantId === r.id).sort((a, b) => a.sortOrder - b.sortOrder),
      items: (this.data.qrMenuItems || []).filter(i => i.restaurantId === r.id).sort((a, b) => a.sortOrder - b.sortOrder),
    };
  }

  public saveRestaurant(rest: Partial<IQRRestaurant> & { businessName: string; slug: string; phone: string; city: string }): IQRRestaurant {
    if (!this.data.qrRestaurants) this.data.qrRestaurants = [];
    const idx = rest.id ? this.data.qrRestaurants.findIndex(r => r.id === rest.id) : -1;

    if (idx >= 0) {
      const updated = {
        ...this.data.qrRestaurants[idx],
        ...rest,
        updatedAt: new Date().toISOString(),
      };
      this.data.qrRestaurants[idx] = updated;
      this.saveData();
      return updated;
    }

    const newRest: IQRRestaurant = {
      id: rest.id || `rest-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      businessName: rest.businessName,
      slug: rest.slug,
      phone: rest.phone,
      city: rest.city,
      logoUrl: rest.logoUrl,
      isPublished: rest.isPublished !== undefined ? rest.isPublished : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.qrRestaurants.unshift(newRest);
    this.saveData();
    return newRest;
  }

  public saveCategory(cat: Partial<IQRCategory> & { restaurantId: string; name: string }): IQRCategory {
    if (!this.data.qrCategories) this.data.qrCategories = [];
    const idx = cat.id ? this.data.qrCategories.findIndex(c => c.id === cat.id) : -1;

    if (idx >= 0) {
      const updated = { ...this.data.qrCategories[idx], ...cat };
      this.data.qrCategories[idx] = updated;
      this.saveData();
      return updated;
    }

    const newCat: IQRCategory = {
      id: cat.id || `cat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      restaurantId: cat.restaurantId,
      name: cat.name,
      sortOrder: cat.sortOrder ?? (this.data.qrCategories.filter(c => c.restaurantId === cat.restaurantId).length + 1),
      createdAt: new Date().toISOString(),
    };

    this.data.qrCategories.push(newCat);
    this.saveData();
    return newCat;
  }

  public deleteCategory(id: string): boolean {
    if (!this.data.qrCategories) return false;
    const initialLen = this.data.qrCategories.length;
    this.data.qrCategories = this.data.qrCategories.filter(c => c.id !== id);
    // Delete dependent menu items
    if (this.data.qrMenuItems) {
      this.data.qrMenuItems = this.data.qrMenuItems.filter(i => i.categoryId !== id);
    }
    this.saveData();
    return this.data.qrCategories.length !== initialLen;
  }

  public saveMenuItem(item: Partial<IQRMenuItem> & { restaurantId: string; categoryId: string; name: string; price: number }): IQRMenuItem {
    if (!this.data.qrMenuItems) this.data.qrMenuItems = [];
    const idx = item.id ? this.data.qrMenuItems.findIndex(i => i.id === item.id) : -1;

    if (idx >= 0) {
      const updated = { ...this.data.qrMenuItems[idx], ...item };
      this.data.qrMenuItems[idx] = updated;
      this.saveData();
      return updated;
    }

    const newItem: IQRMenuItem = {
      id: item.id || `item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      restaurantId: item.restaurantId,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      isVegetarian: item.isVegetarian !== undefined ? item.isVegetarian : true,
      sortOrder: item.sortOrder ?? (this.data.qrMenuItems.filter(i => i.categoryId === item.categoryId).length + 1),
      createdAt: new Date().toISOString(),
    };

    this.data.qrMenuItems.push(newItem);
    this.saveData();
    return newItem;
  }

  public deleteMenuItem(id: string): boolean {
    if (!this.data.qrMenuItems) return false;
    const initialLen = this.data.qrMenuItems.length;
    this.data.qrMenuItems = this.data.qrMenuItems.filter(i => i.id !== id);
    this.saveData();
    return this.data.qrMenuItems.length !== initialLen;
  }

  // ==========================================
  // 4. Referrals System CRUD
  // ==========================================
  public getReferrals(): IReferralRecord[] {
    return this.data.referrals || [];
  }

  public getReferralByCode(code: string): IReferralRecord | undefined {
    return (this.data.referrals || []).find(r => r.referralCode.toUpperCase() === code.toUpperCase());
  }

  public saveReferral(ref: Partial<IReferralRecord> & { referralCode: string; referrerName: string }): IReferralRecord {
    if (!this.data.referrals) this.data.referrals = [];
    const code = ref.referralCode.toUpperCase();
    const idx = this.data.referrals.findIndex(r => r.referralCode === code);

    if (idx >= 0) {
      const updated = {
        ...this.data.referrals[idx],
        ...ref,
        referralCode: code,
        updatedAt: new Date().toISOString(),
      };
      this.data.referrals[idx] = updated;
      this.saveData();
      return updated;
    }

    const newRef: IReferralRecord = {
      id: ref.id || `ref-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      referralCode: code,
      referrerName: ref.referrerName,
      referrerContact: ref.referrerContact,
      referredBusiness: ref.referredBusiness,
      status: ref.status || 'LEAD',
      clicksCount: ref.clicksCount || 0,
      leadsCount: ref.leadsCount || 0,
      wonCount: ref.wonCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.referrals.unshift(newRef);
    this.saveData();
    return newRef;
  }

  public trackReferralClick(code: string): boolean {
    const ref = this.getReferralByCode(code);
    if (!ref) return false;
    ref.clicksCount = (ref.clicksCount || 0) + 1;
    ref.updatedAt = new Date().toISOString();
    this.saveData();
    return true;
  }

  public trackReferralLead(code: string): boolean {
    const ref = this.getReferralByCode(code);
    if (!ref) return false;
    ref.leadsCount = (ref.leadsCount || 0) + 1;
    ref.status = 'QUALIFIED';
    ref.updatedAt = new Date().toISOString();
    this.saveData();
    return true;
  }

  // ==========================================
  // 5. Events & Analytics
  // ==========================================
  public getEvents(): IEventRecord[] {
    return this.data.events || [];
  }

  public saveEvent(event: IEventRecord): IEventRecord {
    if (!this.data.events) this.data.events = [];
    this.data.events.unshift(event);
    // Keep max 1000 events in in-memory list
    if (this.data.events.length > 1000) {
      this.data.events = this.data.events.slice(0, 1000);
    }
    this.saveData();
    return event;
  }

  // ==========================================
  // 6. Research Runs CRUD
  // ==========================================
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

  // ==========================================
  // 7. Workflows CRUD
  // ==========================================
  public getWorkflows(): IWorkflowInstance[] {
    return this.data.workflows || [];
  }

  public getWorkflowById(id: string): IWorkflowInstance | undefined {
    return (this.data.workflows || []).find(w => w.id === id);
  }

  public saveWorkflow(wf: IWorkflowInstance): IWorkflowInstance {
    if (!this.data.workflows) this.data.workflows = [];
    const idx = this.data.workflows.findIndex(w => w.id === wf.id);
    if (idx >= 0) {
      this.data.workflows[idx] = wf;
    } else {
      this.data.workflows.unshift(wf);
    }
    this.saveData();
    return wf;
  }

  // ==========================================
  // 8. Approvals CRUD
  // ==========================================
  public getApprovals(status?: ApprovalStatus): IApprovalItem[] {
    if (!this.data.approvals) this.data.approvals = [];
    if (status) {
      return this.data.approvals.filter(a => a.status === status);
    }
    return this.data.approvals;
  }

  public getApprovalById(id: string): IApprovalItem | undefined {
    return (this.data.approvals || []).find(a => a.id === id);
  }

  public saveApproval(item: Partial<IApprovalItem> & { title: string; summary: string; draftContent: string; agentId: any; type: any }): IApprovalItem {
    if (!this.data.approvals) this.data.approvals = [];
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

  // ==========================================
  // 9. Settings & Provider Configuration
  // ==========================================
  public getSettings(): IDatabaseSchema['settings'] & { hasGeminiKey: boolean; maskedGeminiKey: string } {
    const rawKey = this.data.settings.geminiApiKey || '';
    const hasGeminiKey = Boolean(rawKey && rawKey.trim().length > 0);
    const maskedGeminiKey = hasGeminiKey
      ? (rawKey.length > 8 ? `${rawKey.substring(0, 6)}${'•'.repeat(Math.min(24, Math.max(12, rawKey.length - 10)))}${rawKey.substring(rawKey.length - 4)}` : '••••••••••••')
      : '';

    return {
      ...this.data.settings,
      geminiApiKey: maskedGeminiKey,
      hasGeminiKey,
      maskedGeminiKey,
    };
  }

  public getRawSettings(): IDatabaseSchema['settings'] {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<IDatabaseSchema['settings']>): IDatabaseSchema['settings'] & { hasGeminiKey: boolean; maskedGeminiKey: string } {
    const current = this.data.settings;
    const newSettings: IDatabaseSchema['settings'] = { ...current };

    if (settings.aiProvider) {
      newSettings.aiProvider = settings.aiProvider;
    }
    if (settings.ollamaBaseUrl !== undefined) {
      newSettings.ollamaBaseUrl = settings.ollamaBaseUrl;
    }
    if (settings.ollamaModel !== undefined) {
      newSettings.ollamaModel = settings.ollamaModel;
    }

    if (settings.geminiApiKey !== undefined) {
      const trimmed = settings.geminiApiKey.trim();
      if (trimmed.includes('•') || trimmed.includes('*')) {
        // preserve current real key
      } else {
        newSettings.geminiApiKey = trimmed;
      }
    }

    this.data.settings = newSettings;
    this.saveData();
    return this.getSettings();
  }

  public resetData(): void {
    this.data = {
      leads: [...SEED_LEADS],
      workflows: [],
      approvals: [...SEED_APPROVALS],
      researchRuns: [],
      audits: [...SEED_AUDITS],
      qrRestaurants: [...SEED_RESTAURANTS],
      qrCategories: [...SEED_CATEGORIES],
      qrMenuItems: [...SEED_MENU_ITEMS],
      referrals: [...SEED_REFERRALS],
      events: [],
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

export const dbService = DatabaseService.getInstance();
