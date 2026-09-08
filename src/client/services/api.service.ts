import { IAgentMetadata, IAgentOutput } from '../../core/types/agent.types';
import { ILead, ILeadFilter } from '../../core/types/lead.types';
import { IWorkflowDefinition, IWorkflowInstance } from '../../core/types/workflow.types';
import { IApprovalItem } from '../../core/types/approval.types';
import { IKnowledgeDocument } from '../../core/types/knowledge.types';

const API_BASE = '/api';

export const apiService = {
  // Agents
  async getAgents(): Promise<IAgentMetadata[]> {
    const res = await fetch(`${API_BASE}/agents`);
    const data = await res.json();
    return data.agents;
  },

  async executeAgent(agentId: string, payload: { task: string; objective: string; context?: any; leadData?: any }): Promise<IAgentOutput> {
    const res = await fetch(`${API_BASE}/agents/${agentId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.output;
  },

  // Workflows
  async getWorkflows(): Promise<IWorkflowDefinition[]> {
    const res = await fetch(`${API_BASE}/workflows`);
    const data = await res.json();
    return data.workflows;
  },

  async getWorkflowInstances(): Promise<IWorkflowInstance[]> {
    const res = await fetch(`${API_BASE}/workflows/instances`);
    const data = await res.json();
    return data.instances;
  },

  async startWorkflow(workflowId: string, leadId?: string, context?: any): Promise<IWorkflowInstance> {
    const res = await fetch(`${API_BASE}/workflows/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId, leadId, context }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.instance;
  },

  async resumeWorkflow(instanceId: string, approvalId: string, approved: boolean, feedback?: string): Promise<IWorkflowInstance> {
    const res = await fetch(`${API_BASE}/workflows/instances/${instanceId}/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalId, approved, feedback }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.instance;
  },

  // Leads
  async getLeads(filter?: ILeadFilter): Promise<ILead[]> {
    const params = new URLSearchParams();
    if (filter?.industry) params.set('industry', filter.industry);
    if (filter?.qualificationStatus) params.set('qualificationStatus', filter.qualificationStatus);
    if (filter?.outreachStatus) params.set('outreachStatus', filter.outreachStatus);
    if (filter?.searchQuery) params.set('search', filter.searchQuery);

    const res = await fetch(`${API_BASE}/leads?${params.toString()}`);
    const data = await res.json();
    return data.leads;
  },

  async saveLead(lead: Partial<ILead>): Promise<ILead> {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.lead;
  },

  async deleteLead(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/leads/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  },

  // Approvals
  async getApprovals(status?: string): Promise<IApprovalItem[]> {
    const url = status ? `${API_BASE}/approvals?status=${status}` : `${API_BASE}/approvals`;
    const res = await fetch(url);
    const data = await res.json();
    return data.approvals;
  },

  async actionApproval(id: string, action: 'APPROVE' | 'REVISE' | 'REJECT', comment?: string, modifiedContent?: string): Promise<IApprovalItem> {
    const res = await fetch(`${API_BASE}/approvals/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, comment, modifiedContent }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.approval;
  },

  // Knowledge
  async getKnowledgeDocs(): Promise<IKnowledgeDocument[]> {
    const res = await fetch(`${API_BASE}/knowledge`);
    const data = await res.json();
    return data.documents;
  },

  async saveKnowledgeDoc(slug: string, content: string): Promise<IKnowledgeDocument> {
    const res = await fetch(`${API_BASE}/knowledge/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.document;
  },

  // Logs
  async getLogs(limit: number = 100): Promise<any[]> {
    const res = await fetch(`${API_BASE}/logs?limit=${limit}`);
    const data = await res.json();
    return data.logs;
  },

  // Settings
  async getSettings(): Promise<any> {
    const res = await fetch(`${API_BASE}/settings`);
    const data = await res.json();
    return data.settings;
  },

  async updateSettings(settings: any): Promise<any> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    return data.settings;
  },

  // Tools
  async analyzeWebsite(url: string, businessName?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tools/web-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, businessName }),
    });
    return res.json();
  }
};
