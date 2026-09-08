import { ILlmOptions, ILlmProvider } from './provider.interface';
import { TemplateEngine } from '../utils/template.engine';

export class MockProvider implements ILlmProvider {
  public name = 'mock';

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async generate(prompt: string, systemPrompt?: string, options?: ILlmOptions): Promise<string> {
    const s = systemPrompt || '';
    const ctx = this.extractContextFromPrompt(prompt);

    // Dynamic prospect facts derived from context
    const businessName = ctx.business_name || ctx.title || 'your business';
    const hasExplicitBusinessName = ctx.business_name && ctx.business_name !== 'UNKNOWN';
    const contactName = ctx.contact_name && ctx.contact_name !== 'UNKNOWN' ? ctx.contact_name : '';
    const location = ctx.location && ctx.location !== 'UNKNOWN' ? ctx.location : 'your local market';
    const industry = ctx.industry && ctx.industry !== 'UNKNOWN' ? ctx.industry : 'business';
    const website = ctx.website || ctx.url || 'your website';
    
    // Dynamic Performance Metric
    const responseTimeMs = ctx.response_time_ms ? Number(ctx.response_time_ms) : (ctx.load_time_ms ? Number(ctx.load_time_ms) : null);
    const measuredTimeText = responseTimeMs ? `${responseTimeMs}ms` : 'under 2.0s';
    const hasMeasuredSpeed = responseTimeMs !== null;

    // Client/Customer terminology based on industry
    let clientTerm = 'clients';
    let entityTerm = 'business';
    if (/dental|clinic|doctor|hospital|health|physio/i.test(industry)) {
      clientTerm = 'patients';
      entityTerm = 'practice';
    } else if (/law|legal|attorney|advocate/i.test(industry)) {
      clientTerm = 'clients';
      entityTerm = 'firm';
    } else if (/real\s*estate|property|realt/i.test(industry)) {
      clientTerm = 'buyers & sellers';
      entityTerm = 'agency';
    }

    // Dynamic Observable Gap Trigger
    let observableGapTrigger = 'missing Schema.org LocalBusiness structured markup and direct WhatsApp appointment triggers';
    if (ctx.identified_gaps && Array.isArray(ctx.identified_gaps) && ctx.identified_gaps.length > 0) {
      observableGapTrigger = ctx.identified_gaps.slice(0, 2).join(' and ');
    }

    // 1. Outbound Sales Agent
    if (s.includes('CURRENT_AGENT_ID: outbound_sales')) {
      const greeting = contactName ? `Hi ${contactName},` : `Hi ${hasExplicitBusinessName ? businessName + ' Team' : 'there'},`;
      
      const speedLine = hasMeasuredSpeed
        ? `We conducted a technical scan of ${website} (server response time: ${measuredTimeText}).`
        : `We conducted a digital presence scan for ${businessName}.`;

      const draft = {
        summary: `Crafted signal-based 3-touch outreach sequence anchored in verified technical gaps for ${businessName}.`,
        content: `### Touch 1 (Day 1 - Email)
Subject: quick observation on ${businessName} digital presence

${greeting}

${speedLine} We identified key opportunities for growth: specifically ${observableGapTrigger}.

According to Google mobile web performance research, local mobile visitors leave unoptimized pages within seconds, directing high-intent local ${clientTerm} to nearby competitors in ${location}.

At PrimeSoul, we engineer high-performance web platforms and Google 3-Pack local ranking architectures to capture qualified inquiries.

Open to seeing a 2-minute diagnostic breakdown of these opportunities for ${businessName}?

Best,  
PrimeSoul Web Solutions Team

---
### Touch 2 (Day 4 - WhatsApp Follow-Up)
${greeting} Following up on my note regarding ${businessName}'s search visibility in ${location}. We mapped 3 concrete optimizations for your local ranking. Worth a brief 5-minute conversation this week?

---
### Touch 3 (Day 8 - Breakup Email)
Subject: closing the loop / ${businessName}

${greeting} I assume upgrading ${businessName}'s digital infrastructure is not a current priority. If timing changes down the road and you want to scale local ${clientTerm} intake in ${location}, feel free to reach back out.`,
        facts: [
          `Outreach references verified target domain: ${website}`,
          hasMeasuredSpeed ? `Referenced measured server response time (${measuredTimeText})` : 'Mobile Core Web Vitals marked as unmeasured / field audit required',
          `Referenced observable gaps: ${observableGapTrigger}`,
          "Subject line complies with 3-5 word lowercase standard"
        ],
        assumptions: [
          `Target audience in ${location} values instant WhatsApp response and mobile speed`,
          "Google industry research benchmark (40%+ bounce on unoptimized pages) applies to local search traffic"
        ],
        recommendations: [
          "Submit Touch 1 to Human Review before dispatching",
          contactName ? `Personalized to confirmed contact: ${contactName}` : "Notice: Contact name is UNKNOWN; using neutral greeting"
        ],
        unknowns: [
          contactName ? "Preferred communication channel of economic buyer" : "Economic buyer / contact person name is UNKNOWN",
          "Current monthly organic search visitor count (requires Google Search Console access)"
        ],
        requiresApproval: true
      };

      return JSON.stringify(draft);
    }

    // 2. Deal Strategist Agent (MEDDPICC)
    if (s.includes('CURRENT_AGENT_ID: deal_strategist')) {
      const economicBuyerName = contactName || '[UNKNOWN: Decision Maker to be identified in discovery]';

      const draft = {
        summary: `Completed 8-point MEDDPICC qualification assessment for ${businessName}.`,
        content: `### MEDDPICC Opportunity Assessment: ${businessName}
- **Metrics (4/5)**: [TARGET] Increase qualified monthly ${clientTerm} inquiries by 30-50% within 90 days.
- **Economic Buyer (${contactName ? '4/5' : '2/5'})**: ${economicBuyerName}.
- **Decision Criteria (4/5)**: [SPECIFICATION] Sub-second mobile load time, Google 3-Pack rank proof, fixed milestone pricing.
- **Decision Process (3/5)**: Discovery review -> Proposal presentation -> Milestone agreement sign-off.
- **Paper Process (3/5)**: Standard PrimeSoul service agreement + 50% advance invoice terms.
- **Identify Pain (4/5)**: [OBSERVED GAPS] ${observableGapTrigger}.
- **Champion (3/5)**: Operational / Marketing lead advocating for digital modernization.
- **Competition (4/5)**: Generic local freelancers vs in-house status quo.

**Deal Positioning**: BATTLING — Strong win probability when proposal demonstrates verified technical gaps and transparent PrimeSoul SLAs.`,
        facts: [
          `Evaluated MEDDPICC criteria for target: ${businessName}`,
          `Identified observable technical pain points: ${observableGapTrigger}`
        ],
        assumptions: [
          `Competitors in ${location} compete primarily on price without engineering performance guarantees`
        ],
        recommendations: [
          "Anchor proposal firmly on PrimeSoul engineering standards and post-launch maintenance SLA",
          `Confirm Economic Buyer sign-off criteria during discovery call`
        ],
        unknowns: [
          contactName ? "Exact internal budget authorization milestones" : "Identity of the Economic Buyer is UNKNOWN",
          "Current monthly digital marketing ad spend if any"
        ],
        requiresApproval: false
      };

      return JSON.stringify(draft);
    }

    // 3. Discovery Agent (SPIN & Gap Selling)
    if (s.includes('CURRENT_AGENT_ID: discovery')) {
      const contactGreeting = contactName ? contactName : 'there';

      const draft = {
        summary: `Prepared customized SPIN & Gap discovery call blueprint for ${businessName}.`,
        content: `### Discovery Call Architecture (30-Min Blueprint): ${businessName}

#### 1. Upfront Contract (First 2 Mins)
"Thanks for connecting today, ${contactGreeting}. In our 30 minutes, I want to understand how ${businessName} currently handles digital intake in ${location}, and examine the technical bottlenecks on ${website}. At the end, we will determine if there is a strong fit to partner or agree it is not the right timing — both outcomes are completely fine. Does that sound fair?"

#### 2. SPIN Diagnostic Sequence
- **Situation**: "How do prospective ${clientTerm} currently find and contact ${businessName} online in ${location}?"
- **Problem**: "We observed that ${website} is currently ${observableGapTrigger}. Where do you notice inquiries dropping off before reaching your team?"
- **Implication**: "When high-intent local ${clientTerm} visit on mobile and cannot instantly connect via WhatsApp or find structured local details, what does losing those inquiries cost ${businessName} in monthly revenue?"
- **Need-Payoff**: "If your platform loaded instantly and converted 15-25 additional qualified inquiries each month directly into your team, what impact would that have on your growth?"

#### 3. Gap Mapping
- **Current State**: ${observableGapTrigger}, unverified local map ranking.
- **Future State**: [TARGET] Sub-second mobile response time, top 3 local Google rank, automated WhatsApp intake.
- **The Gap**: Modern, high-performance digital infrastructure.`,
        facts: [
          "Structured using Neil Rackham's SPIN model and Keenan's Gap Selling methodology",
          `Personalized to verified prospect domain: ${website}`
        ],
        assumptions: [
          `Decision maker at ${businessName} is willing to quantify the revenue impact of lost digital inquiries`
        ],
        recommendations: [
          "Maintain a 60/40 listen-to-talk ratio during discovery",
          "Anchor implication questions on lost revenue rather than technical jargon"
        ],
        unknowns: [
          contactName ? "Additional members of the decision-making committee" : "Confirmed identity of primary contact person is UNKNOWN",
          "Current monthly client acquisition cost (CAC)"
        ],
        requiresApproval: false
      };

      return JSON.stringify(draft);
    }

    // 4. Proposal Agent (3-Act Narrative)
    if (s.includes('CURRENT_AGENT_ID: proposal')) {
      const draft = {
        summary: `Architected 3-Act Persuasion Proposal blueprint for ${businessName}.`,
        content: `### PrimeSoul Proposal: Digital Infrastructure & Growth Transformation
**Client**: ${businessName}  
**Target Market**: ${location}  
**Prepared By**: PrimeSoul Web Solutions

#### Act I: Understanding the Challenge
${businessName} has established operations in ${location}, but your current digital presence on ${website} exhibits critical friction points: specifically ${observableGapTrigger}. High-intent local ${clientTerm} searching for your services encounter friction before reaching your intake team.

#### Act II: The Solution Journey
1. **High-Performance Web Platform**: Custom responsive architecture with SSL, clean semantic HTML, and Core Web Vitals optimization.
2. **Google Business Profile & Local SEO Sprint**: Full optimization, 50+ local citations in ${location}, and automated review capture.
3. **Instant WhatsApp Intake Routing**: Direct lead routing connecting high-intent visitors directly into your intake staff.

#### Act III: Transformed State & Investment
- **[DELIVERABLE SLA TARGETS]**:
  - Target Mobile Speed: <1.5s initial response time.
  - Conversion Architecture: Direct WhatsApp intake routing.
  - Search Visibility: Local 3-Pack optimization sprint.
- **Investment Tier**: **Standard Transformation Package [₹35,000 - ₹55,000 / $700 - $1,100]** (Strictly adhering to PrimeSoul published pricing guidelines).
- **Project Timeline**: 3-4 Weeks from kickoff to production deployment.`,
        facts: [
          "Follows 3-Act narrative architecture (Understanding -> Solution Journey -> Transformed State)",
          "Pricing strictly grounded in PrimeSoul published pricing guidelines (knowledge/pricing.md)",
          `Grounded in verified observable gaps: ${observableGapTrigger}`
        ],
        assumptions: [
          `Client has core branding assets ready for the development sprint`
        ],
        recommendations: [
          "Route proposal through Human Approval before dispatching to client",
          "Follow up within 48 hours of client receiving the proposal"
        ],
        unknowns: [
          "Any third-party custom API integrations required beyond standard web/WhatsApp"
        ],
        requiresApproval: true
      };

      return JSON.stringify(draft);
    }

    // 5. Growth Strategist Agent
    if (s.includes('CURRENT_AGENT_ID: growth_strategist')) {
      const draft = {
        summary: `Engineered Grand Slam offer and diagnostic lead magnet blueprint for ${businessName}.`,
        content: `### Growth Offer & Lead Magnet Blueprint: ${businessName}

#### 1. Hormozi Value Equation Architecture
- **Dream Outcome**: Top 3 Google Local Rank in ${location} + 25+ new qualified ${clientTerm} monthly.
- **Perceived Likelihood**: 100% transparent technical audit + verified PrimeSoul case studies in ${industry}.
- **Time Delay (Minimized)**: 21-Day rapid sprint delivery.
- **Effort & Sacrifice (Minimized)**: 100% Done-For-You technical development & WhatsApp routing.

#### 2. Diagnostic Lead Magnet: 'Local Digital Health & Speed Scorecard'
- **Type**: Solve a Problem (Diagnostic Tool).
- **Core Promise**: Instant breakdown of technical bottlenecks and local search ranking gaps in ${location}.
- **Capture Hook**: Direct contact to receive customized action report.`,
        facts: [
          "Applied Alex Hormozi Value Equation framework",
          `Tailored to industry sector: ${industry}`
        ],
        assumptions: [
          `Prospects in ${industry} respond highest to objective diagnostic scorecards`
        ],
        recommendations: [
          "Promote lead magnet via organic LinkedIn case studies and Instagram carousels"
        ],
        unknowns: [
          "Allocated monthly ad budget for paid traffic amplification"
        ],
        requiresApproval: false
      };

      return JSON.stringify(draft);
    }

    // 6. Content & Social Agent
    if (s.includes('CURRENT_AGENT_ID: content_social')) {
      const draft = {
        summary: `Created platform-specific content package for ${businessName} (${industry}).`,
        content: `### Multi-Platform Content Suite: ${businessName}

#### 1. LinkedIn Thought Leadership Post
**Hook**: 80% of local ${industry} websites lose prospective ${clientTerm} within the first 3 seconds. Here is why technical performance equals revenue:

When your mobile site takes seconds to respond or lacks local search schema:
1. Mobile visitors bounce back to search results.
2. Search engines demote your local map ranking.
3. Your acquisition cost per lead doubles.

At PrimeSoul Web Solutions, we engineer platforms built for sub-second speed and conversion capture.

---
#### 2. Instagram Carousel Slide Outline
- Slide 1: Is your ${industry} website secretly losing ${clientTerm}? (Swipe ➡️)
- Slide 2: The Speed Rule: Why attention drops when pages hesitate.
- Slide 3: Google 3-Pack: Why local map rankings drive 70% of inbound calls.
- Slide 4: WhatsApp Automation: Turn passive visitors into instant chats.
- Slide 5: Ready to upgrade? DM 'AUDIT' for a free technical scorecard.`,
        facts: [
          "Adheres to PrimeSoul Brand Voice standards (clear, confident, outcome-driven)",
          "Provides distinct formats for B2B LinkedIn and visual Instagram"
        ],
        assumptions: [
          `Target audience in ${industry} browses primarily on mobile devices`
        ],
        recommendations: [
          "Queue posts for human approval before scheduling in social scheduler"
        ],
        unknowns: [
          "Exact client brand typography and primary HEX color codes"
        ],
        requiresApproval: true
      };

      return JSON.stringify(draft);
    }

    // 7. SEO / Local SEO Agent
    if (s.includes('CURRENT_AGENT_ID: seo_local')) {
      const draft = {
        summary: `Formulated technical SEO audit and local 3-pack roadmap for ${businessName}.`,
        content: `### Technical & Local SEO Audit: ${businessName}
1. **Technical Foundation**:
   - Resolve identified gaps on ${website}: ${observableGapTrigger}.
   - Deploy Schema.org LocalBusiness JSON-LD markup with geo-coordinates in ${location}.
   - Configure canonical tags and mobile viewport directives.

2. **Google Business Profile 3-Pack Roadmap**:
   - Claim and verify primary category for ${industry} in ${location}.
   - Upload 15+ high-res, geo-tagged workplace photos.
   - Implement review generation and weekly update cadence.

3. **Keyword Topic Cluster**:
   - Pillar Page: \`[Primary Service] in ${location}\` (Transactional Intent).
   - Satellite 1: \`Best [Service] costs & options in ${location}\` (Commercial Intent).
   - Satellite 2: \`When to consult a [Specialist]\` (Informational Intent).`,
        facts: [
          `Target domain: ${website}`,
          `Identified on-page gaps: ${observableGapTrigger}`
        ],
        assumptions: [
          `Local search volume in ${location} has commercial purchase intent`
        ],
        recommendations: [
          "Complete pre-GSC cannibalization check before launching local landing pages",
          "Ensure NAP (Name, Address, Phone) consistency across local directories"
        ],
        unknowns: [
          "Google Search Console verified indexation status"
        ],
        requiresApproval: false
      };

      return JSON.stringify(draft);
    }

    // 8. Lead Researcher
    if (s.includes('CURRENT_AGENT_ID: lead_researcher')) {
      const measuredFact = hasMeasuredSpeed
        ? `Measured initial server response time: ${measuredTimeText}`
        : 'Initial response time unmeasured / field audit required';

      const draft = {
        summary: `Analyzed digital presence for ${businessName}. Verified technical infrastructure and local visibility signals.`,
        content: `### Digital Presence Analysis Report: ${businessName}
- **Website Audit**: Scanned ${website}. ${measuredFact}.
- **Observed Gaps**: ${observableGapTrigger}.
- **Local Visibility**: Local presence in ${location} requires Google Business Profile verification and LocalBusiness JSON-LD schema.`,
        facts: [
          `Target website: ${website}`,
          measuredFact,
          `Identified gaps: ${observableGapTrigger}`
        ],
        assumptions: [
          `Unoptimized local metadata in ${location} reduces search discovery compared to optimized competitors`
        ],
        recommendations: [
          "Implement Schema.org LocalBusiness JSON-LD markup",
          "Deploy direct WhatsApp conversion capture widget",
          "Conduct technical Core Web Vitals optimization sprint"
        ],
        unknowns: [
          "Exact monthly organic search visitor count (requires Google Search Console access)",
          "Active advertising spend budget if any"
        ],
        requiresApproval: false
      };

      return JSON.stringify(draft);
    }

    // 9. PrimeSoul Manager Default
    const defaultPlan = {
      summary: `PrimeSoul Manager analyzed objective for ${businessName}, decomposed tasks, and routed specialist agents.`,
      content: `### PrimeSoul Manager Execution Plan: ${businessName}
1. **Task Intent**: Decomposed business objective across sales and marketing divisions.
2. **Agent Routing**: Orchestrated research, strategy, and deliverable creation.
3. **Quality & Provenance Gate**: Verified zero-hallucination compliance against PrimeSoul knowledge base.
4. **Outcome**: Deliverables synthesized with explicit Fact / Inference / Recommendation separation.`,
      facts: ["Task structured into multi-agent execution graph"],
      assumptions: ["Standard PrimeSoul service frameworks apply"],
      recommendations: ["Proceed to human approval review for external communication deliverables"],
      unknowns: ["Any unstated client-specific technical constraints"],
      requiresApproval: false
    };

    return JSON.stringify(defaultPlan);
  }

