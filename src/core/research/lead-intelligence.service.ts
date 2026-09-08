import { WebAnalyzerTool, IWebAnalysisReport } from '../tools/web-analyzer.tool';
import { WebSearchTool } from '../tools/web-search.tool';
import { ProvenanceService } from '../provenance/provenance.service';
import { IdentityResolverService } from './identity-resolver.service';
import { ScoringService } from './scoring.service';
import { ChangeDetectorService } from './change-detector.service';
import { DatabaseService } from '../database/db.service';
import {
  IContactEvidence,
  ILeadIntelligenceProfile,
  IResearchRun,
} from '../types/lead-intelligence.types';
import { ILead } from '../types/lead.types';

export class LeadIntelligenceService {
  private static instance: LeadIntelligenceService;
  private webAnalyzer: WebAnalyzerTool;
  private webSearch: WebSearchTool;
  private provenanceService: ProvenanceService;
  private identityResolver: IdentityResolverService;
  private scoringService: ScoringService;
  private changeDetector: ChangeDetectorService;
  private db: DatabaseService;

  private constructor() {
    this.webAnalyzer = new WebAnalyzerTool();
    this.webSearch = new WebSearchTool();
    this.provenanceService = ProvenanceService.getInstance();
    this.identityResolver = IdentityResolverService.getInstance();
    this.scoringService = ScoringService.getInstance();
    this.changeDetector = ChangeDetectorService.getInstance();
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): LeadIntelligenceService {
    if (!LeadIntelligenceService.instance) {
      LeadIntelligenceService.instance = new LeadIntelligenceService();
    }
    return LeadIntelligenceService.instance;
  }

