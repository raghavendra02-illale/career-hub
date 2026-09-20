import React, { useState, useEffect } from 'react';
import { Application, ApplicationEvent } from '../types.ts';
import {
  X,
  Clock,
  Send,
  Building,
  Calendar,
  CheckCircle2,
  FileText,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  application: Application | null;
  onClose: () => void;
  onUpdateStatus: (id: number, status: string, notes?: string, interviewDate?: string) => Promise<void>;
  fetchTimeline: (id: number) => Promise<ApplicationEvent[]>;
}

const ALL_STATUSES = [
  'Applied',
  'Assessment',
  'Recruiter Screen',
  'Interview',
  'Shortlisted',
  'Offer',
  'Rejected',
  'Withdrawn',
  'On Hold',
];

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  onClose,
  onUpdateStatus,
  fetchTimeline,
}) => {
  if (!application) return null;

  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(application.status);
  const [statusNote, setStatusNote] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!application) return;
    setLoadingEvents(true);
    fetchTimeline(application.id)
      .then((evts) => setEvents(evts))
      .catch((err) => console.warn('Failed to load timeline:', err))
      .finally(() => setLoadingEvents(false));
  }, [application.id]);

  const handleStatusChangeSubmit = async () => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(application.id, selectedStatus, statusNote, interviewDate || undefined);
      setStatusNote('');
      setInterviewDate('');
      // refresh timeline
      const fresh = await fetchTimeline(application.id);
      setEvents(fresh);
    } catch (e: any) {
      alert('Error updating status: ' + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const parsedAnswers = application.answersSubmitted
    ? typeof application.answersSubmitted === 'string'
      ? JSON.parse(application.answersSubmitted || '{}')
      : application.answersSubmitted
    : {};

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                Application #{application.id}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Source: {application.source || 'Direct'}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {application.role} <span className="text-slate-400 font-normal">at</span> {application.company}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-6">
          {/* Resume Version & ATS Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Resume Used
              </span>
              <span className="text-xs font-bold text-slate-900 block mt-1">
                {application.resumeName || 'Primary Resume'}
              </span>
              <span className="text-[11px] text-blue-600 font-medium">
                Version {application.resumeVersion || 1}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ATS Compatibility
              </span>
              <span className="text-xl font-black text-emerald-600 block mt-0.5">
                {application.atsScore || 91}%
              </span>
              <span className="text-[10px] text-slate-400">At time of application</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Current Pipeline Status
              </span>
              <span className="text-xs font-bold text-slate-900 block mt-1">
                {application.status}
              </span>
              <span className="text-[10px] text-slate-400">
                Applied {new Date(application.appliedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Advance Application Pipeline Status */}
          <div className="p-4 border border-blue-200 bg-blue-50/40 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Update Pipeline Status & Log Event
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">New Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Event Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Passed recruiter phone screen"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                />
              </div>

              {selectedStatus === 'Interview' ? (
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Interview Date/Time</label>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white"
                  />
                </div>
              ) : (
                <div className="flex items-end">
                  <button
                    disabled={isUpdating || selectedStatus === application.status}
                    onClick={handleStatusChangeSubmit}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition"
                  >
                    {isUpdating ? 'Saving...' : 'Update Status'}
                  </button>
                </div>
              )}
            </div>

            {selectedStatus === 'Interview' && (
              <div className="flex justify-end pt-1">
                <button
                  disabled={isUpdating}
                  onClick={handleStatusChangeSubmit}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  {isUpdating ? 'Scheduling...' : 'Confirm Status & Schedule Interview'}
                </button>
              </div>
            )}
          </div>

          {/* Chronological Timeline Audit Log */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Application Chronological Timeline
            </h4>

            {loadingEvents ? (
              <p className="text-xs text-slate-500 py-4">Loading timeline events...</p>
            ) : events.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No events logged yet.</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {events.map((evt) => (
                  <div key={evt.id} className="relative">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{evt.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(evt.eventDate).toLocaleString()}
                        </span>
                      </div>
                      {evt.description && (
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submitted Answers Record */}
          {Object.keys(parsedAnswers).length > 0 && (
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Submitted Application Answers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(parsedAnswers).map(([key, val]) => (
                  <div key={key} className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-xs text-slate-800 font-medium block mt-0.5">
                      {String(val) || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
