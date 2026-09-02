import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { screenCandidateSafe } from './src/server/screening.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGroqKey: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'MY_GROQ_API_KEY')
  });
});

// AI Screening API
app.post('/api/screen', async (req, res) => {
  const { jobTitle, jobCompany, jobDescription, candidate, resumeText } = req.body;

  if (!jobDescription || !resumeText) {
    return res.status(400).json({ error: 'Job description and resume text are required.' });
  }

  const result = await screenCandidateSafe({ jobTitle, jobCompany, jobDescription, candidate, resumeText });
  return res.json(result);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Resume Screener Server running on port ${PORT}`);
  });
}

startServer();
