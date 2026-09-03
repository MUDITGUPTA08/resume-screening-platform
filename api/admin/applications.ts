import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../../src/server/adminAuth.js';
import { handleAdminListApplications, handleAdminUpdateApplicationStatus, sendApiError } from '../../src/server/routes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req.headers as any, res)) return;

  try {
    if (req.method === 'GET') {
      const applications = await handleAdminListApplications();
      res.status(200).json(applications);
      return;
    }

    if (req.method === 'PATCH') {
      const { applicationId, status } = req.body ?? {};
      if (!applicationId || typeof applicationId !== 'string') {
        res.status(400).json({ error: 'applicationId is required.' });
        return;
      }
      const updated = await handleAdminUpdateApplicationStatus(applicationId, status);
      res.status(200).json(updated);
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    sendApiError(res, err);
  }
}
