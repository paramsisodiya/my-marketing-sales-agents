import { ILead } from '../types/lead.types';
import { IApprovalItem } from '../types/approval.types';
import { IAuditRecord, IQRRestaurant, IQRCategory, IQRMenuItem, IReferralRecord } from '../types/growth.types';

export const SEED_LEADS: ILead[] = [
  {
    id: 'lead-001',
    businessName: 'Apex Dental Care & Implant Center',
    industry: 'Healthcare',
    businessCategory: 'Clinic',
    location: 'Indore, MP, India',
    city: 'Indore',
    website: 'https://apexdentalcare-sample.in',
    contactName: 'Dr. Rajesh Sharma',
    email: 'dr.sharma@apexdentalcare.in',
    phone: '+91 98260 12345',
    socialProfiles: {
      instagram: 'instagram.com/apexdentalcare_indore',
      facebook: 'facebook.com/apexdentalcare',
    },
    source: 'AUDIT',
    sourceDetail: 'website_audit',
    requirement: 'Google Business',
    timeline: 'Immediately',
    leadScore: 85,
    leadTemperature: 'HOT',
    qualificationStatus: 'QUALIFIED',
    growthStatus: 'QUALIFIED',
    digitalPresenceScore: 42,
    painPoints: [
      'Mobile load time is 4.1s on WordPress/Elementor',
      'Google Business Profile is unverified with only 4 reviews',
      'No online WhatsApp appointment scheduling',
      'Losing local search visibility to newly opened dental clinic 1km away'
    ],
    opportunities: [
      'High conversion potential with Local 3-Pack SEO sprint',
      'Direct WhatsApp booking widget will capture after-hours inquiries',
      'Custom sub-second mobile landing page'
    ],
    recommendedServices: [
      'Website Design & Development',
      'Google Business Profile & Local SEO',
      'WhatsApp Business Setup'
    ],
    outreachStatus: 'DRAFTED',
    notes: 'High-intent prospect with 2 active clinic branches. Decision maker is Dr. Sharma.',
    notesList: [
      {
        id: 'note-1',
        leadId: 'lead-001',
        author: 'Param Sisodiya',
        content: 'Completed initial digital presence audit. High intent for Google Business Profile and WhatsApp booking.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      }
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-002',
    businessName: 'Royal Spice Family Restaurant & Cafe',
    industry: 'Hospitality',
    businessCategory: 'Restaurant',
    location: 'Jaipur, RJ, India',
    city: 'Jaipur',
    website: 'https://royalspice-jaipur-demo.in',
    contactName: 'Karan Singh Rathore',
    email: 'karan@royalspice.in',
    phone: '+91 98290 87654',
    source: 'QR_MENU',
    sourceDetail: 'qr_menu_creation',
    requirement: 'Restaurant QR Menu',
    timeline: 'Within 7 days',
    leadScore: 90,
    leadTemperature: 'HOT',
    qualificationStatus: 'QUALIFIED',
    growthStatus: 'DEMO',
    digitalPresenceScore: 65,
    painPoints: [
      'Paper menus getting worn out and expensive to reprint on price changes',
      'Weekend rush creates delays in waiter taking orders at tables',
      'No customer database for WhatsApp promotions'
    ],
    opportunities: [
      'Deploy PrimeOMS QR digital menu with table ordering',
      'WhatsApp automated bill receipt and feedback loop',
      'Google Review QR cards on every table'
    ],
    recommendedServices: [
      'PrimeOMS',
      'Restaurant QR Menu',
      'WhatsApp Business Setup'
    ],
    outreachStatus: 'IN_PROGRESS',
    notes: 'Owner Karan requested demo of PrimeOMS kitchen display and table ordering.',
    notesList: [
      {
        id: 'note-2',
        leadId: 'lead-002',
        author: 'PrimeSoul Team',
        content: 'Created free QR menu for 18 tables. Scheduled PrimeOMS demo for tomorrow 3 PM.',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      }
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-003',
    businessName: 'Bright Future International School',
    industry: 'Education',
    businessCategory: 'School',
    location: 'Udaipur, RJ, India',
    city: 'Udaipur',
    website: 'https://brightfuture-demo.edu.in',
    contactName: 'Mrs. Suman Meena',
    email: 'admissions@brightfuture.edu.in',
    phone: '+91 94140 33445',
    source: 'WEBSITE',
    sourceDetail: 'school_landing_page',
    requirement: 'Lead Generation',
    timeline: 'Within 30 days',
    leadScore: 70,
    leadTemperature: 'WARM',
    qualificationStatus: 'QUALIFIED',
    growthStatus: 'CONTACTED',
    digitalPresenceScore: 52,
    painPoints: [
      'Admission inquiries down 25% year-over-year',
      'Website is not mobile friendly and has no online inquiry form',
      'Parents searching on Google cannot find admission criteria'
    ],
    opportunities: [
      'Build dedicated Admission 2026-27 Landing Page',
      'WhatsApp automated parent brochure download',
      'Local Google Search & Meta Ads campaign'
    ],
    recommendedServices: [
      'Website',
      'Lead Generation',
      'Google Business'
    ],
    outreachStatus: 'NOT_STARTED',
    notes: 'Principal interested in digital admission campaigns for primary wing.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const SEED_AUDITS: IAuditRecord[] = [
  {
    id: 'audit-001',
    businessName: 'Apex Dental Care & Implant Center',
    websiteUrl: 'https://apexdentalcare-sample.in',
    category: 'Clinic',
    city: 'Indore',
    phone: '+91 98260 12345',
    score: 65,
    grade: 'Needs Improvement',
    resultsJson: {
      score: 65,
      grade: 'Needs Improvement',
      checks: [
        { id: 'chk-accessibility', name: 'Website Live & Accessible', category: 'Technical', passed: true, score: 15, maxScore: 15, details: 'Website is active and responded in 410ms.', severity: 'GOOD' },
        { id: 'chk-https', name: 'SSL / HTTPS Security', category: 'Technical', passed: true, score: 10, maxScore: 10, details: 'Secure SSL certificate is active (https://).', severity: 'GOOD' },
        { id: 'chk-mobile', name: 'Mobile Viewport Optimization', category: 'Technical', passed: true, score: 15, maxScore: 15, details: 'Mobile viewport meta tag configured.', severity: 'GOOD' },
        { id: 'chk-title', name: 'Search Engine Title Tag', category: 'SEO', passed: true, score: 10, maxScore: 10, details: 'Title tag present.', severity: 'GOOD' },
        { id: 'chk-meta-desc', name: 'Search Snippet Description', category: 'SEO', passed: false, score: 0, maxScore: 10, details: 'Missing meta description tag.', severity: 'WARNING' },
        { id: 'chk-phone', name: 'Direct Call / Contact Link', category: 'Conversion', passed: true, score: 10, maxScore: 10, details: 'Phone number found.', severity: 'GOOD' },
        { id: 'chk-whatsapp', name: 'WhatsApp Chat Integration', category: 'Conversion', passed: false, score: 0, maxScore: 15, details: 'No WhatsApp direct chat button found.', severity: 'WARNING' },
        { id: 'chk-schema', name: 'Schema.org Structured Data', category: 'Local', passed: false, score: 0, maxScore: 15, details: 'Missing LocalBusiness schema.', severity: 'WARNING' },
      ],
      strengths: [
        'Online presence active with live website.',
        'Secure HTTPS connection builds customer trust.',
        'Mobile viewport optimization active.',
      ],
      issues: [
        'Missing search meta description — Google displays arbitrary page snippets.',
        'No WhatsApp chat button — Indian patients prefer inquiring via WhatsApp.',
        'Missing Schema.org structured data for Google Maps & Local search snippets.',
      ],
      opportunities: [
        'Add a floating WhatsApp chat widget with pre-filled inquiry messages.',
        'Implement LocalBusiness Schema markup with clinic timings and ratings.',
        'Add instant appointment booking directly from Google Search.',
      ],
      recommendedActions: [
        'Google Business Profile Setup & Local SEO',
        'WhatsApp Business Integration & Direct Chat Widget',
      ],
      metrics: {
        responseTimeMs: 410,
        isHttps: true,
        hasViewport: true,
      },
    },
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  }
];

export const SEED_RESTAURANTS: IQRRestaurant[] = [
  {
    id: 'rest-001',
    businessName: 'Royal Spice Family Restaurant',
    slug: 'royal-spice-jaipur',
    phone: '+91 98290 87654',
    city: 'Jaipur',
    logoUrl: '',
    isPublished: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const SEED_CATEGORIES: IQRCategory[] = [
  { id: 'cat-001-1', restaurantId: 'rest-001', name: 'Starters & Appetizers', sortOrder: 1, createdAt: new Date().toISOString() },
  { id: 'cat-001-2', restaurantId: 'rest-001', name: 'Main Course & Breads', sortOrder: 2, createdAt: new Date().toISOString() },
  { id: 'cat-001-3', restaurantId: 'rest-001', name: 'Beverages & Desserts', sortOrder: 3, createdAt: new Date().toISOString() },
];

export const SEED_MENU_ITEMS: IQRMenuItem[] = [
  {
    id: 'item-001-1',
    restaurantId: 'rest-001',
    categoryId: 'cat-001-1',
    name: 'Paneer Malai Tikka',
    description: 'Charcoal grilled cottage cheese marinated in rich cashew cream and cardamom.',
    price: 279,
    isAvailable: true,
    isVegetarian: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-001-2',
    restaurantId: 'rest-001',
    categoryId: 'cat-001-1',
    name: 'Crispy Corn Salt & Pepper',
    description: 'Sweet corn kernels tossed with crunchy spring onions, garlic, and cracked pepper.',
    price: 199,
    isAvailable: true,
    isVegetarian: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-001-3',
    restaurantId: 'rest-001',
    categoryId: 'cat-001-2',
    name: 'Dal Makhani Special',
    description: 'Our signature slow-cooked black lentils simmered overnight with fresh butter.',
    price: 299,
    isAvailable: true,
    isVegetarian: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-001-4',
    restaurantId: 'rest-001',
    categoryId: 'cat-001-2',
    name: 'Butter Naan',
    description: 'Tandoor-baked flatbread glazed with pure Amul butter.',
    price: 60,
    isAvailable: true,
    isVegetarian: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-001-5',
    restaurantId: 'rest-001',
    categoryId: 'cat-001-3',
    name: 'Royal Masala Chaas',
    description: 'Traditional spiced buttermilk with roasted jeera and mint leaves.',
    price: 79,
    isAvailable: true,
    isVegetarian: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-001-6',
    restaurantId: 'rest-001',
    categoryId: 'cat-001-3',
    name: 'Sizzling Brownie with Ice Cream',
    description: 'Warm chocolate fudge brownie topped with vanilla ice cream and hot chocolate sauce.',
    price: 169,
    isAvailable: true,
    isVegetarian: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  }
];

export const SEED_REFERRALS: IReferralRecord[] = [
  {
    id: 'ref-001',
    referralCode: 'PRIME10',
    referrerName: 'Param Sisodiya',
    referrerContact: 'param@primesoul.in',
    status: 'QUALIFIED',
    clicksCount: 28,
    leadsCount: 5,
    wonCount: 1,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ref-002',
    referralCode: 'JAIPUR20',
    referrerName: 'Karan Singh (Royal Spice)',
    referrerContact: '+91 98290 87654',
    status: 'LEAD',
    clicksCount: 12,
    leadsCount: 2,
    wonCount: 0,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const SEED_APPROVALS: IApprovalItem[] = [
  {
    id: 'appr-101',
    workflowInstanceId: 'wf-outbound-apex-1',
    stepId: 'step-outbound-craft',
    leadId: 'lead-001',
    agentId: 'outbound_sales',
    type: 'COLD_EMAIL',
    title: 'Touch 1 Cold Email: Apex Dental Care',
    summary: 'Signal-based cold outreach email addressing 4.1s mobile load speed and missing Google Maps 3-Pack rank.',
    draftContent: `Subject: quick note on your website speed & local map listing

Hi Dr. Rajesh,

Noticed Apex Dental Care is expanding services in Indore, but your mobile website is currently taking 4.1s to load on smartphones, which typically causes 40%+ of local patients to bounce back to Google.

At PrimeSoul Web Solutions, we help medical practices rank in the Google 3-Pack and load in under 1 second to capture high-intent inquiries.

Open to seeing a 2-minute video breakdown of how to fix this?

Best,  
PrimeSoul Web Solutions Team`,
    status: 'REVIEW',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
