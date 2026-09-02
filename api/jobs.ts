import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleListJobs, ApiError } from '../src/server/routes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const jobs = await handleListJobs();
    res.status(200).json(jobs);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    res.status(status).json({ error: (err as Error).message || 'Internal error' });
  }
}
