import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  handleListJobs,
  handleApply,
  handleAdminCreateJob,
  handleAdminListApplications,
  handleAdminUpdateApplicationStatus,
  ApiError,
} from './src/server/routes.js';
import { isValidAdminPasscode, getAdminPasscodeFromRequest } from './src/server/adminAuth.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const passcode = getAdminPasscodeFromRequest(req.headers as any);
  if (!isValidAdminPasscode(passcode)) {
    res.status(401).json({ error: 'Invalid or missing admin passcode.' });
    return;
  }
  next();
}

function sendApiError(res: express.Response, err: unknown) {
  const status = err instanceof ApiError ? err.status : 500;
  res.status(status).json({ error: (err as Error).message || 'Internal error' });
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGroqKey: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'MY_GROQ_API_KEY'),
    hasSupabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
});

// ---- Public routes ----

app.get('/api/jobs', async (req, res) => {
  try {
    res.json(await handleListJobs());
  } catch (err) {
    sendApiError(res, err);
  }
});

app.post('/api/apply', async (req, res) => {
  try {
    res.json(await handleApply(req.body));
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
    res.status(status).json({ error: message });
  }
});

// ---- Admin routes ----

app.get('/api/admin/jobs', requireAdmin, async (req, res) => {
  try {
    res.json(await handleListJobs());
  } catch (err) {
    sendApiError(res, err);
  }
});

app.post('/api/admin/jobs', requireAdmin, async (req, res) => {
  try {
    res.status(201).json(await handleAdminCreateJob(req.body));
  } catch (err) {
    sendApiError(res, err);
  }
});

app.get('/api/admin/applications', requireAdmin, async (req, res) => {
  try {
    res.json(await handleAdminListApplications());
  } catch (err) {
    sendApiError(res, err);
  }
});

app.patch('/api/admin/applications', requireAdmin, async (req, res) => {
  try {
    const { applicationId, status } = req.body ?? {};
    if (!applicationId) {
      res.status(400).json({ error: 'applicationId is required.' });
      return;
    }
    res.json(await handleAdminUpdateApplicationStatus(applicationId, status));
  } catch (err) {
    sendApiError(res, err);
  }
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
