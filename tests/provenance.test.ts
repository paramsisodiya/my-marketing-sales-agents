import { describe, it, expect } from 'vitest';
import { ProvenanceService } from '../src/core/provenance/provenance.service';
import { WebAnalyzerTool } from '../src/core/tools/web-analyzer.tool';
import { LeadResearcherAgent } from '../src/core/agents/lead-researcher.agent';
import { OutboundSalesAgent } from '../src/core/agents/outbound-sales.agent';
import { ProposalAgent } from '../src/core/agents/proposal.agent';
import { DiscoveryAgent } from '../src/core/agents/discovery.agent';

describe('Data Provenance & Zero-Hallucination Grounding Suite', () => {
  const provenanceService = ProvenanceService.getInstance();
  const webAnalyzer = new WebAnalyzerTool();
  const leadResearcher = new LeadResearcherAgent();
  const outboundAgent = new OutboundSalesAgent();
  const proposalAgent = new ProposalAgent();
  const discoveryAgent = new DiscoveryAgent();

  describe('1. example.com Provenance & Dynamic Grounding', () => {
    it('should NOT invent contact names, cities, expansion claims, or 3.8s load times for unseeded example.com', async () => {
      // Analyze live or mock example.com
      const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Example Domain</title></head>
        <body><h1>Example Domain</h1><p>This domain is for use in illustrative examples.</p></body>
        </html>
      `;

      const webAnalysis = webAnalyzer.parseHtmlMetadata({
        originalUrl: 'https://example.com',
        finalUrl: 'https://example.com',
        httpStatus: 200,
        responseTimeMs: 180, // Actual fast response
        contentSizeBytes: sampleHtml.length,
        compressionType: 'br',
        isHttps: true,
        redirectCount: 0,
        html: sampleHtml,
      });

      // Execute Lead Researcher with unseeded lead data (no fake contact name or fake city)
      const researchOutput = await leadResearcher.execute({
        task: 'Audit digital presence for https://example.com',
        objective: 'Extract verified gaps without inventing facts',
        leadData: {
          website: 'https://example.com',
          businessName: 'UNKNOWN',
          contactName: 'UNKNOWN',
          location: 'UNKNOWN',
          industry: 'UNKNOWN',
        },
        context: {
          webAnalysis,
          responseTimeMs: 180,
          identifiedGaps: webAnalysis.inferred.identifiedGaps,
        }
      });

      // A. Verify no fictional identity
      expect(researchOutput.content).not.toContain('Alex Mercer');
      expect(researchOutput.content).not.toContain('San Francisco');
      expect(researchOutput.content).not.toContain('3.8s');
      expect(researchOutput.content).not.toContain('expanding services');

      // B. Verify real measured response time is referenced
      expect(researchOutput.content).toContain('180ms');

      // Execute Outbound Sales Agent
      const outboundOutput = await outboundAgent.execute({
        task: 'Draft cold sequence for example.com',
        objective: 'Anchor in verified technical gaps',
        leadData: {
          website: 'https://example.com',
          businessName: 'UNKNOWN',
          contactName: 'UNKNOWN',
          location: 'UNKNOWN',
          industry: 'UNKNOWN',
        },
        context: {
          webAnalysis,
          responseTimeMs: 180,
          identifiedGaps: webAnalysis.inferred.identifiedGaps,
        }
      });

      // A. Verify outbound contains NO fictional contact or company
      expect(outboundOutput.content).not.toContain('Alex Mercer');
      expect(outboundOutput.content).not.toContain('San Francisco');
      expect(outboundOutput.content).not.toContain('3.8s');
      expect(outboundOutput.content).not.toContain('expanding services');
      expect(outboundOutput.content).not.toContain('practice'); // No niche dental contamination

      // B. Verify neutral greeting used when contact name is unknown
      expect(outboundOutput.content).toContain('Hi there');
      expect(outboundOutput.requiresApproval).toBe(true);
    });
  });

  describe('2. Strict UNKNOWN Handling', () => {
    it('should assign UNKNOWN sourceType when fields are missing from CRM lead data', () => {
      const rawLead = {
        website: 'https://testdomain.com',
        businessName: '',
        contactName: null,
      };

      const provenance = provenanceService.extractFromLeadData(rawLead, 'Test CRM');
      expect(provenance.businessName.value).toBe('UNKNOWN');
      expect(provenance.businessName.sourceType).toBe('UNKNOWN');
      expect(provenance.businessName.confidence).toBe('NONE');

      expect(provenance.contactName.value).toBe('UNKNOWN');
      expect(provenance.contactName.sourceType).toBe('UNKNOWN');
    });

    it('should assign HIGH confidence and LIVE_WEBSITE source for measured web signals', () => {
      const report = webAnalyzer.parseHtmlMetadata({
        originalUrl: 'https://realclinic.com',
        finalUrl: 'https://realclinic.com',
        httpStatus: 200,
        responseTimeMs: 450,
        contentSizeBytes: 1200,
        compressionType: 'gzip',
        isHttps: true,
        redirectCount: 0,
        html: '<title>Real Clinic</title><h1>Real Clinic</h1>',
      });

      const provenance = provenanceService.extractFromWebAnalysis(report);
      expect(provenance.httpStatus.sourceType).toBe('LIVE_WEBSITE');
      expect(provenance.httpStatus.confidence).toBe('HIGH');
      expect(provenance.responseTimeMs.value).toBe(450);
      expect(provenance.websiteTitle.value).toBe('Real Clinic');
    });
  });

  describe('3. Dynamic Context Switching in MockProvider', () => {
    it('should dynamically update output when lead context changes from Dental to Real Estate', async () => {
      // 1. Dental Lead
      const dentalOutput = await discoveryAgent.execute({
        task: 'Discovery call prep',
        objective: 'SPIN sequence',
        leadData: {
          businessName: 'Smile Dental Clinic',
          contactName: 'Dr. Neha',
          industry: 'Dental / Healthcare',
          location: 'Pune',
          website: 'https://smiledental.in',
        }
      });

      expect(dentalOutput.content).toContain('Smile Dental Clinic');
      expect(dentalOutput.content).toContain('Dr. Neha');
      expect(dentalOutput.content).toContain('Pune');
      expect(dentalOutput.content).toContain('patients'); // Dynamic dental term

      // 2. Real Estate Lead
      const realEstateOutput = await discoveryAgent.execute({
        task: 'Discovery call prep',
        objective: 'SPIN sequence',
        leadData: {
          businessName: 'Skyline Luxury Properties',
          contactName: 'Rohan Kapoor',
          industry: 'Real Estate / Property',
          location: 'Mumbai',
          website: 'https://skylineluxury.in',
        }
      });

      expect(realEstateOutput.content).toContain('Skyline Luxury Properties');
      expect(realEstateOutput.content).toContain('Rohan Kapoor');
      expect(realEstateOutput.content).toContain('Mumbai');
      expect(realEstateOutput.content).toContain('buyers & sellers'); // Dynamic real estate term
      expect(realEstateOutput.content).not.toContain('patients');
    });
  });

  describe('4. Proposal Safety Gate & Pricing Integrity', () => {
    it('should strictly ground proposal pricing in knowledge/pricing.md and frame SLAs as targets', async () => {
      const output = await proposalAgent.execute({
        task: 'Draft proposal',
        objective: 'Package transformation',
        leadData: {
          businessName: 'Zenith Tech',
          location: 'Bangalore',
          website: 'https://zenithtech.io',
        }
      });

      // Pricing verified against pricing.md standard transformation tier
      expect(output.content).toContain('₹35,000 - ₹55,000');
      expect(output.content).toContain('Standard Transformation Package');
      expect(output.content).toContain('[DELIVERABLE SLA TARGETS]');
      expect(output.requiresApproval).toBe(true);
    });
  });
});
