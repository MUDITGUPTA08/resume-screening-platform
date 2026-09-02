import { JobOpening, JobApplication } from '../types';

export const INITIAL_JOB_OPENINGS: JobOpening[] = [
  {
    id: 'jd-opening-a',
    title: 'Founders Office Associate',
    company: 'Satva Partners',
    department: 'Strategy & Operations',
    location: 'Bengaluru, India (Hybrid)',
    createdAt: '2026-08-20T09:00:00Z',
    description: `About Satva Partners:
Satva Partners is an early-stage venture investment firm and strategic growth partner working with high-potential tech-enabled businesses across South and Southeast Asia. We partner deeply with founders to accelerate 0-to-1 and 1-to-10 scale.

The Role:
We are seeking an ambitious, relentless, and structured Founders Office Associate to work shoulder-to-shoulder with our Managing Partners and portfolio leadership. This is a high-visibility, cross-functional role bridging corporate strategy, investment analysis, executive operations, and special strategic initiatives.

Key Responsibilities:
• Lead strategic initiatives and cross-functional special projects directly with the founding partners.
• Conduct market research, competitive benchmarking, financial modeling, and thesis-driven investment memos.
• Monitor portfolio company performance metrics, preparing monthly investor updates and board presentations.
• Drive executive communication, preparing briefing documents, agendas, and synthesis of high-stakes stakeholder meetings.
• Act as a force multiplier for the leadership team — resolving operational bottlenecks, driving follow-through, and ensuring flawless execution.

What We Look For:
• 2–4 years of high-caliber experience in investment banking, top-tier management consulting, venture capital, or a high-growth Series A-C tech startup.
• Exceptional structured thinking, problem-solving, and analytical capabilities (financial modeling, cohort analysis, quantitative reasoning).
• Stellar written and verbal communication — ability to translate complex data into clear, crisp executive memos.
• Extreme ownership mindset, comfort with ambiguity, and high emotional intelligence to influence cross-functional peers.
• Undergraduate degree from a premier institution in Business, Economics, Engineering, or related fields.`,
  },
  {
    id: 'jd-opening-b',
    title: 'Content & Communities Lead',
    company: 'House of Ved',
    department: 'Marketing & Brand Community',
    location: 'Mumbai, India (In-Office / Flexible)',
    createdAt: '2026-08-22T10:30:00Z',
    description: `About House of Ved:
House of Ved is a fast-growing contemporary wellness and consumer brand blending ancient botanical science with clean, modern rituals. We create elevated everyday wellness experiences for conscious urban consumers.

The Role:
We are looking for a creative, culturally attuned, and metrics-driven Content & Communities Lead to champion our brand voice, build engaged micro-communities, and run high-converting social and content campaigns. You will own the narrative across all customer touchpoints.

Key Responsibilities:
• Build and execute an end-to-end content and community roadmap across Instagram, YouTube, Substack, and private community channels (WhatsApp VIPs & Discord).
• Spearhead authentic user-generated content (UGC), founder storytelling, creator partnerships, and ambassador activations.
• Host both digital workshops and offline brand community gatherings to foster genuine customer connection.
• Monitor community sentiment, social engagement metrics, engagement rates, retention, and community-driven revenue attribution.
• Collaborate closely with Performance Marketing and Product teams to align editorial schedules with launch cycles.

What We Look For:
• 3–5 years of proven experience in brand storytelling, community management, or social media leadership for a modern D2C consumer or lifestyle brand.
• Proven track record of scaling an organic audience and nurturing high-retention community cohorts.
• Outstanding creative copywriting with strong aesthetic sensibilities; basic knowledge of short-form video editing and visual curation.
• Deep understanding of organic viral loops, creator negotiations, and community psychology.
• Strong empathy, responsiveness, and authentic voice in engaging with community members.`,
  }
];

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-satva-1',
    jobId: 'jd-opening-a',
    candidate: {
      fullName: 'Aarav Mehta',
      email: 'aarav.mehta@example.com',
      phone: '+91 98201 44521',
      age: 26,
      currentLocation: 'Bengaluru, Karnataka',
      address: '402 Palm Meadows, Whitefield, Bengaluru',
    },
    resumeFileName: 'Aarav_Mehta_Resume_FOA.docx',
    resumeFileSize: 48200,
    resumeParsedText: `AARAV MEHTA
Bengaluru, India | aarav.mehta@example.com | +91 98201 44521

PROFESSIONAL EXPERIENCE

Mckinsey & Company — Senior Business Analyst (Strategy & Corporate Finance)
2023 – Present | Bengaluru
• Advised tech & consumer clients on growth strategy, M&A due diligence, and capital allocation across 6 engagements.
• Built 3-statement financial models, valuation comps, and market sizing models for a $150M cross-border buyout.
• Synthesized partner-ready steering committee presentations and weekly C-suite executive briefing memos.
• Managed a squad of 3 junior analysts and spearheaded firm-wide recruiting initiatives.

CRED — Strategy & Growth Associate (Founders Office)
2021 – 2023 | Bengaluru
• Directly shadowed Chief of Staff to scale high-priority fintech product verticals from concept to $20M GMV.
• Spearheaded cross-functional project management across Engineering, Risk, and Product teams, cutting launch lag by 35%.
• Designed automated KPI tracking dashboards monitoring weekly user cohorts, payback periods, and CAC efficiency.

EDUCATION
Birla Institute of Technology and Science (BITS), Pilani
B.E. Mechanical Engineering & Minor in Finance | CGPA: 8.8/10

SKILLS & PROFICIENCIES
Financial Modeling, Market Research, Cohort Analysis, Executive Communications, Tableau, Capstone Project Management.`,
    analysis: {
      matchScore: 94,
      verdict: 'Strong Match',
      fitSummary: 'Exceptional background directly aligned with Satva Partners requirements. Brings top-tier management consulting pedigree (McKinsey) paired with hands-on fintech Founders Office experience at CRED. Strong financial modeling, cohort analysis, and executive communication abilities.',
      strengths: [
        'Direct Founders Office experience at a premier high-growth startup (CRED) driving cross-functional initiatives',
        'Top-tier strategy consulting credentials at McKinsey with financial modeling and M&A due diligence background',
        'Strong quantitative foundation from BITS Pilani with dual technical and finance exposure',
        'Demonstrated ability to produce C-suite executive briefing memos and KPI tracking dashboards'
      ],
      gaps: [
        'Less direct early-stage angel/seed investing experience compared to buyout/consulting work',
        'Only 3.5 years of total experience, slightly on the younger side though within the 2-4 year target window'
      ],
      followUpQuestions: [
        'Can you walk through a 0-to-1 strategic initiative you led at CRED where you encountered major team pushback, and how you resolved it?',
        'How would you structure an investment thesis and market sizing for an early-stage B2B SaaS startup in Southeast Asia?',
        'Describe your typical approach to managing multiple conflicting deadlines when three different partners request urgent deliverables simultaneously.'
      ],
      modelUsed: 'openai/gpt-oss-120b',
      screenedAt: '2026-08-25T11:20:00Z',
    },
    submittedAt: '2026-08-25T11:15:00Z',
    status: 'shortlisted',
  },
  {
    id: 'app-satva-2',
    jobId: 'jd-opening-a',
    candidate: {
      fullName: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@example.com',
      phone: '+91 97112 89043',
      age: 28,
      currentLocation: 'Gurugram, Haryana',
      address: 'Tower 7, DLF Phase 5, Gurugram',
    },
    resumeFileName: 'Rohan_Deshmukh_CV.docx',
    resumeFileSize: 51400,
    resumeParsedText: `ROHAN DESHMUKH
Gurugram, India | rohan.deshmukh@example.com | +91 97112 89043

PROFESSIONAL EXPERIENCE
Urban Company — Operations Manager
2022 – Present | Gurugram
• Managed field operations and partner onboarding for urban cleaning services in NCR region.
• Managed a vendor workforce of 120+ service professionals, reducing partner churn by 18%.
• Supervised day-to-day fulfillment logistics and customer escalation tickets.

KPMG India — Associate Consultant (Risk & Compliance)
2020 – 2022 | New Delhi
• Conducted internal audits and regulatory compliance reviews for manufacturing clients.
• Prepared audit summary reports and regulatory filings.

EDUCATION
Delhi University — B.Com (Hons)

SKILLS
Operations Management, Vendor Relations, MS Excel, Customer Service Management, Team Leadership.`,
    analysis: {
      matchScore: 58,
      verdict: 'Moderate Match',
      fitSummary: 'Candidate has decent operational grounding at Urban Company and audit experience at KPMG, but lacks the core investment analysis, corporate strategy, financial modeling, and venture capital orientation expected for the Founders Office at Satva Partners.',
      strengths: [
        'Solid day-to-day operational execution and vendor workforce management at Urban Company',
        'Structured compliance and audit mindset from KPMG'
      ],
      gaps: [
        'Lacks financial modeling, investment thesis drafting, or market benchmarking background',
        'Experience is primarily ground-level field operations rather than high-level strategic problem solving',
        'No direct exposure to executive partner-level synthesis or venture capital ecosystems'
      ],
      followUpQuestions: [
        'The role requires deep financial modeling and market research memos for partner meetings — what exposure do you have to 3-statement models and DCF/comps?',
        'How would you transition from ground operational management to strategic portfolio oversight?',
        'Can you provide an example of an executive deck or strategy memo you authored?'
      ],
      modelUsed: 'openai/gpt-oss-120b',
      screenedAt: '2026-08-26T14:40:00Z',
    },
    submittedAt: '2026-08-26T14:35:00Z',
    status: 'reviewed',
  },
  {
    id: 'app-ved-1',
    jobId: 'jd-opening-b',
    candidate: {
      fullName: 'Pooja Kashyap',
      email: 'pooja.kashyap@example.com',
      phone: '+91 99302 11984',
      age: 27,
      currentLocation: 'Mumbai, Maharashtra',
      address: 'Flat 12B, Sea Green Apts, Bandra West, Mumbai',
    },
    resumeFileName: 'Pooja_Kashyap_ContentLead.docx',
    resumeFileSize: 44100,
    resumeParsedText: `POOJA KASHYAP
Mumbai, India | pooja.kashyap@example.com | +91 99302 11984 | Portfolio: poojacreates.live

PROFESSIONAL EXPERIENCE

Subko Coffee Roasters — Senior Community & Content Specialist
2022 – Present | Mumbai
• Grew organic Instagram following from 35k to 140k followers with an average engagement rate of 5.8% (3x industry benchmark).
• Founded the "Subko Origin Stories" video newsletter series, generating over 4M organic views and driving 24% of D2C e-commerce subscription revenue.
• Organized 18 sold-out sensory cupping workshops and community meetups across Mumbai and Bengaluru.
• Directed a creator roster of 65+ lifestyle and food influencers, managing gifting, organic collaborations, and contract negotiations.

mCaffeine — Social Media & Content Strategist
2020 – 2022 | Mumbai
• Scripted and produced over 200 high-converting reels and TikToks centered around skin-care rituals and natural ingredients.
• Supervised active customer DMs and WhatsApp community group of 5,000 top brand advocates.

EDUCATION
St. Xavier's College, Mumbai — Bachelor of Mass Media (BMM), Advertising & Journalism

CORE COMPETENCIES
Brand Storytelling, Community Building, Micro-influencer Strategy, Content Calendar Management, Short-form Video Production, Copywriting, CapCut, Notion, Analytics (Sprout Social).`,
    analysis: {
      matchScore: 96,
      verdict: 'Strong Match',
      fitSummary: 'Outstanding candidate who matches House of Ved requirements almost flawlessly. Demonstrated mastery of high-aesthetic D2C brand storytelling at Subko Coffee and mCaffeine. Proven experience running both digital viral formats and offline community workshops.',
      strengths: [
        'Direct 4-year track record scaling organic communities in premium lifestyle & D2C wellness brands (Subko, mCaffeine)',
        'Demonstrated community-driven revenue attribution (Subko content drove 24% of subscription revenue)',
        'Extensive experience managing creator partnerships (65+ influencers) and offline sensory workshops',
        'Strong education in Mass Media from St. Xavier’s College, Mumbai; resident in Mumbai'
      ],
      gaps: [
        'Less stated experience with Discord or tech-heavy community tools, though deeply versed in Instagram, WhatsApp, and Substack'
      ],
      followUpQuestions: [
        'How would you adapt your visual and narrative storytelling from artisanal coffee to botanical wellness and Ayurvedic rituals?',
        'Can you walk through your framework for calculating ROI or customer lifetime value impact from an offline community workshop?',
        'How do you manage community moderation when an ingredient controversy or negative product review surfaces publicly?'
      ],
      modelUsed: 'openai/gpt-oss-120b',
      screenedAt: '2026-08-27T08:15:00Z',
    },
    submittedAt: '2026-08-27T08:10:00Z',
    status: 'shortlisted',
  }
];