  /**
   * Executes the full end-to-end Lead Intelligence Research Pipeline.
   */
  public async executeResearch(params: {
    url?: string;
    businessName?: string;
    location?: string;
    leadId?: string;
  }): Promise<{
    success: boolean;
    profile?: ILeadIntelligenceProfile;
    run?: IResearchRun;
    lead?: ILead;
    error?: string;
  }> {
    const runId = `run-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = new Date().toISOString();
    const errors: string[] = [];
    const unknownFields: string[] = [];
    const sources: IResearchRun['sources'] = [];

    let targetUrl = params.url?.trim() || '';
    const inputBusinessName = params.businessName?.trim() || '';
    const inputLocation = params.location?.trim() || '';

    // If leadId provided, load existing lead
    let existingLead: ILead | undefined;
    if (params.leadId) {
      existingLead = this.db.getLeadById(params.leadId);
      if (existingLead) {
        if (!targetUrl && existingLead.website) targetUrl = existingLead.website;
      }
    }

    if (!targetUrl && !inputBusinessName) {
      return {
        success: false,
        error: 'Invalid input: Either a website URL or a business name is required to conduct research.',
      };
    }

    // 1. Live Website Analysis (if URL provided)
    let webReport: IWebAnalysisReport | undefined;
    if (targetUrl) {
      const scanStart = Date.now();
      const webResult = await this.webAnalyzer.execute({
        url: targetUrl,
        businessName: inputBusinessName || existingLead?.businessName,
      });

      if (webResult.success && webResult.data) {
        webReport = webResult.data;
        sources.push({
          url: webReport.finalUrl || targetUrl,
          sourceType: 'LIVE_WEBSITE',
          status: 'SUCCESS',
          timestamp,
          latencyMs: Date.now() - scanStart,
        });
      } else {
        errors.push(`Website scan issue: ${webResult.error}`);
        sources.push({
          url: targetUrl,
          sourceType: 'LIVE_WEBSITE',
          status: 'FAILED',
          timestamp,
          latencyMs: Date.now() - scanStart,
        });
      }
    } else {
      unknownFields.push('websiteUrl');
    }

    // 2. Public Web Search
    const searchQuery = inputBusinessName
      ? `${inputBusinessName} ${inputLocation}`.trim()
      : (webReport?.detected?.title || targetUrl);

    let searchResults: any[] = [];
    try {
      const searchRes = await this.webSearch.execute({ query: searchQuery, limit: 4 });
      if (searchRes.success && searchRes.data?.results) {
        searchResults = searchRes.data.results;
        sources.push({
          url: `https://search.engine/?q=${encodeURIComponent(searchQuery)}`,
          sourceType: 'PUBLIC_WEB',
          status: 'SUCCESS',
          timestamp,
        });
      }
    } catch (sErr: any) {
      errors.push(`Public search lookup failed: ${sErr.message}`);
    }

    // 3. Resolve Business Identity
    const identityResult = this.identityResolver.resolveIdentity({
      inputName: inputBusinessName || existingLead?.businessName,
      inputLocation: inputLocation || existingLead?.location,
      inputUrl: targetUrl,
      webReport,
      searchResults,
    });

    if (identityResult.status === 'AMBIGUOUS') {
      unknownFields.push('identity.ambiguity');
    }

    // 4. Default / Fallback Report Structure if webReport unavailable
    const reportToScore: IWebAnalysisReport = webReport || {
      url: targetUrl,
      finalUrl: targetUrl,
      isAccessible: false,
      measured: { httpStatus: 0, responseTimeMs: 0, contentSizeBytes: 0, isHttps: targetUrl.startsWith('https://'), redirectCount: 0 },
      detected: {
        title: inputBusinessName,
        hasViewport: false,
        robotsTxtStatus: 'UNCHECKED',
        sitemapStatus: 'UNCHECKED',
        openGraph: {},
        headings: { h1: [], h2Count: 0, sampleH2s: [], h3Count: 0, sampleH3s: [] },
        detectedCms: 'Unknown / Offline',
        hasWhatsAppLink: false,
        hasTelLink: false,
        publicPhones: [],
        publicEmails: [],
        bookingLinks: [],
        contactPageUrls: [],
        socialProfiles: {},
        imageOptimization: { totalImages: 0, missingAltCount: 0 },
        schemaTypes: [],
        hasLocalBusinessSchema: false,
      },
      inferred: {
        mobileFriendlinessEstimate: 'UNKNOWN',
        localBusinessReadinessScore: 30,
        detectedTechStack: ['Unverified'],
        identifiedGaps: ['Website was inaccessible during audit or no URL provided.'],
        recommendedPrimeSoulActions: ['Conduct manual business discovery and website verification'],
      },
      unknown: {
        realUserCoreWebVitals: 'Unknown',
        organicSearchVolume: 'Unknown',
        internalServerArchitecture: 'Unknown',
      }
    };

    // 5. Transparent Dimensional & Lead Scoring
    const dimensionalScores = this.scoringService.calculateDimensionalScores(reportToScore);
    const leadScoring = this.scoringService.calculateLeadScore({ report: reportToScore, dimensionalScores });
    const recommendedServices = this.scoringService.matchServices(reportToScore.inferred.identifiedGaps, reportToScore);

    // 6. Contact Evidence Normalization
    const publicPhones: IContactEvidence[] = reportToScore.detected.publicPhones.map(phone => ({
      value: phone,
      type: 'PHONE',
      source: reportToScore.finalUrl || targetUrl,
      sourceType: 'LIVE_WEBSITE',
      confidence: 'HIGH',
      evidence: `Extracted from direct tel: link on ${reportToScore.finalUrl || targetUrl}`,
    }));

    const publicEmails: IContactEvidence[] = reportToScore.detected.publicEmails.map(email => ({
      value: email,
      type: 'EMAIL',
      source: reportToScore.finalUrl || targetUrl,
      sourceType: 'LIVE_WEBSITE',
      confidence: 'HIGH',
      evidence: `Extracted from direct mailto: link on ${reportToScore.finalUrl || targetUrl}`,
    }));

    if (publicPhones.length === 0) unknownFields.push('contact.publicPhones');
    if (publicEmails.length === 0) unknownFields.push('contact.publicEmails');

    // 7. Provenance Extraction
    const webFacts = this.provenanceService.extractFromWebAnalysis(reportToScore);
    const crmFacts = this.provenanceService.extractFromLeadData({
      businessName: identityResult.resolvedName,
      location: identityResult.verifiedLocations[0] || 'UNKNOWN',
      website: targetUrl,
      industry: existingLead?.industry || 'UNKNOWN',
    });
    const provenanceDictionary = this.provenanceService.mergeProvenance(webFacts, crmFacts);

    // 8. Assemble Lead Intelligence Profile
    const profile: ILeadIntelligenceProfile = {
      identity: {
        resolvedName: identityResult.resolvedName,
        legalName: identityResult.legalName,
        domain: identityResult.domain,
        verifiedLocations: identityResult.verifiedLocations,
        confidence: identityResult.status,
        ambiguityReasons: identityResult.ambiguityReasons.length > 0 ? identityResult.ambiguityReasons : undefined,
      },
      business: {
        category: existingLead?.industry || 'Local Business & Professional Services',
        summary: reportToScore.detected.metaDescription || `Business profile for ${identityResult.resolvedName}`,
        operationalStatus: reportToScore.isAccessible ? 'OPERATIONAL' : 'REQUIRES_MANUAL_CHECK',
      },
      contact: {
        publicPhones,
        publicEmails,
        contactPages: reportToScore.detected.contactPageUrls,
        bookingLinks: reportToScore.detected.bookingLinks,
        address: identityResult.verifiedLocations[0],
      },
      website: {
        finalUrl: reportToScore.finalUrl,
        isHttps: reportToScore.measured.isHttps,
        httpStatus: reportToScore.measured.httpStatus,
        responseTimeMs: reportToScore.measured.responseTimeMs,
        contentSizeBytes: reportToScore.measured.contentSizeBytes,
        compressionType: reportToScore.measured.compressionType,
        detectedCms: reportToScore.detected.detectedCms,
        detectedTechStack: reportToScore.inferred.detectedTechStack,
      },
      seo: {
        title: reportToScore.detected.title,
        metaDescription: reportToScore.detected.metaDescription,
        canonicalUrl: reportToScore.detected.canonicalUrl,
        h1Count: reportToScore.detected.headings.h1.length,
        sampleH1s: reportToScore.detected.headings.h1,
        h2Count: reportToScore.detected.headings.h2Count,
        sampleH2s: reportToScore.detected.headings.sampleH2s,
        h3Count: reportToScore.detected.headings.h3Count,
        robotsTxtStatus: reportToScore.detected.robotsTxtStatus,
        sitemapStatus: reportToScore.detected.sitemapStatus,
        imageOptimization: reportToScore.detected.imageOptimization,
        score: dimensionalScores.seoHealth,
        reasons: dimensionalScores.dimensions.find(d => d.name === 'SEO Health')?.reasons.map(r => r.description) || [],
      },
      localSearch: {
        hasLocalBusinessSchema: reportToScore.detected.hasLocalBusinessSchema,
        schemaTypes: reportToScore.detected.schemaTypes,
        googleMapsPresence: !!searchResults.find(r => r.url?.includes('maps.google.com')),
        score: dimensionalScores.localSeoReadiness,
        reasons: dimensionalScores.dimensions.find(d => d.name === 'Local SEO Readiness')?.reasons.map(r => r.description) || [],
      },
      conversion: {
        hasWhatsAppWidget: reportToScore.detected.hasWhatsAppLink,
        hasTelLink: reportToScore.detected.hasTelLink,
        hasBookingWidget: reportToScore.detected.bookingLinks.length > 0,
        hasLeadForm: reportToScore.detected.contactPageUrls.length > 0,
        score: dimensionalScores.conversionReadiness,
        reasons: dimensionalScores.dimensions.find(d => d.name === 'Conversion Readiness')?.reasons.map(r => r.description) || [],
      },
      socialPresence: {
        ...reportToScore.detected.socialProfiles,
        score: dimensionalScores.socialPresenceScore,
        reasons: dimensionalScores.dimensions.find(d => d.name === 'Social Presence')?.reasons.map(r => r.description) || [],
      },
      digitalPresence: dimensionalScores,
      leadScoring,
      verifiedGaps: reportToScore.inferred.identifiedGaps,
      opportunities: [
        'Sub-second responsive website rebuild',
        'Local 3-Pack Schema.org JSON-LD structured data',
        'Direct WhatsApp conversion capture integration',
        'On-page SEO meta architecture remediation',
      ],
      unknowns: unknownFields,
      recommendedServices,
      provenance: provenanceDictionary,
      researchRunId: runId,
      researchTimestamp: timestamp,
    };

    // 9. Change Detection against previous profile
    const changesReport = this.changeDetector.detectChanges(
      existingLead?.intelligenceProfile,
      profile
    );

    // 10. Non-Destructive CRM Lead Upsert
    const leadToSave: Partial<ILead> = {
      id: existingLead?.id,
      businessName: identityResult.resolvedName !== 'UNKNOWN' ? identityResult.resolvedName : (existingLead?.businessName || 'UNKNOWN'),
      website: targetUrl || existingLead?.website,
      location: identityResult.verifiedLocations[0] || existingLead?.location || 'UNKNOWN',
      industry: existingLead?.industry || 'Healthcare / Local Services',
      leadScore: leadScoring.leadScore,
      qualificationStatus: leadScoring.qualification,
      digitalPresenceScore: dimensionalScores.overallScore,
      painPoints: reportToScore.inferred.identifiedGaps,
      opportunities: profile.opportunities,
      recommendedServices: recommendedServices.map(s => s.serviceName),
      socialProfiles: {
        ...existingLead?.socialProfiles,
        ...reportToScore.detected.socialProfiles,
      },
      // Preserve verified contacts if new scan found none
      phone: publicPhones[0]?.value || existingLead?.phone,
      email: publicEmails[0]?.value || existingLead?.email,
      intelligenceProfile: profile,
      lastResearchAt: timestamp,
      researchStatus: webReport ? 'COMPLETED' : 'PARTIAL',
      researchRunId: runId,
      identityConfidence: identityResult.status,
    };

    const savedLead = this.db.saveLead(leadToSave as any);

    // 11. Store Immutable Research Run Record
    const runRecord: IResearchRun = {
      runId,
      leadId: savedLead.id,
      input: {
        url: targetUrl,
        businessName: inputBusinessName,
        location: inputLocation,
      },
      status: webReport ? 'COMPLETED' : (targetUrl ? 'PARTIAL' : 'FAILED'),
      sources,
      extractedFacts: provenanceDictionary,
      changesFromPrevious: changesReport,
      unknownFields,
      errors: errors.length > 0 ? errors : undefined,
      timestamp,
      profileSnapshot: profile,
    };

    this.db.saveResearchRun(runRecord);

    return {
      success: true,
      profile,
      run: runRecord,
      lead: savedLead,
    };
  }
}
