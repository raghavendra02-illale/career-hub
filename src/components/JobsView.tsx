import React, { useState } from 'react';
import { Job } from '../types.ts';
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  Sparkles,
  Send,
  SlidersHorizontal,
  Bell,
  Clock,
  DollarSign,
  Building,
  Activity,
  Zap,
} from 'lucide-react';

interface JobsViewProps {
  jobs: Job[];
  savedJobIds: number[];
  onToggleSaveJob: (job: Job) => Promise<void>;
  onSelectJob: (job: Job) => void;
  onOpenApplyModal: (job: Job) => void;
  onOpenAlertsModal: () => void;
}

const SOURCES = ['All', 'LinkedIn Jobs', 'Indeed', 'Foundit', 'Wellfound', 'Apna', 'Naukri', 'Company Careers'];
const WORK_TYPES = ['All', 'Remote', 'Hybrid', 'On-site'];

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  savedJobIds,
  onToggleSaveJob,
  onSelectJob,
  onOpenApplyModal,
  onOpenAlertsModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedWorkType, setSelectedWorkType] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [onlySaved, setOnlySaved] = useState(false);

  // Filter jobs client side
  const filteredJobs = jobs.filter((job) => {
    if (onlySaved && !savedJobIds.includes(job.id)) return false;

    if (selectedSource !== 'All' && job.source.toLowerCase() !== selectedSource.toLowerCase()) {
      return false;
    }

    if (selectedWorkType !== 'All' && job.workType?.toLowerCase() !== selectedWorkType.toLowerCase()) {
      return false;
    }

    if (locationFilter && !job.location?.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCompany = job.company.toLowerCase().includes(q);
      const matchDesc = job.description.toLowerCase().includes(q);
      const skills = typeof job.requiredSkills === 'string' ? job.requiredSkills.toLowerCase() : '';
      const matchSkills = skills.includes(q);
      if (!matchTitle && !matchCompany && !matchDesc && !matchSkills) return false;
    }

    return true;
  });

  return (
    <div id="jobs-view" className="space-y-6 animate-fade-in-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Unified Job Discovery
            </h1>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 text-[11px] font-semibold">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Live Multi-Source</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Aggregating opportunities across LinkedIn, Indeed, Foundit, Wellfound, and direct career portals into one unified feed.
          </p>
        </div>
        <button
          onClick={onOpenAlertsModal}
          className="flex items-center space-x-2 px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold active:scale-[0.98] transition self-start sm:self-auto shadow-xs"
        >
          <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Personalized Alerts</span>
        </button>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 transition-colors duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Main search query */}
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by role, company, skills (e.g. AI Engineer, Python, Scale AI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-hidden transition"
            />
          </div>

          {/* Location filter */}
          <div className="sm:col-span-5 relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="City, State, or Country (e.g. San Francisco, Bengaluru)..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-hidden transition"
            />
          </div>
        </div>

        {/* Source Pills & Quick Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1 uppercase tracking-wider">
              Source:
            </span>
            {SOURCES.map((src) => (
              <button
                key={src}
                onClick={() => setSelectedSource(src)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg active:scale-[0.96] transition whitespace-nowrap ${
                  selectedSource === src
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {/* Work Type selector */}
            <select
              value={selectedWorkType}
              onChange={(e) => setSelectedWorkType(e.target.value)}
              className="text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-hidden"
            >
              {WORK_TYPES.map((wt) => (
                <option key={wt} value={wt}>
                  {wt === 'All' ? 'All Work Types' : wt}
                </option>
              ))}
            </select>

            {/* Saved Jobs Toggle */}
            <button
              onClick={() => setOnlySaved(!onlySaved)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border active:scale-[0.96] transition ${
                onlySaved
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlySaved ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span>Saved ({savedJobIds.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Showing <span className="text-slate-900 dark:text-white font-bold">{filteredJobs.length}</span> verified job postings
        </p>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">Real-time normalized source feed</span>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xs">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No jobs match your active filters</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try broadening your search keywords or resetting your source and location filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSource('All');
              setSelectedWorkType('All');
              setLocationFilter('');
              setOnlySaved(false);
            }}
            className="mt-4 px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-blue-500 active:scale-[0.98] transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job, idx) => {
            const isSaved = savedJobIds.includes(job.id);
            const reqSkills =
              typeof job.requiredSkills === 'string'
                ? JSON.parse(job.requiredSkills || '[]')
                : job.requiredSkills || [];

            return (
              <div
                key={job.id}
                id={`job-card-${job.id}`}
                style={{ animationDelay: `${(idx % 10) * 50}ms` }}
                className="animate-fade-in-up bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-3xl p-5 transition-all duration-200 hover:shadow-md active:scale-[0.99] shadow-xs group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Job Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h2
                        onClick={() => onSelectJob(job)}
                        className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer transition"
                      >
                        {job.title}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800 rounded-md">
                        {job.source}
                      </span>
                      {job.workType && (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                          {job.workType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 mt-1 text-xs text-slate-600 dark:text-slate-400 flex-wrap gap-y-1">
                      <span className="font-semibold text-slate-900 dark:text-white flex items-center">
                        <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {job.company}
                      </span>
                      <span>•</span>
                      <span className="flex items-center text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {job.location}
                      </span>
                      {job.salaryRange && (
                        <>
                          <span>•</span>
                          <span className="flex items-center text-emerald-700 dark:text-emerald-400 font-medium">
                            <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                            {job.salaryRange}
                          </span>
                        </>
                      )}
                      {job.experienceLevel && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500 dark:text-slate-400">{job.experienceLevel}</span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Skill Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {reqSkills.slice(0, 6).map((skill: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="text-[11px] px-2 py-0.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200/80 dark:border-slate-700/60"
                        >
                          {skill}
                        </span>
                      ))}
                      {reqSkills.length > 6 && (
                        <span className="text-[11px] px-1.5 py-0.5 text-slate-400 dark:text-slate-500 font-medium">
                          +{reqSkills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onToggleSaveJob(job)}
                        className={`p-2 rounded-xl border active:scale-[0.96] transition ${
                          isSaved
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                        }`}
                        title={isSaved ? 'Remove from Saved' : 'Save Job'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
                      </button>

                      <button
                        onClick={() => onSelectJob(job)}
                        className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl active:scale-[0.96] transition flex items-center space-x-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>ATS Breakdown</span>
                      </button>

                      <button
                        onClick={() => onOpenApplyModal(job)}
                        className="shimmer-badge px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl active:scale-[0.96] hover:scale-[1.02] transition flex items-center space-x-1.5 shadow-xs hover:shadow-blue-500/25"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Smart Apply</span>
                      </button>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 dark:text-slate-500">
                      Posted {new Date(job.postedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
