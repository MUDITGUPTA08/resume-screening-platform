import React from 'react';
import { X, BookOpen, ShieldCheck, Database, Cpu, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureWriteupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="architecture-writeup-modal"
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-neutral-200"
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Project Write-Up</h2>
              <p className="text-xs text-neutral-500">Approach, trade-offs, and evaluation notes for this submission</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-sm text-neutral-700 leading-relaxed">
          {/* Executive 5-10 Line Summary (Requested in Section 4 & 6) */}
          <section className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-1.5 text-base">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Executive Write-up (Approach, Trade-offs & Next Steps)
            </h3>
            <div className="space-y-2 text-neutral-700 text-xs sm:text-sm">
              <p>
                <strong>Approach:</strong> Architected a dedicated two-sided platform strictly isolating the public applicant experience from the hiring team’s evaluation suite, backed by a shared Postgres database (Supabase) so the flow works across different browsers and devices, not just within one session. Integrated client-side OpenXML <code>.docx</code> extraction via <code>mammoth</code> to enforce Word document exclusivity, paired with a server-side Groq (GPT-OSS 120B) pipeline generating calibrated match scores, fit summaries, gaps, and targeted interview follow-ups.
              </p>
              <p>
                <strong>Data Modeling:</strong> Two Postgres tables — <code>jobs</code> and <code>applications</code> (foreign-keyed by <code>job_id</code>) — implementing a genuine one-to-many relationship, not a client-side array. Every write goes through server-side API routes; the browser never talks to the database directly.
              </p>
              <p>
                <strong>Key Trade-offs:</strong> Split the API surface into public routes (<code>/api/jobs</code>, <code>/api/apply</code>) that never return score data, and admin routes (<code>/api/admin/*</code>) gated by a server-verified passcode header — so the separation holds even if someone calls the API directly, not just by convention in the UI. Kept the admin gate as a shared passcode rather than full user auth, since the brief explicitly allows a simple gate for this exercise.
              </p>
              <p>
                <strong>Next with More Time:</strong> Real per-admin accounts instead of a shared passcode, sending the original <code>.docx</code> bytes to the server for independent re-parsing (currently the server validates the extracted text's shape and length, not the file's actual binary/MIME signature), asynchronous background screening queues, and ATS export integrations (Greenhouse/Lever).
              </p>
            </div>
          </section>

          {/* Section 4 Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Product Judgement */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-medium text-neutral-900">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
                <span>Product Judgement</span>
              </div>
              <p className="text-xs text-neutral-600">
                Prioritized speed of review for hiring managers: high-contrast scores, scannable strengths, red flags/gaps, and instantly copyable interview questions. For applicants, the interface is distraction-free with zero exposure to internal scores or ranking metrics.
              </p>
            </div>

            {/* 2. Data Modelling */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-medium text-neutral-900">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">2</span>
                <span>One-to-Many Modeling</span>
              </div>
              <p className="text-xs text-neutral-600">
                A Postgres <code>jobs</code> table holds each opening's metadata and full JD text; <code>applications</code> references it via <code>job_id</code> with a foreign key, allowing unlimited applicants per opening. Filter, sort, and aggregate analytics dynamically calculate per-role statistics from live data.
              </p>
            </div>

            {/* 3. Access Separation */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-medium text-neutral-900">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</span>
                <span>Strict Access Separation</span>
              </div>
              <p className="text-xs text-neutral-600">
                The public <code>/api/apply</code> endpoint returns only <em>"Thanks, we've received your application. We'll reach out soon."</em> — it never has score data in its response payload, so there's nothing to leak even by inspecting network traffic. Score data only exists behind <code>/api/admin/*</code> routes, which verify a passcode header server-side on every request, not just in the UI.
              </p>
            </div>

            {/* 4. Robustness & Parsing */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-medium text-neutral-900">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">4</span>
                <span>.docx Only & Fallbacks</span>
              </div>
              <p className="text-xs text-neutral-600">
                Client-side extension checking blocks PDF or legacy .doc uploads before parsing; the server independently re-validates the extracted text (extension, minimum length and word count, non-garbage content) before it's ever screened or stored, so a bypassed or tampered client can't slip a non-resume through. If the LLM service experiences latency or quota limits, a deterministic heuristic fallback ensures no applicant is dropped.
              </p>
            </div>
          </div>

          {/* Prompt & LLM Engineering */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <h4 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              Prompt & LLM Design
            </h4>
            <p className="text-xs text-neutral-600 mb-2">
              Structured JSON schema response powered by <code>openai/gpt-oss-120b</code> (Groq) evaluating the resume against JD criteria:
            </p>
            <ul className="text-xs space-y-1 text-neutral-600 list-disc list-inside">
              <li><strong>Match Score:</strong> Calibrated 0-100 integer reflecting depth of relevant experience and core requirements.</li>
              <li><strong>Fit Summary:</strong> 2-3 sentence executive synopsis without fluff.</li>
              <li><strong>Strengths:</strong> Concrete evidence of JD alignment extracted from resume achievements.</li>
              <li><strong>Gaps / Follow-ups:</strong> Unverified claims, domain switches, or missing proficiencies turned into pointed interview questions.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 text-sm font-medium transition-colors"
          >
            Close Write-up
          </button>
        </div>
      </div>
    </div>
  );
};
