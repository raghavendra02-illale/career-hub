import {
  UserProfile,
  Resume,
  ResumeVersion,
  Job,
  Application,
  ApplicationEvent,
  ApplicationAnswer,
  AtsAnalysisResult,
  JobMatchResult,
  ResumeRecommendation,
  Interview,
  NotificationItem,
  UserNotificationPreference,
  EmailLog,
  AnalyticsSummary,
  JobAlert,
} from '../types.ts';

// Helper to get demo user or auth token
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const savedUser = localStorage.getItem('careerhub_current_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      headers['Authorization'] = `Bearer demo-session-${u.uid || 'alex_chen'}`;
      if (u.email) headers['x-demo-email'] = u.email;
      if (u.displayName) headers['x-demo-name'] = u.displayName;
    } else {
      headers['Authorization'] = 'Bearer demo-session-alex_chen';
      headers['x-demo-email'] = 'alex.chen@example.com';
      headers['x-demo-name'] = 'Alex Chen';
    }
  } catch (e) {
    headers['Authorization'] = 'Bearer demo-session-alex_chen';
    headers['x-demo-email'] = 'alex.chen@example.com';
    headers['x-demo-name'] = 'Alex Chen';
  }

  return headers;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const authHeaders = getAuthHeaders();
  const headers: Record<string, string> = {
    ...authHeaders,
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Profile
  getProfile: () => request<UserProfile>('/api/profile'),
  saveProfile: (profile: Partial<UserProfile>) =>
    request<UserProfile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
  extractProfileFromResume: (resumeText: string) =>
    request<any>('/api/profile/extract-from-resume', {
      method: 'POST',
      body: JSON.stringify({ resumeText }),
    }),

  // Resumes
  getResumes: () => request<Resume[]>('/api/resumes'),
  uploadResume: (data: {
    name: string;
    targetRole?: string;
    targetRoles?: string[];
    rawText: string;
    fileName?: string;
    fileSize?: string;
    isDefault?: boolean;
  }) =>
    request<Resume>('/api/resumes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateResume: (id: number, data: Partial<Resume> & { targetRoles?: string[] }) =>
    request<Resume>(`/api/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteResume: (id: number) =>
    request<{ success: boolean }>(`/api/resumes/${id}`, {
      method: 'DELETE',
    }),
  duplicateResume: (id: number) =>
    request<Resume>(`/api/resumes/${id}/duplicate`, {
      method: 'POST',
    }),
  createResumeVersion: (id: number, data: { rawText: string; notes?: string }) =>
    request<Resume>(`/api/resumes/${id}/new-version`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getResumeVersions: (id: number) =>
    request<ResumeVersion[]>(`/api/resumes/${id}/versions`),

  // Jobs
  getJobs: (params?: { search?: string; source?: string; workType?: string; location?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.source) query.append('source', params.source);
    if (params?.workType) query.append('workType', params.workType);
    if (params?.location) query.append('location', params.location);
    const qs = query.toString();
    return request<Job[]>(`/api/jobs${qs ? `?${qs}` : ''}`);
  },
  getSavedJobs: () => request<Job[]>('/api/saved-jobs'),
  toggleSaveJob: async (jobId: number): Promise<{ saved: boolean }> => {
    // Check if currently saved
    const saved = await request<Job[]>('/api/saved-jobs');
    const isAlreadySaved = saved.some((j) => j.id === jobId);
    if (isAlreadySaved) {
      await request<any>(`/api/saved-jobs/${jobId}`, { method: 'DELETE' });
      return { saved: false };
    } else {
      await request<any>('/api/saved-jobs', {
        method: 'POST',
        body: JSON.stringify({ jobId }),
      });
      return { saved: true };
    }
  },

  // ATS & Job Match
  analyzeAts: (resumeId: number, jobId: number) =>
    request<AtsAnalysisResult>('/api/ats-analysis', {
      method: 'POST',
      body: JSON.stringify({ resumeId, jobId }),
    }),
  analyzeJobMatch: (resumeId: number, jobId: number) =>
    request<JobMatchResult>('/api/job-match-analysis', {
      method: 'POST',
      body: JSON.stringify({ resumeId, jobId }),
    }),
  recommendResume: (jobId: number) =>
    request<ResumeRecommendation>('/api/recommend-resume', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    }),
  optimizeResume: (resumeId: number, jobId: number) =>
    request<any>('/api/optimize-resume', {
      method: 'POST',
      body: JSON.stringify({ resumeId, jobId }),
    }),

  // Autofill
  getAutofillData: (jobId: number, resumeId: number) =>
    request<any>('/api/autofill', {
      method: 'POST',
      body: JSON.stringify({ jobId, resumeId }),
    }),

  // Applications
  getApplications: () => request<Application[]>('/api/applications'),
  createApplication: (data: any) =>
    request<Application>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateApplicationStatus: (id: number, data: { status: string; notes?: string; interviewDate?: string }) =>
    request<Application>(`/api/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getApplicationTimeline: (id: number) =>
    request<ApplicationEvent[]>(`/api/applications/${id}/timeline`),

  // Interviews
  getInterviews: () => request<Interview[]>('/api/interviews'),
  createInterview: (data: {
    applicationId: number;
    roundName: string;
    scheduledDate: string;
    interviewer?: string;
    meetingLink?: string;
    prepNotes?: string;
  }) =>
    request<Interview>('/api/interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Answer Bank
  getAnswers: () => request<ApplicationAnswer[]>('/api/answer-bank'),
  saveAnswer: (data: { question: string; answer: string; category?: string }) =>
    request<ApplicationAnswer>('/api/answer-bank', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteAnswer: (id: number) =>
    request<any>(`/api/answer-bank/${id}`, {
      method: 'DELETE',
    }),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/api/notifications'),
  markNotificationRead: (id: number) =>
    request<any>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  // Email Notifications & Classifier
  getNotificationPreferences: () => request<UserNotificationPreference>('/api/email-preferences'),
  saveNotificationPreferences: (prefs: Partial<UserNotificationPreference>) =>
    request<UserNotificationPreference>('/api/email-preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    }),
  getEmailLogs: () => request<EmailLog[]>('/api/email-events'),
  classifyEmail: (emailBody: string) =>
    request<any>('/api/gmail/process-email', {
      method: 'POST',
      body: JSON.stringify({ emailBody }),
    }),
  getGmailStatus: () =>
    request<{ connected: boolean; email: string; lastSyncedAt: string; provider: string }>(
      '/api/gmail/status'
    ),
  sendGmailTestAlert: (data?: { targetEmail?: string; alertType?: string }) =>
    request<{
      success: boolean;
      message: string;
      recipient: string;
      subject: string;
      deliveredAt: string;
      emailEventId: number;
    }>('/api/gmail/send-test-alert', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  // Analytics
  getAnalytics: () => request<AnalyticsSummary>('/api/analytics'),

  // AI Assistant
  assistantChat: (message: string) =>
    request<{ response: string }>('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

// Also export createApiClient for compatibility
export function createApiClient(getToken: () => Promise<string | null>, userEmail?: string, userName?: string) {
  return api;
}
