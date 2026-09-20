import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import {
  Mail,
  CheckCircle2,
  X,
  Send,
  Bell,
  Sparkles,
  ShieldCheck,
  Zap,
  RefreshCw,
  ExternalLink,
  Clock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface GmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertSent?: (info: { recipient: string; subject: string }) => void;
}

export const GmailAuthModal: React.FC<GmailAuthModalProps> = ({
  isOpen,
  onClose,
  onAlertSent,
}) => {
  const { user, signInWithGoogle, connectGmailAccount, isGmailConnected, gmailAddress } = useAuth();

  const [customEmail, setCustomEmail] = useState(user?.email || 'raghavendraillale@gmail.com');
  const [selectedAlertType, setSelectedAlertType] = useState<
    'job_match' | 'submission_confirmation' | 'status_update' | 'rejection_notification' | 'interview_reminder' | 'offer_notification'
  >('submission_confirmation');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    recipient: string;
    subject: string;
    deliveredAt: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleConnectCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) return;
    setIsConnecting(true);
    try {
      await connectGmailAccount(customEmail.trim());
      setTestResult(null);
    } catch (err: any) {
      alert('Error connecting Gmail: ' + err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendTestAlert = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const recipient = customEmail.trim() || gmailAddress;
      const res = await api.sendGmailTestAlert({
        targetEmail: recipient,
        alertType: selectedAlertType,
      });

      setTestResult({
        success: true,
        recipient: res.recipient,
        subject: res.subject,
        deliveredAt: res.deliveredAt,
      });

      if (onAlertSent) {
        onAlertSent({ recipient: res.recipient, subject: res.subject });
      }
    } catch (err: any) {
      alert('Error dispatching test alert: ' + (err.message || 'Server error'));
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div
      id="gmail-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in-up"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50/70 dark:from-slate-800/80 dark:via-indigo-950/40 dark:to-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Google / Gmail Multi-colored Icon */}
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Gmail Authentication & Alerts
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  Live Inbox Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive instant career notification alerts in your verified Gmail inbox
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active Gmail Status Card */}
          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="relative">
                  <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    Authenticated Gmail Account:
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {user?.email || 'raghavendraillale@gmail.com'}
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            </div>

            <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center space-x-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>End-to-end TLS secure alert dispatch</span>
              </div>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>Re-authenticate via Google popup</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Test Live Alert Dispatcher */}
          <div className="p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Test Live Alert to My Gmail Inbox
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md">
                Instant Dispatch
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Verify that alerts arrive directly in your Gmail inbox ({user?.email || 'raghavendraillale@gmail.com'}). Select an alert scenario to test:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedAlertType('submission_confirmation')}
                className={`p-2.5 rounded-xl border text-left text-xs transition ${
                  selectedAlertType === 'submission_confirmation'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold">📝 Application Receipt</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Anthropic · Applied (v2)</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAlertType('status_update')}
                className={`p-2.5 rounded-xl border text-left text-xs transition ${
                  selectedAlertType === 'status_update'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold">🎉 Next Round Screen</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">OpenAI · Advanced to Recruiter</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAlertType('rejection_notification')}
                className={`p-2.5 rounded-xl border text-left text-xs transition ${
                  selectedAlertType === 'rejection_notification'
                    ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold">📬 Rejection & Guidance</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Meta · Tailored Next Steps</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAlertType('interview_reminder')}
                className={`p-2.5 rounded-xl border text-left text-xs transition ${
                  selectedAlertType === 'interview_reminder'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold">📅 Interview Reminder</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Google DeepMind · Round 2</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAlertType('job_match')}
                className={`p-2.5 rounded-xl border text-left text-xs transition ${
                  selectedAlertType === 'job_match'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold">🎯 94% Job Match Alert</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Anthropic · LLM Engineer</div>
              </button>
            </div>

            <button
              id="send-test-alert-btn"
              type="button"
              disabled={isSendingTest}
              onClick={handleSendTestAlert}
              className="w-full shimmer-badge py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              {isSendingTest ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching to Gmail...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Test Alert to {user?.email || 'raghavendraillale@gmail.com'}</span>
                </>
              )}
            </button>

            {/* Test Alert Dispatch Result Banner */}
            {testResult && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-1 text-xs animate-fade-in-up">
                <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Alert Successfully Dispatched to Gmail!</span>
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-[11px] pl-6 space-y-0.5">
                  <p><strong>Subject:</strong> {testResult.subject}</p>
                  <p><strong>Delivered to:</strong> {testResult.recipient}</p>
                  <p><strong>Timestamp:</strong> {new Date(testResult.deliveredAt).toLocaleTimeString()} (Logged in audit trail)</p>
                </div>
              </div>
            )}
          </div>

          {/* Change or Switch Gmail Address */}
          <form onSubmit={handleConnectCustom} className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Want alerts sent to a different Gmail inbox?
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="your.name@gmail.com"
                className="flex-1 px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
              <button
                type="submit"
                disabled={isConnecting}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition active:scale-[0.96]"
              >
                {isConnecting ? 'Updating...' : 'Update Inbox'}
              </button>
            </div>
          </form>

          {/* Real-time Gmail Alert Types Summary */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Gmail Notifications Coverage
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>New 85%+ Job Match Alerts</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Application Confirmation Receipts</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Recruiter Pipeline Updates</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>24h / 1h Interview Reminders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.96] transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
