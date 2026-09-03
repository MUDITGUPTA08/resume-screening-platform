import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  id: string;
  label: string;
  icon?: LucideIcon;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'number';
  min?: string;
  max?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  monospace?: boolean;
  helpText?: string;
}

// Shared field wrapper (optional leading icon + input/textarea + inline
// error) used by both the candidate application form and the admin new-job
// form, so every field's focus ring, error styling, and icon alignment stay
// in sync by construction rather than by copy-paste discipline.
export const FormField: React.FC<Props> = ({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
  min,
  max,
  multiline = false,
  rows = 2,
  required = true,
  monospace = false,
  helpText,
}) => {
  const fieldClasses = `w-full ${Icon ? 'pl-9' : 'px-3'} pr-3 py-2 text-sm bg-neutral-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all ${
    monospace ? 'font-mono text-xs leading-relaxed' : ''
  } ${error ? 'border-red-400 bg-red-50/40' : 'border-neutral-300'}`;

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-neutral-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {helpText && <p className="text-[11px] text-neutral-500 mb-1">{helpText}</p>}
      <div className="relative">
        {Icon && <Icon className={`w-4 h-4 text-neutral-400 absolute left-3 ${multiline ? 'top-3' : 'top-1/2 -translate-y-1/2'}`} />}
        {multiline ? (
          <textarea
            id={id}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={fieldClasses}
          />
        ) : (
          <input
            id={id}
            type={type}
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={fieldClasses}
          />
        )}
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
};
