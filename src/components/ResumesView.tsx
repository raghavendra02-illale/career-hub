import React, { useState } from 'react';
import { Resume, ResumeVersion } from '../types.ts';
import {
  FileText,
  Plus,
  Copy,
  Clock,
  Trash2,
  Edit2,
  CheckCircle,
  Eye,
  Sparkles,
  GitBranch,
  Tag,
  ExternalLink,
  X,
  Upload,
} from 'lucide-react';
import { ResumeExtractModal } from './ResumeExtractModal.tsx';

interface ResumesViewProps {
  resumes: Resume[];
  onUploadResume: (data: {
    name: string;
    targetRole?: string;
    targetRoles?: string[];
    rawText: string;
    fileName?: string;
    fileSize?: string;
    isDefault?: boolean;
  }) => Promise<Resume>;
  onUpdateResume: (id: number, data: Partial<Resume> & { targetRoles?: string[] }) => Promise<void>;
  onDeleteResume: (id: number) => Promise<void>;
  onDuplicateResume: (id: number) => Promise<void>;
  onCreateNewVersion: (id: number, rawText: string, notes?: string) => Promise<void>;
  onFetchVersions: (id: number) => Promise<ResumeVersion[]>;
  onExtractFromResume: (text: string) => Promise<any>;
  onApplyProfileChanges: (data: any) => Promise<void>;
}

