# Resume Screener

A dual-sided hiring platform: candidates apply against posted job openings with a `.docx`-only resume upload, and an admin-only dashboard shows LLM-evaluated fit scores, strengths, gaps, and interview follow-up questions for every submission. Scores and analysis are never exposed on the candidate side.

## Stack

- React + Vite (frontend)
- Express + Vite middleware for local dev, Vercel serverless functions (`api/`) for production
- Google Gemini (`gemini-2.5-flash`) for resume screening, with a deterministic heuristic fallback when no API key is configured
- `mammoth` for client-side `.docx` text extraction

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Set `GEMINI_API_KEY` in a `.env` file to enable real LLM scoring. Without it, the app falls back to a deterministic heuristic screener automatically.
3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy

Deploys to Vercel out of the box — `vite build` produces `dist/`, and `api/screen.ts` / `api/health.ts` run as serverless functions. Set `GEMINI_API_KEY` in the Vercel project's environment variables to enable real LLM scoring in production.
