import { FactSourceType, FactConfidence, IProspectFact, IProvenanceRecord } from '../types/provenance.types';
import { IWebAnalysisReport } from '../tools/web-analyzer.tool';

export class ProvenanceService {
  private static instance: ProvenanceService;

  public static getInstance(): ProvenanceService {
    if (!ProvenanceService.instance) {
      ProvenanceService.instance = new ProvenanceService();
    }
    return ProvenanceService.instance;
  }

  /**
   * Extracts verified, typed provenance facts from a live WebAnalyzer report.
   */
  public extractFromWebAnalysis(report: IWebAnalysisReport): Record<string, IProspectFact> {
    const timestamp = new Date().toISOString();
    const facts: Record<string, IProspectFact> = {};

    if (!report || !report.measured) {
      return facts;
    }

    const source = report.finalUrl || report.url;

    // 1. Measured HTTP & Network Facts
    facts['httpStatus'] = {
      field: 'httpStatus',
      value: report.measured.httpStatus,
      source,
      sourceType: 'LIVE_WEBSITE',
      confidence: 'HIGH',
      evidence: `Live HTTP GET returned status code ${report.measured.httpStatus}`,
      timestamp,
      stage: 'web_analysis',
    };

    facts['responseTimeMs'] = {
      field: 'responseTimeMs',
      value: report.measured.responseTimeMs,
      source,
      sourceType: 'LIVE_WEBSITE',
      confidence: 'HIGH',
      evidence: `Initial HTML response time measured at ${report.measured.responseTimeMs}ms`,
      timestamp,
      stage: 'web_analysis',
    };

    facts['isHttps'] = {
      field: 'isHttps',
      value: report.measured.isHttps,
      source,
      sourceType: 'LIVE_WEBSITE',
      confidence: 'HIGH',
      evidence: report.measured.isHttps ? 'HTTPS SSL certificate detected' : 'Insecure HTTP connection',
      timestamp,
      stage: 'web_analysis',
    };

    // 2. Detected DOM & Meta Facts
    if (report.detected.title) {
      facts['websiteTitle'] = {
        field: 'websiteTitle',
        value: report.detected.title,
        source,
        sourceType: 'LIVE_WEBSITE',
        confidence: 'HIGH',
        evidence: `Extracted from <title> tag: "${report.detected.title}"`,
        timestamp,
        stage: 'web_analysis',
      };
    } else {
      facts['websiteTitle'] = {
        field: 'websiteTitle',
        value: 'UNKNOWN',
        source,
        sourceType: 'UNKNOWN',
        confidence: 'NONE',
        evidence: 'HTML <title> tag was missing on the scanned webpage',
        timestamp,
        stage: 'web_analysis',
      };
    }

    if (report.detected.headings.h1.length > 0) {
      facts['h1Heading'] = {
        field: 'h1Heading',
        value: report.detected.headings.h1[0],
        source,
        sourceType: 'LIVE_WEBSITE',
        confidence: 'HIGH',
        evidence: `Found <h1> tag: "${report.detected.headings.h1[0]}"`,
        timestamp,
        stage: 'web_analysis',
      };
    }

    facts['hasMetaDescription'] = {
      field: 'hasMetaDescription',
      value: !!report.detected.metaDescription,
      source,
      sourceType: 'LIVE_WEBSITE',
      confidence: 'HIGH',
      evidence: report.detected.metaDescription ? `Description: "${report.detected.metaDescription}"` : 'Missing <meta name="description"> tag',
      timestamp,
      stage: 'web_analysis',
    };

    facts['hasLocalBusinessSchema'] = {
      field: 'hasLocalBusinessSchema',
      value: report.detected.hasLocalBusinessSchema,
      source,
      sourceType: 'LIVE_WEBSITE',
      confidence: 'HIGH',
      evidence: report.detected.hasLocalBusinessSchema
        ? `Found Schema.org types: ${report.detected.schemaTypes.join(', ')}`
        : 'Zero LocalBusiness JSON-LD markup found in DOM',
      timestamp,
      stage: 'web_analysis',
    };

    facts['hasWhatsAppWidget'] = {
      field: 'hasWhatsAppWidget',
      value: report.detected.hasWhatsAppLink,
      source,
      sourceType: 'LIVE_WEBSITE',
      confidence: 'HIGH',
      evidence: report.detected.hasWhatsAppLink ? 'WhatsApp click-to-chat link detected' : 'No WhatsApp lead capture links detected',
      timestamp,
      stage: 'web_analysis',
    };

    // 3. Inferred Gaps
    if (report.inferred.identifiedGaps && report.inferred.identifiedGaps.length > 0) {
      facts['identifiedGaps'] = {
        field: 'identifiedGaps',
        value: report.inferred.identifiedGaps,
        source,
        sourceType: 'INFERENCE',
        confidence: 'HIGH',
        evidence: `Inferred directly from observable HTML missing tags (${report.inferred.identifiedGaps.length} gaps)`,
        timestamp,
        stage: 'web_analysis',
      };
    }

    return facts;
  }

