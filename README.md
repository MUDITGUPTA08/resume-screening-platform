# Resume Screener

A two-sided hiring platform: candidates browse open positions and apply with a `.docx`-only resume upload, while a passcode-protected hiring dashboard shows LLM-evaluated fit scores, strengths, gaps, and interview follow-up questions for every submission. Scores and analysis are never exposed on the candidate side — enforced server-side, not just hidden in the UI.

See the in-app **Project Write-Up** (header nav) for the full approach, trade-offs, and evaluation notes.

## Stack

- React + Vite (frontend)
- Express + Vite middleware for local dev, Vercel serverless functions (`api/`) for production
- Supabase (Postgres) for persistence — `jobs` and `applications` tables, foreign-keyed one-to-many, RLS-locked to the server-side service role key only
- Groq (`openai/gpt-oss-120b`, falling back to `openai/gpt-oss-20b`) for resume screening, with a deterministic heuristic fallback when no API key is configured or the LLM call fails
- `mammoth` for client-side `.docx` text extraction, with server-side re-validation of the extracted content

## Run locally

**Prerequisites:** Node.js, a Supabase project (see `supabase/schema.sql`)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in:
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — required for persistence
   - `GROQ_API_KEY` — optional; get a free-tier key at [console.groq.com/keys](https://console.groq.com/keys). Without it, the app falls back to a deterministic heuristic screener automatically.
   - `ADMIN_PASSCODE` — optional, defaults to `admin123`
3. Apply the schema once (Supabase SQL editor, or via the Supabase MCP/CLI):
   ```bash
   supabase/schema.sql
   ```
4. (Optional) Seed the two sample job openings from the assignment brief:
   ```bash
   npx tsx scripts/seedJobs.ts
   ```
5. Run the app:
   ```bash
   npm run dev
   ```

## Deploy

Deploys to Vercel out of the box — `vite build` produces `dist/`, and the functions under `api/` (`jobs`, `apply`, `admin/jobs`, `admin/applications`, `health`) run as Vercel serverless functions. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, and optionally `ADMIN_PASSCODE` in the Vercel project's environment variables.
