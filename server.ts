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
  sendApiError,
  sendPublicApiError,
} from './src/server/routes.js';
import { requireAdmin as checkAdminAuthorized } from './src/server/adminAuth.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Malformed JSON bodies would otherwise fall through to Express's default
// error handler, which returns an HTML page containing the local
// filesystem path and a full stack trace -- fine for a local-only dev
// server, but worth a clean JSON response instead.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Malformed JSON in request body.' });
    return;
  }
  next(err);
});

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (checkAdminAuthorized(req.headers as any, res)) next();
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
    sendPublicApiError(res, err);
  }
});
// Any other method on this path would otherwise fall through to Vite's SPA
// catch-all and return the app shell with a 200 -- reject it explicitly,
// matching the Vercel function's behavior in production.
app.all('/api/apply', (req, res) => {
  res.status(405).json({ error: 'Method not allowed' });
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
