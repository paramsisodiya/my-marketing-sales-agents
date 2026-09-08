import { ILeadIntelligenceProfile, IdentityConfidenceStatus } from './lead-intelligence.types';

export type QualificationStatus =
  | 'UNQUALIFIED'
  | 'RESEARCHED'
  | 'QUALIFIED'
  | 'DISQUALIFIED'
  | 'ENGAGED'
  | 'OPPORTUNITY'
  | 'CUSTOMER';

export type OutreachStatus =
  | 'NOT_STARTED'
  | 'DRAFTED'
  | 'IN_PROGRESS'
  | 'RESPONDED'
  | 'CALL_SCHEDULED'
  | 'PROPOSAL_SENT'
  | 'CLOSED_WON'
  | 'CLOSED_LOST'
  | 'OPTED_OUT';

export interface ILead {
  id: string;
  businessName: string;
  industry: string;
  location: string;
  website?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  socialProfiles?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  source: string;
  leadScore: number; // 0 - 100
  qualificationStatus: QualificationStatus;
  digitalPresenceScore: number; // 0 - 100
  painPoints: string[];
  opportunities: string[];
  recommendedServices: string[];
  outreachStatus: OutreachStatus;
  lastContacted?: string;
  nextFollowUp?: string;
  notes?: string;
  meddpicc?: {
    metrics?: string;
    economicBuyer?: string;
    decisionCriteria?: string;
    decisionProcess?: string;
    paperProcess?: string;
    identifyPain?: string;
    champion?: string;
    competition?: string;
    totalScore?: number; // 0 - 40
  };
  // P2.1 Lead Intelligence Extensions
  intelligenceProfile?: ILeadIntelligenceProfile;
  lastResearchAt?: string;
  researchStatus?: 'COMPLETED' | 'PARTIAL' | 'FAILED';
  researchRunId?: string;
  identityConfidence?: IdentityConfidenceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ILeadFilter {
  industry?: string;
  qualificationStatus?: QualificationStatus;
  outreachStatus?: OutreachStatus;
  minScore?: number;
  searchQuery?: string;
}
