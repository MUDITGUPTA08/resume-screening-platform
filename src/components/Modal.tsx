import React, { useEffect, useRef, useCallback } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Accessible name for the dialog -- wired to aria-labelledby via this id. */
  labelledBy: string;
  /** Optional guard: return false to veto a close (unsaved-changes prompts). */
  onRequestClose?: () => boolean;
  children: React.ReactNode;
  /** Applied to the dialog panel itself so each modal keeps its own sizing. */
  panelClassName?: string;
  id?: string;
}

// Selector for everything the browser considers tabbable inside the panel.
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Shared dialog shell for every modal in the app. Centralises the four
// behaviours that are easy to forget per-modal and were previously missing
// everywhere: Escape to dismiss, a focus trap, focus restoration to whatever
// opened the dialog, and a body scroll lock so the page behind doesn't move.
export const Modal: React.FC<Props> = ({
  isOpen,
  onClose,
  labelledBy,
  onRequestClose,
  children,
  panelClassName = '',
  id,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  // Element that had focus before the dialog opened, restored on close so
  // keyboard users land back on the trigger rather than at the top of the page.
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const requestClose = useCallback(() => {
    if (onRequestClose && !onRequestClose()) return;
    onClose();
  }, [onClose, onRequestClose]);

  // Lock body scroll while open -- without this, scrolling past the end of a
  // modal's own content chains to the page underneath it.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Move focus into the dialog on open, restore it on close.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    if (panel) {
      // Prefer the first real control; fall back to the panel so screen
      // readers still announce the dialog when it has none.
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus();
    }

    return () => {
      // Restore on the next frame: React tears the panel down after this
      // cleanup runs, and removing a focused element resets focus to <body>,
      // which would immediately undo a synchronous restore here.
      const toRestore = previouslyFocused.current;
      if (!toRestore || !toRestore.isConnected) return;
      requestAnimationFrame(() => toRestore.focus());
    };
  }, [isOpen]);

  // Escape closes; Tab cycles within the panel instead of escaping to the page.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        requestClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable: HTMLElement[] = Array.prototype.slice
        .call(panel.querySelectorAll(FOCUSABLE))
        .filter((el: HTMLElement) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, requestClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      // Backdrop click dismisses, but only when the press started on the
      // backdrop -- a drag that ends outside a text selection shouldn't close.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        id={id}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`animate-scale-in focus:outline-hidden ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
};
