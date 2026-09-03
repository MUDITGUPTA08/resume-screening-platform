import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from './Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (passcode: string) => Promise<boolean>;
}

export const AdminGateModal: React.FC<Props> = ({ isOpen, onClose, onAuthenticate }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);
    const success = await onAuthenticate(passcode.trim());
    setIsVerifying(false);
    if (!success) {
      setError('Invalid admin passcode. Hint: Use default passcode "admin123".');
    }
  };

  const handleQuickUnlock = async () => {
    setIsVerifying(true);
    await onAuthenticate('admin123');
    setIsVerifying(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      id="admin-auth-gate-modal"
      labelledBy="admin-gate-title"
      panelClassName="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

        <form onSubmit={handleSubmit} className="px-8 pt-10 pb-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-900 text-white flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h3 id="admin-gate-title" className="text-lg font-bold text-neutral-900 tracking-tight">Hiring Team Access</h3>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-[26ch] mx-auto">
              Enter your access passcode to manage jobs and review candidates.
            </p>
          </div>

          <div className="space-y-1.5 text-left">
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
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 text-sm text-center tracking-widest bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 flex items-center justify-center gap-1 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          <button
            id="btn-submit-passcode"
            type="submit"
            disabled={isVerifying}
            className="w-full py-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 text-sm font-medium transition-colors shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Unlock Dashboard</span>
          </button>

          <div className="pt-1 border-t border-neutral-100">
            <p className="text-[11px] text-neutral-400 pt-4">
              Demo environment ·{' '}
              <button
                id="btn-quick-unlock"
                type="button"
                onClick={handleQuickUnlock}
                disabled={isVerifying}
                className="underline underline-offset-2 hover:text-neutral-600 transition-colors disabled:opacity-60"
              >
                use demo passcode
              </button>
            </p>
          </div>
      </form>
    </Modal>
  );
};
