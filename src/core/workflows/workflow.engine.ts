import { AgentRegistry } from '../agents/agent.registry';
import { DatabaseService } from '../database/db.service';
import { LoggerService } from '../observability/logger.service';
import { IWorkflowDefinition, IWorkflowInstance, IWorkflowStepExecution, StepStatus } from '../types/workflow.types';
import { IAgentOutput } from '../types/agent.types';
import { TemplateEngine } from '../utils/template.engine';

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private db: DatabaseService;
  private logger: LoggerService;

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.logger = LoggerService.getInstance();
  }

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  public async startWorkflow(definition: IWorkflowDefinition, initialContext: Record<string, any>, leadId?: string): Promise<IWorkflowInstance> {
    const instanceId = `wf-${definition.id}-${Date.now().toString(36)}`;
    const stepExecutions: IWorkflowStepExecution[] = definition.steps.map(step => ({
      stepId: step.id,
      name: step.name,
      agentId: step.agentId,
      status: 'PENDING' as StepStatus,
    }));

    // Enrich context with lead data if available
    const enrichedContext: Record<string, any> = { ...initialContext };
    if (leadId) {
      const lead = this.db.getLeadById(leadId);
      if (lead) {
        enrichedContext.businessName = enrichedContext.businessName || lead.businessName;
        enrichedContext.contactName = enrichedContext.contactName || lead.contactName;
        enrichedContext.website = enrichedContext.website || lead.website;
        enrichedContext.location = enrichedContext.location || lead.location;
        enrichedContext.industry = enrichedContext.industry || lead.industry;
        enrichedContext.painPoints = enrichedContext.painPoints || lead.painPoints;
      }
    }

    const instance: IWorkflowInstance = {
      id: instanceId,
      workflowId: definition.id,
      workflowName: definition.name,
      status: 'RUNNING',
      leadId,
      context: enrichedContext,
      steps: stepExecutions,
      currentStepIndex: 0,
      startedAt: new Date().toISOString(),
      logs: [`Workflow ${definition.name} started at ${new Date().toISOString()}`],
    };

    this.db.saveWorkflow(instance);
    this.logger.info(`Workflow started: ${instance.workflowName} (${instance.id})`, { workflowId: instance.id, leadId });

    // Execute steps sequentially
    return this.executeNextStep(instance, definition);
  }

  public async executeNextStep(instance: IWorkflowInstance, definition: IWorkflowDefinition): Promise<IWorkflowInstance> {
    if (instance.currentStepIndex >= definition.steps.length) {
      instance.status = 'COMPLETED';
      instance.completedAt = new Date().toISOString();
      instance.logs.push(`Workflow completed successfully at ${new Date().toISOString()}`);
      this.db.saveWorkflow(instance);
      this.logger.info(`Workflow completed: ${instance.workflowName} (${instance.id})`, { workflowId: instance.id });
      return instance;
    }

    const stepDef = definition.steps[instance.currentStepIndex];
    const stepExec = instance.steps[instance.currentStepIndex];

    stepExec.status = 'RUNNING';
    stepExec.startedAt = new Date().toISOString();
    this.db.saveWorkflow(instance);

    try {
      const agent = AgentRegistry.getAgent(stepDef.agentId);
      if (!agent) {
        throw new Error(`Agent ${stepDef.agentId} not found in registry`);
      }

      // Gather outputs from previous steps
      const prevOutputs: Record<string, IAgentOutput> = {};
      for (let i = 0; i < instance.currentStepIndex; i++) {
        const prev = instance.steps[i];
        if (prev.output) {
          prevOutputs[prev.stepId] = prev.output;
        }
      }

      let leadData: any = undefined;
      if (instance.leadId) {
        leadData = this.db.getLeadById(instance.leadId);
      }

      // Compute step-specific input
      const computedContext = stepDef.transformInput
        ? stepDef.transformInput(prevOutputs, instance.context)
        : { ...instance.context, previousOutputs: prevOutputs };

      // Validate required variables for sales & proposal workflows if lead data or context is present
      if (definition.category === 'sales') {
        const activeBusinessName = computedContext.businessName || (leadData && leadData.businessName);
        if (!activeBusinessName && !computedContext.researchScope && !computedContext.discoveryData) {
          TemplateEngine.validateRequiredVariables(['businessName'], computedContext, `${definition.name} -> ${stepDef.name}`);
        }
      }

      stepExec.input = computedContext;

      // Execute Agent with enriched context
      const output = await agent.execute({
        task: stepDef.name,
        objective: stepDef.objective,
        context: computedContext,
        leadData: leadData || {
          businessName: computedContext.businessName,
          contactName: computedContext.contactName,
          website: computedContext.website,
          location: computedContext.location,
          industry: computedContext.industry,
        },
      });

      stepExec.output = output;
      stepExec.completedAt = new Date().toISOString();
      stepExec.durationMs = output.executionTimeMs;

      // Check if Human Approval is needed
      if (stepDef.requiresHumanApproval || output.requiresApproval) {
        stepExec.status = 'WAITING_APPROVAL';
        instance.status = 'WAITING_APPROVAL';

        const approvalItem = this.db.saveApproval({
          workflowInstanceId: instance.id,
          stepId: stepExec.stepId,
          leadId: instance.leadId,
          agentId: stepDef.agentId,
          type: (stepDef.approvalType as any) || 'COLD_EMAIL',
          title: `Approval Required: ${stepExec.name} (${instance.workflowName})`,
          summary: output.summary,
          draftContent: output.content,
          status: 'REVIEW',
        });

        stepExec.approvalId = approvalItem.id;
        instance.logs.push(`Step ${stepExec.name} paused for Human Approval (ID: ${approvalItem.id})`);
        this.db.saveWorkflow(instance);
        this.logger.info(`Workflow step paused for human approval: ${stepExec.name}`, { approvalId: approvalItem.id, workflowId: instance.id });
        return instance;
      }

      stepExec.status = 'COMPLETED';
      instance.logs.push(`Step ${stepExec.name} completed by ${output.agentName} in ${output.executionTimeMs}ms`);
      instance.currentStepIndex++;
      this.db.saveWorkflow(instance);

      // Recursively run the next step
      return this.executeNextStep(instance, definition);
    } catch (err: any) {
      stepExec.status = 'FAILED';
      stepExec.error = err.message;
      instance.status = 'FAILED';
      instance.error = err.message;
      instance.completedAt = new Date().toISOString();
      instance.logs.push(`Step ${stepExec.name} FAILED: ${err.message}`);
      this.db.saveWorkflow(instance);
      this.logger.error(`Workflow step failed: ${stepExec.name}`, { error: err.message, workflowId: instance.id });
      return instance;
    }
  }

  public async resumeWorkflowAfterApproval(instanceId: string, approvalId: string, approved: boolean, feedback?: string): Promise<IWorkflowInstance | null> {
    const instance = this.db.getWorkflowById(instanceId);
    if (!instance) return null;

    const stepExec = instance.steps[instance.currentStepIndex];
    if (!stepExec || stepExec.approvalId !== approvalId) return instance;

    if (!approved) {
      stepExec.status = 'FAILED';
      stepExec.error = `Rejected by human reviewer: ${feedback || 'No feedback provided'}`;
      instance.status = 'CANCELLED';
      instance.logs.push(`Step ${stepExec.name} rejected by reviewer.`);
      this.db.saveWorkflow(instance);
      return instance;
    }

    // Step approved, advance to next
    stepExec.status = 'COMPLETED';
    instance.logs.push(`Step ${stepExec.name} APPROVED by reviewer.`);
    instance.currentStepIndex++;
    instance.status = 'RUNNING';
    this.db.saveWorkflow(instance);

    const definitions = await import('./workflow.definitions');
    const def = definitions.WORKFLOW_DEFINITIONS.find(d => d.id === instance.workflowId);
    if (def) {
      return this.executeNextStep(instance, def);
    }

    return instance;
  }
}
