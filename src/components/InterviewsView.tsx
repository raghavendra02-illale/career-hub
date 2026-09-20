import React, { useState } from 'react';
import { Interview, Application } from '../types.ts';
import {
  Calendar,
  Clock,
  Video,
  User,
  CheckCircle2,
  Plus,
  ExternalLink,
  BookOpen,
  X,
} from 'lucide-react';

interface InterviewsViewProps {
  interviews: Interview[];
  applications: Application[];
  onScheduleInterview: (data: {
    applicationId: number;
    roundName: string;
    scheduledDate: string;
    interviewer?: string;
    meetingLink?: string;
    prepNotes?: string;
  }) => Promise<void>;
}

export const InterviewsView: React.FC<InterviewsViewProps> = ({
  interviews,
  applications,
  onScheduleInterview,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [appId, setAppId] = useState<number>(applications[0]?.id || 0);
  const [roundName, setRoundName] = useState('Technical Interview Round 1');
  const [scheduledDate, setScheduledDate] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [prepNotes, setPrepNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId || !scheduledDate) {
      alert('Please select an application and schedule date/time.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onScheduleInterview({
        applicationId: appId,
        roundName,
        scheduledDate,
        interviewer,
        meetingLink,
        prepNotes,
      });
      setShowModal(false);
      setRoundName('Technical Interview Round 1');
      setScheduledDate('');
      setInterviewer('');
      setMeetingLink('');
      setPrepNotes('');
    } catch (e: any) {
      alert('Failed to schedule interview: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="interviews-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interview Tracker</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track interview rounds, meeting coordinates, prep notes, and feedback across your applications.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Interview Round</span>
        </button>
      </div>

      {/* Interviews Grid */}
      {interviews.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 shadow-2xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No interviews currently scheduled</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When recruiters reach out or an application advances to an interview round, log it here to track prep notes and dates.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Log Interview
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                    {item.roundName}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">{item.company}</h3>
                  <p className="text-xs text-slate-600 font-medium">{item.role}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                  {item.status}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>Scheduled: <strong className="text-slate-900">{new Date(item.scheduledDate).toLocaleString()}</strong></span>
                </div>

                {item.interviewer && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>Panel / Interviewer: <strong className="text-slate-900">{item.interviewer}</strong></span>
                  </div>
                )}

                {item.meetingLink && (
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-medium flex items-center"
                    >
                      <span>Join Video Conference</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>

              {item.prepNotes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                  <span className="font-semibold text-slate-900 block mb-1 flex items-center">
                    <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Prep Notes:
                  </span>
                  <p className="text-slate-600 leading-relaxed">{item.prepNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Schedule Interview Round</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Associated Application *</label>
                <select
                  required
                  value={appId}
                  onChange={(e) => setAppId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  {applications.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.company} — {a.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Round Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Round 1 (Algorithms & System Architecture)"
                  value={roundName}
                  onChange={(e) => setRoundName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Interviewer Name or Title</label>
                <input
                  type="text"
                  placeholder="e.g. Staff AI Architect / Hiring Lead"
                  value={interviewer}
                  onChange={(e) => setInterviewer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Meeting Link (Google Meet / Zoom)</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abc-def"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Preparation Notes & Questions</label>
                <textarea
                  rows={3}
                  placeholder="Key talking points, recent project metrics to highlight..."
                  value={prepNotes}
                  onChange={(e) => setPrepNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
                >
                  {isSubmitting ? 'Scheduling...' : 'Save Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