export const ResumesView: React.FC<ResumesViewProps> = ({
  resumes,
  onUploadResume,
  onUpdateResume,
  onDeleteResume,
  onDuplicateResume,
  onCreateNewVersion,
  onFetchVersions,
  onExtractFromResume,
  onApplyProfileChanges,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [versionModalResume, setVersionModalResume] = useState<Resume | null>(null);
  const [resumeVersionsList, setResumeVersionsList] = useState<ResumeVersion[]>([]);
  const [newVersionModalResume, setNewVersionModalResume] = useState<Resume | null>(null);
  const [newVersionText, setNewVersionText] = useState('');
  const [newVersionNotes, setNewVersionNotes] = useState('');
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);

  // Extract review modal state
  const [extractModalOpen, setExtractModalOpen] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Upload Form state
  const [newName, setNewName] = useState('');
  const [newTargetRole, setNewTargetRole] = useState('');
  const [newTargetRolesInput, setNewTargetRolesInput] = useState('');
  const [newRawText, setNewRawText] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file drop / manual selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setNewRawText(content);
    };
    reader.readAsText(file);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRawText.trim()) {
      alert('Please provide a resume name and content.');
      return;
    }
    setIsUploading(true);
    try {
      const roles = newTargetRolesInput.split(',').map(s => s.trim()).filter(Boolean);
      const created = await onUploadResume({
        name: newName.trim(),
        targetRole: newTargetRole.trim() || roles[0] || 'Software Engineer',
        targetRoles: roles.length > 0 ? roles : [newTargetRole.trim() || 'Software Engineer'],
        rawText: newRawText.trim(),
        fileName: `${newName.replace(/\s+/g, '_')}_v1.pdf`,
        fileSize: `${Math.round(newRawText.length / 1024) || 45} KB`,
        isDefault: newIsDefault,
      });

      setShowUploadModal(false);
      // Reset form
      setNewName('');
      setNewTargetRole('');
      setNewTargetRolesInput('');
      setNewRawText('');

      // Trigger Gemini extraction for Review Gate
      try {
        const parsed = await onExtractFromResume(created.rawText);
        setExtractedData(parsed);
        setExtractModalOpen(true);
      } catch (err) {
        console.warn('Extraction skipped or failed:', err);
      }
    } catch (e: any) {
      alert('Upload failed: ' + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Open version history modal
  const handleOpenVersions = async (r: Resume) => {
    setVersionModalResume(r);
    try {
      const vers = await onFetchVersions(r.id);
      setResumeVersionsList(vers);
    } catch (e: any) {
      alert('Failed to load version history: ' + e.message);
    }
  };

  // Submit new version
  const handleCreateNewVersion = async () => {
    if (!newVersionModalResume || !newVersionText.trim()) return;
    setIsCreatingVersion(true);
    try {
      await onCreateNewVersion(newVersionModalResume.id, newVersionText, newVersionNotes);
      setNewVersionModalResume(null);
      setNewVersionText('');
      setNewVersionNotes('');
    } catch (e: any) {
      alert('Error creating version: ' + e.message);
    } finally {
      setIsCreatingVersion(false);
    }
  };

  return (
    <div id="resumes-view" className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resume Management</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Maintain multiple tailored resumes mapped to specific roles, track full version history, and view which applications used which version.
          </p>
        </div>
        <button
          id="upload-new-resume-btn"
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add / Upload Resume</span>
        </button>
      </div>

      {/* Resumes Grid */}
      {resumes.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No resumes uploaded yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload your first resume to automatically extract structured profile information and calculate ATS match scores for jobs.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Upload Resume Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resumes.map((r) => {
            const skillsList = typeof r.skills === 'string' ? JSON.parse(r.skills || '[]') : (r.skills || []);
            const targetRoles = r.targetRoles || (r.targetRole ? [r.targetRole] : ['General Role']);

            return (
              <div
                key={r.id}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition shadow-2xs ${
                  r.isDefault ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        v{r.version}
                      </span>
                      {r.isDefault && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Primary Active</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(r.updatedAt || r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title & File details */}
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{r.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {r.fileName || `${r.name}.pdf`} • {r.fileSize || '95 KB'}
                  </p>

                  {/* Target Role Mappings */}
                  <div className="mt-3">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Mapped Roles
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {targetRoles.map((role: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-100"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills Snapshot */}
                  <div className="mt-3">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Detected Skills ({skillsList.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {skillsList.slice(0, 5).map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {skillsList.length > 5 && (
                        <span className="text-[10px] px-1 text-slate-400">
                          +{skillsList.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setPreviewResume(r)}
                      title="Preview Resume Text"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenVersions(r)}
                      title="Version History & Application Mapping"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    >
                      <GitBranch className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setNewVersionModalResume(r);
                        setNewVersionText(r.rawText);
                        setNewVersionNotes('');
                      }}
                      title="Create New Version"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateResume(r.id)}
                      title="Duplicate Resume"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingResume(r)}
                      title="Edit Name & Roles"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {!r.isDefault && (
                      <button
                        onClick={() => onUpdateResume(r.id, { isDefault: true })}
                        className="text-[10px] font-semibold text-slate-600 hover:text-blue-600 px-2 py-1 rounded hover:bg-slate-100"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Delete resume "${r.name}"?`)) onDeleteResume(r.id);
                      }}
                      title="Delete Resume"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload New Resume Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Add / Upload New Resume</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resume Title / Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI / Machine Learning Specialist Resume"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Job Roles (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning Engineer, AI Research Scientist, LLM Engineer"
                  value={newTargetRolesInput}
                  onChange={(e) => setNewTargetRolesInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  CareerHub uses these target roles to auto-recommend the best resume for specific job postings.
                </span>
              </div>

              {/* Drag and drop / file selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Text File or Paste Resume Content *
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center bg-slate-50/50 mb-2">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-600 block">Select a file from your computer (.txt, .md, .pdf text)</span>
                  <input
                    type="file"
                    accept=".txt,.md,.text,.pdf"
                    onChange={handleFileUpload}
                    className="mt-2 text-xs text-slate-500"
                  />
                </div>

                <textarea
                  rows={7}
                  required
                  placeholder="Or paste resume plain text here..."
                  value={newRawText}
                  onChange={(e) => setNewRawText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="set-default"
                  checked={newIsDefault}
                  onChange={(e) => setNewIsDefault(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="set-default" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Set as Primary Active Resume
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Parsing & Saving...' : 'Save & Extract Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Resume Content Modal */}
      {previewResume && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{previewResume.name} (v{previewResume.version})</h3>
                <p className="text-xs text-slate-500">Target Role: {previewResume.targetRole || 'General'}</p>
              </div>
              <button onClick={() => setPreviewResume(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 flex-1 overflow-y-auto bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap">
              {previewResume.rawText}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setPreviewResume(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resume Details Modal */}
      {editingResume && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Edit Resume Info</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Resume Name</label>
                <input
                  type="text"
                  value={editingResume.name}
                  onChange={(e) => setEditingResume({ ...editingResume, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Roles (comma separated)</label>
                <input
                  type="text"
                  value={(editingResume.targetRoles || [editingResume.targetRole || '']).join(', ')}
                  onChange={(e) => {
                    const roles = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setEditingResume({
                      ...editingResume,
                      targetRole: roles[0] || 'Engineer',
                      targetRoles: roles,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setEditingResume(null)}
                className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onUpdateResume(editingResume.id, {
                    name: editingResume.name,
                    targetRole: editingResume.targetRole,
                    targetRoles: editingResume.targetRoles,
                  });
                  setEditingResume(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History & Application Mapping Modal */}
      {versionModalResume && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Version History: {versionModalResume.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Audit log of revisions and applications that used each version
                </p>
              </div>
              <button onClick={() => setVersionModalResume(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-3">
              {resumeVersionsList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">Initial version active.</p>
              ) : (
                resumeVersionsList.map((ver) => (
                  <div key={ver.id} className="p-3.5 border border-slate-200 rounded-xl bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">Version {ver.versionNumber}</span>
                        <span className="text-[11px] text-slate-500">({ver.name})</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ver.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 italic">
                      "{ver.notes || 'Routine revision'}"
                    </p>

                    {/* Applications that used this version */}
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Applications submitted with v{ver.versionNumber}:
                      </span>
                      {ver.usedInApplications && ver.usedInApplications.length > 0 ? (
                        <div className="space-y-1">
                          {ver.usedInApplications.map((app, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded">
                              <span><strong>{app.company}</strong> — {app.role}</span>
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 rounded font-medium">{app.status}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">None yet</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setVersionModalResume(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Version Modal */}
      {newVersionModalResume && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Create New Version for {newVersionModalResume.name}
              </h3>
              <button onClick={() => setNewVersionModalResume(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 flex-1 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Revision Notes (e.g. Added LLM fine-tuning project)
                </label>
                <input
                  type="text"
                  placeholder="What changed in this version?"
                  value={newVersionNotes}
                  onChange={(e) => setNewVersionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Updated Resume Text
                </label>
                <textarea
                  rows={8}
                  value={newVersionText}
                  onChange={(e) => setNewVersionText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setNewVersionModalResume(null)}
                className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={isCreatingVersion}
                onClick={handleCreateNewVersion}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
              >
                {isCreatingVersion ? 'Creating Version...' : `Save as Version ${(newVersionModalResume.version || 1) + 1}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Extraction Review Gate Modal */}
      <ResumeExtractModal
        isOpen={extractModalOpen}
        onClose={() => setExtractModalOpen(false)}
        extractedData={extractedData}
        onApplyToProfile={onApplyProfileChanges}
      />
    </div>
  );
};
