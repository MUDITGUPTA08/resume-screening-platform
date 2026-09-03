import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Optional call to action rendered under the description. */
  action?: React.ReactNode;
  className?: string;
}

// The same icon-circle + heading + description block appeared three times
// across the two portals with only the copy differing. Sharing it keeps the
// spacing and muted palette consistent as new empty states get added.
export const EmptyState: React.FC<Props> = ({
  icon: Icon,
  title,
  description,
  action,
  className = 'p-12',
}) => (
  <div
    className={`bg-white rounded-2xl border border-neutral-200 text-center space-y-3 animate-fade-in ${className}`}
  >
    <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-semibold text-neutral-900 text-sm">{title}</h3>
    <p className="text-xs text-neutral-500 max-w-sm mx-auto">{description}</p>
    {action}
  </div>
);
