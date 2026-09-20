import React, { useState, useEffect } from 'react';
import { Job, Resume, ApplicationAnswer } from '../types.ts';
import {
  X,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  HelpCircle,
  Check,
  ChevronRight,
  ArrowLeft,
  Bookmark,
  ShieldCheck,
  Mail,
} from 'lucide-react';

interface SmartApplicationModalProps {
  job: Job | null;
  resumes: Resume[];
  initialResumeId?: number;
  onClose: () => void;
  onSubmitApplication: (data: {
    jobId?: number | null;
    company: string;
    role: string;
    source?: string;
    resumeId: number;
    resumeVersion: number;
    resumeName: string;
    atsScore: number;
    jobMatchScore: number;
    applicationUrl?: string;
    notes?: string;
    answersSubmitted?: Record<string, string>;
  }) => Promise<void>;
  fetchAutofillData: (jobId: number, resumeId: number) => Promise<any>;
  saveToAnswerBank: (question: string, answer: string) => Promise<void>;
}

export const SmartApplicationModal: React.FC<SmartApplicationModalProps> = ({
  job,
  resumes,
  initialResumeId,
  onClose,
  onSubmitApplication,
  fetchAutofillData,
  saveToAnswerBank,
}) => {
  if (!job) return null;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedResumeId, setSelectedResumeId] = useState<number>(
    initialResumeId || resumes.find((r) => r.isDefault)?.id || resumes[0]?.id || 0
  );

  const [formData, setFormData] = useState<Record<string, string>>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    yearsOfExperience: '',
    currentCompany: '',
    noticePeriod: '',
    expectedSalary: '',
    willingToRelocate: 'Yes',
    workAuthorization: 'Yes, authorized to work',
    sponsorshipRequired: 'No sponsorship required',
    whyJoinCompany: '',
  });

  const [fieldSources, setFieldSources] = useState<Record<string, string>>({});
  const [saveToBankKeys, setSaveToBankKeys] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingAutofill, setLoadingAutofill] = useState(false);

  // Load autofill data when resume is chosen
  useEffect(() => {
    if (!job || !selectedResumeId) return;
    setLoadingAutofill(true);
    fetchAutofillData(job.id, selectedResumeId)
      .then((res) => {
        if (res && res.fields) {
          const newValues: Record<string, string> = { ...formData };
          const newSources: Record<string, string> = {};

          Object.keys(res.fields).forEach((key) => {
            const field = res.fields[key];
            if (field.value) {
              newValues[key] = field.value;
              newSources[key] = field.source;
            } else {
              newSources[key] = 'missing';
            }
          });

          setFormData(newValues);
          setFieldSources(newSources);
        }
      })
      .catch((err) => console.warn('Autofill load err:', err))
      .finally(() => setLoadingAutofill(false));
  }, [selectedResumeId, job?.id]);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldSources((prev) => ({ ...prev, [key]: 'user_entered' }));
  };

  const handleToggleBankSave = (key: string) => {
    setSaveToBankKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Explicit confirmation submission
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Save flagged fields to answer bank
      for (const key of Object.keys(saveToBankKeys)) {
        if (saveToBankKeys[key] && formData[key]) {
          let q = key;
          if (key === 'whyJoinCompany') q = 'Why do you want to work at our company?';
          if (key === 'noticePeriod') q = 'What is your official notice period?';
          if (key === 'expectedSalary') q = 'What are your compensation expectations?';
          await saveToAnswerBank(q, formData[key]);
        }
      }

      // Submit application
      await onSubmitApplication({
        jobId: job.id,
        company: job.company,
        role: job.title,
        source: job.source,
        resumeId: selectedResume.id,
        resumeVersion: selectedResume.version || 1,
        resumeName: selectedResume.name,
        atsScore: 91,
        jobMatchScore: 88,
        applicationUrl: job.url || '',
        notes: `Submitted via Smart Assistant using ${selectedResume.name} (v${selectedResume.version || 1})`,
        answersSubmitted: formData,
      });

      onClose();
    } catch (e: any) {
      alert('Error submitting application: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSourceBadge = (source: string) => {
    if (source === 'profile') {
      return <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">From Profile</span>;
    }
    if (source === 'resume') {
      return <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">From Resume</span>;
    }
    if (source === 'answer_bank') {
      return <span className="text-[10px] font-semibold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md">From Answer Bank</span>;
    }
    if (source === 'user_entered') {
      return <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">Entered by You</span>;
    }
    return <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">Please Review</span>;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Application Assistant
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Step {currentStep} of 4
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Applying to {job.company}: <span className="text-blue-600">{job.title}</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2 my-4">
          <div className={`h-1.5 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full ${currentStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full ${currentStep >= 4 ? 'bg-blue-600' : 'bg-slate-200'}`} />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* STEP 1: RESUME SELECTION & MATCH */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Select Resume Version
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  CareerHub recommends your highest-scoring resume for this role. You can confirm or choose any other version from your repository.
                </p>

                <div className="space-y-2">
                  {resumes.map((r) => {
                    const isSelected = r.id === selectedResumeId;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedResumeId(r.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{r.name}</span>
                            <span className="text-[11px] text-slate-500">
                              Version {r.version} • Target: {r.targetRole || 'General'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-emerald-600">89% Match</span>
                          <input
                            type="radio"
                            name="resume-choice"
                            checked={isSelected}
                            onChange={() => setSelectedResumeId(r.id)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROFILE AUTOFILL (IDENTITY & CONTACT) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Contact & Identity (Autofilled from Profile)
                </h3>
                <span className="text-[11px] text-slate-500">Verify information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                    {getSourceBadge(fieldSources.fullName)}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                    {getSourceBadge(fieldSources.email)}
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Phone Number *</label>
                    {getSourceBadge(fieldSources.phone)}
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Current Location *</label>
                    {getSourceBadge(fieldSources.location)}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">LinkedIn Profile</label>
                    {getSourceBadge(fieldSources.linkedin)}
                  </div>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">GitHub Profile</label>
                    {getSourceBadge(fieldSources.github)}
                  </div>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Portfolio Website</label>
                    {getSourceBadge(fieldSources.portfolio)}
                  </div>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => handleInputChange('portfolio', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ADDITIONAL QUESTIONS & ANSWER BANK */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Role-Specific Questions & Answer Bank
                </h3>
                <span className="text-[11px] text-slate-500">1-click populated</span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Years of Experience</label>
                      {getSourceBadge(fieldSources.yearsOfExperience)}
                    </div>
                    <input
                      type="text"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Notice Period</label>
                      {getSourceBadge(fieldSources.noticePeriod)}
                    </div>
                    <input
                      type="text"
                      value={formData.noticePeriod}
                      onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                    <label className="mt-1 flex items-center space-x-1.5 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(saveToBankKeys.noticePeriod)}
                        onChange={() => handleToggleBankSave('noticePeriod')}
                        className="rounded text-blue-600"
                      />
                      <span>Save answer to Answer Bank for future applications</span>
                    </label>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Expected Compensation</label>
                      {getSourceBadge(fieldSources.expectedSalary)}
                    </div>
                    <input
                      type="text"
                      value={formData.expectedSalary}
                      onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                    <label className="mt-1 flex items-center space-x-1.5 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(saveToBankKeys.expectedSalary)}
                        onChange={() => handleToggleBankSave('expectedSalary')}
                        className="rounded text-blue-600"
                      />
                      <span>Save answer to Answer Bank</span>
                    </label>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Willing to Relocate?</label>
                      {getSourceBadge(fieldSources.willingToRelocate)}
                    </div>
                    <select
                      value={formData.willingToRelocate}
                      onChange={(e) => handleInputChange('willingToRelocate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                    >
                      <option value="Yes">Yes, willing to relocate</option>
                      <option value="No">No, remote or local only</option>
                      <option value="Negotiable">Negotiable depending on package</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Why do you want to join {job.company}?
                    </label>
                    {getSourceBadge(fieldSources.whyJoinCompany)}
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Briefly explain your motivation and alignment with their engineering mission..."
                    value={formData.whyJoinCompany}
                    onChange={(e) => handleInputChange('whyJoinCompany', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="mt-1 flex items-center space-x-1.5 text-[11px] text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(saveToBankKeys.whyJoinCompany)}
                      onChange={() => handleToggleBankSave('whyJoinCompany')}
                      className="rounded text-blue-600"
                    />
                    <span>Save answer to Answer Bank for future applications</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MANDATORY REVIEW BEFORE SUBMISSION */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">
                    Application Review & Verification Gate
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                    Review your application package below. As per strict integrity policies, CareerHub AI will never automatically submit without your explicit confirmation.
                  </p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Role</span>
                    <span className="font-bold text-slate-900">{job.title}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Company</span>
                    <span className="font-bold text-slate-900">{job.company}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Selected Resume</span>
                    <span className="font-semibold text-slate-800">{selectedResume.name} (v{selectedResume.version})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated ATS Fit</span>
                    <span className="font-bold text-emerald-600">91% Compatible</span>
                  </div>
                </div>

                {/* Answers review */}
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Applicant:</span>
                    <span className="font-medium text-slate-900">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-medium text-slate-900">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-medium text-slate-900">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Notice Period:</span>
                    <span className="font-medium text-slate-900">{formData.noticePeriod || 'Immediate'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Work Authorization:</span>
                    <span className="font-medium text-slate-900">{formData.workAuthorization}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-blue-700 bg-blue-50/60 p-2.5 rounded-xl">
                  <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>
                    Official submission confirmation and snapshot will be delivered to <strong>{formData.email}</strong>.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          )}

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-1.5"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={isSubmitting}
              onClick={handleConfirmSubmit}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-2 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming & Submitting...' : 'Confirm & Submit Application'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
