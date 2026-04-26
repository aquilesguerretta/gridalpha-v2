// FOUNDRY contract — Vault destination types.
// CaseStudy powers the Vault library. ConceptNode drives the Alexandria
// curriculum graph (and the Student Nest concept map).

export type CaseCategory =
  | 'arbitrage'
  | 'congestion'
  | 'spark'
  | 'forecast'
  | 'extreme'
  | 'regulatory';

export type CaseSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface CaseStudyMetric {
  label: string;
  value: string;
}

export interface CaseStudyEvent {
  hour: number;
  label: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  date: string;
  category: CaseCategory;
  region: string;
  severity: CaseSeverity;
  headline: string;
  metrics: CaseStudyMetric[];
  prices24h: number[];
  events: CaseStudyEvent[];
  whatHappened: string;
  whyItHappened: string;
  tradingImplication: string;
  sources: string[];
  relatedConcepts: string[];
}

export type ConceptTier = 'foundation' | 'mechanics' | 'advanced';

export interface ConceptNode {
  id: string;
  label: string;
  tier: ConceptTier;
  parents: string[];
  description: string;
  unlocked: boolean;
  x: number;
  y: number;
}
