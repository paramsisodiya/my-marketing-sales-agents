/**
 * Data Provenance & Grounding Type Definitions for PrimeSoul AI
 * Enforces verifiable source attribution and prevents hallucination/contamination.
 */

export type FactSourceType = 'LIVE_WEBSITE' | 'USER_CRM' | 'PRIMESOUL_KNOWLEDGE' | 'INFERENCE' | 'UNKNOWN';

export type FactConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface IProspectFact<T = any> {
  field: string;
  value: T;
  source: string;
  sourceType: FactSourceType;
  confidence: FactConfidence;
  evidence?: string;
  timestamp: string;
  stage?: string;
}

export interface IProvenanceRecord {
  prospectUrl?: string;
  facts: Record<string, IProspectFact>;
  createdAt: string;
  updatedAt: string;
}

export interface IClaimValidationResult {
  valid: boolean;
  unsupportedClaims: string[];
  sanitizedCopy?: string;
}
