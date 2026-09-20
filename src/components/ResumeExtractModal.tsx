import React, { useState } from 'react';
import { Sparkles, Check, AlertCircle, ArrowRight, X } from 'lucide-react';

interface ExtractedProfileData {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  professionalTitle?: string | null;
  yearsOfExperience?: string | null;
  skills?: string[];
  currentCompany?: string | null;
  previousCompanies?: string[];
  education?: Array<{ degree: string; institution: string; year: string }>;
  certifications?: string[];
  projects?: Array<{ name: string; tech: string; desc: string }>;
  achievements?: string[];
}

interface ResumeExtractModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedData: ExtractedProfileData | null;
  onApplyToProfile: (selectedData: Partial<ExtractedProfileData>) => Promise<void>;
}

export const ResumeExtractModal: React.FC<ResumeExtractModalProps> = ({
  isOpen,
  onClose,
  extractedData,
  onApplyToProfile,
}) => {
  if (!isOpen || !extractedData) return null;

  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
    fullName: true,
    email: true,
    phone: true,
    location: true,
    linkedin: true,
    github: true,
    professionalTitle: true,
    yearsOfExperience: true,
    skills: true,
    currentCompany: true,
    education: true,
    certifications: true,
    projects: true,
  });

  const [isApplying, setIsApplying] = useState(false);

  const toggleField = (field: string) => {
    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleAcceptAll = async () => {
    setIsApplying(true);
    try {
      await onApplyToProfile(extractedData);
      onClose();
    } catch (e: any) {
      alert('Error updating profile: ' + e.message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplySelected = async () => {
    setIsApplying(true);
    try {
      const filtered: any = {};
      Object.keys(selectedFields).forEach((key) => {
        if (selectedFields[key] && (extractedData as any)[key] !== undefined) {
          filtered[key] = (extractedData as any)[key];
        }
      });
      await onApplyToProfile(filtered);
      onClose();
    } catch (e: any) {
      alert('Error updating profile: ' + e.message);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-xl my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Review Resume Extraction</h2>
              <p className="text-xs text-slate-500">
                Gemini extracted these profile details. AI will NOT silently overwrite existing data.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start space-x-2.5 text-xs text-blue-800">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold">Review Gate: </span>
            Select which extracted fields you would like to synchronize into your persistent Profile. Unchecked fields will remain untouched.
          </div>
        </div>

        {/* Extraction Preview Items */}
        <div className="mt-4 overflow-y-auto pr-1 space-y-3 flex-1">
          {/* Identity & Contact */}
          <div className="border border-slate-200 rounded-xl p-3.5">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Personal & Contact Info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {extractedData.fullName && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedFields.fullName)}
                    onChange={() => toggleField('fullName')}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">Name: <strong className="text-slate-900">{extractedData.fullName}</strong></span>
                </label>
              )}
              {extractedData.email && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedFields.email)}
                    onChange={() => toggleField('email')}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">Email: <strong className="text-slate-900">{extractedData.email}</strong></span>
                </label>
              )}
              {extractedData.phone && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedFields.phone)}
                    onChange={() => toggleField('phone')}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">Phone: <strong className="text-slate-900">{extractedData.phone}</strong></span>
                </label>
              )}
              {extractedData.location && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedFields.location)}
                    onChange={() => toggleField('location')}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">Location: <strong className="text-slate-900">{extractedData.location}</strong></span>
                </label>
              )}
            </div>
          </div>

          {/* Professional Title & Experience */}
          <div className="border border-slate-200 rounded-xl p-3.5">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Professional Headline</h4>
            <div className="space-y-2 text-xs">
              {extractedData.professionalTitle && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedFields.professionalTitle)}
                    onChange={() => toggleField('professionalTitle')}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">Title: <strong className="text-slate-900">{extractedData.professionalTitle}</strong></span>
                </label>
              )}
              {extractedData.yearsOfExperience && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedFields.yearsOfExperience)}
                    onChange={() => toggleField('yearsOfExperience')}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">Experience: <strong className="text-slate-900">{extractedData.yearsOfExperience} years</strong></span>
                </label>
              )}
            </div>
          </div>

          {/* Extracted Skills */}
          {extractedData.skills && extractedData.skills.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900">Extracted Skills ({extractedData.skills.length})</h4>
                <label className="flex items-center space-x-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedFields.skills)}
                    onChange={() => toggleField('skills')}
                    className="rounded text-blue-600"
                  />
                  <span className="text-slate-600 font-medium">Include in profile</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {extractedData.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md border border-slate-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {extractedData.education && extractedData.education.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900">Education Details</h4>
                <label className="flex items-center space-x-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedFields.education)}
                    onChange={() => toggleField('education')}
                    className="rounded text-blue-600"
                  />
                  <span className="text-slate-600 font-medium">Update education</span>
                </label>
              </div>
              <div className="space-y-1 text-xs text-slate-700">
                {extractedData.education.map((edu, idx) => (
                  <div key={idx} className="font-medium">
                    • {edu.degree} — {edu.institution} ({edu.year})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition"
          >
            Keep Existing Profile
          </button>
          <div className="flex space-x-2">
            <button
              disabled={isApplying}
              onClick={handleApplySelected}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
            >
              {isApplying ? 'Applying...' : 'Apply Selected'}
            </button>
            <button
              disabled={isApplying}
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isApplying ? 'Applying...' : 'Accept All & Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
