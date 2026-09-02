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
              <h2 className="text-lg font-semibold text-neutral-900">Candidate Brief Write-Up & Evaluation</h2>
              <p className="text-xs text-neutral-500">Addressing Sections 4 & 6 of the Take-Home Assignment Brief</p>
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
                <strong>Approach:</strong> Architected a dedicated two-sided platform strictly isolating the public applicant experience from the hiring team’s evaluation suite. Integrated client-side OpenXML <code>.docx</code> extraction via <code>mammoth</code> to enforce Word document exclusivity, and paired it with a server-side Groq (GPT-OSS 120B) pipeline generating calibrated match scores, fit summaries, gaps, and targeted interview follow-ups.
              </p>
              <p>
                <strong>Data Modeling:</strong> Implemented a normalized one-to-many relationship (<code>JobOpening</code> &rarr; <code>JobApplication[]</code>) supporting unlimited candidate submissions per JD without fixed-schema hardcoding.
              </p>
              <p>
                <strong>Key Trade-offs:</strong> Prioritized an end-to-end working preview with lightweight passkey access gate and in-memory/local persistence over heavy multi-tenant SSO infrastructure. Opted for real-time synchronous screening on submission with dual fallback heuristics so evaluating applicants never hangs if third-party API quotas fluctuate.
              </p>
              <p>
                <strong>Next with More Time:</strong> Implement asynchronous background screening queues (BullMQ/Redis) with webhook notifications, batch multi-file resume uploading, candidate talent pooling across multiple JDs, and ATS export integrations (Greenhouse/Lever).
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
                Each <code>JobOpening</code> holds unique ID, metadata, and full JD text. Submissions reference <code>jobId</code>, allowing multiple applicants per opening. Filter, sort, and aggregate analytics dynamically calculate per-role statistics.
              </p>
            </div>

            {/* 3. Access Separation */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-medium text-neutral-900">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</span>
                <span>Strict Access Separation</span>
              </div>
              <p className="text-xs text-neutral-600">
                Candidate submission views return solely: <em>"Thanks, we've received your application. We'll reach out soon."</em> No score, ranking, or LLM tokens are rendered on the candidate portal. Admin views are gated behind authenticated credentials.
              </p>
            </div>

            {/* 4. Robustness & Parsing */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-medium text-neutral-900">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">4</span>
                <span>.docx Only & Fallbacks</span>
              </div>
              <p className="text-xs text-neutral-600">
                Strict MIME and extension checking blocks PDF or legacy .doc uploads. Robust extraction parses headers, bullets, and varied resume formats. If the LLM service experiences latency or quota limits, an intelligent heuristic fallback ensures zero applicant dropped calls.
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
