import React from 'react';
import { Briefcase, ShieldCheck, UserCheck, BookOpen, Lock, Unlock } from 'lucide-react';

interface Props {
  activeTab: 'candidate' | 'admin';
  onTabChange: (tab: 'candidate' | 'admin') => void;
  isAdminAuthenticated: boolean;
  onOpenAdminAuth: () => void;
  onAdminLogout: () => void;
  onOpenWriteup: () => void;
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
  applicationCount,
  jobCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2.5 lg:h-16 lg:py-0">

          {/* Logo and Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-xs shrink-0">
              <Briefcase className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-neutral-900 text-base sm:text-lg tracking-tight">Resume Screener</span>
                <span className="hidden xs:inline text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200">
                  Dual-Sided
                </span>
              </div>
              <p className="text-xs text-neutral-500 hidden lg:block">
                {jobCount} Active Openings • {applicationCount} Applications
              </p>
            </div>
          </div>

          {/* Action Buttons (writeup + admin lock) — grouped with logo row until desktop width */}
          <div className="flex items-center gap-2 order-2 lg:order-3 shrink-0">
            <button
              id="btn-open-writeup"
              onClick={onOpenWriteup}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
              title="View Candidate Brief & Technical Write-up"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xl:inline">Brief Write-Up</span>
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
          </div>

          {/* Persona View Switcher — full width on its own row until desktop width */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200 w-full lg:w-auto order-3 lg:order-2">
            <button
              id="tab-candidate-portal"
              onClick={() => onTabChange('candidate')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 flex-1 lg:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'candidate'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">Candidate Portal</span>
              <span className="hidden xl:inline text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">Public</span>
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
              className={`flex items-center justify-center gap-1.5 sm:gap-2 flex-1 lg:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {isAdminAuthenticated ? (
                <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="truncate">Admin Dashboard</span>
              <span className="hidden xl:inline text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">Protected</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
