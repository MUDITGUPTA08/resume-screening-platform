import samples from './sampleJobDescriptions.json';

// Prefill templates for the "post a new job" form. Typed here once so the
// modal can iterate them instead of hardcoding one branch per sample.
export interface SampleJobDescription {
  key: string;
  label: string;
  title: string;
  company: string;
  department: string;
  location: string;
  description: string;
}

export const SAMPLE_JOB_DESCRIPTIONS: SampleJobDescription[] =
  samples as SampleJobDescription[];
