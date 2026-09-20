export interface UserProfile {
  id?: number;
  userId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  address: string | null;
  dob: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  otherLinks: string | null;
  professionalTitle: string | null;
  yearsOfExperience: string | null;
  currentCompany: string | null;
  previousCompanies: string | null;
  education: string | null;
  skills: string | null;
  certifications: string | null;
  projects: string | null;
  achievements: string | null;
  languages: string | null;
  preferredRoles: string | null;
  preferredLocations: string | null;
  preferredWorkType: string | null;
  expectedSalary: string | null;
  noticePeriod: string | null;
  updatedAt?: string;
}

export interface Resume {
  id: number;
  userId: string;
  name: string;
  targetRole: string | null;
  targetRoles?: string[];
  version: number;
  skills: string | null;
  experienceSummary: string | null;
  educationSummary: string | null;
  projectsSummary: string | null;
  keywords: string | null;
  rawText: string;
  fileName: string | null;
  fileSize: string | null;
  isDefault: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeVersion {
  id: number;
  resumeId: number;
  userId: string;
  versionNumber: number;
  name: string;
  rawText: string;
  skills: string | null;
  notes: string | null;
  createdAt: string;
  usedInApplications?: Array<{
    company: string;
    role: string;
    appliedAt: string;
    status: string;
  }>;
}

export interface Job {
  id: number;
  externalId: string | null;
  title: string;
  company: string;
  location: string | null;
  workType: string | null;
  source: string;
  url: string | null;
  salaryRange: string | null;
  experienceLevel: string | null;
  description: string;
  requiredSkills: string; // JSON array
  postedDate: string;
  deadline: string | null;
  isActive: boolean;
  savedAt?: string;
  notes?: string;
}

export interface Application {
  id: number;
  userId: string;
  jobId: number | null;
  company: string;
  role: string;
  source: string | null;
  resumeId: number | null;
  resumeVersion: number | null;
  resumeName: string | null;
  atsScore: number | null;
  jobMatchScore: number | null;
  status: 'Saved' | 'Applied' | 'Assessment' | 'Recruiter Screen' | 'Interview' | 'Shortlisted' | 'Offer' | 'Rejected' | 'Withdrawn' | 'On Hold';
  applicationUrl: string | null;
  appliedAt: string;
  notes: string | null;
  answersSubmitted: string | null;
  updatedAt: string;
}

export interface ApplicationEvent {
  id: number;
  applicationId: number;
  userId: string;
  eventType: string;
  fromStatus: string | null;
  toStatus: string | null;
  title: string;
  description: string | null;
  eventDate: string;
}

export interface ApplicationAnswer {
  id: number;
  userId: string;
  question: string;
  answer: string;
  category: string;
  updatedAt: string;
}

export interface AtsAnalysisResult {
  overallScore: number;
  keywordMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  jobTitleMatch: number;
  formatting: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface JobMatchResult {
  matchScore: number;
  skillFit: number;
  experienceFit: number;
  locationFit: number;
  reasons: string[];
}

export interface ResumeRecommendation {
  recommendedResumeId: number;
  resumeName: string;
  estimatedAtsMatch: number;
  matchingReasons: string[];
  matchedSkills: string[];
}

export interface Interview {
  id: number;
  applicationId: number;
  userId: string;
  roundName: string;
  scheduledDate: string;
  interviewer: string | null;
  meetingLink: string | null;
  status: string;
  feedback: string | null;
  prepNotes: string | null;
  company?: string;
  role?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface EmailPreference {
  id?: number;
  userId: string;
  newMatchingJobs: boolean;
  applicationSubmitted: boolean;
  statusChanged: boolean;
  assessmentReceived: boolean;
  interviewScheduled: boolean;
  interviewReminder: boolean;
  offerReceived: boolean;
  jobClosingSoon: boolean;
  dailyDigest: boolean;
}

export interface EmailEvent {
  id: number;
  userId: string;
  subject: string;
  sender: string;
  recipient: string;
  status: string;
  emailType: string;
  sentAt: string;
}

export interface JobAlert {
  id: number;
  userId: string;
  role: string;
  skills: string;
  location: string;
  experience: string;
  sources: string;
  frequency: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserSourceConnection {
  id: number;
  userId: string;
  source: string;
  isConnected: boolean;
  filterPreferences: string | null;
  updatedAt: string;
}

export interface UserNotificationPreference {
  jobAlerts: boolean;
  applicationStatusUpdates: boolean;
  interviewReminders: boolean;
  weeklyDigest: boolean;
  gmailSyncEnabled: boolean;
  frequency: string;
}

export interface EmailLog {
  id: number;
  userId: string;
  subject: string;
  sender: string;
  recipient: string;
  status: string;
  emailType: string;
  sentAt: string;
}

export interface AnalyticsSummary {
  totalJobsDiscovered: number;
  totalSavedJobs: number;
  totalApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
}

