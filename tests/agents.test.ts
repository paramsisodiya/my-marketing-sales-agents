import { describe, it, expect, beforeEach } from 'vitest';
import { AgentRegistry } from '../src/core/agents/agent.registry';
import { LlmFactory } from '../src/core/llm/llm.factory';

describe('PrimeSoul AI Agents Suite', () => {
  beforeEach(() => {
    AgentRegistry.initialize();
    LlmFactory.setProvider('mock');
  });

  it('should initialize all 9 core PrimeSoul agents', () => {
    const agents = AgentRegistry.getAllAgents();
    expect(agents.length).toBe(9);

    const ids = agents.map(a => a.metadata.id);
    expect(ids).toContain('primesoul_manager');
    expect(ids).toContain('lead_researcher');
    expect(ids).toContain('growth_strategist');
    expect(ids).toContain('content_social');
    expect(ids).toContain('seo_local');
    expect(ids).toContain('outbound_sales');
    expect(ids).toContain('discovery');
    expect(ids).toContain('deal_strategist');
    expect(ids).toContain('proposal');
  });

  it('Lead Researcher should perform digital presence audit with facts and assumptions', async () => {
    const agent = AgentRegistry.getAgent('lead_researcher');
    expect(agent).toBeDefined();

    const output = await agent!.execute({
      task: 'Audit dental clinic website',
      objective: 'Identify mobile speed and Google Business Profile gaps',
      leadData: {
        businessName: 'Apex Dental Care',
        website: 'https://apexdentalcare-sample.in',
      }
    });

    expect(output.agentId).toBe('lead_researcher');
    expect(output.summary).toBeTruthy();
    expect(output.facts.length).toBeGreaterThan(0);
    expect(output.assumptions.length).toBeGreaterThan(0);
    expect(output.recommendations.length).toBeGreaterThan(0);
    expect(output.executionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('Outbound Sales Agent should craft cold sequence and flag requiresApproval', async () => {
    const agent = AgentRegistry.getAgent('outbound_sales');
    expect(agent).toBeDefined();

    const output = await agent!.execute({
      task: 'Generate 3-touch sequence',
      objective: 'Target 3.8s mobile load speed trigger',
      leadData: {
        businessName: 'Apex Dental Care',
        contactName: 'Dr. Sharma',
      }
    });

    expect(output.agentId).toBe('outbound_sales');
    expect(output.requiresApproval).toBe(true);
    expect(output.content).toContain('Subject:');
  });

  it('Deal Strategist should score MEDDPICC framework', async () => {
    const agent = AgentRegistry.getAgent('deal_strategist');
    expect(agent).toBeDefined();

    const output = await agent!.execute({
      task: 'Score opportunity',
      objective: 'Evaluate MEDDPICC criteria for Apex Dental',
      context: { dealSize: '₹45,000' }
    });

    expect(output.agentId).toBe('deal_strategist');
    expect(output.content).toContain('MEDDPICC');
  });
});
