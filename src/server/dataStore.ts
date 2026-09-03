import { getSupabaseClient } from './supabase.js';
import type { ScreeningResult } from './screening.js';
import type { CandidateDetails, JobApplication } from '../types.js';

export interface JobRecord {
  id: string;
  title: string;
  company: string;
  department: string | null;
  location: string | null;
  description: string;
  createdAt: string;
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  candidate: CandidateDetails;
  resumeFileName: string;
  resumeFileSize: number;
  resumeParsedText: string;
  analysis: ScreeningResult;
  status: JobApplication['status'];
  submittedAt: string;
}

function mapJobRow(row: any): JobRecord {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    department: row.department,
    location: row.location,
    description: row.description,
    createdAt: row.created_at,
  };
}

function mapApplicationRow(row: any): ApplicationRecord {
  return {
    id: row.id,
    jobId: row.job_id,
    candidate: {
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      age: row.age,
      currentLocation: row.current_location,
      address: row.address,
    },
    resumeFileName: row.resume_file_name,
    resumeFileSize: row.resume_file_size,
    resumeParsedText: row.resume_parsed_text,
    analysis: {
      matchScore: row.match_score,
      verdict: row.verdict,
      fitSummary: row.fit_summary,
      strengths: row.strengths ?? [],
      gaps: row.gaps ?? [],
      followUpQuestions: row.follow_up_questions ?? [],
      modelUsed: row.model_used,
      screenedAt: row.submitted_at,
    },
    status: row.status,
    submittedAt: row.submitted_at,
  };
}

export async function listJobs(): Promise<JobRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to list jobs: ${error.message}`);
  return (data ?? []).map(mapJobRow);
}

export async function createJob(input: {
  title: string;
  company: string;
  department?: string;
  location?: string;
  description: string;
}): Promise<JobRecord> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      title: input.title,
      company: input.company,
      department: input.department || 'General',
      location: input.location || 'Flexible / Remote',
      description: input.description,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create job: ${error.message}`);
  return mapJobRow(data);
}

export async function getJobById(jobId: string): Promise<JobRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch job: ${error.message}`);
  return data ? mapJobRow(data) : null;
}

export async function listApplications(): Promise<ApplicationRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) throw new Error(`Failed to list applications: ${error.message}`);
  return (data ?? []).map(mapApplicationRow);
}

export async function createApplication(input: {
  jobId: string;
  candidate: ApplicationRecord['candidate'];
  resumeFileName: string;
  resumeFileSize: number;
  resumeParsedText: string;
  analysis: ScreeningResult;
}): Promise<ApplicationRecord> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: input.jobId,
      full_name: input.candidate.fullName,
      email: input.candidate.email,
      phone: input.candidate.phone,
      age: String(input.candidate.age),
      current_location: input.candidate.currentLocation,
      address: input.candidate.address,
      resume_file_name: input.resumeFileName,
      resume_file_size: input.resumeFileSize,
      resume_parsed_text: input.resumeParsedText,
      match_score: input.analysis.matchScore,
      verdict: input.analysis.verdict,
      fit_summary: input.analysis.fitSummary,
      strengths: input.analysis.strengths,
      gaps: input.analysis.gaps,
      follow_up_questions: input.analysis.followUpQuestions,
      model_used: input.analysis.modelUsed,
      status: 'submitted',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create application: ${error.message}`);
  return mapApplicationRow(data);
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationRecord['status']
): Promise<ApplicationRecord> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update application status: ${error.message}`);
  return mapApplicationRow(data);
}
