import { ILeadIntelligenceProfile, IdentityConfidenceStatus } from './lead-intelligence.types';
import { BusinessCategory, LeadRequirement, LeadTimeline, LeadTemperature, GrowthLeadStatus, ILeadNote } from './growth.types';

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
  businessCategory?: BusinessCategory;
  city?: string;
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
  sourceDetail?: string;
  requirement?: LeadRequirement;
  timeline?: LeadTimeline;
  leadScore: number; // 0 - 100
  leadTemperature?: LeadTemperature;
  qualificationStatus: QualificationStatus;
  growthStatus?: GrowthLeadStatus;
  digitalPresenceScore: number; // 0 - 100
  painPoints: string[];
  opportunities: string[];
  recommendedServices: string[];
  outreachStatus: OutreachStatus;
  lastContacted?: string;
  nextFollowUp?: string;
  followUpDate?: string;
  assignedTo?: string;
  referralCode?: string;
  notes?: string;
  notesList?: ILeadNote[];
  auditId?: string;
  restaurantId?: string;
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
  businessCategory?: string;
  qualificationStatus?: QualificationStatus;
  growthStatus?: GrowthLeadStatus;
  outreachStatus?: OutreachStatus;
  temperature?: LeadTemperature;
  source?: string;
  minScore?: number;
  searchQuery?: string;
}
