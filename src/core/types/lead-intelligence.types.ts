import { FactConfidence, FactSourceType, IProspectFact } from './provenance.types';

export type IdentityConfidenceStatus = 'CONFIDENT' | 'PROBABLE' | 'AMBIGUOUS';

export interface IContactEvidence {
  value: string;
  type: 'PHONE' | 'EMAIL' | 'BOOKING' | 'FORM' | 'ADDRESS';
  source: string;
  sourceType: FactSourceType;
  confidence: FactConfidence;
  evidence: string;
}

export interface IDigitalPresenceDimension {
  name: string;
  score: number; // 0 - 100
  weight: number;
  reasons: {
    type: 'BONUS' | 'DEDUCTION' | 'NEUTRAL';
    points: number;
    description: string;
    evidence: string;
  }[];
}

export interface IRecommendedServiceMatch {
  serviceName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  rationale: string;
  matchedGaps: string[];
}

export interface ILeadScoreFactor {
  factor: string;
  points: number;
  evidence: string;
}

export interface ILeadScoreBreakdown {
  leadScore: number; // 0 - 100
  qualification: 'QUALIFIED' | 'UNQUALIFIED' | 'OPPORTUNITY' | 'DISQUALIFIED';
  confidence: FactConfidence;
  scoreBreakdown: ILeadScoreFactor[];
}

export interface ILeadIntelligenceProfile {
  identity: {
    resolvedName: string;
    legalName?: string;
    domain: string;
    verifiedLocations: string[];
    confidence: IdentityConfidenceStatus;
    ambiguityReasons?: string[];
  };
  business: {
    category: string;
    summary: string;
    operationalStatus: string;
  };
  contact: {
    publicPhones: IContactEvidence[];
    publicEmails: IContactEvidence[];
    contactPages: string[];
    bookingLinks: string[];
    address?: string;
  };
  website: {
    finalUrl: string;
    isHttps: boolean;
    httpStatus: number;
    responseTimeMs: number;
    contentSizeBytes: number;
    compressionType?: string;
    detectedCms: string;
    detectedTechStack: string[];
  };
  seo: {
    title?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    h1Count: number;
    sampleH1s: string[];
    h2Count: number;
    sampleH2s: string[];
    h3Count: number;
    robotsTxtStatus: 'AVAILABLE' | 'MISSING' | 'UNCHECKED';
    sitemapStatus: 'AVAILABLE' | 'MISSING' | 'UNCHECKED';
    imageOptimization: {
      totalImages: number;
      missingAltCount: number;
    };
    score: number;
    reasons: string[];
  };
  localSearch: {
    hasLocalBusinessSchema: boolean;
    schemaTypes: string[];
    googleMapsPresence: boolean;
    reviewRating?: number;
    reviewCount?: number;
    score: number;
    reasons: string[];
  };
  conversion: {
    hasWhatsAppWidget: boolean;
    hasTelLink: boolean;
    hasBookingWidget: boolean;
    hasLeadForm: boolean;
    score: number;
    reasons: string[];
  };
  socialPresence: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    score: number;
    reasons: string[];
  };
  digitalPresence: {
    overallScore: number;
    technicalHealth: number;
    seoHealth: number;
    localSeoReadiness: number;
    conversionReadiness: number;
    socialPresenceScore: number;
    websiteQuality: number;
    dimensions: IDigitalPresenceDimension[];
  };
  leadScoring: ILeadScoreBreakdown;
  verifiedGaps: string[];
  opportunities: string[];
  unknowns: string[];
  recommendedServices: IRecommendedServiceMatch[];
  provenance: Record<string, IProspectFact>;
  researchRunId: string;
  researchTimestamp: string;
}

export interface IChangeItem {
  field: string;
  previousValue: any;
  newValue: any;
  significance: 'MAJOR' | 'MINOR' | 'INFORMATIONAL';
  description: string;
}

export interface IChangeDetectionReport {
  hasChanges: boolean;
  changesCount: number;
  changes: IChangeItem[];
  previousRunTimestamp?: string;
}

export interface IResearchRun {
  runId: string;
  leadId: string;
  input: {
    url?: string;
    businessName?: string;
    location?: string;
  };
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED';
  sources: {
    url: string;
    sourceType: FactSourceType;
    status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
    timestamp: string;
    latencyMs?: number;
  }[];
  extractedFacts: Record<string, IProspectFact>;
  changesFromPrevious?: IChangeDetectionReport;
  unknownFields: string[];
  errors?: string[];
  timestamp: string;
  profileSnapshot?: Partial<ILeadIntelligenceProfile>;
}
