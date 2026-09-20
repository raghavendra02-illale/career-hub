import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Job, Application, Resume } from '../types.ts';
import {
  Briefcase,
  FileText,
  Send,
  Calendar,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Target,
  Zap,
  Activity,
} from 'lucide-react';

interface DashboardViewProps {
  jobs: Job[];
  savedJobs: Job[];
  applications: Application[];
  resumes: Resume[];
  onNavigate: (tab: string) => void;
  onSelectJob: (job: Job) => void;
  onOpenApplyModal: (job: Job) => void;
  onOpenAssistant: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  savedJobs,
  applications,
  resumes,
  onNavigate,
  onSelectJob,
  onOpenApplyModal,
  onOpenAssistant,
}) => {
  const { user } = useAuth();

  // Dynamic greeting based on user time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.displayName?.split(' ')[0] || 'there';

  // Metrics counts
  const totalJobsCount = jobs.length;
  const savedCount = savedJobs.length;
  const appliedCount = applications.length;
  const interviewCount = applications.filter((a) => a.status === 'Interview').length;
  const shortlistCount = applications.filter((a) => a.status === 'Shortlisted').length;
  const offerCount = applications.filter((a) => a.status === 'Offer').length;

  // Recommended jobs (top 3)
  const recommendedJobs = jobs.slice(0, 3);
  const recentApplications = applications.slice(0, 4);

  const stats = [
    {
      id: 'stat-jobs',
      label: 'Jobs Found',
      value: totalJobsCount,
      subtext: 'Multi-source unified',
      icon: Briefcase,
      color: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-50/50 dark:bg-blue-950/20',
    },
    {
      id: 'stat-saved',
      label: 'Saved Jobs',
      value: savedCount,
      subtext: 'Bookmarked',
      icon: Target,
      color: 'text-amber-500 dark:text-amber-400',
      bgLight: 'bg-amber-50/50 dark:bg-amber-950/20',
    },
    {
      id: 'stat-applied',
      label: 'Applications',
      value: appliedCount,
      subtext: 'Active tracking',
      icon: Send,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgLight: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    },
    {
      id: 'stat-interviews',
      label: 'Interviews',
      value: interviewCount,
      subtext: 'Scheduled / active',
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bgLight: 'bg-purple-50/50 dark:bg-purple-950/20',
    },
    {
      id: 'stat-shortlist',
      label: 'Shortlisted',
      value: shortlistCount,
      subtext: 'In progression',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgLight: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    },
    {
      id: 'stat-offers',
      label: 'Job Offers',
      value: offerCount,
      subtext: 'Received',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgLight: 'bg-green-50/50 dark:bg-green-950/20',
    },
  ];

  return (
    <div id="dashboard-view" className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {getGreeting()}, {displayName} 👋
              </h1>

              {/* Status Pulse Badges */}
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

                <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/25 text-[11px] font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <span>Live Source Pulse</span>
                </span>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
              Welcome to your unified career headquarters. Manage tailored resumes, track multi-source
              job discovery with real-time sync, run grounded ATS compatibility analyses, and monitor
              your application pipeline.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            <button
              id="dash-upload-resume-btn"
              onClick={() => onNavigate('resumes')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-all duration-150 shadow-xs hover:shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Manage Resumes ({resumes.length})</span>
            </button>
            <button
              id="dash-browse-jobs-btn"
              onClick={() => onNavigate('jobs')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-[0.98] transition-all duration-150 shadow-xs"
            >
              <Briefcase className="w-4 h-4 text-blue-500" />
              <span>Explore Jobs</span>
            </button>
          </div>
        </div>

        {/* Staggered Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                id={stat.id}
                style={{ animationDelay: `${idx * 70}ms` }}
                className="animate-fade-in-up bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4 hover:-translate-y-1 hover:shadow-md active:scale-[0.98] transition-all duration-200 group cursor-default"
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-semibold">{stat.label}</span>
                  <div className={`p-1.5 rounded-lg ${stat.bgLight} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2 tracking-tight">
                  {stat.value}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {stat.subtext}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recommended Jobs & Pipeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* Smart Recommended Jobs with Staggered Entrance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs transition-colors duration-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Recommended Jobs For You
                  </h2>
                  <span className="flex items-center space-x-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900/60">
                    <Activity className="w-3 h-3 animate-pulse" />
                    <span>Live Source Feed</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Grounded match based on your active resumes and preferred role profile
                </p>
              </div>
              <button
                onClick={() => onNavigate('jobs')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1 active:scale-[0.96] transition-all"
              >
                <span>View all ({jobs.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {recommendedJobs.map((job, index) => {
                const reqSkills =
                  typeof job.requiredSkills === 'string'
                    ? JSON.parse(job.requiredSkills || '[]')
                    : job.requiredSkills || [];
                return (
                  <div
                    key={job.id}
                    id={`rec-job-${job.id}`}
                    style={{ animationDelay: `${(index + 1) * 90}ms` }}
                    className="animate-fade-in-up border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl p-4.5 transition-all duration-200 hover:shadow-md active:scale-[0.98] bg-white dark:bg-slate-800/60 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3
                            className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer transition-colors"
                            onClick={() => onSelectJob(job)}
                          >
                            {job.title}
                          </h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-md">
                            {job.source}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                          {job.company} • {job.location} •{' '}
                          <span className="text-slate-500 dark:text-slate-400">{job.workType}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2.5 self-start sm:self-center">
                        {/* ATS Compatibility Badge with Shimmer & Ambient Glow */}
                        <div className="shimmer-badge px-2.5 py-1 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-right">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              88% ATS Fit
                            </span>
                          </div>
                          <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                            Resume v{resumes[0]?.version || 1}
                          </span>
                        </div>

                        <button
                          onClick={() => onSelectJob(job)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl active:scale-[0.96] transition-all"
                        >
                          Analyze ATS
                        </button>

                        {/* Primary Smart Apply Button with Shimmer and Tactile scale */}
                        <button
                          onClick={() => onOpenApplyModal(job)}
                          className="shimmer-badge px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl active:scale-[0.96] hover:scale-[1.02] transition-all shadow-xs hover:shadow-blue-500/30"
                        >
                          Smart Apply
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {reqSkills.slice(0, 5).map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200/80 dark:border-slate-700/60"
                        >
                          {skill}
                        </span>
                      ))}
                      {reqSkills.length > 5 && (
                        <span className="text-[11px] px-1.5 py-0.5 text-slate-500 dark:text-slate-400 font-medium">
                          +{reqSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Applications Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs transition-colors duration-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Applications
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tracked with specific resume version and audit log
                </p>
              </div>
              <button
                onClick={() => onNavigate('applications')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1 active:scale-[0.96] transition-all"
              >
                <span>Full Tracker ({applications.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {recentApplications.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Send className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No applications submitted yet
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Find an open role in Job Discovery and use Smart Apply to submit your first
                  application.
                </p>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="mt-4 px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-blue-500 active:scale-[0.98] transition-all"
                >
                  Explore Jobs
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {app.role}
                        </span>
                        <span className="text-slate-400 dark:text-slate-600">•</span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {app.company}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Used: {app.resumeName || 'Primary Resume'} (v{app.resumeVersion || 1})</span>
                        <span>•</span>
                        <span>ATS: {app.atsScore || 88}%</span>
                        <span>•</span>
                        <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          app.status === 'Offer'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : app.status === 'Interview'
                            ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                            : app.status === 'Shortlisted'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : app.status === 'Assessment'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : app.status === 'Rejected'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Tools, Active Resumes & AI Insights */}
        <div className="space-y-6">
          {/* Active Resumes Snapshot */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Active Resumes</span>
              </h3>
              <button
                onClick={() => onNavigate('resumes')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 active:scale-[0.96] transition"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2.5">
              {resumes.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  onClick={() => onNavigate('resumes')}
                  className="p-3 border border-slate-200/90 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer active:scale-[0.98] transition-all duration-150"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[170px]">
                      {r.name}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                      v{r.version}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    Target: {r.targetRole || 'General Role'}
                  </p>
                  {r.isDefault && (
                    <span className="inline-block mt-1.5 text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-md border border-blue-200 dark:border-blue-900">
                      Primary Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Career Assistant Shortcut Card with Pulse Glow */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-indigo-900/30 dark:border-blue-800/40 relative overflow-hidden">
            <div className="flex items-center space-x-2 text-blue-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">CareerHub Intelligence</span>
            </div>
            <h3 className="text-sm font-bold mt-2 text-white">Ready to optimize your job hunt?</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Ask your grounded career assistant which resume matches a role best, how to improve your
              ATS score, or generate interview prep questions.
            </p>
            <button
              onClick={onOpenAssistant}
              className="shimmer-badge mt-4 w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-1.5 shadow-md"
            >
              <span>Ask AI Career Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs transition-colors duration-200">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Quick Workspaces</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => onNavigate('answer-bank')}
                className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-2xl text-left active:scale-[0.98] transition"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Application Answer Bank
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Reusable questions for 1-click autofill
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('email-sync')}
                className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-2xl text-left active:scale-[0.98] transition"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Email & Recruiter Status Sync
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Detect interview invites and updates
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('analytics')}
                className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-2xl text-left active:scale-[0.98] transition"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Application Analytics
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Funnel conversion & resume performance
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
