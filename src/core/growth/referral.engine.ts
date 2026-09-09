import { IReferralRecord } from '../types/growth.types';

export class ReferralEngine {
  /**
   * Generates a clean, alphanumeric referral code.
   */
  public static generateCode(prefix?: string): string {
    const cleanPrefix = (prefix || 'GROWTH').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6);
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3-digit number
    return `${cleanPrefix}${randomSuffix}`;
  }

  /**
   * Normalizes and cleans a user-provided referral code.
   */
  public static normalizeCode(code: string): string {
    return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  }
}
