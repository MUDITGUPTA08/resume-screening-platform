import React, { useState, useEffect, useCallback } from 'react';
import { JobOpening, JobApplication } from './types';
import { Header } from './components/Header';
import { CandidatePortal } from './components/CandidatePortal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminGateModal } from './components/AdminGateModal';
import { NewJobModal } from './components/NewJobModal';
import { ArchitectureWriteupModal } from './components/ArchitectureWriteupModal';
import { useToast } from './components/ToastProvider';
import {
  fetchOpenJobs,
  fetchAdminJobs,
  fetchAdminApplications,
  verifyAdminPasscode,
  updateApplicationStatusAdmin,
  updateJobStatusAdmin,
  getStoredAdminPasscode,
  setStoredAdminPasscode,
  clearStoredAdminPasscode,
} from './services/apiClient';

const STATUS_LABELS: Record<JobApplication['status'], string> = {
  submitted: 'Submitted',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
};

export default function App() {
  const { showToast } = useToast();

  // Kept as two separate slices -- the public list is open-only and the
  // admin list includes closed jobs too, so a single shared `jobs` state
  // let whichever fetch resolved last (public vs admin) clobber the other
  // view's data, causing a visible flicker when switching tabs quickly.
  const [publicJobs, setPublicJobs] = useState<JobOpening[]>([]);
  const [adminJobs, setAdminJobs] = useState<JobOpening[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);
  const [isLoadingAdminData, setIsLoadingAdminData] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'candidate' | 'admin'>('candidate');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return Boolean(getStoredAdminPasscode());
  });

  const [isAdminGateOpen, setIsAdminGateOpen] = useState<boolean>(false);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState<boolean>(false);
  const [isWriteupOpen, setIsWriteupOpen] = useState<boolean>(false);

  // Tab switches can fire several silent background refetches for the same
  // resource before any of them return, and network responses can resolve
  // out of order -- an older in-flight request finishing after a newer one
  // would otherwise clobber fresher (or optimistically-updated) state with
  // stale data, which is what produced the "there, then not" flicker.
  // Each loader tags its own call with a sequence number and only applies
  // the response if it's still the most recent call for that resource.
  const publicJobsRequestId = React.useRef(0);
  const adminDataRequestId = React.useRef(0);

  const loadPublicJobs = useCallback(async (options?: { silent?: boolean }) => {
    const requestId = ++publicJobsRequestId.current;
    try {
      if (!options?.silent) {
        setIsLoadingJobs(true);
      }
      setLoadError('');
      const data = await fetchOpenJobs();
      if (requestId !== publicJobsRequestId.current) return;
      setPublicJobs(data);
    } catch (e) {
      console.error('Failed to load job openings', e);
      if (requestId !== publicJobsRequestId.current) return;
      if (!options?.silent) {
        setLoadError('Could not load job openings. Please refresh the page.');
      }
    } finally {
      if (requestId === publicJobsRequestId.current && !options?.silent) {
        setIsLoadingJobs(false);
      }
    }
  }, []);

  const loadAdminData = useCallback(async (options?: { silent?: boolean }) => {
    const requestId = ++adminDataRequestId.current;
    try {
      if (!options?.silent) {
        setIsLoadingAdminData(true);
      }
      const [fetchedJobs, fetchedApplications] = await Promise.all([
        fetchAdminJobs(),
        fetchAdminApplications(),
      ]);
      if (requestId !== adminDataRequestId.current) return;
      setAdminJobs(fetchedJobs);
      setApplications(fetchedApplications);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      if (requestId === adminDataRequestId.current && !options?.silent) {
        setIsLoadingAdminData(false);
      }
    }
  }, []);

  const hasLoadedJobsOnce = React.useRef(false);
  const hasLoadedAdminDataOnce = React.useRef(false);

  useEffect(() => {
    if (activeTab === 'candidate') {
      loadPublicJobs({ silent: hasLoadedJobsOnce.current });
      hasLoadedJobsOnce.current = true;
    }
  }, [activeTab, loadPublicJobs]);

  useEffect(() => {
    if (activeTab === 'admin' && isAdminAuthenticated) {
      loadAdminData({ silent: hasLoadedAdminDataOnce.current });
      hasLoadedAdminDataOnce.current = true;
    }
  }, [activeTab, isAdminAuthenticated, loadAdminData]);

  // Scroll position is shared across both views, so arriving from a scrolled
  // dashboard used to drop you into the middle of the other tab. Keyed off
  // activeTab rather than the switcher's click handler so the two indirect
  // paths -- unlocking the passcode gate and logging out -- reset too.
  const isFirstTabRender = React.useRef(true);
  useEffect(() => {
    if (isFirstTabRender.current) {
      // Don't fight the browser's own scroll restoration on initial load.
      isFirstTabRender.current = false;
      return;
    }
    // `behavior: 'smooth'` is a script-driven scroll, so the stylesheet's
    // prefers-reduced-motion rule (animations/transitions only) can't reach it.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }, [activeTab]);

  const handleTabChange = (tab: 'candidate' | 'admin') => {
    if (tab === 'admin' && !isAdminAuthenticated) {
      setIsAdminGateOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleAuthenticate = async (passcode: string): Promise<boolean> => {
    const ok = await verifyAdminPasscode(passcode).catch(() => false);
    if (ok) {
      setStoredAdminPasscode(passcode);
      setIsAdminAuthenticated(true);
      setIsAdminGateOpen(false);
      setActiveTab('admin');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    clearStoredAdminPasscode();
    setActiveTab('candidate');
  };

  const handleJobPosted = () => {
    loadAdminData({ silent: true });
    loadPublicJobs({ silent: true });
  };

  const handleApplicationSubmitted = () => {
    // Candidate side never receives application/score data back —
    // nothing to store here beyond showing the confirmation screen.
  };

  const handleUpdateApplicationStatus = async (
    appId: string,
    status: JobApplication['status'],
    options?: { silent?: boolean }
  ) => {
    const previous = applications.find((app) => app.id === appId);
    try {
      await updateApplicationStatusAdmin(appId, status);
      setApplications((prev) => prev.map((app) => (app.id === appId ? { ...app, status } : app)));

      if (options?.silent) return;
      const name = previous?.candidate.fullName ?? 'Candidate';
      showToast(`${name} marked as ${STATUS_LABELS[status]}.`, {
        // Status is a single click with no confirmation step, so make the
        // mistake cheap to walk back rather than requiring a second click.
        action:
          previous && previous.status !== status
            ? {
                label: 'Undo',
                onAct: () =>
                  handleUpdateApplicationStatus(appId, previous.status, { silent: true }),
              }
            : undefined,
      });
    } catch (e) {
      console.error('Failed to update application status', e);
      // The write never landed -- say so instead of leaving an optimistic
      // change on screen that the server does not actually have.
      showToast('Could not save that status change. Please try again.', { variant: 'error' });
    }
  };

  const handleUpdateJobStatus = async (
    jobId: string,
    status: JobOpening['status'],
    options?: { silent?: boolean }
  ) => {
    try {
      await updateJobStatusAdmin(jobId, status);
      // Invalidate any refetch that was already in flight before this call
      // resolved -- otherwise it can land afterward with pre-close data and
      // stomp the optimistic update below right back to the old status.
      publicJobsRequestId.current += 1;
      adminDataRequestId.current += 1;
      setAdminJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status } : job)));
      // Keep the public (open-only) list honest too: a newly-closed job is
      // removed from it immediately, a reopened one is picked up on the
      // candidate tab's own next silent refetch rather than guessed here.
      setPublicJobs((prev) => prev.filter((job) => job.id !== jobId || status === 'open'));
      const job = adminJobs.find((j) => j.id === jobId);
      if (!options?.silent) {
        showToast(
          status === 'closed'
            ? `"${job?.title ?? 'Job'}" is closed to new applications.`
            : `"${job?.title ?? 'Job'}" is open for applications again.`,
          {
            action: {
              label: 'Undo',
              onAct: () =>
                handleUpdateJobStatus(jobId, status === 'closed' ? 'open' : 'closed', {
                  silent: true,
                }),
            },
          }
        );
      }
    } catch (e) {
      console.error('Failed to update job status', e);
      showToast('Could not update the job status. Please try again.', { variant: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminAuth={() => setIsAdminGateOpen(true)}
        onAdminLogout={handleAdminLogout}
        onOpenWriteup={() => setIsWriteupOpen(true)}
        applicationCount={applications.length}
        jobCount={publicJobs.length}
      />

      {/* Main View Area */}
      <main className="grow">
        {loadError && (
          <div className="max-w-3xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {loadError}
          </div>
        )}
        {activeTab === 'candidate' ? (
          <CandidatePortal
            jobs={publicJobs}
            isLoading={isLoadingJobs}
            onApplicationSubmitted={handleApplicationSubmitted}
          />
        ) : (
          <AdminDashboard
            jobs={adminJobs}
            applications={applications}
            isLoading={isLoadingAdminData}
            onOpenNewJobModal={() => setIsNewJobModalOpen(true)}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onUpdateJobStatus={handleUpdateJobStatus}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      <AdminGateModal
        isOpen={isAdminGateOpen}
        onClose={() => setIsAdminGateOpen(false)}
        onAuthenticate={handleAuthenticate}
      />

      <NewJobModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
        onJobPosted={handleJobPosted}
      />

      <ArchitectureWriteupModal
        isOpen={isWriteupOpen}
        onClose={() => setIsWriteupOpen(false)}
      />
    </div>
  );
}
