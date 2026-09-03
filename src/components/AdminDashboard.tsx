import React, { useState, useEffect } from 'react';
import { JobOpening, JobApplication, MatchVerdict, SCORE_THRESHOLDS } from '../types';
import { ApplicantCard } from './ApplicantCard';
import { SelectableCard } from './SelectableCard';
import { EmptyState } from './EmptyState';
import { Skeleton, SkeletonList } from './Skeleton';
import { usePersistentState } from '../hooks/usePersistentState';
import { scoreSearchRelevance } from '../utils/searchRelevance';
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
  ArrowUpDown,
  Lock,
  Unlock,
  X
} from 'lucide-react';

interface Props {
  jobs: JobOpening[];
  applications: JobApplication[];
  isLoading?: boolean;
  onOpenNewJobModal: () => void;
  onUpdateApplicationStatus: (appId: string, status: JobApplication['status']) => void;
  onUpdateJobStatus: (jobId: string, status: JobOpening['status']) => void;
}

// Exact filter-value -> verdict mapping, checked by equality rather than
// substring containment -- avoids relying on each verdict string happening
// not to collide with another filter's keyword.
const VERDICT_FILTER_MAP: Record<string, MatchVerdict> = {
  strong: 'Strong Match',
  potential: 'Potential Match',
  moderate: 'Moderate Match',
  low: 'Low Match',
};

