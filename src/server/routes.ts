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

const MIN_RESUME_LENGTH = 20;

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
  if (typeof resumeText !== 'string' || resumeText.trim().length < MIN_RESUME_LENGTH) {
    throw new ApiError(400, 'Resume content is missing or unreadable.');
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
