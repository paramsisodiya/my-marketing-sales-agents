import { BaseAgent } from './base.agent';
import { AgentId, IAgentMetadata } from '../types/agent.types';
import { PrimeSoulManagerAgent } from './primesoul-manager.agent';
import { LeadResearcherAgent } from './lead-researcher.agent';
import { GrowthStrategistAgent } from './growth-strategist.agent';
import { ContentSocialAgent } from './content-social.agent';
import { SeoLocalAgent } from './seo-local.agent';
import { OutboundSalesAgent } from './outbound-sales.agent';
import { DiscoveryAgent } from './discovery.agent';
import { DealStrategistAgent } from './deal-strategist.agent';
import { ProposalAgent } from './proposal.agent';

export class AgentRegistry {
  private static agents: Map<AgentId, BaseAgent> = new Map();

  public static initialize(): void {
    if (this.agents.size > 0) return;

    const list: BaseAgent[] = [
      new PrimeSoulManagerAgent(),
      new LeadResearcherAgent(),
      new GrowthStrategistAgent(),
      new ContentSocialAgent(),
      new SeoLocalAgent(),
      new OutboundSalesAgent(),
      new DiscoveryAgent(),
      new DealStrategistAgent(),
      new ProposalAgent(),
    ];

    for (const agent of list) {
      this.agents.set(agent.metadata.id, agent);
    }
  }

  public static getAgent(id: AgentId): BaseAgent | undefined {
    if (this.agents.size === 0) this.initialize();
    return this.agents.get(id);
  }

  public static getAllAgents(): BaseAgent[] {
    if (this.agents.size === 0) this.initialize();
    return Array.from(this.agents.values());
  }

  public static getAllMetadata(): IAgentMetadata[] {
    return this.getAllAgents().map(a => a.metadata);
  }
}
