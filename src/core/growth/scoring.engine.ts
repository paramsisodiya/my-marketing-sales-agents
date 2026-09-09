import { LeadTemperature, LeadRequirement, LeadTimeline } from '../types/growth.types';

export interface ILeadScoringInput {
  phone?: string;
  email?: string;
  requirement?: LeadRequirement | string;
  timeline?: LeadTimeline | string;
  hasViewedAuditResult?: boolean;
  hasClickedContactCta?: boolean;
  hasCreatedQrMenu?: boolean;
  hasRequestedDemo?: boolean;
  isTableOrderingInterested?: boolean;
}

export interface ILeadScoringResult {
  score: number;
  temperature: LeadTemperature;
  reasons: string[];
}

export class GrowthScoringEngine {
  /**
   * Calculates a deterministic 0-100 lead score and intent temperature.
   */
  public static calculateScore(input: ILeadScoringInput): ILeadScoringResult {
    let score = 0;
    const reasons: string[] = [];

    // 1. Contact Information
    if (input.phone && input.phone.trim().length >= 8) {
      score += 20;
      reasons.push('Phone number provided (+20)');
    }

    if (input.email && input.email.includes('@') && input.email.includes('.')) {
      score += 10;
      reasons.push('Email address provided (+10)');
    }

    // 2. Clear Requirement Selected
    if (input.requirement && input.requirement !== 'Not Sure') {
      score += 15;
      reasons.push(`Selected requirement: ${input.requirement} (+15)`);
    }

    // 3. Urgency / Timeline
    if (input.timeline === 'Immediately') {
      score += 20;
      reasons.push('Immediate deployment timeline (+20)');
    } else if (input.timeline === 'Within 7 days') {
      score += 10;
      reasons.push('7-day start timeline (+10)');
    } else if (input.timeline === 'Within 30 days') {
      score += 5;
      reasons.push('30-day timeline (+5)');
    }

    // 4. Funnel Engagement
    if (input.hasViewedAuditResult) {
      score += 10;
      reasons.push('Completed digital health audit (+10)');
    }

    if (input.hasClickedContactCta) {
      score += 15;
      reasons.push('Clicked consultation / contact CTA (+15)');
    }

    // 5. PrimeOMS / Restaurant Specific Intent
    if (input.hasCreatedQrMenu) {
      score += 20;
      reasons.push('Created active QR digital menu (+20)');
    }

    if (input.isTableOrderingInterested) {
      score += 20;
      reasons.push('Interested in direct table ordering (+20)');
    }

    if (input.hasRequestedDemo) {
      score += 10;
      reasons.push('Requested personalized demo (+10)');
    }

    // Cap at 100
    const finalScore = Math.min(100, Math.max(0, score));

    // Temperature classification
    let temperature: LeadTemperature = 'COLD';
    if (finalScore >= 80) {
      temperature = 'HOT';
    } else if (finalScore >= 60) {
      temperature = 'WARM';
    } else if (finalScore >= 40) {
      temperature = 'COOL';
    } else {
      temperature = 'COLD';
    }

    return {
      score: finalScore,
      temperature,
      reasons,
    };
  }
}
