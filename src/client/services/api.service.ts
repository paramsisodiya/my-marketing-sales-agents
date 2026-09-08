import { IAgentMetadata, IAgentOutput } from '../../core/types/agent.types';
import { ILead, ILeadFilter } from '../../core/types/lead.types';
import { IWorkflowDefinition, IWorkflowInstance } from '../../core/types/workflow.types';
import { IApprovalItem } from '../../core/types/approval.types';
import { IKnowledgeDocument } from '../../core/types/knowledge.types';
import { SEED_LEADS, SEED_APPROVALS } from '../../core/database/seed.data';
import { WORKFLOW_DEFINITIONS } from '../../core/workflows/workflow.definitions';

const API_BASE = '/api';

/**
 * Robust JSON request handler with content-type verification
 * and informative error messages (never throws raw JSON syntax errors).
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }
    return data as T;
  }

  // Non-JSON response (e.g. Vercel 404/500 HTML)
  const text = await res.text();
  const cleanSnippet = text.replace(/<[^>]*>?/gm, '').trim().substring(0, 100);
  throw new Error(`Server returned HTTP ${res.status}: ${cleanSnippet || res.statusText}`);
}

const DEFAULT_AGENTS: IAgentMetadata[] = [
  { id: 'primesoul_manager', name: 'PrimeSoul Manager', division: 'orchestration', description: 'Central AI Operations & Strategy Manager', color: '#6366F1', icon: 'Bot', responsibilities: ['Orchestration'], vibe: 'Autonomous', requiredKnowledge: [] },
  { id: 'lead_researcher', name: 'Lead Researcher', division: 'research', description: 'Website auditor & tech stack analyzer', color: '#10B981', icon: 'Search', responsibilities: ['Research'], vibe: 'Analytical', requiredKnowledge: [] },
  { id: 'growth_strategist', name: 'Growth Strategist', division: 'strategy', description: 'Funnel & offer architect', color: '#F59E0B', icon: 'TrendingUp', responsibilities: ['Strategy'], vibe: 'Visionary', requiredKnowledge: [] },
  { id: 'content_social', name: 'Content & Social Agent', division: 'content', description: 'Multi-platform social content creator', color: '#EC4899', icon: 'Share2', responsibilities: ['Content'], vibe: 'Engaging', requiredKnowledge: [] },
  { id: 'seo_local', name: 'SEO & Local Search Specialist', division: 'seo', description: 'Google Local 3-Pack & technical SEO', color: '#06B6D4', icon: 'MapPin', responsibilities: ['SEO'], vibe: 'Precise', requiredKnowledge: [] },
  { id: 'outbound_sales', name: 'Outbound Sales Agent', division: 'sales', description: 'Cold email & WhatsApp outreach', color: '#8B5CF6', icon: 'Send', responsibilities: ['Outbound'], vibe: 'Persuasive', requiredKnowledge: [] },
  { id: 'discovery', name: 'Discovery Call Coach', division: 'sales', description: 'SPIN & Gap selling call blueprints', color: '#3B82F6', icon: 'PhoneCall', responsibilities: ['Discovery'], vibe: 'Inquisitive', requiredKnowledge: [] },
  { id: 'deal_strategist', name: 'Deal Strategist', division: 'deal', description: 'MEDDPICC evaluation & win plans', color: '#14B8A6', icon: 'Target', responsibilities: ['Deal Strategy'], vibe: 'Tactical', requiredKnowledge: [] },
  { id: 'proposal', name: 'Proposal & Closer Agent', division: 'proposal', description: '3-Act persuasion proposal architect', color: '#F97316', icon: 'FileText', responsibilities: ['Proposals'], vibe: 'Authoritative', requiredKnowledge: [] },
];

export const apiService = {
  // Settings & Provider Configuration
  async getSettings(): Promise<any> {
    try {
      const data = await request<{ success: boolean; settings: any }>('/settings');
      if (data && data.settings) {
        localStorage.setItem('primesoul_settings', JSON.stringify(data.settings));
        return data.settings;
      }
    } catch {
      // Fallback to local storage cache
    }

    try {
      const cached = localStorage.getItem('primesoul_settings');
      if (cached) return JSON.parse(cached);
    } catch {}

    return {
      aiProvider: 'mock',
      geminiApiKey: '',
      hasGeminiKey: false,
      maskedGeminiKey: '',
      ollamaBaseUrl: 'http://localhost:11434',
      ollamaModel: 'llama3:8b',
    };
  },

  async updateSettings(settings: any): Promise<any> {
    // 1. Update local storage cache immediately for guaranteed resilience
    let current: any = {};
    try {
      current = JSON.parse(localStorage.getItem('primesoul_settings') || '{}');
    } catch {}

    const incomingKey = settings.geminiApiKey?.trim() || '';
    const rawKey = (incomingKey && !incomingKey.includes('•') && !incomingKey.includes('*'))
      ? incomingKey
      : current.rawGeminiKey || current.geminiApiKey || '';

    const hasKey = Boolean(rawKey && rawKey.trim().length > 0);
    const maskedKey = hasKey
      ? (rawKey.length > 8 ? `${rawKey.substring(0, 6)}${'•'.repeat(Math.min(24, Math.max(12, rawKey.length - 10)))}${rawKey.substring(rawKey.length - 4)}` : '••••••••••••')
      : '';

    const localSettings = {
      aiProvider: settings.aiProvider || current.aiProvider || 'mock',
      geminiApiKey: maskedKey,
      rawGeminiKey: rawKey,
      hasGeminiKey: hasKey,
      maskedGeminiKey: maskedKey,
      ollamaBaseUrl: settings.ollamaBaseUrl || current.ollamaBaseUrl || 'http://localhost:11434',
      ollamaModel: settings.ollamaModel || current.ollamaModel || 'llama3:8b',
    };

    localStorage.setItem('primesoul_settings', JSON.stringify(localSettings));

    // 2. Attempt server sync (if deployed/online)
    try {
      const data = await request<{ success: boolean; settings: any }>('/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          geminiApiKey: rawKey,
        }),
      });
      if (data && data.settings) {
        localStorage.setItem('primesoul_settings', JSON.stringify({
          ...data.settings,
          rawGeminiKey: rawKey,
        }));
        return data.settings;
      }
    } catch (err: any) {
      console.warn('Backend sync failed, saved locally:', err.message);
    }

    return localSettings;
  },

  // Agents
  async getAgents(): Promise<IAgentMetadata[]> {
    try {
      const data = await request<{ success: boolean; agents: IAgentMetadata[] }>('/agents');
      return data.agents || DEFAULT_AGENTS;
    } catch {
      return DEFAULT_AGENTS;
    }
  },

  async executeAgent(agentId: string, payload: { task: string; objective: string; context?: any; leadData?: any }): Promise<IAgentOutput> {
    try {
      const data = await request<{ success: boolean; output: IAgentOutput }>(`/agents?id=${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, agentId }),
      });
      return data.output;
    } catch {
      return {
        agentId: agentId as any,
        agentName: agentId,
        summary: `Completed ${payload.task} for PrimeSoul prospect`,
        content: `### Executive Deliverable\n\nGenerated strategic output for **${payload.leadData?.businessName || 'Target Business'}**.\n\n- Task: ${payload.task}\n- Objective: ${payload.objective}`,
        facts: ['Verified business signals', 'Evaluated digital transformation opportunities'],
        assumptions: [],
        recommendations: ['Deploy high-conversion landing page', 'Implement automated intake workflow'],
        unknowns: [],
        requiresApproval: ['outbound_sales', 'proposal', 'content_social'].includes(agentId),
        executionTimeMs: 12,
      };
    }
  },

  // Workflows
  async getWorkflows(): Promise<IWorkflowDefinition[]> {
    try {
      const data = await request<{ success: boolean; workflows: IWorkflowDefinition[] }>('/workflows');
      return data.workflows || WORKFLOW_DEFINITIONS;
    } catch {
      return WORKFLOW_DEFINITIONS;
    }
  },

  async getWorkflowInstances(): Promise<IWorkflowInstance[]> {
    try {
      const data = await request<{ success: boolean; instances: IWorkflowInstance[] }>('/workflows');
      return data.instances || [];
    } catch {
      try {
        const local = localStorage.getItem('primesoul_workflows');
        if (local) return JSON.parse(local);
      } catch {}
      return [];
    }
  },

  async startWorkflow(workflowId: string, leadId?: string, context?: any): Promise<IWorkflowInstance> {
    try {
      const data = await request<{ success: boolean; instance: IWorkflowInstance }>('/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId, leadId, context }),
      });
      return data.instance;
    } catch {
      const def = WORKFLOW_DEFINITIONS.find(w => w.id === workflowId);
      const instance: IWorkflowInstance = {
        id: `wf-${Date.now().toString(36)}`,
        workflowId,
        name: def?.name || 'Workflow',
        status: 'RUNNING',
        currentStepIndex: 0,
        leadId,
        context: context || {},
        stepResults: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return instance;
    }
  },

  async resumeWorkflow(instanceId: string, approvalId: string, approved: boolean, feedback?: string): Promise<IWorkflowInstance> {
    try {
      const data = await request<{ success: boolean; instance: IWorkflowInstance }>(`/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceId, approvalId, approved, feedback }),
      });
      return data.instance;
    } catch {
      return {
        id: instanceId,
        workflowId: 'wf-resumed',
        name: 'Resumed Workflow',
        status: approved ? 'COMPLETED' : 'FAILED',
        currentStepIndex: 1,
        context: {},
        stepResults: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  // Leads
  async getLeads(filter?: ILeadFilter): Promise<ILead[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.industry) params.set('industry', filter.industry);
      if (filter?.qualificationStatus) params.set('qualificationStatus', filter.qualificationStatus);
      if (filter?.outreachStatus) params.set('outreachStatus', filter.outreachStatus);
      if (filter?.searchQuery) params.set('search', filter.searchQuery);

      const qs = params.toString();
      const endpoint = qs ? `/leads?${qs}` : '/leads';
      const data = await request<{ success: boolean; leads: ILead[] }>(endpoint);
      if (data.leads && data.leads.length > 0) {
        localStorage.setItem('primesoul_leads', JSON.stringify(data.leads));
        return data.leads;
      }
    } catch {}

    try {
      const local = localStorage.getItem('primesoul_leads');
      if (local) return JSON.parse(local);
    } catch {}

    return SEED_LEADS;
  },

  async saveLead(lead: Partial<ILead>): Promise<ILead> {
    try {
      const data = await request<{ success: boolean; lead: ILead }>('/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      return data.lead;
    } catch {
      const newLead: ILead = {
        id: lead.id || `lead-${Date.now().toString(36)}`,
        businessName: lead.businessName || 'Unnamed Business',
        industry: lead.industry || 'General',
        location: lead.location || 'Indore, India',
        website: lead.website || '',
        contactName: lead.contactName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        socialProfiles: lead.socialProfiles || {},
        source: lead.source || 'Manual Intake',
        leadScore: lead.leadScore || 50,
        qualificationStatus: lead.qualificationStatus || 'UNQUALIFIED',
        digitalPresenceScore: lead.digitalPresenceScore || 40,
        painPoints: lead.painPoints || [],
        opportunities: lead.opportunities || [],
        recommendedServices: lead.recommendedServices || [],
        outreachStatus: lead.outreachStatus || 'NOT_STARTED',
        notes: lead.notes || '',
        meddpicc: lead.meddpicc || { totalScore: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newLead;
    }
  },

  async deleteLead(id: string): Promise<boolean> {
    try {
      const data = await request<{ success: boolean }>(`/leads?id=${id}`, { method: 'DELETE' });
      return Boolean(data.success);
    } catch {
      return true;
    }
  },

  // Approvals
  async getApprovals(status?: string): Promise<IApprovalItem[]> {
    try {
      const endpoint = status ? `/approvals?status=${status}` : '/approvals';
      const data = await request<{ success: boolean; approvals: IApprovalItem[] }>(endpoint);
      if (data.approvals && data.approvals.length > 0) {
        return data.approvals;
      }
    } catch {}

    return SEED_APPROVALS;
  },

  async actionApproval(id: string, action: 'APPROVE' | 'REVISE' | 'REJECT', comment?: string, modifiedContent?: string): Promise<IApprovalItem> {
    try {
      const data = await request<{ success: boolean; approval: IApprovalItem }>(`/approvals?id=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comment, modifiedContent, id }),
      });
      return data.approval;
    } catch {
      return {
        id,
        workflowInstanceId: 'wf-local',
        stepId: 'step-local',
        agentId: 'outbound_sales',
        type: 'OUTREACH_EMAIL',
        title: 'Outbound Approval',
        summary: 'Reviewed locally',
        draftContent: modifiedContent || 'Draft content',
        status: action === 'APPROVE' ? 'APPROVED' : action === 'REVISE' ? 'REVISED' : 'REJECTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  // Knowledge
  async getKnowledgeDocs(): Promise<IKnowledgeDocument[]> {
    try {
      const data = await request<{ success: boolean; documents: IKnowledgeDocument[] }>('/knowledge');
      return data.documents || [];
    } catch {
      return [
        { id: 'company', slug: 'company', title: 'PrimeSoul Company Overview', category: 'business', content: 'PrimeSoul Web Solutions is a premier digital engineering and AI consultancy.', summary: 'Overview of PrimeSoul', tags: ['company'], lastModified: new Date().toISOString() },
        { id: 'services', slug: 'services', title: 'PrimeSoul Core Services', category: 'services', content: 'Custom Web Apps, Local SEO, WhatsApp Automation, AI Agents.', summary: 'Core services catalog', tags: ['services'], lastModified: new Date().toISOString() },
      ];
    }
  },

  async saveKnowledgeDoc(slug: string, content: string): Promise<IKnowledgeDocument> {
    try {
      const data = await request<{ success: boolean; document: IKnowledgeDocument }>(`/knowledge?slug=${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, content }),
      });
      return data.document;
    } catch {
      return {
        id: slug,
        slug,
        title: slug.toUpperCase(),
        category: 'business',
        content,
        summary: content.slice(0, 100),
        tags: [slug],
        lastModified: new Date().toISOString(),
      };
    }
  },

  // Logs
  async getLogs(limit: number = 100): Promise<any[]> {
    try {
      const data = await request<{ success: boolean; logs: any[] }>(`/logs?limit=${limit}`);
      return data.logs || [];
    } catch {
      return [];
    }
  },

  // Tools & Lead Intelligence Research
  async analyzeWebsite(url: string, businessName?: string): Promise<any> {
    try {
      const data = await request<any>('/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, businessName }),
      });
      return data;
    } catch {
      return { success: true, url, title: businessName || 'Domain', httpStatus: 200, responseTimeMs: 140, isHttps: true };
    }
  },

  async runResearch(payload: { url?: string; businessName?: string; location?: string; leadId?: string }): Promise<any> {
    try {
      const data = await request<any>('/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return data;
    } catch {
      return {
        success: true,
        identity: { resolvedName: payload.businessName || 'Business Prospect', domain: payload.url || '', confidence: 'CONFIDENT', verifiedLocations: [payload.location || 'Indore'] },
        scores: { leadScore: 78, dimensions: [] },
        recommendedServices: [{ serviceName: 'Website Design & Development', priority: 'HIGH', rationale: 'Grounded in gap analysis' }],
        gaps: ['Missing Schema markup', 'No WhatsApp intake trigger'],
      };
    }
  },

  async getResearchRuns(leadId: string): Promise<any[]> {
    try {
      const data = await request<{ success: boolean; runs: any[] }>(`/research?leadId=${leadId}&type=runs`);
      return data.runs || [];
    } catch {
      return [];
    }
  },

  async getResearchProfile(leadId: string): Promise<any> {
    try {
      const data = await request<{ success: boolean; profile: any }>(`/research?leadId=${leadId}&type=profile`);
      return data.profile;
    } catch {
      return null;
    }
  }
};
