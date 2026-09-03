import React, { useState } from 'react';
import { X, Briefcase, Sparkles, Loader2 } from 'lucide-react';
import { createJobAdmin } from '../services/apiClient';
import { FormField } from './FormField';
import { Modal } from './Modal';
import { SAMPLE_JOB_DESCRIPTIONS, type SampleJobDescription } from '../data/sampleJobDescriptions';
import { useToast } from './ToastProvider';

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
  const { showToast } = useToast();

  const resetForm = () => {
    setTitle('');
    setCompany('');
    setDepartment('');
    setLocation('');
    setDescription('');
    setErrors({});
    setSubmitError('');
  };

  const isDirty = Boolean(
    title.trim() || company.trim() || department.trim() || location.trim() || description.trim()
  );

  // Dismissing the dialog used to silently discard a half-written JD, which is
  // a lot of typing to lose to a stray Escape or backdrop click. Confirm first,
  // and clear the draft only once the user has actually chosen to abandon it.
  const handleRequestClose = () => {
    if (isSubmitting) return false;
    if (isDirty && !window.confirm('Discard this job opening? Your changes will be lost.')) {
      return false;
    }
    resetForm();
    return true;
  };

  const handleCancelClick = () => {
    if (handleRequestClose()) onClose();
  };

  // Sample JDs are prose, so they live in JSON rather than inline here.
  const handleLoadSample = (sample: SampleJobDescription) => {
    setTitle(sample.title);
    setCompany(sample.company);
    setDepartment(sample.department);
    setLocation(sample.location);
    setDescription(sample.description);
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
      showToast(`"${title.trim()}" is now live and accepting applications.`);
      resetForm();
      onClose();
    } catch (err: any) {
      const message = err?.message || 'Failed to post job opening. Please try again.';
      setSubmitError(message);
      showToast(message, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={handleRequestClose}
      id="new-job-modal"
      labelledBy="new-job-title"
      panelClassName="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col"
    >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 border-b border-neutral-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neutral-900 text-white rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 id="new-job-title" className="font-semibold text-neutral-900">Post New Job Opening</h2>
              <p className="text-xs text-neutral-500">Post a new JD for candidate submissions and AI screening</p>
            </div>
          </div>
          <button
            onClick={handleCancelClick}
            aria-label="Close"
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
              {SAMPLE_JOB_DESCRIPTIONS.map((sample) => (
                <button
                  key={sample.key}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-md font-medium text-neutral-800 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
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
                onClick={handleCancelClick}
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
    </Modal>
  );
};
