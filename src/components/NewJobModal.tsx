import React, { useState } from 'react';
import { X, Briefcase, Sparkles, Loader2 } from 'lucide-react';
import { createJobAdmin } from '../services/apiClient';
import { FormField } from './FormField';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onJobPosted: () => void;
}

export const NewJobModal: React.FC<Props> = ({ isOpen, onClose, onJobPosted }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const handleLoadSample = (sampleType: 'growth' | 'product') => {
    if (sampleType === 'growth') {
      setTitle('Growth & Performance Marketing Manager');
      setCompany('Aura Living');
      setDepartment('Growth Marketing');
      setLocation('Delhi NCR, India');
      setDescription(`About Aura Living:
Aura Living is a direct-to-consumer home wellness and ergonomics brand revolutionizing how modern professionals live and work.

Key Responsibilities:
• Own paid user acquisition across Meta, Google Ads, and emerging channels with an 8-figure annual budget.
• Build continuous multivariate A/B testing loops for landing pages, ad copy, and creative assets.
• Drive customer acquisition cost (CAC) optimization and ROAS tracking across blended attribution models.
• Partner with product and engineering to optimize customer checkout funnel and conversion rate.

Requirements:
• 3–5 years scaling performance marketing at a fast-growing D2C brand or high-growth consumer tech startup.
• Deep analytical rigor: cohort analyses, CAC-to-LTV ratios, and analytics tooling (GA4, Mixpanel).
• Strong creative intuition paired with experimental discipline.`);
    } else {
      setTitle('Senior Product Manager (Core Experience)');
      setCompany('OmniFlow');
      setDepartment('Product Management');
      setLocation('Bengaluru / Remote');
      setDescription(`About OmniFlow:
OmniFlow provides enterprise collaboration infrastructure for globally distributed teams.

Key Responsibilities:
• Lead product discovery, roadmapping, and feature execution for the core collaboration suite.
• Work with engineering, UX research, and design leaders to deliver enterprise-grade workflows.
• Measure usage analytics, adoption velocity, and Net Promoter Scores.

Requirements:
• 4+ years of product management experience in B2B SaaS.
• Proven track record shipping complex, highly scalable web applications.
• Strong technical background with API architectures and system design.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = 'Job title is required';
    if (!company.trim()) newErrors.company = 'Company/Brand name is required';
    if (!description.trim() || description.length < 50) newErrors.description = 'Please provide a substantive job description (min 50 chars)';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);
    try {
      await createJobAdmin({
        title: title.trim(),
        company: company.trim(),
        department: department.trim() || 'General',
        location: location.trim() || 'Flexible / Remote',
        description: description.trim(),
      });
      onJobPosted();
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to post job opening. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="new-job-modal"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 border-b border-neutral-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neutral-900 text-white rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900">Post New Job Opening</h2>
              <p className="text-xs text-neutral-500">Post a new JD for candidate submissions and AI screening</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto grow">
          {/* Quick template loader */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
            <span className="font-medium text-neutral-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Quick Fill Sample JDs:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('growth')}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-md font-medium text-neutral-800 transition-colors"
              >
                + Growth Manager
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('product')}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-md font-medium text-neutral-800 transition-colors"
              >
                + Product Manager
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="input-job-title"
              label="Job Title"
              value={title}
              onChange={(v) => {
                setTitle(v);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Founders Office Associate"
              error={errors.title}
            />
            <FormField
              id="input-job-company"
              label="Company / Brand"
              value={company}
              onChange={(v) => {
                setCompany(v);
                if (errors.company) setErrors((prev) => ({ ...prev, company: '' }));
              }}
              placeholder="e.g. Satva Partners"
              error={errors.company}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="input-job-dept"
              label="Department / Function"
              value={department}
              onChange={setDepartment}
              placeholder="e.g. Strategy & Operations"
              required={false}
            />
            <FormField
              id="input-job-location"
              label="Location"
              value={location}
              onChange={setLocation}
              placeholder="e.g. Bengaluru, India (Hybrid)"
              required={false}
            />
          </div>

          <FormField
            id="input-job-description"
            label="Full Job Description (JD) Text"
            value={description}
            onChange={(v) => {
              setDescription(v);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            placeholder="Paste the full job opening requirements, responsibilities, and qualifications..."
            error={errors.description}
            helpText="Include role overview, responsibilities, requirements, and qualifications. The LLM will evaluate applicant resumes directly against this text."
            multiline
            rows={8}
            monospace
          />

          {/* Footer */}
          <div className="pt-2 space-y-2 border-t border-neutral-100">
            {submitError && (
              <p className="text-xs text-red-600">{submitError}</p>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-post-job"
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors shadow-xs disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Publish Job Opening</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
