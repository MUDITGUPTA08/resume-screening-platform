import React from 'react';

// Shimmer placeholder. The `.skeleton` animation lives in index.css; this
// wrapper exists so loading blocks read as shapes ("a 3/4-width line") rather
// than as another anonymous div carrying a utility-class string.
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton rounded ${className}`} />
);

interface CardProps {
  /** How many placeholder cards to render. */
  count: number;
  className?: string;
  children: React.ReactNode;
}

// Repeats one skeleton card shape `count` times with the staggered delay the
// real lists use, so the placeholder and the loaded list animate alike.
export const SkeletonList: React.FC<CardProps> = ({ count, className = '', children }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className={className} style={{ animationDelay: `${i * 80}ms` }}>
        {children}
      </div>
    ))}
  </>
);
