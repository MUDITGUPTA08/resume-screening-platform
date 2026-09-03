import React from 'react';
import { JobApplication } from '../types';
import { getScoreBadgeClasses, getScoreRingColor, getScoreIconClasses } from '../utils/scoreDisplay';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  Eye,
  Award,
} from 'lucide-react';

interface Props {
  app: JobApplication;
  isAnalysisExpanded: boolean;
  isResumeExpanded: boolean;
  copiedQuestionId: string | null;
  onToggleAnalysis: () => void;
  onToggleResume: () => void;
  onCopyQuestion: (question: string, id: string) => void;
  onUpdateStatus: (status: JobApplication['status']) => void;
}

export const ApplicantCard: React.FC<Props> = ({
  app,
  isAnalysisExpanded,
  isResumeExpanded,
  copiedQuestionId,
  onToggleAnalysis,
  onToggleResume,
  onCopyQuestion,
  onUpdateStatus,
}) => {
  const scoreColor = getScoreBadgeClasses(app.analysis.matchScore);
  const scoreRingColor = getScoreRingColor(app.analysis.matchScore);

  return (
    <div
      id={`applicant-card-${app.id}`}
      className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden transition-all duration-200 hover:border-neutral-300 hover:shadow-sm"
    >
      {/* Collapsed summary row — always visible */}
      <button
        type="button"
        onClick={onToggleAnalysis}
        className="w-full text-left p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-neutral-100 flex items-center justify-center relative shrink-0 sm:hidden">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${scoreRingColor} ${app.analysis.matchScore * 3.6}deg, transparent 0deg)`,
                mask: 'radial-gradient(transparent 58%, black 59%)',
                WebkitMask: 'radial-gradient(transparent 58%, black 59%)',
              }}
            />
            <span className="text-xs font-bold text-neutral-900">{app.analysis.matchScore}</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-neutral-900">{app.candidate.fullName}</h3>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${scoreColor}`}>
              {app.analysis.matchScore} · {app.analysis.verdict}
            </span>
          </div>
          <p className="text-xs text-neutral-500 truncate mt-0.5">
            {app.candidate.email} · {app.candidate.currentLocation}
          </p>
          <p className="text-xs text-neutral-600 mt-1.5 line-clamp-1 sm:line-clamp-2">
            {app.analysis.fitSummary}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <div className="w-14 h-14 rounded-full border-4 border-neutral-100 flex items-center justify-center relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${scoreRingColor} ${app.analysis.matchScore * 3.6}deg, transparent 0deg)`,
                mask: 'radial-gradient(transparent 55%, black 56%)',
                WebkitMask: 'radial-gradient(transparent 55%, black 56%)',
              }}
            />
            <Award className={`w-5 h-5 ${getScoreIconClasses(app.analysis.matchScore)}`} />
          </div>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isAnalysisExpanded ? 'rotate-180' : ''}`} />
        </div>
        <ChevronDown className={`sm:hidden w-4 h-4 text-neutral-400 transition-transform shrink-0 ${isAnalysisExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Always-visible quick actions row */}
      <div className="px-5 pb-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3">
        <button
          type="button"
          onClick={onToggleAnalysis}
          className="text-xs font-semibold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 transition-colors"
        >
          <span>{isAnalysisExpanded ? 'Hide Full Analysis' : 'View Full Analysis'}</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isAnalysisExpanded ? 'rotate-90' : ''}`} />
        </button>

        <select
          value={app.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdateStatus(e.target.value as JobApplication['status'])}
          className="px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-md text-xs font-medium text-neutral-700"
        >
          <option value="submitted">Status: Submitted</option>
          <option value="reviewed">Status: Reviewed</option>
          <option value="shortlisted">Status: Shortlisted</option>
          <option value="rejected">Status: Rejected</option>
        </select>
      </div>

      {/* Expanded full analysis */}
      {isAnalysisExpanded && (
        <div className="px-5 pb-6 pt-1 space-y-5 border-t border-neutral-100 bg-neutral-50/40 animate-slide-up">

          {/* Contact Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 pt-4">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              {app.candidate.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              {app.candidate.phone}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              {app.candidate.currentLocation}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Age {app.candidate.age}
            </span>
          </div>

          {/* Match Analysis heading + score */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Match Analysis
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {app.analysis.modelUsed}
            </span>
          </div>

          {/* Fit Summary */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 space-y-1.5">
            <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              LLM Fit Summary
            </span>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              {app.analysis.fitSummary}
            </p>
          </div>

          {/* Strengths vs Gaps Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Strengths
              </h4>
              <ul className="space-y-1 text-xs text-neutral-700">
                {app.analysis.strengths.map((st, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Gaps
              </h4>
              <ul className="space-y-1 text-xs text-neutral-700">
                {app.analysis.gaps.map((gp, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                    <span>{gp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Follow-Up Questions for Interviewers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                Interview Questions
              </h4>
              <button
                onClick={() => onCopyQuestion(app.analysis.followUpQuestions.join('\n'), `${app.id}-all`)}
                className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
              >
                {copiedQuestionId === `${app.id}-all` ? (
                  <><Check className="w-3 h-3 text-emerald-600" /> Copied</>
                ) : (
                  <><Copy className="w-3 h-3" /> Copy All</>
                )}
              </button>
            </div>
            <div className="space-y-1.5">
              {app.analysis.followUpQuestions.map((q, qIndex) => {
                const questionId = `${app.id}-q-${qIndex}`;
                const isCopied = copiedQuestionId === questionId;
                return (
                  <div
                    key={qIndex}
                    className="p-2.5 bg-white hover:bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between gap-3 text-xs text-neutral-800 transition-colors"
                  >
                    <span className="leading-relaxed">
                      <strong className="text-neutral-500 mr-1.5">Q{qIndex + 1}:</strong>
                      {q}
                    </span>
                    <button
                      onClick={() => onCopyQuestion(q, questionId)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded hover:bg-neutral-100 transition-colors shrink-0"
                      title="Copy question to clipboard"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* File Details & Raw Resume Drawer Toggle */}
          <div className="pt-2 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-medium text-neutral-700">{app.resumeFileName}</span>
              <span>•</span>
              <span>Submitted {new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <button
              onClick={onToggleResume}
              className="px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors flex items-center gap-1 self-start sm:self-auto"
            >
              <Eye className="w-3 h-3" />
              <span>{isResumeExpanded ? 'Hide Raw .docx Text' : 'Inspect Raw .docx CV'}</span>
            </button>
          </div>

          {/* Expanded Raw Resume Text */}
          {isResumeExpanded && (
            <div className="p-4 bg-neutral-900 text-neutral-200 rounded-xl font-mono text-[11px] leading-relaxed max-h-64 overflow-y-auto whitespace-pre-line border border-neutral-800 animate-slide-up">
              <div className="text-neutral-400 text-[10px] uppercase font-sans mb-2 border-b border-neutral-800 pb-1">
                Extracted Word (.docx) Document Stream
              </div>
              {app.resumeParsedText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
