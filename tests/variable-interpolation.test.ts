import { describe, it, expect } from 'vitest';
import { TemplateEngine } from '../src/core/utils/template.engine';
import { OutboundSalesAgent } from '../src/core/agents/outbound-sales.agent';
import { WorkflowEngine } from '../src/core/workflows/workflow.engine';
import { WORKFLOW_DEFINITIONS } from '../src/core/workflows/workflow.definitions';
import { DatabaseService } from '../src/core/database/db.service';

describe('P0 #3: Variable Interpolation & Context Validation Suite', () => {
  const db = DatabaseService.getInstance();
  const workflowEngine = WorkflowEngine.getInstance();

  describe('Template Engine Unit Tests', () => {
    it('should interpolate simple and alias variables accurately', () => {
      const template = 'Hi {{contact_name}}, notice {{business_name}} has 3.8s load time in {{location}}!';
      const context = {
        businessName: 'Apex Dental Care',
        contactName: 'Dr. Rahul',
        location: 'Mumbai',
      };

      const result = TemplateEngine.interpolate(template, context);
      expect(result).toBe('Hi Dr. Rahul, notice Apex Dental Care has 3.8s load time in Mumbai!');
    });

    it('should support fallback values when a variable is missing', () => {
      const template = 'Hi {{contact_name | Valued Doctor}}, welcome to {{business_name | PrimeSoul}}!';
      const result = TemplateEngine.interpolate(template, {});
      expect(result).toBe('Hi Valued Doctor, welcome to PrimeSoul!');
    });

    it('should validate required variables and throw descriptive errors when missing', () => {
      expect(() => {
        TemplateEngine.validateRequiredVariables(['businessName', 'website'], { businessName: 'Apex' }, 'Test Step');
      }).toThrow(/\[VariableValidationError\].*website/);
    });

    it('should pass validation when all required variables are present', () => {
      const check = TemplateEngine.validateRequiredVariables(
        ['businessName', 'location'],
        { businessName: 'Metro Clinic', location: 'Delhi' },
        'Test Step'
      );
      expect(check.valid).toBe(true);
    });
  });

  describe('MockProvider & Agent Dynamic Variable Resolution', () => {
    it('should generate personalized outreach with zero raw handlebar placeholders', async () => {
      const outboundAgent = new OutboundSalesAgent();
      const output = await outboundAgent.execute({
        task: 'Draft personalized cold sequence',
        objective: 'Target 3.8s mobile speed trigger',
        leadData: {
          businessName: 'Radiance Skin & Dental',
          contactName: 'Dr. Anita Mehta',
          location: 'Pune',
          website: 'https://radianceskin.in',
        },
      });

      // Verify that NO unresolved literal handlebars remain
      expect(output.content).not.toContain('{{contact_name}}');
      expect(output.content).not.toContain('{{business_name}}');
      expect(output.content).not.toContain('{{location}}');

      // Verify actual lead variables were inserted
      expect(output.content).toContain('Dr. Anita Mehta');
      expect(output.content).toContain('Radiance Skin & Dental');
      expect(output.content).toContain('Pune');
    });
  });

  describe('End-to-End Multi-Agent Workflow Variable Propagation', () => {
    it('should correctly propagate lead context across the Lead-to-Outreach pipeline', async () => {
      const lead = db.saveLead({
        businessName: 'Vanguard Spine & Rehab',
        contactName: 'Dr. Sameer Joshi',
        industry: 'Healthcare / Orthopedics',
        location: 'Bangalore',
        website: 'https://vanguardspine.in',
        source: 'outbound_audit',
      });

      const def = WORKFLOW_DEFINITIONS.find(w => w.id === 'lead-to-outreach')!;
      const instance = await workflowEngine.startWorkflow(def, {}, lead.id);

      // Workflow reaches Step 2 and pauses for Human Approval
      expect(instance.status).toBe('WAITING_APPROVAL');
      expect(instance.steps[1].output).toBeDefined();

      const outreachContent = instance.steps[1].output?.content || '';
      expect(outreachContent).toContain('Vanguard Spine & Rehab');
      expect(outreachContent).toContain('Dr. Sameer Joshi');
      expect(outreachContent).not.toContain('{{business_name}}');
    });

    it('should correctly propagate variables through Discovery to MEDDPICC pipeline', async () => {
      const lead = db.saveLead({
        businessName: 'Zenith Law Associates',
        contactName: 'Adv. Meenakshi',
        industry: 'Legal Services',
        location: 'New Delhi',
        source: 'referral',
      });

      const def = WORKFLOW_DEFINITIONS.find(w => w.id === 'discovery-to-deal')!;
      const instance = await workflowEngine.startWorkflow(def, {}, lead.id);

      expect(instance.status).toBe('COMPLETED');
      expect(instance.steps[0].output?.content).toContain('Zenith Law Associates');
      expect(instance.steps[1].output?.content).toContain('Zenith Law Associates');
    });
  });
});
