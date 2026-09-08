import { IWorkflowDefinition } from '../types/workflow.types';

export const WORKFLOW_DEFINITIONS: IWorkflowDefinition[] = [
  {
    id: 'lead-to-outreach',
    name: 'Lead Research & Signal-Based Outreach',
    category: 'sales',
    description: 'Audits business website and digital presence, extracts pain points, and drafts a personalized 3-touch cold sequence with Human Approval.',
    icon: 'MailCheck',
    steps: [
      {
        id: 'step-research',
        name: 'Digital Presence & Technical Audit',
        agentId: 'lead_researcher',
        objective: 'Analyze target company website, mobile Core Web Vitals, and local Google Business Profile visibility gaps.',
      },
      {
        id: 'step-outreach',
        name: 'Craft Signal-Based Outreach Sequence',
        agentId: 'outbound_sales',
        objective: 'Draft a 3-touch Email & WhatsApp sequence anchored in detected website speed and local map ranking gaps.',
        requiresHumanApproval: true,
        approvalType: 'COLD_EMAIL',
        transformInput: (prevOutputs, context) => ({
          ...context,
          researchFindings: prevOutputs['step-research']?.content,
          detectedFacts: prevOutputs['step-research']?.facts,
        }),
      }
    ]
  },
  {
    id: 'discovery-to-deal',
    name: 'Discovery Call Prep & MEDDPICC Deal Strategy',
    category: 'sales',
    description: 'Prepares 30-min SPIN/Gap call structure, then assesses MEDDPICC qualification score and competitive positioning.',
    icon: 'ShieldCheck',
    steps: [
      {
        id: 'step-discovery-prep',
        name: 'Discovery Call & Question Architecture',
        agentId: 'discovery',
        objective: 'Generate customized SPIN and Gap Selling questions with upfront contract and AECR objection handling.',
      },
      {
        id: 'step-deal-scoring',
        name: 'MEDDPICC Qualification & Win Plan',
        agentId: 'deal_strategist',
        objective: 'Score opportunity against 8 MEDDPICC dimensions, map competitive positioning, and generate a win plan.',
        transformInput: (prevOutputs, context) => ({
          ...context,
          discoveryData: prevOutputs['step-discovery-prep']?.content,
        }),
      }
    ]
  },
  {
    id: 'deal-to-proposal',
    name: '3-Act Proposal Engineering',
    category: 'sales',
    description: 'Synthesizes lead pain points and deal criteria into a compelling 3-Act Persuasion Proposal and Win Theme matrix with Human Approval.',
    icon: 'FileText',
    steps: [
      {
        id: 'step-research-brief',
        name: 'Opportunity & Scope Synthesis',
        agentId: 'lead_researcher',
        objective: 'Compile comprehensive scope of required PrimeSoul services and quantified business bottlenecks.',
      },
      {
        id: 'step-proposal-craft',
        name: '3-Act Narrative Proposal Drafting',
        agentId: 'proposal',
        objective: 'Draft 3-Act Proposal (Understanding -> Solution Journey -> Transformed State) with Win Theme matrix and pricing tiers.',
        requiresHumanApproval: true,
        approvalType: 'PROPOSAL',
        transformInput: (prevOutputs, context) => ({
          ...context,
          researchScope: prevOutputs['step-research-brief']?.content,
        }),
      }
    ]
  },
  {
    id: 'seo-audit-pipeline',
    name: 'Technical SEO & Local 3-Pack Audit',
    category: 'seo',
    description: 'Performs technical Core Web Vitals audit, Google Business Profile evaluation, topic clustering, and pre-GSC cannibalization checks.',
    icon: 'Compass',
    steps: [
      {
        id: 'step-tech-crawl',
        name: 'Technical Health & Core Web Vitals Crawl',
        agentId: 'lead_researcher',
        objective: 'Audit crawlability, indexation, mobile LCP, and Schema.org LocalBusiness markup.',
      },
      {
        id: 'step-seo-strategy',
        name: 'SEO Roadmap & Topic Cluster Design',
        agentId: 'seo_local',
        objective: 'Formulate Google Business Profile sprint, 3-tier keyword cluster, and pre-GSC cannibalization map.',
        transformInput: (prevOutputs, context) => ({
          ...context,
          crawlMetrics: prevOutputs['step-tech-crawl']?.content,
        }),
      }
    ]
  },
  {
    id: 'content-campaign-pipeline',
    name: 'Growth Offer & Multi-Platform Content Suite',
    category: 'marketing',
    description: 'Applies Hormozi Value Equation to design a high-value lead magnet and generates matching LinkedIn and Instagram content with Human Approval.',
    icon: 'TrendingUp',
    steps: [
      {
        id: 'step-offer-design',
        name: 'Value Equation & Lead Magnet Blueprint',
        agentId: 'growth_strategist',
        objective: 'Design a grand-slam offer and diagnostic lead magnet (Solve / Educate / Sample).',
      },
      {
        id: 'step-content-creation',
        name: 'Multi-Platform Post Creation',
        agentId: 'content_social',
        objective: 'Draft LinkedIn thought leadership post and Instagram carousel outline promoting the lead magnet.',
        requiresHumanApproval: true,
        approvalType: 'SOCIAL_POST',
        transformInput: (prevOutputs, context) => ({
          ...context,
          offerBlueprint: prevOutputs['step-offer-design']?.content,
        }),
      }
    ]
  }
];
