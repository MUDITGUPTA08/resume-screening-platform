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
  getStoredAdminPasscode,
  setStoredAdminPasscode,
  clearStoredAdminPasscode,
} from './services/apiClient';

export default function App() {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'candidate' | 'admin'>('candidate');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return Boolean(getStoredAdminPasscode());
  });

  const [isAdminGateOpen, setIsAdminGateOpen] = useState<boolean>(false);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState<boolean>(false);
  const [isWriteupOpen, setIsWriteupOpen] = useState<boolean>(false);

  const loadPublicJobs = useCallback(async () => {
    try {
      setIsLoadingJobs(true);
      setLoadError('');
      const data = await fetchOpenJobs();
      setJobs(data);
    } catch (e) {
      console.error('Failed to load job openings', e);
      setLoadError('Could not load job openings. Please refresh the page.');
    } finally {
      setIsLoadingJobs(false);
    }
  }, []);

  const loadAdminData = useCallback(async () => {
    try {
      const [adminJobs, adminApplications] = await Promise.all([
        fetchAdminJobs(),
        fetchAdminApplications(),
      ]);
      setJobs(adminJobs);
      setApplications(adminApplications);
    } catch (e) {
      console.error('Failed to load admin data', e);
    }
  }, []);

  useEffect(() => {
    loadPublicJobs();
  }, [loadPublicJobs]);

  useEffect(() => {
    if (activeTab === 'admin' && isAdminAuthenticated) {
      loadAdminData();
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
    loadAdminData();
    loadPublicJobs();
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
        jobCount={jobs.length}
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
            jobs={jobs}
            isLoading={isLoadingJobs}
            onApplicationSubmitted={handleApplicationSubmitted}
          />
        ) : (
          <AdminDashboard
            jobs={jobs}
            applications={applications}
            onOpenNewJobModal={() => setIsNewJobModalOpen(true)}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-neutral-200/80 bg-white/60 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Resume Screener</span>
          <button
            onClick={() => setIsWriteupOpen(true)}
            className="hover:text-neutral-900 underline transition-colors"
          >
            Project Write-Up
          </button>
        </div>
      </footer>

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
