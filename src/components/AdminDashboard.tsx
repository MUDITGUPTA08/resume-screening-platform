import React, { useState } from 'react';
import { JobOpening, JobApplication, SCORE_THRESHOLDS } from '../types';
import { ApplicantCard } from './ApplicantCard';
import {
  Briefcase,
  MapPin,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  Inbox,
  Users,
  Target,
  TrendingUp,
  ArrowUpDown
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
  const [sortOrder, setSortOrder] = useState<'score-desc' | 'score-asc' | 'newest' | 'oldest'>('score-desc');
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [expandedResumeAppId, setExpandedResumeAppId] = useState<string | null>(null);
  const [expandedAnalysisAppId, setExpandedAnalysisAppId] = useState<string | null>(null);
  const [isViewingFullJD, setIsViewingFullJD] = useState<boolean>(false);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // Resumes for selected JD (One-to-Many relationship)
  const jobApplications = applications.filter((app) => app.jobId === selectedJob?.id);

  // Filtered + sorted applications
  const filteredApplications = jobApplications
    .filter((app) => {
      const matchesSearch =
        app.candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidate.currentLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.analysis.fitSummary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesVerdict =
        verdictFilter === 'all' || app.analysis.verdict.toLowerCase().includes(verdictFilter.toLowerCase());

      return matchesSearch && matchesVerdict;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'score-desc':
          return b.analysis.matchScore - a.analysis.matchScore;
        case 'score-asc':
          return a.analysis.matchScore - b.analysis.matchScore;
        case 'newest':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case 'oldest':
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        default:
          return 0;
      }
    });

  // Calculate statistics
  const totalScreened = applications.length;
  const strongMatches = applications.filter((a) => a.analysis.matchScore >= SCORE_THRESHOLDS.strong).length;
  const avgScore = totalScreened > 0
    ? Math.round(applications.reduce((acc, a) => acc + a.analysis.matchScore, 0) / totalScreened)
    : 0;

  const handleCopyQuestion = async (question: string, id: string) => {
    try {
      await navigator.clipboard.writeText(question);
      setCopiedQuestionId(id);
      setTimeout(() => setCopiedQuestionId(null), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
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
              Hiring Dashboard
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Manage open positions and review candidate applications.
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
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-neutral-100 text-neutral-600 shrink-0">
              <Briefcase className="w-3.5 h-3.5" />
            </span>
            <p className="text-xs text-neutral-500 truncate">Open Roles</p>
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{jobs.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-neutral-100 text-neutral-600 shrink-0">
              <Users className="w-3.5 h-3.5" />
            </span>
            <p className="text-xs text-neutral-500 truncate">Applications</p>
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{totalScreened}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <Target className="w-3.5 h-3.5" />
            </span>
            <p className="text-xs text-neutral-500 truncate">Strong Match</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{strongMatches}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            <p className="text-xs text-neutral-500 truncate">Avg Match</p>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{avgScore}%</p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: All Posted Job Openings (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Open Positions ({jobs.length})
            </h2>
            <span className="text-[11px] text-neutral-400">Select a role</span>
          </div>

          {jobs.length === 0 && (
            <div className="p-10 bg-white rounded-2xl border border-neutral-200 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm">No open positions yet</h3>
              <p className="text-xs text-neutral-500 max-w-[24ch] mx-auto">
                Create your first job opening to start accepting applications.
              </p>
              <button
                onClick={onOpenNewJobModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Post New Job
              </button>
            </div>
          )}

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
              <div className="flex flex-col gap-3 pt-1">
                <span className="text-xs font-semibold text-neutral-700">
                  Candidates for this role ({filteredApplications.length} of {jobApplications.length})
                </span>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {/* Search input */}
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search candidate name or email..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Filter by match category */}
                    <select
                      value={verdictFilter}
                      onChange={(e) => setVerdictFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden text-neutral-700"
                    >
                      <option value="all">All Scores</option>
                      <option value="strong">Strong Match (85+)</option>
                      <option value="potential">Potential (70-84)</option>
                      <option value="moderate">Moderate (&lt;70)</option>
                    </select>

                    {/* Sort order */}
                    <div className="relative">
                      <ArrowUpDown className="w-3 h-3 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                        className="pl-7 pr-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden text-neutral-700"
                      >
                        <option value="score-desc">Highest Score</option>
                        <option value="score-asc">Lowest Score</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* List of Resumes submitted against selected JD */}
          {filteredApplications.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-neutral-200 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm">
                {jobApplications.length === 0 ? 'No applications yet' : 'No matching applicants'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {jobApplications.length === 0
                  ? 'Applications submitted for this role will appear here once candidates start applying.'
                  : 'No applicants match the current search or filter. Try adjusting them.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <ApplicantCard
                  key={app.id}
                  app={app}
                  isAnalysisExpanded={expandedAnalysisAppId === app.id}
                  isResumeExpanded={expandedResumeAppId === app.id}
                  copiedQuestionId={copiedQuestionId}
                  onToggleAnalysis={() => setExpandedAnalysisAppId(expandedAnalysisAppId === app.id ? null : app.id)}
                  onToggleResume={() => setExpandedResumeAppId(expandedResumeAppId === app.id ? null : app.id)}
                  onCopyQuestion={handleCopyQuestion}
                  onUpdateStatus={(status) => onUpdateApplicationStatus(app.id, status)}
                />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