  /**
   * Extracts verified provenance facts from user-supplied CRM lead input.
   */
  public extractFromLeadData(lead: Record<string, any>, sourceName: string = 'User CRM Input'): Record<string, IProspectFact> {
    const timestamp = new Date().toISOString();
    const facts: Record<string, IProspectFact> = {};

    if (!lead || typeof lead !== 'object') {
      return facts;
    }

    // Business Name
    if (lead.businessName && lead.businessName.trim() && lead.businessName !== 'UNKNOWN') {
      facts['businessName'] = {
        field: 'businessName',
        value: lead.businessName.trim(),
        source: sourceName,
        sourceType: 'USER_CRM',
        confidence: 'HIGH',
        evidence: `Explicitly provided in lead record: "${lead.businessName}"`,
        timestamp,
        stage: 'crm_input',
      };
    } else {
      facts['businessName'] = {
        field: 'businessName',
        value: 'UNKNOWN',
        source: sourceName,
        sourceType: 'UNKNOWN',
        confidence: 'NONE',
        evidence: 'Business name was not provided in input context',
        timestamp,
        stage: 'crm_input',
      };
    }

    // Contact Person
    if (lead.contactName && lead.contactName.trim() && lead.contactName !== 'UNKNOWN') {
      facts['contactName'] = {
        field: 'contactName',
        value: lead.contactName.trim(),
        source: sourceName,
        sourceType: 'USER_CRM',
        confidence: 'HIGH',
        evidence: `Explicitly provided in lead record: "${lead.contactName}"`,
        timestamp,
        stage: 'crm_input',
      };
    } else {
      facts['contactName'] = {
        field: 'contactName',
        value: 'UNKNOWN',
        source: sourceName,
        sourceType: 'UNKNOWN',
        confidence: 'NONE',
        evidence: 'Contact person name was not provided in lead data',
        timestamp,
        stage: 'crm_input',
      };
    }

    // Location
    if (lead.location && lead.location.trim() && lead.location !== 'UNKNOWN') {
      facts['location'] = {
        field: 'location',
        value: lead.location.trim(),
        source: sourceName,
        sourceType: 'USER_CRM',
        confidence: 'HIGH',
        evidence: `Explicitly provided in lead record: "${lead.location}"`,
        timestamp,
        stage: 'crm_input',
      };
    } else {
      facts['location'] = {
        field: 'location',
        value: 'UNKNOWN',
        source: sourceName,
        sourceType: 'UNKNOWN',
        confidence: 'NONE',
        evidence: 'Location was not provided in lead data',
        timestamp,
        stage: 'crm_input',
      };
    }

    // Website
    if (lead.website && lead.website.trim()) {
      facts['websiteUrl'] = {
        field: 'websiteUrl',
        value: lead.website.trim(),
        source: sourceName,
        sourceType: 'USER_CRM',
        confidence: 'HIGH',
        evidence: `Explicitly provided target domain: "${lead.website}"`,
        timestamp,
        stage: 'crm_input',
      };
    }

    // Industry
    if (lead.industry && lead.industry.trim() && lead.industry !== 'UNKNOWN') {
      facts['industry'] = {
        field: 'industry',
        value: lead.industry.trim(),
        source: sourceName,
        sourceType: 'USER_CRM',
        confidence: 'HIGH',
        evidence: `Explicitly provided industry sector: "${lead.industry}"`,
        timestamp,
        stage: 'crm_input',
      };
    } else {
      facts['industry'] = {
        field: 'industry',
        value: 'UNKNOWN',
        source: sourceName,
        sourceType: 'UNKNOWN',
        confidence: 'NONE',
        evidence: 'Industry niche was not provided in lead data',
        timestamp,
        stage: 'crm_input',
      };
    }

    return facts;
  }

  /**
   * Merges multiple provenance collections into a unified provenance store.
   */
  public mergeProvenance(...records: Record<string, IProspectFact>[]): Record<string, IProspectFact> {
    const merged: Record<string, IProspectFact> = {};
    for (const rec of records) {
      if (rec && typeof rec === 'object') {
        Object.assign(merged, rec);
      }
    }
    return merged;
  }
}
