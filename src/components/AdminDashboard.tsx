import React, { useState } from 'react';
import { JobOpening, JobApplication } from '../types';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Plus, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Copy, 
  Check, 
  Filter, 
  SlidersHorizontal,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Eye,
  Award,
  Clock
} from 'lucide-react';

interface Props {
  jobs: JobOpening[];
  applications: JobApplication[];
  onOpenNewJobModal: () => void;
  onUpdateApplicationStatus: (appId: string, status: JobApplication['status']) => void;
}

export const AdminDashboard: React.FC<Props> = ({
  jobs,
  applications,
  onOpenNewJobModal,
  onUpdateApplicationStatus,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [expandedResumeAppId, setExpandedResumeAppId] = useState<string | null>(null);
  const [isViewingFullJD, setIsViewingFullJD] = useState<boolean>(false);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // Resumes for selected JD (One-to-Many relationship)
  const jobApplications = applications.filter((app) => app.jobId === selectedJob?.id);

  // Filtered applications
  const filteredApplications = jobApplications.filter((app) => {
    const matchesSearch = 
      app.candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate.currentLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.analysis.fitSummary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVerdict = 
      verdictFilter === 'all' || app.analysis.verdict.toLowerCase().includes(verdictFilter.toLowerCase());

    return matchesSearch && matchesVerdict;
  });

  // Calculate statistics
  const totalScreened = applications.length;
  const strongMatches = applications.filter((a) => a.analysis.matchScore >= 85).length;
  const avgScore = totalScreened > 0 
    ? Math.round(applications.reduce((acc, a) => acc + a.analysis.matchScore, 0) / totalScreened)
    : 0;

  const handleCopyQuestion = (question: string, id: string) => {
    navigator.clipboard.writeText(question);
    setCopiedQuestionId(id);
    setTimeout(() => setCopiedQuestionId(null), 2000);
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 70) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 55) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner & Overview */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 bg-neutral-900 text-white rounded-lg shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
              Hiring Team Admin Dashboard
            </h1>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 whitespace-nowrap">
              Admin-Only Score Room
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Review posted job descriptions, applicant pipelines, and LLM-evaluated candidate fit scores.
          </p>
        </div>

        <button
          id="btn-post-new-opening"
          onClick={onOpenNewJobModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-neutral-800 transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job Opening</span>
        </button>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500">Active Job Openings</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{jobs.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500">Total Resumes Screened</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{totalScreened}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500">Strong Match Candidates</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{strongMatches}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500">Avg Candidate Score</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{avgScore}/100</p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: All Posted Job Openings (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Posted Job Openings ({jobs.length})
            </h2>
            <span className="text-[11px] text-neutral-400">Select to view applicants</span>
          </div>

          <div className="space-y-2.5">
            {jobs.map((job) => {
              const isSelected = job.id === selectedJob?.id;
              const count = applications.filter((a) => a.jobId === job.id).length;
              return (
                <div
                  key={job.id}
                  id={`admin-jd-card-${job.id}`}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all text-left ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {job.company}
                      </span>
                      <h3 className="font-semibold text-sm leading-snug mt-0.5">
                        {job.title}
                      </h3>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isSelected 
                        ? 'bg-neutral-800 text-neutral-100 border border-neutral-700' 
                        : count > 0 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {count} {count === 1 ? 'Resume' : 'Resumes'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className={`flex items-center gap-1 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      <MapPin className="w-3 h-3" />
                      {job.location || 'Remote'}
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Applications submitted against this JD (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Header of Active JD */}
          {selectedJob && (
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {selectedJob.company}
                    </span>
                    <span className="text-xs text-neutral-300">•</span>
                    <span className="text-xs text-neutral-500">{selectedJob.department}</span>
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                    {selectedJob.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-toggle-view-jd"
                    onClick={() => setIsViewingFullJD(!isViewingFullJD)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isViewingFullJD ? 'Hide JD Text' : 'View Full JD'}</span>
                  </button>
                </div>
              </div>

              {/* Expandable JD drawer */}
              {isViewingFullJD && (
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
                  {selectedJob.description}
                </div>
              )}

              {/* Filters for this JD's applications */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-700">
                    Applicant Pool ({filteredApplications.length} of {jobApplications.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search candidates..."
                      className="pl-8 pr-3 py-1 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 w-36 sm:w-44"
                    />
                  </div>

                  {/* Filter by match category */}
                  <select
                    value={verdictFilter}
                    onChange={(e) => setVerdictFilter(e.target.value)}
                    className="px-2.5 py-1 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden text-neutral-700"
                  >
                    <option value="all">All Scores</option>
                    <option value="strong">Strong Match (85+)</option>
                    <option value="potential">Potential (70-84)</option>
                    <option value="moderate">Moderate (&lt;70)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* List of Resumes submitted against selected JD */}
          {filteredApplications.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-neutral-200 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm">
                No Resumes Found For This Job Opening
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {jobApplications.length === 0
                  ? 'No candidates have submitted their .docx resume against this JD yet. Switch to the Candidate Portal to apply.'
                  : 'No applicants match the current search or verdict filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const isResumeExpanded = expandedResumeAppId === app.id;
                const scoreColor = getScoreBadgeColor(app.analysis.matchScore);

                return (
                  <div
                    key={app.id}
                    id={`applicant-card-${app.id}`}
                    className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 space-y-5 transition-all hover:border-neutral-300"
                  >
                    {/* Top Row: Candidate Header + Score Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-100 pb-4">
                      
                      {/* Candidate Identity */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-neutral-900">
                            {app.candidate.fullName}
                          </h3>
                          <span className="text-xs text-neutral-500">
                            (Age: {app.candidate.age})
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${scoreColor}`}>
                            {app.analysis.verdict}
                          </span>
                        </div>

                        {/* Contact Meta */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 pt-1">
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
                        </div>
                      </div>

                      {/* Score Gauge Badge */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                            Match Score
                          </span>
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="text-2xl font-black text-neutral-900 tracking-tight">
                              {app.analysis.matchScore}
                            </span>
                            <span className="text-xs text-neutral-400 font-medium">/100</span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-14 h-14 rounded-full border-4 border-neutral-100 flex items-center justify-center relative">
                          <div 
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: `conic-gradient(${
                                app.analysis.matchScore >= 85 ? '#10b981' : app.analysis.matchScore >= 70 ? '#3b82f6' : '#f59e0b'
                              } ${app.analysis.matchScore * 3.6}deg, transparent 0deg)`,
                              mask: 'radial-gradient(transparent 55%, black 56%)',
                              WebkitMask: 'radial-gradient(transparent 55%, black 56%)',
                            }}
                          />
                          <Award className={`w-5 h-5 ${
                            app.analysis.matchScore >= 85 ? 'text-emerald-600' : app.analysis.matchScore >= 70 ? 'text-blue-600' : 'text-amber-600'
                          }`} />
                        </div>
                      </div>

                    </div>

                    {/* Section 1: LLM Fit Summary */}
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          LLM Fit Summary
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {app.analysis.modelUsed}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                        {app.analysis.fitSummary}
                      </p>
                    </div>

                    {/* Section 2: Strengths vs Gaps Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Strengths */}
                      <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-2">
                        <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Identified Strengths & JD Alignment
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

                      {/* Gaps & Red Flags */}
                      <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-100 space-y-2">
                        <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Gaps, Risks & Missing Elements
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

                    {/* Section 3: Follow-Up Questions for Interviewers */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                        Targeted Interview Follow-Up Questions (Probe Gaps)
                      </h4>
                      <div className="space-y-1.5">
                        {app.analysis.followUpQuestions.map((q, qIndex) => {
                          const questionId = `${app.id}-q-${qIndex}`;
                          const isCopied = copiedQuestionId === questionId;
                          return (
                            <div 
                              key={qIndex}
                              className="p-2.5 bg-neutral-50 hover:bg-neutral-100/80 rounded-lg border border-neutral-200 flex items-center justify-between gap-3 text-xs text-neutral-800 transition-colors"
                            >
                              <span className="leading-relaxed">
                                <strong className="text-neutral-500 mr-1.5">Q{qIndex + 1}:</strong>
                                {q}
                              </span>
                              <button
                                onClick={() => handleCopyQuestion(q, questionId)}
                                className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded hover:bg-white transition-colors shrink-0"
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

                    {/* Section 4: File Details & Raw Resume Drawer Toggle */}
                    <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-medium text-neutral-700">{app.resumeFileName}</span>
                        <span>•</span>
                        <span>Submitted {new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedResumeAppId(isResumeExpanded ? null : app.id)}
                          className="px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{isResumeExpanded ? 'Hide Raw .docx Text' : 'Inspect Raw .docx CV'}</span>
                        </button>

                        {/* Status tag */}
                        <select
                          value={app.status}
                          onChange={(e) => onUpdateApplicationStatus(app.id, e.target.value as JobApplication['status'])}
                          className="px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-md text-xs font-medium text-neutral-700"
                        >
                          <option value="submitted">Status: Submitted</option>
                          <option value="reviewed">Status: Reviewed</option>
                          <option value="shortlisted">Status: Shortlisted</option>
                          <option value="rejected">Status: Rejected</option>
                        </select>
                      </div>
                    </div>

                    {/* Expanded Raw Resume Text */}
                    {isResumeExpanded && (
                      <div className="p-4 bg-neutral-900 text-neutral-200 rounded-xl font-mono text-[11px] leading-relaxed max-h-64 overflow-y-auto whitespace-pre-line border border-neutral-800">
                        <div className="text-neutral-400 text-[10px] uppercase font-sans mb-2 border-b border-neutral-800 pb-1">
                          Extracted Word (.docx) Document Stream
                        </div>
                        {app.resumeParsedText}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