export const AdminDashboard: React.FC<Props> = ({
  jobs,
  applications,
  isLoading,
  onOpenNewJobModal,
  onUpdateApplicationStatus,
  onUpdateJobStatus,
}) => {
  const [selectedJobId, setSelectedJobId] = usePersistentState<string>('admin.selectedJobId', '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // The filtered list is keyed on the query, so filtering on every keystroke
  // replayed the staggered entrance animation per character and made the list
  // strobe while typing. Debouncing the value the filter actually reads keeps
  // the input responsive while the results settle once.
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'score-desc' | 'score-asc' | 'newest' | 'oldest'>('score-desc');
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [expandedResumeAppId, setExpandedResumeAppId] = useState<string | null>(null);
  const [expandedAnalysisAppId, setExpandedAnalysisAppId] = useState<string | null>(null);
  const [isViewingFullJD, setIsViewingFullJD] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // Restore or repair the remembered selection once jobs arrive -- a job
  // deleted or renamed between visits must not leave the panel blank.
  useEffect(() => {
    if (jobs.length === 0) return;
    if (!selectedJobId || !jobs.some((j) => j.id === selectedJobId)) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId, setSelectedJobId]);

  // Resumes for selected JD (One-to-Many relationship)
  const jobApplications = applications.filter((app) => app.jobId === selectedJob?.id);

  const isSearching = debouncedSearch.trim().length > 0;

  const compareBySortOrder = (a: JobApplication, b: JobApplication) => {
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
  };

  // Filtered + sorted applications. Relevance is computed once per row rather
  // than inside the comparator, which would recompute it on every comparison.
  const filteredApplications = jobApplications
    .map((app) => ({ app, relevance: scoreSearchRelevance(app, debouncedSearch) }))
    .filter(({ app, relevance }) => {
      const matchesVerdict =
        verdictFilter === 'all' || app.analysis.verdict === VERDICT_FILTER_MAP[verdictFilter];
      return relevance > 0 && matchesVerdict;
    })
    .sort((a, b) => {
      // While searching, how well a row matches what was typed outranks the
      // chosen sort order; the sort order then breaks ties within a tier.
      if (isSearching && a.relevance !== b.relevance) {
        return b.relevance - a.relevance;
      }
      return compareBySortOrder(a.app, b.app);
    })
    .map(({ app }) => app);

  // Calculate statistics
  const openJobsCount = jobs.filter((j) => j.status === 'open').length;
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
      {isLoading && jobs.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SkeletonList count={4} className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded-lg" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-6 w-10" />
          </SkeletonList>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs transition-all">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-neutral-100 text-neutral-600 shrink-0">
                <Briefcase className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs text-neutral-500 truncate">Open Roles</p>
            </div>
            <p key={openJobsCount} className="text-2xl font-bold text-neutral-900 mt-2 animate-fade-in">{openJobsCount}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-neutral-100 text-neutral-600 shrink-0">
                <Users className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs text-neutral-500 truncate">Applications</p>
            </div>
            <p key={totalScreened} className="text-2xl font-bold text-neutral-900 mt-2 animate-fade-in">{totalScreened}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <Target className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs text-neutral-500 truncate">Strong Match</p>
            </div>
            <p key={strongMatches} className="text-2xl font-bold text-emerald-600 mt-2 animate-fade-in">{strongMatches}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs text-neutral-500 truncate">Avg Match</p>
            </div>
            <p key={avgScore} className="text-2xl font-bold text-blue-600 mt-2 animate-fade-in">{avgScore}%</p>
          </div>
        </div>
      )}

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: All Posted Job Openings (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Job Openings ({jobs.length})
            </h2>
            <span className="text-[11px] text-neutral-400">Select a role</span>
          </div>

          {isLoading && jobs.length === 0 && (
            <div className="space-y-2.5">
              <SkeletonList count={3} className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5">
                    <Skeleton className="h-2.5 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-7 w-full rounded-lg" />
              </SkeletonList>
            </div>
          )}

          {!isLoading && jobs.length === 0 && (
            <EmptyState
              icon={Briefcase}
              className="p-10"
              title="No open positions yet"
              description="Create your first job opening to start accepting applications."
              action={
                <button
                  onClick={onOpenNewJobModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Post New Job
                </button>
              }
            />
          )}

          <div className="space-y-2.5">
            {jobs.map((job, index) => {
              const isSelected = job.id === selectedJob?.id;
              const isClosed = job.status === 'closed';
              const count = applications.filter((a) => a.jobId === job.id).length;
              return (
                <SelectableCard
                  key={job.id}
                  id={`admin-jd-card-${job.id}`}
                  isSelected={isSelected}
                  onSelect={() => setSelectedJobId(job.id)}
                  ariaLabel={`${job.title}, ${count} ${count === 1 ? 'resume' : 'resumes'}${isClosed ? ', closed' : ''}`}
                  className={`stagger-item p-4 rounded-xl cursor-pointer border transition-all duration-300 text-left ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                      : isClosed
                      ? 'border-neutral-200 bg-neutral-50 text-neutral-500'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm hover:-translate-y-0.5 text-neutral-800'
                  }`}
                  style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 ${isSelected ? 'text-neutral-300' : isClosed ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {job.company}
                        </span>
                        {isClosed && (
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full animate-pop ${
                            isSelected ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-200 text-neutral-500'
                          }`}>
                            Closed
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm leading-snug mt-0.5">
                        {job.title}
                      </h3>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
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

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateJobStatus(job.id, isClosed ? 'open' : 'closed');
                    }}
                    className={`mt-3 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                        : isClosed
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <span key={isClosed ? 'closed' : 'open'} className="flex items-center gap-1.5 animate-fade-in">
                      {isClosed ? (
                        <><Unlock className="w-3 h-3" /> Reopen Position</>
                      ) : (
                        <><Lock className="w-3 h-3" /> Close Position</>
                      )}
                    </span>
                  </button>
                </SelectableCard>
              );
            })}
          </div>
        </div>

        {/* Right Column: Applications submitted against this JD (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Header of Active JD */}
          {selectedJob && (
            <div key={selectedJob.id} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {selectedJob.company}
                    </span>
                    <span className="text-xs text-neutral-300">•</span>
                    <span className="text-xs text-neutral-500">{selectedJob.department}</span>
                    {selectedJob.status === 'closed' && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600 animate-pop">
                        Closed
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                    {selectedJob.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateJobStatus(selectedJob.id, selectedJob.status === 'closed' ? 'open' : 'closed')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 active:scale-95 cursor-pointer ${
                      selectedJob.status === 'closed'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    <span key={selectedJob.status} className="flex items-center gap-1.5 animate-fade-in">
                      {selectedJob.status === 'closed' ? (
                        <><Unlock className="w-3.5 h-3.5" /> <span>Reopen</span></>
                      ) : (
                        <><Lock className="w-3.5 h-3.5" /> <span>Close</span></>
                      )}
                    </span>
                  </button>
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
                      // Escape clears without reaching for the mouse, matching
                      // the convention of every other search field.
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setSearchQuery('');
                      }}
                      aria-label="Search candidates"
                      placeholder="Search candidate name or email..."
                      className="w-full pl-8 pr-8 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
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
                      <option value="moderate">Moderate (55-69)</option>
                      <option value="low">Low Match (&lt;55)</option>
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
          {isLoading && jobs.length === 0 ? (
            <div className="space-y-3">
              <SkeletonList count={3} className="p-5 bg-white rounded-2xl border border-neutral-200 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
              </SkeletonList>
            </div>
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={
                jobApplications.length > 0
                  ? 'No matching applicants'
                  : selectedJob?.status === 'closed'
                  ? 'Closed with no applications'
                  : 'No applications yet'
              }
              description={
                jobApplications.length > 0
                  ? 'No applicants match the current search or filter. Try adjusting them.'
                  : selectedJob?.status === 'closed'
                  ? 'This role is closed, so it is hidden from the candidate portal and cannot receive new applications. Reopen it to start collecting resumes.'
                  : 'Applications submitted for this role will appear here once candidates start applying.'
              }
              action={
                jobApplications.length === 0 && selectedJob?.status === 'closed' ? (
                  <button
                    onClick={() => onUpdateJobStatus(selectedJob.id, 'open')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Reopen Position
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div key={`${selectedJob?.id}-${verdictFilter}-${sortOrder}-${debouncedSearch}`} className="space-y-3">
              {filteredApplications.map((app, index) => (
                <div key={app.id} className="stagger-item" style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}>
                  <ApplicantCard
                    app={app}
                    isAnalysisExpanded={expandedAnalysisAppId === app.id}
                    isResumeExpanded={expandedResumeAppId === app.id}
                    copiedQuestionId={copiedQuestionId}
                    onToggleAnalysis={() => setExpandedAnalysisAppId(expandedAnalysisAppId === app.id ? null : app.id)}
                    onToggleResume={() => setExpandedResumeAppId(expandedResumeAppId === app.id ? null : app.id)}
                    onCopyQuestion={handleCopyQuestion}
                    onUpdateStatus={(status) => onUpdateApplicationStatus(app.id, status)}
                  />
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
