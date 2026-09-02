import React, { useState, useEffect } from 'react';
import { JobOpening, JobApplication } from './types';
import { INITIAL_JOB_OPENINGS, INITIAL_APPLICATIONS } from './data/initialData';
import { Header } from './components/Header';
import { CandidatePortal } from './components/CandidatePortal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminGateModal } from './components/AdminGateModal';
import { NewJobModal } from './components/NewJobModal';
import { ArchitectureWriteupModal } from './components/ArchitectureWriteupModal';

const JOBS_STORAGE_KEY = 'resume_screener_jobs_v1';
const APPS_STORAGE_KEY = 'resume_screener_apps_v1';
const ADMIN_AUTH_KEY = 'resume_screener_admin_auth_v1';

export default function App() {
  const [jobs, setJobs] = useState<JobOpening[]>(() => {
    try {
      const saved = localStorage.getItem(JOBS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved jobs from localStorage', e);
    }
    return INITIAL_JOB_OPENINGS;
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem(APPS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved applications from localStorage', e);
    }
    return INITIAL_APPLICATIONS;
  });

  const [activeTab, setActiveTab] = useState<'candidate' | 'admin'>('candidate');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });

  const [isAdminGateOpen, setIsAdminGateOpen] = useState<boolean>(false);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState<boolean>(false);
  const [isWriteupOpen, setIsWriteupOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
    } catch (e) {
      console.error('Failed to persist jobs to localStorage', e);
    }
  }, [jobs]);

  useEffect(() => {
    try {
      localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(applications));
    } catch (e) {
      console.error('Failed to persist applications to localStorage', e);
    }
  }, [applications]);

  const handleTabChange = (tab: 'candidate' | 'admin') => {
    if (tab === 'admin' && !isAdminAuthenticated) {
      setIsAdminGateOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleAuthenticate = (passcode: string): boolean => {
    // Standard gate check: 'admin123' or 'admin'
    if (passcode.toLowerCase() === 'admin123' || passcode.toLowerCase() === 'admin') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setIsAdminGateOpen(false);
      setActiveTab('admin');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setActiveTab('candidate');
  };

  const handleAddJob = (newJob: JobOpening) => {
    setJobs((prev) => [newJob, ...prev]);
  };

  const handleApplicationSubmitted = (newApp: JobApplication) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  const handleUpdateApplicationStatus = (appId: string, status: JobApplication['status']) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status } : app))
    );
  };

  const handleResetData = () => {
    localStorage.removeItem(JOBS_STORAGE_KEY);
    localStorage.removeItem(APPS_STORAGE_KEY);
    setJobs(INITIAL_JOB_OPENINGS);
    setApplications(INITIAL_APPLICATIONS);
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
        onResetData={handleResetData}
        applicationCount={applications.length}
        jobCount={jobs.length}
      />

      {/* Main View Area */}
      <main className="grow">
        {activeTab === 'candidate' ? (
          <CandidatePortal
            jobs={jobs}
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
          <span>Resume Screener — Dual-Sided Talent Evaluation Platform</span>
          <button
            onClick={() => setIsWriteupOpen(true)}
            className="hover:text-neutral-900 underline transition-colors"
          >
            Review Candidate Brief Write-up & Evaluation Rubric
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
        onAddJob={handleAddJob}
      />

      <ArchitectureWriteupModal
        isOpen={isWriteupOpen}
        onClose={() => setIsWriteupOpen(false)}
      />
    </div>
  );
}
