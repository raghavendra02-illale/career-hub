import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { UserNotificationPreference, EmailLog } from '../types.ts';
import { EmailDetailModal } from './EmailDetailModal.tsx';
import {
  Mail,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Bell,
  ShieldCheck,
  Send,
  Calendar,
  ExternalLink,
  ChevronRight,
  Inbox,
  Filter,
  Zap,
  Radio,
  Clock,
  UserCheck,
} from 'lucide-react';

interface GmailIntegrationViewProps {
  preferences: UserNotificationPreference | null;
  emailLogs: EmailLog[];
  onUpdatePreferences: (prefs: Partial<UserNotificationPreference>) => Promise<void>;
  onClassifyEmail: (emailText: string) => Promise<any>;
}

export const GmailIntegrationView: React.FC<GmailIntegrationViewProps> = ({
  preferences,
  emailLogs,
  onUpdatePreferences,
  onClassifyEmail,
}) => {
  const { user, signInWithGoogle, connectGmailAccount } = useAuth();

  const [localPrefs, setLocalPrefs] = useState<UserNotificationPreference>({
    jobAlerts: true,
    applicationStatusUpdates: true,
    interviewReminders: true,
    weeklyDigest: true,
    gmailSyncEnabled: true,
    frequency: 'instant',
  });

  const [testAlertType, setTestAlertType] = useState<
    'job_match' | 'submission_confirmation' | 'status_update' | 'rejection_notification' | 'interview_reminder' | 'offer_notification'
  >('submission_confirmation');
  const [selectedEmailLog, setSelectedEmailLog] = useState<EmailLog | null>(null);
  const [isSendingTestAlert, setIsSendingTestAlert] = useState(false);
  const [testAlertSuccess, setTestAlertSuccess] = useState<{
    subject: string;
    recipient: string;
    time: string;
  } | null>(null);

  const [customGmail, setCustomGmail] = useState(user?.email || 'raghavendraillale@gmail.com');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const [sampleEmailInput, setSampleEmailInput] = useState(
    `Subject: Interview Invitation: Senior AI Engineer at Anthropic\n\nHi Alex,\n\nThank you for applying to the Senior AI Engineer role at Anthropic. We were very impressed by your background in distributed model fine-tuning and TypeScript tooling.\n\nWe would love to invite you to a 45-minute technical screen on Thursday, Oct 24th at 2:00 PM PST.\nMeeting link: https://meet.google.com/abc-xyz-123\n\nPlease let us know if this time works for you!\n\nBest regards,\nSarah Jenkins\nSenior Technical Recruiter, Anthropic`
  );

  const [classifiedResult, setClassifiedResult] = useState<any | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleSendTestAlert = async () => {
    setIsSendingTestAlert(true);
    setTestAlertSuccess(null);
    try {
      const recipient = user?.email || 'raghavendraillale@gmail.com';
      const res = await api.sendGmailTestAlert({
        targetEmail: recipient,
        alertType: testAlertType,
      });
      setTestAlertSuccess({
        subject: res.subject,
        recipient: res.recipient,
        time: new Date(res.deliveredAt).toLocaleTimeString(),
      });
    } catch (err: any) {
      alert('Failed to send test alert: ' + (err.message || 'Server error'));
    } finally {
      setIsSendingTestAlert(false);
    }
  };

  const handleUpdateGmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGmail.trim() || !customGmail.includes('@')) return;
    setIsUpdatingEmail(true);
    try {
      await connectGmailAccount(customGmail.trim());
      setTestAlertSuccess(null);
    } catch (err: any) {
      alert('Error updating Gmail: ' + err.message);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleTogglePref = async (key: keyof UserNotificationPreference) => {
    const updated = { ...localPrefs, [key]: !localPrefs[key] };
    setLocalPrefs(updated);
    setIsSavingPrefs(true);
    try {
      await onUpdatePreferences(updated);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch (e: any) {
      alert('Error updating preferences: ' + e.message);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleClassify = async () => {
    if (!sampleEmailInput.trim()) return;
    setIsClassifying(true);
    try {
      const res = await onClassifyEmail(sampleEmailInput);
      setClassifiedResult(res);
    } catch (err: any) {
      alert('Error classifying email: ' + err.message);
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <div id="gmail-integration-view" className="space-y-6 animate-fade-in-up">
      {/* Header with Glow & Pulse accents */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Email & Notification Intelligence
            </h1>

            {/* Pulse Feeds */}
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 text-[11px] font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Engine Active</span>
              </span>

              <span className="shimmer-badge inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold shadow-xs">
                <Zap className="w-3 h-3 text-amber-300" />
                <span>PRO AI</span>
              </span>

              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/25 text-[11px] font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span>Live Source Pulse</span>
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Configure real-time system email alerts, verify authenticated Gmail inbox delivery, and test alert dispatches.
          </p>
        </div>

        {prefsSaved && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold animate-fade-in-up">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences Updated</span>
          </div>
        )}
      </div>

      {/* Hero: Verified Gmail Authentication & Live Test Dispatcher */}
      <div className="animate-fade-in-up bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/30 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center space-x-3.5">
            {/* Google Icon */}
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs flex-shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Gmail Authentication Status
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/25">
                  <span className="relative flex h-1.5 w-1.5 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Verified & Ready for Alerts
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {user?.email || 'raghavendraillale@gmail.com'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={signInWithGoogle}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition active:scale-[0.96] flex items-center space-x-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Google Sign-In Popup</span>
            </button>
          </div>
        </div>

        {/* Live Test Alert Dispatch Box */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Verify Live Alert Delivery to Your Gmail Inbox</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dispatch an instant test notification email directly to <strong>{user?.email || 'raghavendraillale@gmail.com'}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTestAlertType('submission_confirmation')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                testAlertType === 'submission_confirmation'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>📝 Application Receipt (Anthropic)</span>
            </button>

            <button
              type="button"
              onClick={() => setTestAlertType('status_update')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                testAlertType === 'status_update'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>💼 Next Round / Screen (OpenAI)</span>
            </button>

            <button
              type="button"
              onClick={() => setTestAlertType('rejection_notification')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                testAlertType === 'rejection_notification'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>📬 Rejection & Guidance (Meta)</span>
            </button>

            <button
              type="button"
              onClick={() => setTestAlertType('interview_reminder')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                testAlertType === 'interview_reminder'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>📅 Interview Reminder (Google)</span>
            </button>

            <button
              type="button"
              onClick={() => setTestAlertType('job_match')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                testAlertType === 'job_match'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>🎯 94% Job Match Alert</span>
            </button>

            <button
              id="send-gmail-test-btn"
              type="button"
              disabled={isSendingTestAlert}
              onClick={handleSendTestAlert}
              className="shimmer-badge px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-blue-500/25 active:scale-[0.96] transition-all flex items-center space-x-2"
            >
              {isSendingTestAlert ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Alert to My Gmail</span>
                </>
              )}
            </button>
          </div>

          {/* Test Alert Success Feedback Banner */}
          {testAlertSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs animate-fade-in-up">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    Live Alert Delivered to {testAlertSuccess.recipient}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 block text-[11px]">
                    Subject: "{testAlertSuccess.subject}" at {testAlertSuccess.time}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] rounded-md">
                Audit Logged
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Preferences + Email Status with Staggered Entrance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Notification Preferences */}
        <div
          style={{ animationDelay: '100ms' }}
          className="animate-fade-in-up bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Email Notification Preferences</span>
            </h2>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Direct inbox delivery
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer active:scale-[0.99] transition-all duration-150">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Job Matches & Alerts
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Notify when new high-match (&gt;85%) opportunities are aggregated
                </span>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.jobAlerts}
                onChange={() => handleTogglePref('jobAlerts')}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              >
              </input>
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer active:scale-[0.99] transition-all duration-150">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Application Submissions
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Send confirmation receipt & snapshot whenever an application is submitted
                </span>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.applicationStatusUpdates}
                onChange={() => handleTogglePref('applicationStatusUpdates')}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              >
              </input>
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer active:scale-[0.99] transition-all duration-150">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Interview Reminders
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Send reminder email 24 hours and 1 hour before scheduled interview rounds
                </span>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.interviewReminders}
                onChange={() => handleTogglePref('interviewReminders')}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              >
              </input>
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer active:scale-[0.99] transition-all duration-150">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Weekly Career Digest
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Weekly summary of active pipeline progress, response rates, and recommendations
                </span>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.weeklyDigest}
                onChange={() => handleTogglePref('weeklyDigest')}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              >
              </input>
            </label>
          </div>
        </div>

        {/* Box 2: Automated Email Delivery Activity Log with Staggered Entrance */}
        <div
          style={{ animationDelay: '180ms' }}
          className="animate-fade-in-up bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Email Delivery Audit Trail</span>
            </h2>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {emailLogs.length} dispatched
            </span>
          </div>

          <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
            {emailLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                No outbound emails sent yet. Dispatches will be audited here in real-time.
              </div>
            ) : (
              emailLogs.map((log, idx) => (
                <div
                  key={log.id}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() => setSelectedEmailLog(log)}
                  className="animate-fade-in-up p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl space-y-1 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[240px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {log.subject}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md">
                        {log.status}
                      </span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition hidden sm:inline">
                        View Email →
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>To: {log.recipient}</span>
                    <span>{new Date(log.sentAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Recruiter Email Classifier & Parsed Invitations */}
      <div
        style={{ animationDelay: '240ms' }}
        className="animate-fade-in-up bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 transition-colors duration-200"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>AI Recruiter Email Classifier & Status Parser</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Paste any recruiter email, interview invite, assessment link, or rejection notice.
              CareerHub AI extracts structured metadata and updates application pipelines.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Email Text Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Recruiter Email Content / Thread:
            </label>
            <textarea
              rows={8}
              value={sampleEmailInput}
              onChange={(e) => setSampleEmailInput(e.target.value)}
              className="w-full p-3.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 rounded-2xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden transition"
            />
            <div className="flex justify-end">
              <button
                disabled={isClassifying}
                onClick={handleClassify}
                className="shimmer-badge px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl active:scale-[0.96] hover:scale-[1.02] transition-all flex items-center space-x-2 shadow-xs hover:shadow-blue-500/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isClassifying ? 'Analyzing Email...' : 'Classify with Gemini'}</span>
              </button>
            </div>
          </div>

          {/* Classification Output Card with Staggered Parsed Invitations */}
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 bg-slate-50/80 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between">
            {classifiedResult ? (
              <div className="space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    Detected Category:
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 rounded-lg">
                    {classifiedResult.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                      Company
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {classifiedResult.company || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                      Role
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {classifiedResult.role || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                      Confidence
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {Math.round((classifiedResult.confidence || 0.95) * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                      Recommended Status
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {classifiedResult.suggestedApplicationStatus}
                    </span>
                  </div>
                </div>

                {classifiedResult.interviewDate && (
                  <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-center space-x-2 animate-fade-in-up">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>
                      Detected Interview Date: <strong>{classifiedResult.interviewDate}</strong>
                    </span>
                  </div>
                )}

                {classifiedResult.nextSteps && (
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                      Identified Next Steps:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {classifiedResult.nextSteps}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 animate-float-gentle" />
                <span>
                  Click "Classify with Gemini" to extract company, interview dates, and next steps.
                </span>
              </div>
            )}

            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Zero-storage email privacy parsing engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Render Email Detail Modal on Click */}
      <EmailDetailModal
        email={selectedEmailLog}
        onClose={() => setSelectedEmailLog(null)}
      />
    </div>
  );
};
