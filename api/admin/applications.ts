import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isValidAdminPasscode, getAdminPasscodeFromRequest } from '../../src/server/adminAuth.js';
import { handleAdminListApplications, handleAdminUpdateApplicationStatus, ApiError } from '../../src/server/routes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const passcode = getAdminPasscodeFromRequest(req.headers as any);
  if (!isValidAdminPasscode(passcode)) {
    res.status(401).json({ error: 'Invalid or missing admin passcode.' });
    return;
  }

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
    const status = err instanceof ApiError ? err.status : 500;
    res.status(status).json({ error: (err as Error).message || 'Internal error' });
  }
}
