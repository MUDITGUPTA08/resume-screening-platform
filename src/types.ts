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

export interface ScreeningAnalysis {
  matchScore: number; // 0 to 100
  verdict: 'Strong Match' | 'Potential Match' | 'Moderate Match' | 'Low Match';
  fitSummary: string;
  strengths: string[];
  gaps: string[];
  followUpQuestions: string[];
  modelUsed: string;
  screenedAt: string;
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
