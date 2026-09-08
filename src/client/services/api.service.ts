import { IAgentMetadata, IAgentOutput } from '../../core/types/agent.types';
import { ILead, ILeadFilter } from '../../core/types/lead.types';
import { IWorkflowDefinition, IWorkflowInstance } from '../../core/types/workflow.types';
import { IApprovalItem } from '../../core/types/approval.types';
import { IKnowledgeDocument } from '../../core/types/knowledge.types';

const API_BASE = '/api';

/**
 * Robust JSON request handler with content-type verification
 * and informative error messages (never throws raw JSON syntax errors).
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
      }
      return data as T;
    }

    // Non-JSON response (e.g., Vercel routing 404 HTML, gateway timeout, etc.)
    const text = await res.text();
    if (res.status === 404) {
      throw new Error(`API endpoint not found: ${url} (Status 404). Please ensure serverless functions are deployed.`);
    }
    const snippet = text.replace(/<[^>]*>?/gm, '').trim().substring(0, 120);
    throw new Error(`Server returned HTTP ${res.status}: ${snippet || res.statusText || 'Non-JSON response'}`);
  } catch (err: any) {
    if (err.message && !err.message.includes('Unexpected token')) {
      throw err;
    }
    throw new Error(`API Error: ${err.message || 'Unable to connect to server'}`);
  }
}

export const apiService = {
  // Agents
  async getAgents(): Promise<IAgentMetadata[]> {
    const data = await request<{ success: boolean; agents: IAgentMetadata[] }>('/agents');
    return data.agents || [];
  },

  async executeAgent(agentId: string, payload: { task: string; objective: string; context?: any; leadData?: any }): Promise<IAgentOutput> {
    const data = await request<{ success: boolean; output: IAgentOutput }>(`/agents/${agentId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data.output;
  },

  // Workflows
  async getWorkflows(): Promise<IWorkflowDefinition[]> {
    const data = await request<{ success: boolean; workflows: IWorkflowDefinition[] }>('/workflows');
    return data.workflows || [];
  },

  async getWorkflowInstances(): Promise<IWorkflowInstance[]> {
    const data = await request<{ success: boolean; instances: IWorkflowInstance[] }>('/workflows/instances');
    return data.instances || [];
  },

  async startWorkflow(workflowId: string, leadId?: string, context?: any): Promise<IWorkflowInstance> {
    const data = await request<{ success: boolean; instance: IWorkflowInstance }>('/workflows/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId, leadId, context }),
    });
    return data.instance;
  },

  async resumeWorkflow(instanceId: string, approvalId: string, approved: boolean, feedback?: string): Promise<IWorkflowInstance> {
    const data = await request<{ success: boolean; instance: IWorkflowInstance }>(`/workflows/instances/${instanceId}/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalId, approved, feedback }),
    });
    return data.instance;
  },

  // Leads
  async getLeads(filter?: ILeadFilter): Promise<ILead[]> {
    const params = new URLSearchParams();
    if (filter?.industry) params.set('industry', filter.industry);
    if (filter?.qualificationStatus) params.set('qualificationStatus', filter.qualificationStatus);
    if (filter?.outreachStatus) params.set('outreachStatus', filter.outreachStatus);
    if (filter?.searchQuery) params.set('search', filter.searchQuery);

    const qs = params.toString();
    const endpoint = qs ? `/leads?${qs}` : '/leads';
    const data = await request<{ success: boolean; leads: ILead[] }>(endpoint);
    return data.leads || [];
  },

  async saveLead(lead: Partial<ILead>): Promise<ILead> {
    const data = await request<{ success: boolean; lead: ILead }>('/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    return data.lead;
  },

  async deleteLead(id: string): Promise<boolean> {
    const data = await request<{ success: boolean }>(`/leads/${id}`, { method: 'DELETE' });
    return Boolean(data.success);
  },

  // Approvals
  async getApprovals(status?: string): Promise<IApprovalItem[]> {
    const endpoint = status ? `/approvals?status=${status}` : '/approvals';
    const data = await request<{ success: boolean; approvals: IApprovalItem[] }>(endpoint);
    return data.approvals || [];
  },

  async actionApproval(id: string, action: 'APPROVE' | 'REVISE' | 'REJECT', comment?: string, modifiedContent?: string): Promise<IApprovalItem> {
    const data = await request<{ success: boolean; approval: IApprovalItem }>(`/approvals/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, comment, modifiedContent }),
    });
    return data.approval;
  },

  // Knowledge
  async getKnowledgeDocs(): Promise<IKnowledgeDocument[]> {
    const data = await request<{ success: boolean; documents: IKnowledgeDocument[] }>('/knowledge');
    return data.documents || [];
  },

  async saveKnowledgeDoc(slug: string, content: string): Promise<IKnowledgeDocument> {
    const data = await request<{ success: boolean; document: IKnowledgeDocument }>(`/knowledge/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    return data.document;
  },

  // Logs
  async getLogs(limit: number = 100): Promise<any[]> {
    const data = await request<{ success: boolean; logs: any[] }>(`/logs?limit=${limit}`);
    return data.logs || [];
  },

  // Settings & Provider Configuration
  async getSettings(): Promise<any> {
    try {
      const data = await request<{ success: boolean; settings: any }>('/settings');
      if (data && data.settings) {
        try {
          localStorage.setItem('primesoul_settings_cache', JSON.stringify({
            aiProvider: data.settings.aiProvider,
            ollamaBaseUrl: data.settings.ollamaBaseUrl,
            ollamaModel: data.settings.ollamaModel,
            hasGeminiKey: data.settings.hasGeminiKey,
            maskedGeminiKey: data.settings.maskedGeminiKey || data.settings.geminiApiKey,
          }));
        } catch {}
        return data.settings;
      }
      return data;
    } catch (err) {
      // Fallback to localStorage cache for offline / cold-start resilience
      try {
        const cached = localStorage.getItem('primesoul_settings_cache');
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {}
      throw err;
    }
  },

  async updateSettings(settings: any): Promise<any> {
    const data = await request<{ success: boolean; settings: any }>('/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (data && data.settings) {
      try {
        localStorage.setItem('primesoul_settings_cache', JSON.stringify({
          aiProvider: data.settings.aiProvider,
          ollamaBaseUrl: data.settings.ollamaBaseUrl,
          ollamaModel: data.settings.ollamaModel,
          hasGeminiKey: data.settings.hasGeminiKey,
          maskedGeminiKey: data.settings.maskedGeminiKey || data.settings.geminiApiKey,
        }));
      } catch {}
      return data.settings;
    }
    return data;
  },

  // Tools & Lead Intelligence Research
  async analyzeWebsite(url: string, businessName?: string): Promise<any> {
    const data = await request<any>('/tools/web-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, businessName }),
    });
    return data;
  },

  async runResearch(payload: { url?: string; businessName?: string; location?: string; leadId?: string }): Promise<any> {
    const data = await request<any>('/research/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data;
  },

  async getResearchRuns(leadId: string): Promise<any[]> {
    const data = await request<{ success: boolean; runs: any[] }>(`/research/runs/${leadId}`);
    return data.runs || [];
  },

  async getResearchProfile(leadId: string): Promise<any> {
    const data = await request<{ success: boolean; profile: any }>(`/research/profile/${leadId}`);
    return data.profile;
  }
};
