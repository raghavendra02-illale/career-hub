import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (Firebase Auth UID mapped)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Comprehensive User Profile
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  fullName: text('full_name'),
  email: text('email'),
  phone: text('phone'),
  location: text('location'),
  address: text('address'),
  dob: text('dob'),
  linkedin: text('linkedin'),
  github: text('github'),
  portfolio: text('portfolio'),
  otherLinks: text('other_links'), // JSON array string
  professionalTitle: text('professional_title'),
  yearsOfExperience: text('years_of_experience'),
  currentCompany: text('current_company'),
  previousCompanies: text('previous_companies'), // JSON array string
  education: text('education'), // JSON array string
  skills: text('skills'), // JSON array string
  certifications: text('certifications'), // JSON array string
  projects: text('projects'), // JSON array string
  achievements: text('achievements'), // JSON array string
  languages: text('languages'), // JSON array string
  preferredRoles: text('preferred_roles'), // JSON array string
  preferredLocations: text('preferred_locations'), // JSON array string
  preferredWorkType: text('preferred_work_type'), // Remote / Hybrid / Onsite
  expectedSalary: text('expected_salary'),
  noticePeriod: text('notice_period'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Resumes (Multiple per user)
export const resumes = pgTable('resumes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  targetRole: text('target_role'),
  version: integer('version').default(1),
  skills: text('skills'), // JSON array
  experienceSummary: text('experience_summary'),
  educationSummary: text('education_summary'),
  projectsSummary: text('projects_summary'),
  keywords: text('keywords'), // JSON array
  rawText: text('raw_text').notNull(),
  fileName: text('file_name'),
  fileSize: text('file_size'),
  isDefault: boolean('is_default').default(false),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Resume Versions
export const resumeVersions = pgTable('resume_versions', {
  id: serial('id').primaryKey(),
  resumeId: integer('resume_id').notNull(),
  userId: text('user_id').notNull(),
  versionNumber: integer('version_number').notNull(),
  name: text('name').notNull(),
  rawText: text('raw_text').notNull(),
  skills: text('skills'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Resume Skills
export const resumeSkills = pgTable('resume_skills', {
  id: serial('id').primaryKey(),
  resumeId: integer('resume_id').notNull(),
  userId: text('user_id').notNull(),
  skill: text('skill').notNull(),
  category: text('category'),
});

// Resume to Target Roles Mapping
export const resumeRoleMappings = pgTable('resume_role_mappings', {
  id: serial('id').primaryKey(),
  resumeId: integer('resume_id').notNull(),
  userId: text('user_id').notNull(),
  targetRole: text('target_role').notNull(),
});

// Unified Jobs
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  externalId: text('external_id'),
  title: text('title').notNull(),
  company: text('company').notNull(),
  location: text('location'),
  workType: text('work_type'),
  source: text('source').notNull(),
  url: text('url'),
  salaryRange: text('salary_range'),
  experienceLevel: text('experience_level'),
  description: text('description').notNull(),
  requiredSkills: text('required_skills'), // JSON array
  postedDate: timestamp('posted_date').defaultNow(),
  deadline: text('deadline'),
  isActive: boolean('is_active').default(true),
});

// Saved Jobs
export const savedJobs = pgTable('saved_jobs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  jobId: integer('job_id').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Personalized Job Alerts
export const jobAlerts = pgTable('job_alerts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  role: text('role').notNull(),
  skills: text('skills'), // JSON array
  location: text('location'),
  experience: text('experience'),
  sources: text('sources'), // JSON array
  frequency: text('frequency').default('Daily'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Applications Tracking
export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  jobId: integer('job_id'),
  company: text('company').notNull(),
  role: text('role').notNull(),
  source: text('source'),
  resumeId: integer('resume_id'),
  resumeVersion: integer('resume_version'),
  resumeName: text('resume_name'),
  atsScore: integer('ats_score'),
  jobMatchScore: integer('job_match_score'),
  status: text('status').notNull().default('Applied'),
  applicationUrl: text('application_url'),
  appliedAt: timestamp('applied_at').defaultNow(),
  notes: text('notes'),
  answersSubmitted: text('answers_submitted'), // JSON object string
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Application Timeline Events
export const applicationEvents = pgTable('application_events', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').notNull(),
  userId: text('user_id').notNull(),
  eventType: text('event_type').notNull(),
  fromStatus: text('from_status'),
  toStatus: text('to_status'),
  title: text('title').notNull(),
  description: text('description'),
  eventDate: timestamp('event_date').defaultNow(),
});

// Application Answer Bank
export const applicationAnswerBank = pgTable('application_answer_bank', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category').default('general'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Estimated ATS Analyses
export const atsAnalyses = pgTable('ats_analyses', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  resumeId: integer('resume_id'),
  jobId: integer('job_id'),
  overallScore: integer('overall_score').notNull(),
  keywordMatch: integer('keyword_match'),
  skillsMatch: integer('skills_match'),
  experienceMatch: integer('experience_match'),
  educationMatch: integer('education_match'),
  jobTitleMatch: integer('job_title_match'),
  formatting: integer('formatting'),
  matchedKeywords: text('matched_keywords'), // JSON array
  missingKeywords: text('missing_keywords'), // JSON array
  strengths: text('strengths'), // JSON array
  gaps: text('gaps'), // JSON array
  recommendations: text('recommendations'), // JSON array
  createdAt: timestamp('created_at').defaultNow(),
});

// Job Match Analyses
export const jobMatchAnalyses = pgTable('job_match_analyses', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  jobId: integer('job_id').notNull(),
  resumeId: integer('resume_id'),
  matchScore: integer('match_score').notNull(),
  reasons: text('reasons'), // JSON array
  skillFit: integer('skill_fit'),
  experienceFit: integer('experience_fit'),
  locationFit: integer('location_fit'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Interviews
export const interviews = pgTable('interviews', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').notNull(),
  userId: text('user_id').notNull(),
  roundName: text('round_name').notNull(),
  scheduledDate: text('scheduled_date').notNull(),
  interviewer: text('interviewer'),
  meetingLink: text('meeting_link'),
  status: text('status').default('Scheduled'),
  feedback: text('feedback'),
  prepNotes: text('prep_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Email Preferences
export const emailPreferences = pgTable('email_preferences', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  newMatchingJobs: boolean('new_matching_jobs').default(true),
  applicationSubmitted: boolean('application_submitted').default(true),
  statusChanged: boolean('status_changed').default(true),
  assessmentReceived: boolean('assessment_received').default(true),
  interviewScheduled: boolean('interview_scheduled').default(true),
  interviewReminder: boolean('interview_reminder').default(true),
  offerReceived: boolean('offer_received').default(true),
  jobClosingSoon: boolean('job_closing_soon').default(true),
  dailyDigest: boolean('daily_digest').default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Email Audit Events
export const emailEvents = pgTable('email_events', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  subject: text('subject').notNull(),
  sender: text('sender'),
  recipient: text('recipient').notNull(),
  status: text('status').default('sent'),
  emailType: text('email_type').notNull(),
  sentAt: timestamp('sent_at').defaultNow(),
});

// Integrations (e.g. Gmail integration)
export const integrations = pgTable('integrations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  provider: text('provider').notNull(),
  connected: boolean('connected').default(false),
  email: text('email'),
  lastSyncedAt: timestamp('last_synced_at'),
  settings: text('settings'),
});

// User Job Source Connections
export const userSourceConnections = pgTable('user_source_connections', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  source: text('source').notNull(),
  isConnected: boolean('is_connected').default(true),
  filterPreferences: text('filter_preferences'),
  updatedAt: timestamp('updated_at').defaultNow(),
});
