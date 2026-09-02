import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isValidAdminPasscode, getAdminPasscodeFromRequest } from '../../src/server/adminAuth.js';
import { handleListJobs, handleAdminCreateJob, ApiError } from '../../src/server/routes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const passcode = getAdminPasscodeFromRequest(req.headers as any);
  if (!isValidAdminPasscode(passcode)) {
    res.status(401).json({ error: 'Invalid or missing admin passcode.' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const jobs = await handleListJobs();
      res.status(200).json(jobs);
      return;
    }

    if (req.method === 'POST') {
      const job = await handleAdminCreateJob(req.body);
      res.status(201).json(job);
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    res.status(status).json({ error: (err as Error).message || 'Internal error' });
  }
}
