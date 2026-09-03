import React, { useState, useEffect, useCallback } from 'react';
import { JobOpening, JobApplication } from './types';
import { Header } from './components/Header';
import { CandidatePortal } from './components/CandidatePortal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminGateModal } from './components/AdminGateModal';
import { NewJobModal } from './components/NewJobModal';
import { ArchitectureWriteupModal } from './components/ArchitectureWriteupModal';
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

export default function App() {
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

  const loadPublicJobs = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setIsLoadingJobs(true);
      }
      setLoadError('');
      const data = await fetchOpenJobs();
      setPublicJobs(data);
    } catch (e) {
      console.error('Failed to load job openings', e);
      if (!options?.silent) {
        setLoadError('Could not load job openings. Please refresh the page.');
      }
    } finally {
      if (!options?.silent) {
        setIsLoadingJobs(false);
      }
    }
  }, []);

  const loadAdminData = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setIsLoadingAdminData(true);
      }
      const [fetchedJobs, fetchedApplications] = await Promise.all([
        fetchAdminJobs(),
        fetchAdminApplications(),
      ]);
      setAdminJobs(fetchedJobs);
      setApplications(fetchedApplications);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      if (!options?.silent) {
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

  const handleUpdateApplicationStatus = async (appId: string, status: JobApplication['status']) => {
    try {
      await updateApplicationStatusAdmin(appId, status);
      setApplications((prev) => prev.map((app) => (app.id === appId ? { ...app, status } : app)));
    } catch (e) {
      console.error('Failed to update application status', e);
    }
  };

  const handleUpdateJobStatus = async (jobId: string, status: JobOpening['status']) => {
    try {
      await updateJobStatusAdmin(jobId, status);
      setAdminJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status } : job)));
      // Keep the public (open-only) list honest too: a newly-closed job is
      // removed from it immediately, a reopened one is picked up on the
      // candidate tab's own next silent refetch rather than guessed here.
      setPublicJobs((prev) => prev.filter((job) => job.id !== jobId || status === 'open'));
    } catch (e) {
      console.error('Failed to update job status', e);
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
