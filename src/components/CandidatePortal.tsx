import React, { useState, useRef } from 'react';
import {
  JobOpening,
  CandidateDetails
} from '../types';
import { validateDocxFile, extractTextFromDocx } from '../utils/docxUtils';
import { submitApplication } from '../services/apiClient';
import { SAMPLE_CANDIDATE_PRESETS } from '../data/initialData';
import {
  Briefcase,
  Building2,
  MapPin,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  Home,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
  X,
  PartyPopper
} from 'lucide-react';

interface Props {
  jobs: JobOpening[];
  isLoading?: boolean;
  onApplicationSubmitted: () => void;
}

export const CandidatePortal: React.FC<Props> = ({ jobs, isLoading, onApplicationSubmitted }) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');

  // Jobs load asynchronously from the server; default the selection once they arrive.
  React.useEffect(() => {
    if (!selectedJobId && jobs.length > 0) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);
  const [candidateForm, setCandidateForm] = useState<CandidateDetails>({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    currentLocation: '',
    address: '',
  });

  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [parsedResumeText, setParsedResumeText] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isJdExpanded, setIsJdExpanded] = useState<boolean>(false);
  const [isDemoProfilesOpen, setIsDemoProfilesOpen] = useState<boolean>(false);

  const JD_PREVIEW_LENGTH = 420;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleInputChange = (field: keyof CandidateDetails, value: string) => {
    setCandidateForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const processFile = async (file: File) => {
    setFileError('');
    const validation = validateDocxFile(file);
    if (!validation.isValid) {
      setFileError(validation.errorMessage || 'Invalid file. Please upload a .docx Word document.');
      setDocxFile(null);
      setParsedResumeText('');
      return;
    }

    setDocxFile(file);
    const result = await extractTextFromDocx(file);
    if (result.error) {
      setFileError(result.error);
      setParsedResumeText('');
    } else {
      setParsedResumeText(result.text);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDocxFile(null);
    setParsedResumeText('');
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsJdExpanded(false);
  };

  // Quick fill preset for easy tester evaluation
  const handleApplyPreset = (presetIndex: number) => {
    const preset = SAMPLE_CANDIDATE_PRESETS[presetIndex];
    if (!preset) return;

    setCandidateForm({ ...preset.details });
    setParsedResumeText(preset.text);
    setFileError('');
    setFormErrors({});

    // Create a mock docx-named file blob
    const blob = new Blob([preset.text], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    const fakeFile = new File([blob], preset.fileName, { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    setDocxFile(fakeFile);

    const matchingJob = preset.suggestedRole
      ? jobs.find((j) => j.title === preset.suggestedRole)
      : undefined;
    if (matchingJob) {
      setSelectedJobId(matchingJob.id);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!candidateForm.fullName.trim()) errors.fullName = 'Full name is required';
    if (!candidateForm.email.trim() || !candidateForm.email.includes('@')) errors.email = 'Valid email is required';
    if (!candidateForm.phone.trim()) errors.phone = 'Phone number is required';
    if (!candidateForm.age) errors.age = 'Age is required';
    if (!candidateForm.currentLocation.trim()) errors.currentLocation = 'Current location is required';
    if (!candidateForm.address.trim()) errors.address = 'Full address is required';

    if (!docxFile) {
      setFileError('Please attach your Word document (.docx) resume.');
      errors.resume = 'Resume is required';
    } else if (!parsedResumeText) {
      errors.resume = 'Please ensure the .docx contains readable resume content';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!selectedJob) return;

    setIsSubmitting(true);

    try {
      await submitApplication({
        jobId: selectedJob.id,
        candidate: candidateForm,
        resumeFileName: docxFile?.name || 'Candidate_Resume.docx',
        resumeFileSize: docxFile?.size || parsedResumeText.length,
        resumeText: parsedResumeText,
      });

      onApplicationSubmitted();
      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
    } catch (err) {
      console.error('Submission processing error:', err);
      setIsSubmitting(false);
      setIsSubmittedSuccess(true); // Always show success to applicant as required by brief
    }
  };

  const handleResetForNewApplication = () => {
    setIsSubmittedSuccess(false);
    setCandidateForm({
      fullName: '',
      email: '',
      phone: '',
      age: '',
      currentLocation: '',
      address: '',
    });
    setDocxFile(null);
    setParsedResumeText('');
    setFileError('');
    setFormErrors({});
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      {!isSubmittedSuccess && !isSubmitting && (
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Find your next opportunity
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Browse open positions and submit your application.
          </p>
        </div>
      )}

      {isSubmittedSuccess ? (
        /* Confirmed submission screen strictly adheres to candidate brief */
        <div
          id="candidate-confirmation-card"
          className="max-w-xl mx-auto my-12 p-8 sm:p-10 bg-white rounded-2xl border border-neutral-200 shadow-sm text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PartyPopper className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-3">
            Application Received!
          </h2>

          <p className="text-base text-neutral-700 leading-relaxed mb-6 font-medium">
            "Thanks, we've received your application. We'll reach out soon."
          </p>

          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-8">
            Our talent team reviews every submission thoroughly. If your background is a strong fit for the role, an interviewer will contact you via email or phone.
          </p>

          <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              id="btn-apply-another"
              onClick={handleResetForNewApplication}
              className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              Apply for Another Role
            </button>
          </div>
        </div>
      ) : isSubmitting ? (
        /* Processing state — submission touches extraction, LLM screening, and
           persistence server-side, which can take a few seconds; make that visible
           rather than leaving the candidate wondering if the click registered. */
        <div className="max-w-xl mx-auto my-12 p-8 sm:p-10 bg-white rounded-2xl border border-neutral-200 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">
            Submitting your application…
          </h2>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">
            Please wait while we securely send your details and resume to {selectedJob?.company}'s hiring team.
          </p>
          <div className="mt-6 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Job Selection & Description (4 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <h2 className="text-base font-semibold text-neutral-900">
                Select a position
              </h2>
            </div>

            {/* List of open jobs */}
            <div className="space-y-3">
              {isLoading && jobs.length === 0 && (
                <div className="p-6 text-center text-sm text-neutral-500 bg-white rounded-xl border border-neutral-200">
                  Loading open positions…
                </div>
              )}
              {!isLoading && jobs.length === 0 && (
                <div className="p-6 text-center text-sm text-neutral-500 bg-white rounded-xl border border-neutral-200">
                  No open positions right now. Check back soon.
                </div>
              )}
              {jobs.map((job) => {
                const isSelected = job.id === selectedJobId;
                return (
                  <div
                    key={job.id}
                    id={`job-card-${job.id}`}
                    onClick={() => handleSelectJob(job.id)}
                    className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                            {job.company}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-emerald-400/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Open
                          </span>
                        </div>
                        <h3 className="font-semibold text-base leading-tight mt-1">
                          {job.title}
                        </h3>
                      </div>
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
                        <Briefcase className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs">
                      {job.location && (
                        <span className={`flex items-center gap-1 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                      )}
                      {job.department && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>
                          {job.department}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Job Description Preview */}
            {selectedJob && (
              <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-neutral-600" />
                    <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                      Role Overview: {selectedJob.title}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">
                  {isJdExpanded || selectedJob.description.length <= JD_PREVIEW_LENGTH
                    ? selectedJob.description
                    : `${selectedJob.description.slice(0, JD_PREVIEW_LENGTH).trimEnd()}…`}
                </div>

                {selectedJob.description.length > JD_PREVIEW_LENGTH && (
                  <button
                    type="button"
                    onClick={() => setIsJdExpanded((prev) => !prev)}
                    className="text-xs font-semibold text-neutral-900 hover:text-neutral-600 underline underline-offset-2 transition-colors"
                  >
                    {isJdExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Candidate Details & .docx Upload (7 cols on lg) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 sm:p-7">
            
            {/* Demo profiles — collapsed by default, small utility rather than a headline feature */}
            <div className="mb-6 rounded-xl border border-neutral-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsDemoProfilesOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-left transition-colors"
              >
                <span className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Demo Profiles
                </span>
                <ArrowRight className={`w-3 h-3 text-neutral-400 transition-transform ${isDemoProfilesOpen ? 'rotate-90' : ''}`} />
              </button>
              {isDemoProfilesOpen && (
                <div className="p-3 space-y-2 bg-white">
                  <p className="text-[11px] text-neutral-500">Quickly populate the form with sample candidate data.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SAMPLE_CANDIDATE_PRESETS.map((preset, idx) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(idx)}
                        className="p-2 text-left bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-xs transition-colors"
                      >
                        <div className="font-semibold text-neutral-900 truncate">{preset.details.fullName}</div>
                        <div className="text-[10px] text-neutral-500 truncate">{preset.role}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight leading-tight">
                  Complete your application
                </h2>
                <p className="text-xs text-neutral-500">
                  For <span className="font-semibold text-neutral-800">{selectedJob?.title}</span> at <span className="font-semibold text-neutral-800">{selectedJob?.company}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Personal Details Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-candidate-fullname"
                      type="text"
                      value={candidateForm.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className={`w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all ${
                        formErrors.fullName ? 'border-red-400 bg-red-50/40' : 'border-neutral-300'
                      }`}
                    />
                  </div>
                  {formErrors.fullName && <p className="text-[11px] text-red-500 mt-1">{formErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-candidate-email"
                      type="email"
                      value={candidateForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="e.g. priya.sharma@example.com"
                      className={`w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all ${
                        formErrors.email ? 'border-red-400 bg-red-50/40' : 'border-neutral-300'
                      }`}
                    />
                  </div>
                  {formErrors.email && <p className="text-[11px] text-red-500 mt-1">{formErrors.email}</p>}
                </div>
              </div>

              {/* Personal Details Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-candidate-phone"
                      type="tel"
                      value={candidateForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all ${
                        formErrors.phone ? 'border-red-400 bg-red-50/40' : 'border-neutral-300'
                      }`}
                    />
                  </div>
                  {formErrors.phone && <p className="text-[11px] text-red-500 mt-1">{formErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-candidate-age"
                      type="number"
                      min="18"
                      max="85"
                      value={candidateForm.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="26"
                      className={`w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all ${
                        formErrors.age ? 'border-red-400 bg-red-50/40' : 'border-neutral-300'
                      }`}
                    />
                  </div>
                  {formErrors.age && <p className="text-[11px] text-red-500 mt-1">{formErrors.age}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Current Location / Place <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-candidate-location"
                      type="text"
                      value={candidateForm.currentLocation}
                      onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                      placeholder="e.g. Bengaluru, KA"
                      className={`w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all ${
                        formErrors.currentLocation ? 'border-red-400 bg-red-50/40' : 'border-neutral-300'
                      }`}
                    />
                  </div>
                  {formErrors.currentLocation && <p className="text-[11px] text-red-500 mt-1">{formErrors.currentLocation}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Residential Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <textarea
                    id="input-candidate-address"
                    rows={2}
                    value={candidateForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="e.g. Flat 304, Green Heights, Indiranagar, Bengaluru - 560038"
                    className={`w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all ${
                      formErrors.address ? 'border-red-400 bg-red-50/40' : 'border-neutral-300'
                    }`}
                  />
                </div>
                {formErrors.address && <p className="text-[11px] text-red-500 mt-1">{formErrors.address}</p>}
              </div>

              {/* Resume/CV Upload Field (Word Documents .docx ONLY - NOT PDF) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-900">
                    Resume / CV Upload <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Word (.docx) only — PDF not accepted
                  </span>
                </div>

                <div
                  id="resume-dropzone"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-neutral-900 bg-neutral-50'
                      : docxFile
                      ? 'border-emerald-500/80 bg-emerald-50/30'
                      : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  {docxFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate">{docxFile.name}</p>
                        <p className="text-xs text-neutral-500">
                          {(docxFile.size / 1024).toFixed(1)} KB • Word Document (.docx)
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 mt-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready to submit
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-neutral-800">
                        Click to browse or drag and drop your <span className="font-semibold text-neutral-950">.docx</span> file
                      </p>
                      <p className="text-xs text-neutral-500">
                        Only Microsoft Word (.docx) files are supported. Maximum size 10MB.
                      </p>
                    </div>
                  )}
                </div>

                {/* File Error Notification */}
                {fileError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  id="btn-submit-application"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-neutral-400 text-center mt-2">
                  By submitting, your application will be securely sent to {selectedJob?.company}'s hiring team.
                </p>
              </div>

            </form>
          </div>

        </div>
      )}
    </div>
  );
};
