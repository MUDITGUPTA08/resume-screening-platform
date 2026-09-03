import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleApply, sendPublicApiError } from '../src/server/routes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const result = await handleApply(req.body);
    res.status(200).json(result);
  } catch (err) {
    sendPublicApiError(res, err);
  }
}
