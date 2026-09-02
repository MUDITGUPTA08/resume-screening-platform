import React from 'react';
import { Briefcase, ShieldCheck, UserCheck, BookOpen, RotateCcw, Lock, Unlock } from 'lucide-react';

interface Props {
  activeTab: 'candidate' | 'admin';
  onTabChange: (tab: 'candidate' | 'admin') => void;
  isAdminAuthenticated: boolean;
  onOpenAdminAuth: () => void;
  onAdminLogout: () => void;
  onOpenWriteup: () => void;
  onResetData: () => void;
  applicationCount: number;
  jobCount: number;
}

export const Header: React.FC<Props> = ({
  activeTab,
  onTabChange,
  isAdminAuthenticated,
  onOpenAdminAuth,
  onAdminLogout,
  onOpenWriteup,
  onResetData,
  applicationCount,
  jobCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo and Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-lg tracking-tight">Resume Screener</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200">
                  Dual-Sided
                </span>
              </div>
              <p className="text-xs text-neutral-500 hidden sm:block">
                {jobCount} Active Openings • {applicationCount} Applications
              </p>
            </div>
          </div>

          {/* Persona View Switcher */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
            <button
              id="tab-candidate-portal"
              onClick={() => onTabChange('candidate')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'candidate'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Candidate Portal</span>
              <span className="hidden md:inline text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">Public</span>
            </button>

            <button
              id="tab-admin-dashboard"
              onClick={() => {
                if (!isAdminAuthenticated) {
                  onOpenAdminAuth();
                } else {
                  onTabChange('admin');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {isAdminAuthenticated ? (
                <Unlock className="w-4 h-4 text-emerald-600" />
              ) : (
                <Lock className="w-4 h-4 text-amber-600" />
              )}
              <span>Admin Dashboard</span>
              <span className="hidden md:inline text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">Protected</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-open-writeup"
              onClick={onOpenWriteup}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
              title="View Candidate Brief & Technical Write-up"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden lg:inline">Brief Write-Up</span>
            </button>

            {isAdminAuthenticated && activeTab === 'admin' && (
              <button
                id="btn-admin-logout"
                onClick={onAdminLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-red-600 hover:bg-red-50 border border-neutral-200 rounded-lg transition-colors"
                title="Lock Admin Access"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            )}

            <button
              id="btn-reset-demo-data"
              onClick={() => {
                if (window.confirm('Reset all job openings and applications to default sample data?')) {
                  onResetData();
                }
              }}
              className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Reset to Sample Openings & Applications"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
