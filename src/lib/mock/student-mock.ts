// FOUNDRY mock — Student Nest data.
// Today's market explainer, 11-node concept map, interview questions, jobs,
// cohort, sandbox P&L.

import type { ConceptNode } from '@/lib/types/vault';

export interface TodayExplainer {
  headline: string;
  summary: string;
  relatedConceptIds: string[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface JobPosting {
  id: string;
  company: string;
  title: string;
  location: string;
  salaryRange: string;
}

export interface CohortMember {
  id: string;
  name: string;
  conceptProgress: number;
}

export interface SandboxPnl {
  thisWeek: number;
  allTime: number;
}

export const TODAY_EXPLAINER: TodayExplainer = {
  headline: 'Why is RECO printing $58/MWh while WEST_HUB sits at $36?',
  summary:
    'A binding NY-NJ interface plus a Bergen-Linden constraint is congesting power into the RECO zone. The system marginal energy price is similar everywhere — it is the congestion component that explains the $20+ basis. Watch the constraint shadow prices: when they relax, the basis collapses fast.',
  relatedConceptIds: ['s-lmp', 's-congestion', 's-ftr'],
};

// 11 concept nodes — 2 foundation, 4 mechanics, 5 advanced.
// y bands: foundation 80, mechanics 240, advanced 400.
export const STUDENT_CONCEPT_NODES: ConceptNode[] = [
  // Foundation (2)
  { id: 's-electricity',   label: 'What is electricity?', tier: 'foundation', parents: [],                        description: 'Flow of electrons through a conductor, measured in watts.',                    unlocked: true,  x: 240, y: 80  },
  { id: 's-grid',          label: 'The grid',             tier: 'foundation', parents: ['s-electricity'],          description: 'Synchronous network of generators, transmission, and load — the four pillars.', unlocked: true,  x: 540, y: 80  },

  // Mechanics (4)
  { id: 's-lmp',           label: 'LMP',                  tier: 'mechanics',  parents: ['s-grid'],                 description: 'Locational Marginal Price = energy + congestion + loss.',                       unlocked: true,  x: 120, y: 240 },
  { id: 's-congestion',    label: 'Congestion',           tier: 'mechanics',  parents: ['s-lmp'],                  description: 'Price difference between zones when transmission is binding.',                  unlocked: true,  x: 320, y: 240 },
  { id: 's-capacity',      label: 'Capacity market',      tier: 'mechanics',  parents: ['s-grid'],                 description: 'Forward auction paying generators to be available, separate from energy.',     unlocked: false, x: 520, y: 240 },
  { id: 's-spark',         label: 'Spark spread',         tier: 'mechanics',  parents: ['s-lmp'],                  description: 'LMP minus fuel-adjusted dispatch cost — a gas plant\'s gross margin.',          unlocked: false, x: 720, y: 240 },

  // Advanced (5)
  { id: 's-ftr',           label: 'FTR',                  tier: 'advanced',   parents: ['s-congestion'],           description: 'Financial Transmission Right — a hedge against congestion charges.',            unlocked: false, x: 80,  y: 400 },
  { id: 's-virtuals',      label: 'Virtual trading',      tier: 'advanced',   parents: ['s-lmp'],                  description: 'Buy DA / sell RT (or vice versa) without physical delivery.',                   unlocked: false, x: 240, y: 400 },
  { id: 's-dr',            label: 'Demand response',      tier: 'advanced',   parents: ['s-capacity'],             description: 'Loads paid to curtail when the grid is tight.',                                 unlocked: false, x: 400, y: 400 },
  { id: 's-battery-arb',   label: 'Battery arbitrage',    tier: 'advanced',   parents: ['s-lmp', 's-spark'],       description: 'Charge during cheap hours, discharge during peak — bound by efficiency and cycles.', unlocked: false, x: 560, y: 400 },
  { id: 's-bcap',          label: 'BCAP',                 tier: 'advanced',   parents: ['s-capacity'],             description: 'Battery Capacity Accreditation Procedure — how PJM derates a battery\'s capacity value.', unlocked: false, x: 720, y: 400 },
];

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  { id: 'iq-001', question: 'Walk me through the components of an LMP.',                                        difficulty: 'easy',   topic: 'fundamentals' },
  { id: 'iq-002', question: 'How would you hedge a coal plant in a high-renewables zone?',                       difficulty: 'medium', topic: 'risk' },
  { id: 'iq-003', question: 'A 4-hour battery in PSEG: what is your headline thesis for revenue today?',         difficulty: 'medium', topic: 'markets' },
  { id: 'iq-004', question: 'Build a back-of-envelope spark spread for a 7,800 HHV plant when gas is $3.20.',     difficulty: 'easy',   topic: 'modeling' },
  { id: 'iq-005', question: 'Tell me about a time you were wrong about a market call. What did you learn?',      difficulty: 'hard',   topic: 'behavioral' },
];

export const JOB_POSTINGS: JobPosting[] = [
  { id: 'job-001', company: 'Tenaska',        title: 'Junior Power Trader',         location: 'Omaha, NE',     salaryRange: '$95K–$115K + bonus' },
  { id: 'job-002', company: 'EnerNOC',        title: 'Energy Markets Analyst',      location: 'Boston, MA',    salaryRange: '$78K–$92K' },
  { id: 'job-003', company: 'EDF Renewables', title: 'IPP Development Associate',   location: 'San Diego, CA', salaryRange: '$85K–$105K' },
];

export const COHORT_MEMBERS: CohortMember[] = [
  { id: 'cm-001', name: 'Aquiles G. (Penn State)',     conceptProgress: 64 },
  { id: 'cm-002', name: 'Jordan W. (Texas A&M)',       conceptProgress: 51 },
  { id: 'cm-003', name: 'Mateo R. (U. of Houston)',    conceptProgress: 78 },
  { id: 'cm-004', name: 'Sara K. (Carnegie Mellon)',   conceptProgress: 42 },
];

export const SANDBOX_PNL: SandboxPnl = {
  thisWeek: 1842,
  allTime: 23984,
};
