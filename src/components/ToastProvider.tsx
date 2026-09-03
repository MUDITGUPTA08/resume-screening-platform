import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, X, Undo2 } from 'lucide-react';

type ToastVariant = 'success' | 'error';

interface ToastAction {
  label: string;
  onAct: () => void;
}

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
}

interface ToastApi {
  showToast: (
    message: string,
    options?: { variant?: ToastVariant; action?: ToastAction; durationMs?: number }
  ) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

// Mutations in this app are optimistic and were previously silent: a failed
// status update only reached the console, so the UI showed a change that had
// not been saved. Toasts make both outcomes visible, and carry the undo
// affordance for actions that are easy to trigger by mistake.
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback<ToastApi['showToast']>(
    (message, options) => {
      const id = nextId.current++;
      const variant = options?.variant ?? 'success';
      // Errors and undoable actions stay up longer -- both need a decision.
      const durationMs =
        options?.durationMs ?? (variant === 'error' ? 6000 : options?.action ? 6000 : 3500);

      setToasts((prev) => [...prev.slice(-2), { id, message, variant, action: options?.action }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), durationMs)
      );
    },
    [dismiss]
  );

  const api = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
        // Announced politely so a screen reader hears the outcome without
        // having the current reading interrupted.
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-up ${
              toast.variant === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-neutral-900 border-neutral-800 text-white'
            }`}
          >
            {toast.variant === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span className="text-xs font-medium grow leading-snug">{toast.message}</span>

            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onAct();
                  dismiss(toast.id);
                }}
                className={`shrink-0 flex items-center gap-1 text-xs font-semibold underline underline-offset-2 transition-colors ${
                  toast.variant === 'error' ? 'hover:text-red-600' : 'hover:text-neutral-300'
                }`}
              >
                <Undo2 className="w-3.5 h-3.5" />
                {toast.action.label}
              </button>
            )}

            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className={`shrink-0 p-1 rounded-md transition-colors ${
                toast.variant === 'error' ? 'hover:bg-red-100' : 'hover:bg-neutral-800'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
