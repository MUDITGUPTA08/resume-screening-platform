import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleApply, ApiError } from '../src/server/routes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const result = await handleApply(req.body);
    res.status(200).json(result);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    // Never leak internal error detail to the public applicant endpoint.
    const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
    res.status(status).json({ error: message });
  }
}
