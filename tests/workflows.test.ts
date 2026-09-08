import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowEngine } from '../src/core/workflows/workflow.engine';
import { WORKFLOW_DEFINITIONS } from '../src/core/workflows/workflow.definitions';
import { AgentRegistry } from '../src/core/agents/agent.registry';
import { LlmFactory } from '../src/core/llm/llm.factory';
import { DatabaseService } from '../src/core/database/db.service';

describe('PrimeSoul AI Workflow Engine Suite', () => {
  beforeEach(() => {
    AgentRegistry.initialize();
    LlmFactory.setProvider('mock');
  });

  it('should start and run a multi-step workflow until an approval gate', async () => {
    const engine = WorkflowEngine.getInstance();
    const def = WORKFLOW_DEFINITIONS.find(w => w.id === 'lead-to-outreach');
    expect(def).toBeDefined();

    const instance = await engine.startWorkflow(def!, {
      businessName: 'Apex Dental Care',
      website: 'https://apexdentalcare-sample.in',
    }, 'lead-001');

    expect(instance.id).toBeTruthy();
    // Step 1 completed, Step 2 paused for approval
    expect(instance.status).toBe('WAITING_APPROVAL');
    expect(instance.steps[0].status).toBe('COMPLETED');
    expect(instance.steps[1].status).toBe('WAITING_APPROVAL');
    expect(instance.steps[1].approvalId).toBeTruthy();
  });

  it('should execute non-gated discovery workflow to completion', async () => {
    const engine = WorkflowEngine.getInstance();
    const def = WORKFLOW_DEFINITIONS.find(w => w.id === 'discovery-to-deal');
    expect(def).toBeDefined();

    const instance = await engine.startWorkflow(def!, {
      businessName: 'Vanguard Realty',
    }, 'lead-002');

    expect(instance.status).toBe('COMPLETED');
    expect(instance.steps[0].status).toBe('COMPLETED');
    expect(instance.steps[1].status).toBe('COMPLETED');
    expect(instance.completedAt).toBeTruthy();
  });
});
