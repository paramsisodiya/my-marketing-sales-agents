import { AgentId } from './agent.types';

export type ApprovalStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'REVISED'
  | 'EXECUTED'
  | 'REJECTED';

export type ApprovalItemType =
  | 'COLD_EMAIL'
  | 'WHATSAPP_MESSAGE'
  | 'PROPOSAL'
  | 'SOCIAL_POST'
  | 'CAMPAIGN_BUDGET'
  | 'CRM_UPDATE';

export interface IApprovalItem {
  id: string;
  workflowInstanceId?: string;
  stepId?: string;
  leadId?: string;
  agentId: AgentId;
  type: ApprovalItemType;
  title: string;
  summary: string;
  draftContent: string;
  revisedContent?: string;
  status: ApprovalStatus;
  feedbackHistory?: Array<{
    timestamp: string;
    action: 'REVIEW' | 'APPROVE' | 'REVISE' | 'REJECT';
    comment?: string;
    modifiedContent?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
