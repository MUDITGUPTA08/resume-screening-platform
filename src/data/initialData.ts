import { JobOpening, CandidateDetails } from '../types';
import jobOpenings from './jobOpenings.json';
import candidatePresets from './candidatePresets.json';

// Demo content lives in the adjacent JSON files rather than inline here.
// It is prose -- job descriptions and fake resumes -- and kept it out of the
// source so editing a sample JD doesn't mean scrolling past it to reach code.
// This module stays as the typed boundary: JSON has no types of its own, so
// the casts happen once here instead of at every call site.

export interface CandidatePreset {
  name: string;
  role: string;
  details: CandidateDetails;
  suggestedRole: string;
  fileName: string;
  text: string;
}

export const INITIAL_JOB_OPENINGS: JobOpening[] = jobOpenings as JobOpening[];

export const SAMPLE_CANDIDATE_PRESETS: CandidatePreset[] =
  candidatePresets as CandidatePreset[];