export const SAMPLE_CANDIDATE_PRESETS = [
  {
    name: 'Consulting & Strategy Lead (Aarav Mehta)',
    role: 'Founders Office Associate',
    details: {
      fullName: 'Aarav Mehta',
      email: 'aarav.mehta@example.com',
      phone: '+91 98201 44521',
      age: 26,
      currentLocation: 'Bengaluru, Karnataka',
      address: '402 Palm Meadows, Whitefield, Bengaluru',
    },
    suggestedJobId: 'jd-opening-a',
    fileName: 'Aarav_Mehta_Resume_FOA.docx',
    text: `AARAV MEHTA
Bengaluru, India | aarav.mehta@example.com | +91 98201 44521

PROFESSIONAL EXPERIENCE
McKinsey & Company — Senior Business Analyst (Strategy & Corporate Finance)
2023 – Present | Bengaluru
• Advised tech & consumer clients on growth strategy, M&A due diligence, and capital allocation across 6 engagements.
• Built 3-statement financial models, valuation comps, and market sizing models for a $150M cross-border buyout.
• Synthesized partner-ready steering committee presentations and weekly C-suite executive briefing memos.
• Managed a squad of 3 junior analysts and spearheaded firm-wide recruiting initiatives.

CRED — Strategy & Growth Associate (Founders Office)
2021 – 2023 | Bengaluru
• Directly shadowed Chief of Staff to scale high-priority fintech product verticals from concept to $20M GMV.
• Spearheaded cross-functional project management across Engineering, Risk, and Product teams, cutting launch lag by 35%.
• Designed automated KPI tracking dashboards monitoring weekly user cohorts, payback periods, and CAC efficiency.

EDUCATION
Birla Institute of Technology and Science (BITS), Pilani
B.E. Mechanical Engineering & Minor in Finance | CGPA: 8.8/10

SKILLS & PROFICIENCIES
Financial Modeling, Market Research, Cohort Analysis, Executive Communications, Tableau, Capstone Project Management.`,
  },
  {
    name: 'Brand Storyteller & Community Builder (Pooja Kashyap)',
    role: 'Content & Communities Lead',
    details: {
      fullName: 'Pooja Kashyap',
      email: 'pooja.kashyap@example.com',
      phone: '+91 99302 11984',
      age: 27,
      currentLocation: 'Mumbai, Maharashtra',
      address: 'Flat 12B, Sea Green Apts, Bandra West, Mumbai',
    },
    suggestedJobId: 'jd-opening-b',
    fileName: 'Pooja_Kashyap_ContentLead.docx',
    text: `POOJA KASHYAP
Mumbai, India | pooja.kashyap@example.com | +91 99302 11984 | Portfolio: poojacreates.live

PROFESSIONAL EXPERIENCE
Subko Coffee Roasters — Senior Community & Content Specialist
2022 – Present | Mumbai
• Grew organic Instagram following from 35k to 140k followers with an average engagement rate of 5.8% (3x industry benchmark).
• Founded the "Subko Origin Stories" video newsletter series, generating over 4M organic views and driving 24% of D2C e-commerce subscription revenue.
• Organized 18 sold-out sensory cupping workshops and community meetups across Mumbai and Bengaluru.
• Directed a creator roster of 65+ lifestyle and food influencers, managing gifting, organic collaborations, and contract negotiations.

mCaffeine — Social Media & Content Strategist
2020 – 2022 | Mumbai
• Scripted and produced over 200 high-converting reels and TikToks centered around skin-care rituals and natural ingredients.
• Supervised active customer DMs and WhatsApp community group of 5,000 top brand advocates.

EDUCATION
St. Xavier's College, Mumbai — Bachelor of Mass Media (BMM), Advertising & Journalism

CORE COMPETENCIES
Brand Storytelling, Community Building, Micro-influencer Strategy, Content Calendar Management, Short-form Video Production, Copywriting, CapCut, Notion, Analytics (Sprout Social).`,
  },
  {
    name: 'Junior Marketer / Career Pivot (Vikram Sen)',
    role: 'General Applicant',
    details: {
      fullName: 'Vikram Sen',
      email: 'vikram.sen@example.com',
      phone: '+91 98450 72109',
      age: 24,
      currentLocation: 'Pune, Maharashtra',
      address: 'Flat 501, Silver Bells, Kothrud, Pune',
    },
    suggestedJobId: 'jd-opening-b',
    fileName: 'Vikram_Sen_Resume.docx',
    text: `VIKRAM SEN
Pune, India | vikram.sen@example.com | +91 98450 72109

OBJECTIVE
Energetic marketing graduate seeking an opportunity to contribute to high-growth consumer brands.

EXPERIENCE
Freelance Content Creator & Social Intern
2024 – Present | Remote
• Created graphic posts on Canva and wrote blog posts for local boutique stores.
• Moderated comment section and replied to direct inquiries on Facebook.

College Cultural Fest — Media Head
2023 – 2024 | Pune
• Led college festival social media promotion, attracting 1,200 attendees.
• Designed posters and handled campus ticket sales.

EDUCATION
Pune University — B.B.A. (Marketing), 2024

SKILLS
Canva, Social Media Posting, Basic Copywriting, Microsoft Word.`,
  }
];
