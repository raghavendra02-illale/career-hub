import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './context/AuthContext.tsx';
import {
  Job,
  Resume,
  Application,
  Interview,
  NotificationItem,
  UserNotificationPreference,
  EmailLog,
  AnalyticsSummary,
  UserProfile,
  ApplicationAnswer,
} from './types.ts';
import { api } from './lib/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { JobsView } from './components/JobsView.tsx';
import { ResumesView } from './components/ResumesView.tsx';
import { ApplicationsView } from './components/ApplicationsView.tsx';
import { InterviewsView } from './components/InterviewsView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { AnswerBankView } from './components/AnswerBankView.tsx';
import { GmailIntegrationView } from './components/GmailIntegrationView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { JobDetailModal } from './components/JobDetailModal.tsx';
import { SmartApplicationModal } from './components/SmartApplicationModal.tsx';
import { JobAlertsModal } from './components/JobAlertsModal.tsx';
import { AssistantDrawer } from './components/AssistantDrawer.tsx';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Application Data States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [answers, setAnswers] = useState<ApplicationAnswer[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<UserNotificationPreference | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Modal States
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<Job | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [applyInitialResumeId, setApplyInitialResumeId] = useState<number | undefined>(undefined);
  const [showJobAlertsModal, setShowJobAlertsModal] = useState<boolean>(false);
  const [showAssistantDrawer, setShowAssistantDrawer] = useState<boolean>(false);

  // Load all user isolated data whenever authenticated user changes
  const loadUserData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    setDataError(null);
    try {
      const [
        pData,
        rData,
        jData,
        sjData,
        aData,
        iData,
        ansData,
        nData,
        eData,
        npData,
        anData,
      ] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getResumes().catch(() => []),
        api.getJobs().catch(() => []),
        api.getSavedJobs().catch(() => []),
        api.getApplications().catch(() => []),
        api.getInterviews().catch(() => []),
        api.getAnswers().catch(() => []),
        api.getNotifications().catch(() => []),
        api.getEmailLogs().catch(() => []),
        api.getNotificationPreferences().catch(() => null),
        api.getAnalytics().catch(() => null),
      ]);

      setProfile(pData);
      setResumes(rData || []);
      setJobs(jData || []);
      setSavedJobIds((sjData || []).map((j: Job) => j.id));
      setApplications(aData || []);
      setInterviews(iData || []);
      setAnswers(ansData || []);
      setNotifications(nData || []);
      setEmailLogs(eData || []);
      setNotificationPreferences(npData);
      setAnalytics(anData);
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setDataError(err.message || 'Failed to load user records.');
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Handler: Toggle save / bookmark job
  const handleToggleSaveJob = async (job: Job) => {
    try {
      const res = await api.toggleSaveJob(job.id);
      if (res.saved) {
        setSavedJobIds((prev) => [...prev, job.id]);
      } else {
        setSavedJobIds((prev) => prev.filter((id) => id !== job.id));
      }
    } catch (err: any) {
      alert('Error toggling saved job: ' + err.message);
    }
  };

  // Handler: Upload new resume
  const handleUploadResume = async (data: any) => {
    const newResume = await api.uploadResume(data);
    setResumes((prev) => [newResume, ...prev]);
    return newResume;
  };

  // Handler: Update resume
  const handleUpdateResume = async (id: number, data: any) => {
    const updated = await api.updateResume(id, data);
    setResumes((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  // Handler: Delete resume
  const handleDeleteResume = async (id: number) => {
    await api.deleteResume(id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
  };

  // Handler: Duplicate resume
  const handleDuplicateResume = async (id: number) => {
    const dup = await api.duplicateResume(id);
    setResumes((prev) => [dup, ...prev]);
  };

  // Handler: Create new version of a resume
  const handleCreateNewVersion = async (id: number, rawText: string, notes?: string) => {
    const updated = await api.createResumeVersion(id, { rawText, notes });
    setResumes((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  // Handler: Mark notification read
  const handleMarkNotificationRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.warn('Notification mark read failed:', e);
    }
  };

  // Handler: Submit application from SmartApplicationModal
  const handleSubmitApplication = async (data: any) => {
    const createdApp = await api.createApplication(data);
    setApplications((prev) => [createdApp, ...prev]);
    // refresh notifications and email logs
    const [freshNotifs, freshEmails] = await Promise.all([
      api.getNotifications().catch(() => []),
      api.getEmailLogs().catch(() => []),
    ]);
    setNotifications(freshNotifs);
    setEmailLogs(freshEmails);
  };

  // Handler: Advance application pipeline status
  const handleUpdateApplicationStatus = async (
    id: number,
    status: string,
    notes?: string,
    interviewDate?: string
  ) => {
    const updated = await api.updateApplicationStatus(id, { status, notes, interviewDate });
    setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    // If interview was scheduled, reload interviews
    if (interviewDate || status === 'Interview') {
      const freshInterviews = await api.getInterviews().catch(() => []);
      setInterviews(freshInterviews);
    }
    const [freshNotifs, freshEmails] = await Promise.all([
      api.getNotifications().catch(() => []),
      api.getEmailLogs().catch(() => []),
    ]);
    setNotifications(freshNotifs);
    setEmailLogs(freshEmails);
  };

  // Handler: Schedule interview round
  const handleScheduleInterview = async (data: any) => {
    const scheduled = await api.createInterview(data);
    setInterviews((prev) => [scheduled, ...prev]);
    const [freshNotifs, freshApps, freshEmails] = await Promise.all([
      api.getNotifications().catch(() => []),
      api.getApplications().catch(() => []),
      api.getEmailLogs().catch(() => []),
    ]);
    setNotifications(freshNotifs);
    setApplications(freshApps);
    setEmailLogs(freshEmails);
  };

  // Handler: Save profile
  const handleSaveProfile = async (data: Partial<UserProfile>) => {
    const saved = await api.saveProfile(data);
    setProfile(saved);
  };

  // Handler: Save Answer Bank item
  const handleSaveAnswer = async (question: string, answer: string, category?: string) => {
    const saved = await api.saveAnswer({ question, answer, category });
    setAnswers((prev) => [saved, ...prev]);
  };

  // Handler: Delete Answer Bank item
  const handleDeleteAnswer = async (id: number) => {
    await api.deleteAnswer(id);
    setAnswers((prev) => prev.filter((a) => a.id !== id));
  };

  // Handler: Update notification preferences
  const handleUpdatePreferences = async (prefs: Partial<UserNotificationPreference>) => {
    const updated = await api.saveNotificationPreferences(prefs);
    setNotificationPreferences(updated);
  };

  // Handler: Send message to AI Advisor
  const handleSendAiMessage = async (message: string): Promise<string> => {
    const res = await api.assistantChat(message);
    return res.response || 'Thank you for your question. Keep building your verified engineering portfolio!';
  };

  const savedJobsList = jobs.filter((j) => savedJobIds.includes(j.id));

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-200">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Initializing CareerHub AI Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-950 dark:selection:text-blue-200 transition-colors duration-200">
      {/* Universal Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onOpenAssistant={() => setShowAssistantDrawer(true)}
        resumesCount={resumes.length}
        applicationsCount={applications.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loadingData ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-500">
              Synchronizing verified career state for {user?.displayName || 'user'}...
            </p>
          </div>
        ) : dataError ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <strong>Data Sync Error:</strong> {dataError}
            </div>
            <button
              onClick={loadUserData}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {/* View 1: Overview Dashboard */}
              {activeTab === 'dashboard' && (
                <DashboardView
                  jobs={jobs}
                  savedJobs={savedJobsList}
                  applications={applications}
                  resumes={resumes}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onSelectJob={(job) => setSelectedJobForDetails(job)}
                  onOpenApplyModal={(job) => {
                    setSelectedJobForApply(job);
                    setApplyInitialResumeId(undefined);
                  }}
                  onOpenAssistant={() => setShowAssistantDrawer(true)}
                />
              )}

              {/* View 2: Unified Job Discovery */}
              {activeTab === 'jobs' && (
                <JobsView
                  jobs={jobs}
                  savedJobIds={savedJobIds}
                  onToggleSaveJob={handleToggleSaveJob}
                  onSelectJob={(job) => setSelectedJobForDetails(job)}
                  onOpenApplyModal={(job) => {
                    setSelectedJobForApply(job);
                    setApplyInitialResumeId(undefined);
                  }}
                  onOpenAlertsModal={() => setShowJobAlertsModal(true)}
                />
              )}

              {/* View 3: Resumes & Version Repository */}
              {activeTab === 'resumes' && (
                <ResumesView
                  resumes={resumes}
                  onUploadResume={handleUploadResume}
                  onUpdateResume={handleUpdateResume}
                  onDeleteResume={handleDeleteResume}
                  onDuplicateResume={handleDuplicateResume}
                  onCreateNewVersion={handleCreateNewVersion}
                  onFetchVersions={api.getResumeVersions}
                  onExtractFromResume={(text) => api.extractProfileFromResume(text)}
                  onApplyProfileChanges={handleSaveProfile}
                />
              )}

              {/* View 4: Applications Tracker & Kanban */}
              {activeTab === 'applications' && (
                <ApplicationsView
                  applications={applications}
                  onUpdateStatus={handleUpdateApplicationStatus}
                  fetchTimeline={api.getApplicationTimeline}
                  onNavigateToJobs={() => setActiveTab('jobs')}
                />
              )}

              {/* View 5: Interviews Tracker */}
              {activeTab === 'interviews' && (
                <InterviewsView
                  interviews={interviews}
                  applications={applications}
                  onScheduleInterview={handleScheduleInterview}
                />
              )}

              {/* View 6: Professional Profile */}
              {activeTab === 'profile' && (
                <ProfileView profile={profile} onSaveProfile={handleSaveProfile} />
              )}

              {/* View 7: Application Answer Bank */}
              {activeTab === 'answer-bank' && (
                <AnswerBankView
                  answers={answers}
                  onSaveAnswer={handleSaveAnswer}
                  onDeleteAnswer={handleDeleteAnswer}
                />
              )}

              {/* View 8: Email Notifications & Recruiter Classifier */}
              {activeTab === 'email-sync' && (
                <GmailIntegrationView
                  preferences={notificationPreferences}
                  emailLogs={emailLogs}
                  onUpdatePreferences={handleUpdatePreferences}
                  onClassifyEmail={(text) => api.classifyEmail(text)}
                />
              )}

              {/* View 9: Career Analytics & Funnel */}
              {activeTab === 'analytics' && (
                <AnalyticsView
                  analytics={analytics}
                  applications={applications}
                  resumes={resumes}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* MODAL 1: Job Details with Estimated ATS & Dual Job Match */}
      {selectedJobForDetails && (
        <JobDetailModal
          job={selectedJobForDetails}
          resumes={resumes}
          isSaved={savedJobIds.includes(selectedJobForDetails.id)}
          onClose={() => setSelectedJobForDetails(null)}
          onToggleSave={handleToggleSaveJob}
          onOpenApply={(job, resId) => {
            setSelectedJobForDetails(null);
            setSelectedJobForApply(job);
            setApplyInitialResumeId(resId);
          }}
          fetchAtsAnalysis={(rId, jId) => api.analyzeAts(rId, jId)}
          fetchJobMatch={(rId, jId) => api.analyzeJobMatch(rId, jId)}
          fetchRecommendResume={(jId) => api.recommendResume(jId)}
          fetchOptimizeAdvice={(rId, jId) => api.optimizeResume(rId, jId)}
        />
      )}

      {/* MODAL 2: 4-Step Smart Application Assistant with Mandatory Review */}
      {selectedJobForApply && (
        <SmartApplicationModal
          job={selectedJobForApply}
          resumes={resumes}
          initialResumeId={applyInitialResumeId}
          onClose={() => {
            setSelectedJobForApply(null);
            setApplyInitialResumeId(undefined);
          }}
          onSubmitApplication={handleSubmitApplication}
          fetchAutofillData={(jId, rId) => api.getAutofillData(jId, rId)}
          saveToAnswerBank={(q, a) => handleSaveAnswer(q, a, 'autofill')}
        />
      )}

      {/* MODAL 3: Personalized Job Alerts */}
      <JobAlertsModal
        isOpen={showJobAlertsModal}
        onClose={() => setShowJobAlertsModal(false)}
      />

      {/* DRAWER: Gemini Career AI Advisor */}
      <AssistantDrawer
        isOpen={showAssistantDrawer}
        onClose={() => setShowAssistantDrawer(false)}
        onSendMessage={handleSendAiMessage}
      />

      {/* Floating Career AI Advisor Trigger (Desktop & Mobile) */}
      {!showAssistantDrawer && (
        <button
          onClick={() => setShowAssistantDrawer(true)}
          className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3.5 shadow-xl flex items-center space-x-2 transition hover:scale-105"
          title="Open CareerHub AI Advisor"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-bold hidden sm:inline">Ask AI Advisor</span>
        </button>
      )}
    </div>
  );
}
