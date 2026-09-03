import { screenCandidateSafe } from './screening.js';
import {
  listJobs,
  createJob,
  getJobById,
  listApplications,
  createApplication,
  updateApplicationStatus,
  type JobRecord,
} from './dataStore.js';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Minimal structural type covering both Express's Response and Vercel's
// VercelResponse -- avoids importing either framework's types into this
// framework-agnostic module just to share this one helper.
interface JsonResponder {
  status(code: number): { json(body: unknown): void };
}

// Shared by every route handler (Express in server.ts, and each Vercel
// function in api/**) so the ApiError -> HTTP status mapping and the
// generic-500 fallback live in exactly one place.
export function sendApiError(res: JsonResponder, err: unknown): void {
  const status = err instanceof ApiError ? err.status : 500;
  const message = err instanceof ApiError ? err.message : (err as Error)?.message || 'Internal error';
  res.status(status).json({ error: message });
}

// Same as sendApiError, but for public candidate-facing endpoints: never
// surface a non-ApiError message (which could leak internal detail) to
// someone applying for a job.
export function sendPublicApiError(res: JsonResponder, err: unknown): void {
  const status = err instanceof ApiError ? err.status : 500;
  const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
  res.status(status).json({ error: message });
}

function serializeJob(job: JobRecord) {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    department: job.department,
    location: job.location,
    description: job.description,
    createdAt: job.createdAt,
  };
}

// ---- Public routes ----

export async function handleListJobs() {
  const jobs = await listJobs();
  return jobs.map(serializeJob);
}

const MIN_RESUME_LENGTH = 150;
const MIN_RESUME_WORDS = 25;

// Server-side sanity check on the extracted resume text. We don't re-parse the
// original .docx bytes server-side (the client already did that with mammoth),
// so this can't catch a renamed non-.docx file -- but it catches the common
// abuse case of a trivially short or non-prose "resume" slipping past a
// client that was tampered with or bypassed entirely (e.g. a direct API call).
function looksLikeResumeText(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < MIN_RESUME_LENGTH) return false;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < MIN_RESUME_WORDS) return false;

  // Reject content that's mostly a handful of characters repeated (garbage /
  // binary leakage) rather than actual prose.
  const uniqueChars = new Set(trimmed.toLowerCase().replace(/\s/g, '')).size;
  if (uniqueChars < 10) return false;

  return true;
}

export async function handleApply(body: any) {
  const { jobId, candidate, resumeFileName, resumeFileSize, resumeText } = body ?? {};

  if (!jobId || typeof jobId !== 'string') {
    throw new ApiError(400, 'jobId is required.');
  }
  if (!candidate?.fullName || !candidate?.email || !candidate?.phone || !candidate?.age || !candidate?.currentLocation || !candidate?.address) {
    throw new ApiError(400, 'All candidate details are required.');
  }
  if (typeof resumeFileName !== 'string' || !resumeFileName.toLowerCase().endsWith('.docx')) {
    throw new ApiError(400, 'Only .docx resumes are accepted.');
  }
  if (typeof resumeText !== 'string' || !looksLikeResumeText(resumeText)) {
    throw new ApiError(400, 'Resume content is missing, too short, or unreadable. Please upload a complete .docx resume.');
  }

  const job = await getJobById(jobId);
  if (!job) {
    throw new ApiError(404, 'This job opening no longer exists.');
  }

  const analysis = await screenCandidateSafe({
    jobTitle: job.title,
    jobCompany: job.company,
    jobDescription: job.description,
    candidate,
    resumeText,
  });

  await createApplication({
    jobId: job.id,
    candidate,
    resumeFileName,
    resumeFileSize: typeof resumeFileSize === 'number' ? resumeFileSize : resumeText.length,
    resumeParsedText: resumeText,
    analysis,
  });

  // Deliberately return nothing but a confirmation — the brief requires the
  // candidate side to never see a score, ranking, or analysis of any kind.
  return { success: true, message: "Thanks, we've received your application. We'll reach out soon." };
}

// ---- Admin routes ----

export async function handleAdminCreateJob(body: any) {
  const { title, company, department, location, description } = body ?? {};
  if (!title || !company || !description || description.length < 50) {
    throw new ApiError(400, 'Title, company, and a substantive description are required.');
  }
  const job = await createJob({ title, company, department, location, description });
  return serializeJob(job);
}

export async function handleAdminListApplications() {
  const applications = await listApplications();
  return applications;
}

export async function handleAdminUpdateApplicationStatus(applicationId: string, status: string) {
  const validStatuses = ['submitted', 'reviewed', 'shortlisted', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status value.');
  }
  return updateApplicationStatus(applicationId, status as any);
}
