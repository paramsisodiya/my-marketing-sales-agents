export type AgentId =
  | 'primesoul_manager'
  | 'lead_researcher'
  | 'growth_strategist'
  | 'content_social'
  | 'seo_local'
  | 'outbound_sales'
  | 'discovery'
  | 'deal_strategist'
  | 'proposal';

export type AgentDivision = 'orchestration' | 'research' | 'sales' | 'marketing' | 'seo';

export interface IAgentMetadata {
  id: AgentId;
  name: string;
  division: AgentDivision;
  description: string;
  color: string;
  icon: string;
  vibe: string;
  responsibilities: string[];
  requiredKnowledge: string[];
}

export interface IAgentInput {
  task: string;
  objective: string;
  context?: Record<string, any>;
  leadData?: Record<string, any>;
  constraints?: string[];
  history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

export interface IAgentHandoff {
  sourceAgent: AgentId;
  targetAgent: AgentId;
  task: string;
  objective: string;
  context: Record<string, any>;
  constraints?: string[];
  expectedOutput: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiresHumanApproval: boolean;
}

export interface IAgentOutput {
  agentId: AgentId;
  agentName: string;
  summary: string;
  content: string;
  facts: string[];
  assumptions: string[];
  recommendations: string[];
  unknowns: string[];
  nextSuggestedAgent?: AgentId;
  handoffPayload?: IAgentHandoff;
  requiresApproval: boolean;
  metadata?: Record<string, any>;
  executionTimeMs: number;
}
