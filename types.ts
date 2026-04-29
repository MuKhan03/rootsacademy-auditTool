export type SessionStatus = 'draft' | 'notes' | 'debrief' | 'scoring' | 'complete' | 'reviewed';

export interface Session {
  id: string;
  type: string;
  status: SessionStatus;
  createdAt: string;
  context: Record<string, any>;
  notes: string;
  scanForNotes: Record<string, boolean>;
  debriefQuestions: DebriefQuestion[];
  debriefAnswers: DebriefAnswer[];
  scores: SessionScore[] | null;
  summary: string;
  auditor?: string;
  primary_strength?: string;
  priority_development?: string;
}

export interface DebriefQuestion {
  indicator: string;
  question: string;
  rationale: string;
}

export interface DebriefAnswer {
  indicator: string;
  question: string;
  answer: string;
}

export interface SessionScore {
  indicator: string;
  score: number | 'N/A';
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
  reasoning: string;
}

export interface ScoringResult {
  scores: SessionScore[];
  summary: string;
  primary_strength: string;
  priority_development: string;
}

export interface IndicatorMeta {
  code: string;
  name: string;
  focus: string;
  rubric?: Record<string, string[]>;
}

export interface SessionType {
  name: string;
  description: string;
  icon: string;
  primaryFrameworks: string[];
  secondaryFrameworks: string[];
  primaryIndicators: string[];
  secondaryIndicators: string[];
  contextFields: ContextField[];
  scanFor: string[];
}

export interface ContextField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number';
  required: boolean;
}

export interface Pattern {
  id: string;
  title: string;
  type: 'framework_gap' | 'execution_gap' | 'leadership_signal' | 'culture_signal' | 'outcome_signal' | 'structural_constraint';
  severity: 'high' | 'medium' | 'low';
  frameworks: string[];
  indicators: string[];
  summary: string;
  evidence: string;
  implications: string;
  tentative: boolean;
}

export interface EvidenceItem {
  indicator: string;
  score: number;
  evidence: string;
  sessionTitle: string;
  sessionType: string;
}
