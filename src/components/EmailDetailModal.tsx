import React from 'react';
import { EmailLog } from '../types.ts';
import {
  X,
  Mail,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink,
  Building2,
  Calendar,
  Send,
  FileCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface EmailDetailModalProps {
  email: EmailLog | null;
  onClose: () => void;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({ email, onClose }) => {
  if (!email) return null;

  // Derive message details based on emailType or subject
  const isRejection = email.emailType === 'rejection_update' || email.subject.toLowerCase().includes('update regarding') || email.subject.toLowerCase().includes('not moving forward');
  const isSubmission = email.emailType === 'application_submitted' || email.subject.toLowerCase().includes('confirmation') || email.subject.toLowerCase().includes('submitted');
  const isInterview = email.emailType === 'interview_invitation' || email.emailType === 'interview_scheduled' || email.subject.toLowerCase().includes('interview');
  const isScreening = email.emailType === 'screening_invitation' || email.subject.toLowerCase().includes('screen');
  const isOffer = email.emailType === 'offer_received' || email.subject.toLowerCase().includes('offer');
  const isJobAlert = email.emailType === 'job_match' || email.subject.toLowerCase().includes('match');

  return (
    <div
      id="email-detail-modal-backdrop"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="email-detail-modal-container"
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 transition-colors duration-200 animate-fade-in-up"
      >
        {/* Top App Header / Window Controls */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 via-amber-500 to-blue-500 flex items-center justify-center shadow-xs">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Gmail Message</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Delivered to Inbox</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{email.recipient}</p>
            </div>
          </div>
          <button
            id="btn-close-email-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Envelope Metadata Bar */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 dark:text-slate-500 font-medium w-16">From:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                CareerHub Automated Delivery &lt;{email.sender || 'careers@careerhub.ai'}&gt;
              </span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-[11px]">
              <Clock className="w-3 h-3" />
              <span>{new Date(email.sentAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 dark:text-slate-500 font-medium w-16">To:</span>
            <span className="font-semibold text-slate-900 dark:text-white font-mono">{email.recipient}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 dark:text-slate-500 font-medium w-16">Subject:</span>
            <span className="font-bold text-slate-900 dark:text-white">{email.subject}</span>
          </div>

          <div className="pt-2 flex items-center space-x-3 text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Security: TLS 1.3 standard encryption</span>
            </span>
            <span>•</span>
            <span>SPF: PASS</span>
            <span>•</span>
            <span>DKIM: PASS (careerhub.ai)</span>
          </div>
        </div>

        {/* Styled Professional Email Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[55vh] overflow-y-auto bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
          {/* Email Branded Header */}
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[11px] font-black">
                C
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">CareerHub</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              ID: CH-MSG-{email.id.toString().padStart(5, '0')}
            </span>
          </div>

          <div>
            <p className="font-medium text-slate-900 dark:text-white">Dear Candidate,</p>
          </div>

          {/* Conditional Content by Scenario */}
          {isSubmission && (
            <div className="space-y-4">
              <p>
                Thank you for submitting your application through CareerHub. Your candidate profile and credentials have been securely transmitted to the employer's applicant tracking system.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <FileCheck className="w-4 h-4" />
                  <span>Submission Summary</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Position</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{email.subject.replace('Application Confirmation: ', '').replace('Application Submitted: ', '')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Status</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Received & In Active Review</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Target Inbox</span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">{email.recipient}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Timestamp</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{new Date(email.sentAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <p className="font-semibold text-slate-900 dark:text-white">What happens next?</p>
                <p>
                  1. The recruiting coordinator will inspect your verified resume version and ATS score.
                </p>
                <p>
                  2. Any response, recruiter inquiry, or interview invitation will automatically sync to your inbox and update your pipeline tracker.
                </p>
              </div>
            </div>
          )}

          {isRejection && (
            <div className="space-y-4">
              <p>
                Thank you for taking the time to interview and consider opportunities through our platform.
              </p>
              <p>
                The hiring team has completed their review of candidate profiles for this role. While they were impressed by your background and technical capabilities, they have decided to move forward with other candidates whose experience more specifically aligns with their immediate project scope.
              </p>

              <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 text-xs space-y-2 text-amber-900 dark:text-amber-200">
                <div className="flex items-center space-x-2 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Curated Next Steps for You</span>
                </div>
                <p className="leading-relaxed">
                  CareerHub has already refreshed your tailored recommendations with 3 newly aggregated roles matching your verified skills and resume profile. Your application pipeline remains active.
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                We wish you the very best in your job search and look forward to supporting your next application.
              </p>
            </div>
          )}

          {isInterview && (
            <div className="space-y-4">
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                🎉 Congratulations! You have been invited to the next round of interviews.
              </p>
              <p>
                The team was enthusiastic about your background and would like to schedule a formal discussion with the interview panel.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Interview Coordination</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Meeting link, calendar invite (.ics), and recommended system design prep questions have been synced with your CareerHub Interviews tab.
                </p>
              </div>
            </div>
          )}

          {isScreening && (
            <div className="space-y-4">
              <p>
                Great news! The hiring manager has shortlisted your application for an initial recruiter screening discussion.
              </p>
              <p>
                This brief 20-30 minute conversation will cover your background, availability, and project aspirations. Please check your calendar or respond to propose optimal time slots.
              </p>
            </div>
          )}

          {isOffer && (
            <div className="space-y-4">
              <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                🚀 Tremendous news! A formal offer has been extended.
              </p>
              <p>
                The hiring committee is thrilled to extend an offer to join their engineering team. The formal compensation breakdown and agreement packet are prepared for your review.
              </p>
            </div>
          )}

          {isJobAlert && (
            <div className="space-y-4">
              <p>
                A new high-priority job opening matching your specified criteria and technical stack has just been aggregated.
              </p>
              <p>
                Review the role in your CareerHub discovery feed to analyze ATS keyword compatibility and submit an optimized application.
              </p>
            </div>
          )}

          {!isSubmission && !isRejection && !isInterview && !isScreening && !isOffer && !isJobAlert && (
            <div className="space-y-3">
              <p>
                An update has occurred regarding your career pipeline:
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-semibold text-slate-900 dark:text-white text-xs">
                {email.subject}
              </div>
              <p className="text-xs text-slate-500">
                Log into CareerHub anytime to inspect timeline updates, interview preparation materials, or adjust notification preferences.
              </p>
            </div>
          )}

          {/* Professional Signoff */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-500 dark:text-slate-400">
            <p className="font-medium text-slate-900 dark:text-white">Warm regards,</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">The CareerHub Candidate Success Team</p>
            <p>notifications@careerhub.ai • careerhub.ai</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Delivered directly to <strong className="text-slate-800 dark:text-slate-200">{email.recipient}</strong>
          </span>
          <button
            id="btn-dismiss-email-modal"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl transition shadow-xs"
          >
            Close Email View
          </button>
        </div>
      </div>
    </div>
  );
};
