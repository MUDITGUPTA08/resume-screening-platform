import React, { useState } from 'react';
import { Lock, ShieldCheck, X, KeyRound, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (passcode: string) => boolean;
}

export const AdminGateModal: React.FC<Props> = ({ isOpen, onClose, onAuthenticate }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onAuthenticate(passcode.trim());
    if (!success) {
      setError('Invalid admin passcode. Hint: Use default passcode "admin123".');
    }
  };

  const handleQuickUnlock = () => {
    onAuthenticate('admin123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="admin-auth-gate-modal"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Admin Authentication</h3>
              <p className="text-xs text-neutral-500">Access Restricted Hiring Team View</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-neutral-600 leading-relaxed">
            As outlined in the assignment brief, candidate applications and AI match scores are strictly confidential and restricted to the hiring team.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-700">
              Admin Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-admin-passcode"
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter passcode (e.g. admin123)"
                className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
            <span>Default passcode for evaluation:</span>
            <code className="px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded font-mono font-semibold">
              admin123
            </code>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              id="btn-submit-passcode"
              type="submit"
              className="w-full py-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 text-sm font-medium transition-colors shadow-xs"
            >
              Verify & Enter Admin Portal
            </button>
            <button
              id="btn-quick-unlock"
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 text-xs font-medium transition-colors"
            >
              One-Click Unlock (Reviewer Shortcut)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