  public async generateStructured<T>(prompt: string, systemPrompt?: string, options?: ILlmOptions): Promise<T> {
    const raw = await this.generate(prompt, systemPrompt, { ...options, jsonMode: true });
    try {
      return JSON.parse(raw) as T;
    } catch {
      return {
        summary: "Processed request",
        content: raw,
        facts: [],
        assumptions: [],
        recommendations: [],
        unknowns: [],
        requiresApproval: false
      } as unknown as T;
    }
  }

  /**
   * Extracts contextual prospect variables and live analysis metrics from the user prompt.
   */
  private extractContextFromPrompt(prompt: string): Record<string, any> {
    const ctx: Record<string, any> = {
      business_name: '',
      contact_name: '',
      website: '',
      location: '',
      industry: '',
      title: '',
      response_time_ms: null,
      load_time_ms: null,
      identified_gaps: [],
    };

    // 1. Extract XML tag contents (from PromptBoundaryService.wrapUntrustedData)
    const xmlMatches = prompt.match(/<untrusted_external_data[^>]*>([\s\S]*?)<\/untrusted_external_data>/g);
    if (xmlMatches) {
      for (const xml of xmlMatches) {
        const inner = xml.replace(/<untrusted_external_data[^>]*>/, '').replace(/<\/untrusted_external_data>/, '').trim();
        try {
          const parsed = JSON.parse(inner);
          this.populateCtxFromObject(ctx, parsed);
        } catch {
          // not valid JSON
        }
      }
    }

    // 2. Regex fallback for explicit key-value patterns
    const bizMatch = prompt.match(/"businessName"\s*:\s*"([^"]+)"/i) ||
      prompt.match(/"business_name"\s*:\s*"([^"]+)"/i) ||
      prompt.match(/Target Lead:\s*([^\n\r(]+)/i) ||
      prompt.match(/(?:call with|audit for|plan for|proposal for|review for)\s+([A-Z][A-Za-z0-9\s&.'-]+?)(?:\s+in|\s+team|\s*\n|\s*\.|\s*\(|$)/i);
    if (bizMatch && !ctx.business_name && bizMatch[1].trim() !== 'UNKNOWN') {
      ctx.business_name = bizMatch[1].trim();
    }

    const contactMatch = prompt.match(/"contactName"\s*:\s*"([^"]+)"/i) ||
      prompt.match(/"contact_name"\s*:\s*"([^"]+)"/i) ||
      prompt.match(/Contact Person:\s*([^\n\r]+)/i);
    if (contactMatch && !ctx.contact_name && contactMatch[1].trim() !== 'UNKNOWN') {
      ctx.contact_name = contactMatch[1].trim();
    }

    const locationMatch = prompt.match(/"location"\s*:\s*"([^"]+)"/i) ||
      prompt.match(/Location:\s*([^\n\r]+)/i);
    if (locationMatch && !ctx.location && locationMatch[1].trim() !== 'UNKNOWN') {
      ctx.location = locationMatch[1].trim();
    }

    const industryMatch = prompt.match(/"industry"\s*:\s*"([^"]+)"/i) ||
      prompt.match(/Industry:\s*([^\n\r]+)/i);
    if (industryMatch && !ctx.industry && industryMatch[1].trim() !== 'UNKNOWN') {
      ctx.industry = industryMatch[1].trim();
    }

    const websiteMatch = prompt.match(/https?:\/\/[^\s"'><\)\],]+/i);
    if (websiteMatch && !ctx.website) {
      ctx.website = websiteMatch[0];
    }

    const responseTimeMatch = prompt.match(/(?:responseTimeMs|response_time_ms|Response Time|response time)[\s":=]+(\d+)/i) ||
      prompt.match(/(\d+)\s*ms/i);
    if (responseTimeMatch && ctx.response_time_ms === null) {
      ctx.response_time_ms = Number(responseTimeMatch[1]);
    }

    return ctx;
  }

  private populateCtxFromObject(ctx: Record<string, any>, obj: any): void {
    if (!obj || typeof obj !== 'object') return;

    if (obj.businessName && obj.businessName !== 'UNKNOWN') ctx.business_name = obj.businessName;
    if (obj.business_name && obj.business_name !== 'UNKNOWN') ctx.business_name = obj.business_name;
    if (obj.contactName && obj.contactName !== 'UNKNOWN') ctx.contact_name = obj.contactName;
    if (obj.contact_name && obj.contact_name !== 'UNKNOWN') ctx.contact_name = obj.contact_name;
    if (obj.website) ctx.website = obj.website;
    if (obj.url) ctx.website = obj.url;
    if (obj.location && obj.location !== 'UNKNOWN') ctx.location = obj.location;
    if (obj.industry && obj.industry !== 'UNKNOWN') ctx.industry = obj.industry;

    if (obj.measured?.responseTimeMs) ctx.response_time_ms = obj.measured.responseTimeMs;
    if (obj.responseTimeMs) ctx.response_time_ms = obj.responseTimeMs;
    if (obj.loadTimeMs) ctx.load_time_ms = obj.loadTimeMs;
    if (obj.detected?.title) ctx.title = obj.detected.title;
    if (obj.inferred?.identifiedGaps && Array.isArray(obj.inferred.identifiedGaps)) ctx.identified_gaps = obj.inferred.identifiedGaps;
    if (obj.identifiedGaps && Array.isArray(obj.identifiedGaps)) ctx.identified_gaps = obj.identifiedGaps;
    if (obj.painPoints && Array.isArray(obj.painPoints)) ctx.identified_gaps = obj.painPoints;

    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.populateCtxFromObject(ctx, obj[key]);
      }
    }
  }
}
