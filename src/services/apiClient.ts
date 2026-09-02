import { JobOpening, JobApplication, CandidateDetails } from '../types';

const ADMIN_PASSCODE_KEY = 'resume_screener_admin_passcode_v1';

export function getStoredAdminPasscode(): string | null {
  return sessionStorage.getItem(ADMIN_PASSCODE_KEY);
}

export function setStoredAdminPasscode(passcode: string) {
  sessionStorage.setItem(ADMIN_PASSCODE_KEY, passcode);
}

export function clearStoredAdminPasscode() {
  sessionStorage.removeItem(ADMIN_PASSCODE_KEY);
}

async function parseJsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }
  return data;
}

// ---- Public ----

export async function fetchOpenJobs(): Promise<JobOpening[]> {
  const res = await fetch('/api/jobs');
  const data = await parseJsonOrThrow(res);
  return data;
}

export async function submitApplication(params: {
  jobId: string;
  candidate: CandidateDetails;
  resumeFileName: string;
  resumeFileSize: number;
  resumeText: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return parseJsonOrThrow(res);
}

// ---- Admin ----

async function adminFetch(path: string, options: RequestInit = {}) {
  const passcode = getStoredAdminPasscode();
  const res = await fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'x-admin-passcode': passcode || '',
    },
  });
  return parseJsonOrThrow(res);
}

// Verifies a passcode by attempting an authenticated admin request.
export async function verifyAdminPasscode(passcode: string): Promise<boolean> {
  const res = await fetch('/api/admin/jobs', {
    headers: { 'x-admin-passcode': passcode },
  });
  return res.ok;
}

export async function fetchAdminJobs(): Promise<JobOpening[]> {
  return adminFetch('/api/admin/jobs');
}

export async function createJobAdmin(job: {
  title: string;
  company: string;
  department?: string;
  location?: string;
  description: string;
}): Promise<JobOpening> {
  return adminFetch('/api/admin/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job),
  });
}

export async function fetchAdminApplications(): Promise<JobApplication[]> {
  return adminFetch('/api/admin/applications');
}

export async function updateApplicationStatusAdmin(
  applicationId: string,
  status: JobApplication['status']
): Promise<JobApplication> {
  return adminFetch('/api/admin/applications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId, status }),
  });
}
