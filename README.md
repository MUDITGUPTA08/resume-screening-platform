# Resume Screener

A two-sided hiring platform: candidates browse open positions and apply with a `.docx`-only resume upload, while a passcode-protected hiring dashboard shows LLM-evaluated fit scores, strengths, gaps, and interview follow-up questions for every submission. Scores and analysis are never exposed on the candidate side — enforced server-side, not just hidden in the UI.

See the in-app **Project Write-Up** (header nav) for the full approach, trade-offs, and evaluation notes.

## Architecture

![Architecture diagram: the Candidate Portal and Hiring Dashboard both talk to a server layer that persists to Supabase. The candidate path (public) hits handleApply(), which screens via Groq with a heuristic fallback and returns only a confirmation message. The admin path is gated by a server-side passcode check on every request before any database read.](docs/architecture.svg)

Two request paths converge on one server layer:

- **Candidate path** (public, no auth) — `POST /api/apply` runs `handleApply()`, which validates the submission, screens it via Groq (falling back to a deterministic heuristic scorer if the LLM is unreachable or no key is set), and writes one row to `applications`. The only thing that ever returns to the browser is `{success, message}` — there's no code path where score data leaves the server on this side.
- **Admin path** (protected) — every `/api/admin/*` request, in both the Vercel functions and the local Express server, passes through `requireAdmin()` first, which checks an `x-admin-passcode` header against `ADMIN_PASSCODE` server-side and returns `401` before any query runs. This is enforced independent of client state — the React app's `isAdminAuthenticated` flag is just a UI convenience, not the security boundary.
- **Data model** — `applications.job_id` is a real, indexed foreign key into `jobs.id`, so one JD genuinely has many resumes against it, not an array bolted onto the job row.

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
