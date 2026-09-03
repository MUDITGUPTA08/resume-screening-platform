import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../../src/server/adminAuth.js';
import { handleListJobs, handleAdminCreateJob, sendApiError } from '../../src/server/routes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req.headers as any, res)) return;

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
    sendApiError(res, err);
  }
}
