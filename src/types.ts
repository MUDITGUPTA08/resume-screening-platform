export interface JobOpening {
  id: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  department?: string;
  createdAt: string;
}

export interface CandidateDetails {
  fullName: string;
  email: string;
  phone: string;
  age: string | number;
  currentLocation: string;
  address: string;
}

export type MatchVerdict = 'Strong Match' | 'Potential Match' | 'Moderate Match' | 'Low Match';

export interface ScreeningAnalysis {
  matchScore: number; // 0 to 100
  verdict: MatchVerdict;
  fitSummary: string;
  strengths: string[];
  gaps: string[];
  followUpQuestions: string[];
  modelUsed: string;
  screenedAt: string;
}

// Single source of truth for score -> verdict thresholds, shared by the
// server (screening.ts, when the LLM omits/mangles a verdict) and the
// client (score badge/ring colors) so the cutoffs can't drift apart.
export const SCORE_THRESHOLDS = {
  strong: 85,
  potential: 70,
  moderate: 55,
} as const;

export function verdictForScore(score: number): MatchVerdict {
  if (score >= SCORE_THRESHOLDS.strong) return 'Strong Match';
  if (score >= SCORE_THRESHOLDS.potential) return 'Potential Match';
  if (score >= SCORE_THRESHOLDS.moderate) return 'Moderate Match';
  return 'Low Match';
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidate: CandidateDetails;
  resumeFileName: string;
  resumeFileSize: number;
  resumeParsedText: string;
  analysis: ScreeningAnalysis;
  submittedAt: string;
  status: 'submitted' | 'reviewed' | 'shortlisted' | 'rejected';
}
