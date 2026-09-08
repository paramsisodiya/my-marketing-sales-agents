import { ILead } from '../types/lead.types';
import { IApprovalItem } from '../types/approval.types';

export const SEED_LEADS: ILead[] = [
  {
    id: 'lead-001',
    businessName: 'Apex Dental Care & Implant Center',
    industry: 'Healthcare',
    location: 'Indore, MP, India',
    website: 'https://apexdentalcare-sample.in',
    contactName: 'Dr. Rajesh Sharma',
    email: 'dr.sharma@apexdentalcare.in',
    phone: '+91 98260 12345',
    socialProfiles: {
      instagram: 'instagram.com/apexdentalcare_indore',
      facebook: 'facebook.com/apexdentalcare',
    },
    source: 'Local Map Search Audit',
    leadScore: 82,
    qualificationStatus: 'QUALIFIED',
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
    meddpicc: {
      metrics: 'Increase monthly booked implants from 8 to 20',
      economicBuyer: 'Dr. Rajesh Sharma (Owner)',
      decisionCriteria: 'Load speed < 1.5s, top 3 local ranking within 60 days, fixed package pricing',
      decisionProcess: 'Initial proposal review -> Partner discussion -> Kickoff',
      paperProcess: 'Standard agreement, 50% advance',
      identifyPain: 'Estimated ₹1.5L lost monthly revenue from mobile bounce',
      champion: 'Clinic Manager (Pooja)',
      competition: 'Freelancer web designer + Status Quo',
      totalScore: 31,
    },
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-002',
    businessName: 'Vanguard Realty & Luxury Estates',
    industry: 'Real Estate',
    location: 'Mumbai, MH, India',
    website: 'https://vanguardrealty-demo.com',
    contactName: 'Vikramaditya Mehta',
    email: 'vikram@vanguardrealty.com',
    phone: '+91 98200 54321',
    socialProfiles: {
      linkedin: 'linkedin.com/company/vanguard-realty-mumbai',
      instagram: 'instagram.com/vanguard_realty',
    },
    source: 'LinkedIn Executive Signal',
    leadScore: 91,
    qualificationStatus: 'QUALIFIED',
    digitalPresenceScore: 58,
    painPoints: [
      'Property portfolio page is heavy with uncompressed images (LCP 5.8s)',
      'High bounce rate on Meta Ads lead forms',
      'Manual follow-ups in Excel spreadsheets leading to delayed lead contact'
    ],
    opportunities: [
      'Deploy PrimeOMS SaaS for automated lead routing and pipeline stages',
      'High-converting landing page with interactive 3D floorplan preview',
      'Google Search Ads for luxury high-intent buyers'
    ],
    recommendedServices: [
      'Landing Pages',
      'Google Ads',
      'Meta Ads',
      'PrimeOMS SaaS Implementation'
    ],
    outreachStatus: 'IN_PROGRESS',
    lastContacted: new Date(Date.now() - 1 * 86400000).toISOString(),
    nextFollowUp: new Date(Date.now() + 2 * 86400000).toISOString(),
    notes: 'Managing Director interested in improving CPL and integrating CRM pipeline automation.',
    meddpicc: {
      metrics: 'Cut cost-per-qualified-buyer-lead by 35%',
      economicBuyer: 'Vikramaditya Mehta (Managing Director)',
      decisionCriteria: 'Proven real estate conversion architecture, fast deployment (<3 weeks)',
      decisionProcess: 'Demo presentation -> Board signoff',
      paperProcess: 'Corporate PO and vendor NDA',
      identifyPain: 'High ad spend leakage with zero lead attribution',
      champion: 'VP Sales (Rohit Verma)',
      competition: 'In-house marketing team trying to code internally',
      totalScore: 35,
    },
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-003',
    businessName: 'Aura Organic Skincare & Wellness',
    industry: 'E-Commerce',
    location: 'Bangalore, KA, India',
    website: 'https://auraorganics-test.store',
    contactName: 'Ananya Sen',
    email: 'ananya@auraorganics.in',
    phone: '+91 99000 88776',
    socialProfiles: {
      instagram: 'instagram.com/aura_organics_in',
    },
    source: 'Meta Ad Teardown Research',
    leadScore: 74,
    qualificationStatus: 'RESEARCHED',
    digitalPresenceScore: 50,
    painPoints: [
      'Shopify storefront checkout drop-off rate is 68%',
      'Organic SEO traffic is stagnant due to keyword cannibalization on product categories',
      'No automated WhatsApp cart recovery flows'
    ],
    opportunities: [
      'Conversion Rate Optimization (CRO) on product detail pages',
      'Topic cluster SEO revamp for organic non-branded search',
      'Automated WhatsApp recovery sequences'
    ],
    recommendedServices: [
      'Website Design & Development',
      'SEO',
      'WhatsApp Business Setup'
    ],
    outreachStatus: 'NOT_STARTED',
    notes: 'D2C founder scaling SKUs, needs organic search and CRO help.',
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
  },
  {
    id: 'appr-102',
    workflowInstanceId: 'wf-proposal-vanguard-2',
    stepId: 'step-proposal-draft',
    leadId: 'lead-002',
    agentId: 'proposal',
    type: 'PROPOSAL',
    title: 'Client Proposal: Vanguard Realty Digital Growth & PrimeOMS Suite',
    summary: '3-Act Proposal for luxury real estate lead generation, high-speed landing pages, and PrimeOMS CRM deployment.',
    draftContent: `### PrimeSoul Proposal: Vanguard Realty Digital Growth Transformation

#### Act I: Understanding the Challenge
Vanguard Realty manages high-ticket luxury listings in Mumbai. However, heavy imagery (5.8s load time) and Excel-based lead tracking are causing lead response latency and high ad spend leakage.

#### Act II: The Solution Journey
1. **High-Speed Luxury Landing Pages**: Sub-second property pages with mobile WhatsApp CTAs.
2. **Targeted Google Search & Meta Performance Ads**: Capturing high-intent property investors.
3. **PrimeOMS Platform Deployment**: Automated lead routing, agent assignment, and pipeline stages.

#### Act III: Investment & Roadmap
- **Estimated Tier**: Full Growth & SaaS Suite [Estimated Range: ₹75,000 - ₹1,20,000 / $1,500 - $2,400]
- **Deployment Timeline**: 3 Weeks from kickoff.`,
    status: 'REVIEW',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
