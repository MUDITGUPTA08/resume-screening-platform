import type { VercelRequest, VercelResponse } from '@vercel/node';
import { screenCandidateSafe } from '../src/server/screening.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { jobTitle, jobCompany, jobDescription, candidate, resumeText } = req.body ?? {};

  if (!jobDescription || !resumeText) {
    res.status(400).json({ error: 'Job description and resume text are required.' });
    return;
  }

  const result = await screenCandidateSafe({
    jobTitle,
    jobCompany,
    jobDescription,
    candidate,
    resumeText,
  });

  res.status(200).json(result);
}
