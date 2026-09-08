import { AgentId, IAgentOutput } from './agent.types';

export type WorkflowStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type StepStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED';

export interface IWorkflowStepDefinition {
  id: string;
  name: string;
  agentId: AgentId;
  objective: string;
  dependsOn?: string[];
  requiresHumanApproval?: boolean;
  approvalType?: string;
  transformInput?: (prevOutputs: Record<string, IAgentOutput>, globalContext: Record<string, any>) => Record<string, any>;
}

export interface IWorkflowDefinition {
  id: string;
  name: string;
  category: 'sales' | 'marketing' | 'seo' | 'research' | 'pipeline';
  description: string;
  icon: string;
  steps: IWorkflowStepDefinition[];
}

export interface IWorkflowStepExecution {
  stepId: string;
  name: string;
  agentId: AgentId;
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  input?: Record<string, any>;
  output?: IAgentOutput;
  error?: string;
  approvalId?: string;
}

export interface IWorkflowInstance {
  id: string;
  workflowId: string;
  workflowName: string;
  status: WorkflowStatus;
  leadId?: string;
  context: Record<string, any>;
  steps: IWorkflowStepExecution[];
  currentStepIndex: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  logs: string[];
}
