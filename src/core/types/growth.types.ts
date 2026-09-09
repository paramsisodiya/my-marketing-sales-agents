export type BusinessCategory =
  | 'School'
  | 'Coaching'
  | 'Restaurant'
  | 'Cafe'
  | 'Salon'
  | 'Clinic'
  | 'Gym'
  | 'Retail'
  | 'Real Estate'
  | 'Professional Service'
  | 'Other';

export type LeadRequirement =
  | 'Website'
  | 'Google Business'
  | 'Social Media'
  | 'Digital Marketing'
  | 'Lead Generation'
  | 'PrimeOMS'
  | 'Restaurant QR Menu'
  | 'Not Sure';

export type LeadTimeline =
  | 'Immediately'
  | 'Within 7 days'
  | 'Within 30 days'
  | 'Later'
  | 'Just exploring';

export type LeadSource =
  | 'WEBSITE'
  | 'AUDIT'
  | 'QR_MENU'
  | 'REFERRAL'
  | 'PARTNER'
  | 'INSTAGRAM'
  | 'YOUTUBE'
  | 'GOOGLE'
  | 'DIRECT'
  | 'OTHER';

export type GrowthLeadStatus =
  | 'NEW'
  | 'QUALIFIED'
  | 'CONTACTED'
  | 'DEMO'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'FOLLOW_UP';

export type LeadTemperature = 'HOT' | 'WARM' | 'COOL' | 'COLD';

export interface ILeadNote {
  id: string;
  leadId: string;
  userId?: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface IAuditCheck {
  id: string;
  name: string;
  category: 'Technical' | 'SEO' | 'Conversion' | 'Local';
  passed: boolean;
  score: number;
  maxScore: number;
  details: string;
  severity?: 'GOOD' | 'WARNING' | 'CRITICAL' | 'INFO';
}

export interface IAuditResultData {
  score: number;
  grade: 'Excellent' | 'Good' | 'Needs Improvement' | 'Major Opportunities';
  checks: IAuditCheck[];
  strengths: string[];
  issues: string[];
  opportunities: string[];
  recommendedActions: string[];
  metrics?: {
    responseTimeMs: number;
    isHttps: boolean;
    hasViewport: boolean;
    contentSizeBytes?: number;
  };
}

export interface IAuditRecord {
  id: string;
  businessName: string;
  websiteUrl?: string;
  category: BusinessCategory;
  city: string;
  contact?: string;
  email?: string;
  phone?: string;
  googleBusinessUrl?: string;
  score: number;
  grade: 'Excellent' | 'Good' | 'Needs Improvement' | 'Major Opportunities';
  resultsJson: IAuditResultData;
  createdAt: string;
}

export interface IQRRestaurant {
  id: string;
  businessName: string;
  slug: string;
  phone: string;
  city: string;
  logoUrl?: string;
  isPublished: boolean;
  categories?: IQRCategory[];
  items?: IQRMenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IQRCategory {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
}

export interface IQRMenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number; // in INR e.g. 149
  imageUrl?: string;
  isAvailable: boolean;
  isVegetarian?: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface IReferralRecord {
  id: string;
  referralCode: string;
  referrerName: string;
  referrerContact?: string;
  referredBusiness?: string;
  status: 'CLICKED' | 'LEAD' | 'QUALIFIED' | 'WON' | 'REWARDED';
  clicksCount: number;
  leadsCount: number;
  wonCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IEventRecord {
  id: string;
  eventName: string;
  anonymousId?: string;
  leadId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
