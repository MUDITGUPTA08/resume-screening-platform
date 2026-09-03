import React from 'react';

interface Props {
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  /** Spoken label -- card innards are decorative markup, not a usable name. */
  ariaLabel: string;
  children: React.ReactNode;
}

// Job cards in both portals were plain divs with onClick, which put them
// entirely out of reach of the keyboard. This keeps the existing div-based
// layout (a real <button> can't legally wrap the nested action buttons the
// admin card needs) while supplying the button semantics by hand.
export const SelectableCard: React.FC<Props> = ({
  isSelected,
  onSelect,
  className = '',
  style,
  id,
  ariaLabel,
  children,
}) => (
  <div
    id={id}
    role="button"
    tabIndex={0}
    aria-pressed={isSelected}
    aria-label={ariaLabel}
    onClick={onSelect}
    onKeyDown={(e) => {
      // Space scrolls the page by default; Enter/Space both activate a button.
      if (e.key === 'Enter' || e.key === ' ') {
        // Ignore keys forwarded from a nested control (e.g. the close button).
        if (e.target !== e.currentTarget) return;
        e.preventDefault();
        onSelect();
      }
    }}
    className={`focus:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 ${className}`}
    style={style}
  >
    {children}
  </div>
);
