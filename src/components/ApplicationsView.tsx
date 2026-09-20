import React, { useState } from 'react';
import { Application, ApplicationEvent } from '../types.ts';
import {
  Search,
  Send,
  Building,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  Layers,
  LayoutGrid,
  List,
} from 'lucide-react';
import { ApplicationDetailModal } from './ApplicationDetailModal.tsx';

interface ApplicationsViewProps {
  applications: Application[];
  onUpdateStatus: (id: number, status: string, notes?: string, interviewDate?: string) => Promise<void>;
  fetchTimeline: (id: number) => Promise<ApplicationEvent[]>;
  onNavigateToJobs: () => void;
}

const STATUS_FILTERS = [
  'All',
  'Applied',
  'Assessment',
  'Recruiter Screen',
  'Interview',
  'Shortlisted',
  'Offer',
  'Rejected',
];

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  onUpdateStatus,
  fetchTimeline,
  onNavigateToJobs,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const filteredApps = applications.filter((app) => {
    if (selectedStatusFilter !== 'All' && app.status !== selectedStatusFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        app.company.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q) ||
        (app.resumeName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Offer':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Interview':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'Shortlisted':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Assessment':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Rejected':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div id="applications-view" className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Centralized pipeline tracking with exact resume version traceability, audit timeline events, and status advancement.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-900 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg active:scale-[0.96] transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg active:scale-[0.96] transition ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Pipeline Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onNavigateToJobs}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-blue-500 active:scale-[0.98] transition shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Apply to New Job</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3 transition-colors duration-200">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search submitted applications by role, company, or resume used..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-hidden transition"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`text-[11px] font-medium px-3 py-1 rounded-xl active:scale-[0.96] transition whitespace-nowrap ${
                selectedStatusFilter === st
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
              {st !== 'All' && (
                <span className="ml-1.5 text-[10px] opacity-75">
                  ({applications.filter((a) => a.status === st).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main List / Kanban View */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xs">
          <Send className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No applications found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {selectedStatusFilter !== 'All'
              ? `No applications currently in '${selectedStatusFilter}' status.`
              : 'You have not submitted any applications yet. Explore verified jobs to begin.'}
          </p>
          <button
            onClick={onNavigateToJobs}
            className="mt-4 px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-blue-500 active:scale-[0.98] transition"
          >
            Explore Job Openings
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredApps.map((app, idx) => (
            <div
              key={app.id}
              style={{ animationDelay: `${(idx % 10) * 60}ms` }}
              onClick={() => setSelectedApp(app)}
              className="animate-fade-in-up bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition hover:shadow-md active:scale-[0.99] shadow-xs cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {app.role}
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {app.company}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-y-1">
                  <span className="flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
                    {app.resumeName || 'Primary Resume'} (v{app.resumeVersion || 1})
                  </span>
                  <span>•</span>
                  <span>
                    ATS Match:{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {app.atsScore || 88}%
                    </strong>
                  </span>
                  <span>•</span>
                  <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApp(app);
                  }}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl active:scale-[0.96] transition flex items-center space-x-1"
                >
                  <span>Timeline & Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {['Applied', 'Assessment', 'Interview', 'Offer'].map((columnStatus) => {
            const colApps = applications.filter((a) => a.status === columnStatus);
            return (
              <div
                key={columnStatus}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 flex flex-col shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {columnStatus}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className="p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs cursor-pointer active:scale-[0.98] transition space-y-2"
                    >
                      <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                        {app.role}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block">
                        {app.company}
                      </span>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-400">
                        <span>Resume v{app.resumeVersion || 1}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {app.atsScore || 88}%
                        </span>
                      </div>
                    </div>
                  ))}
                  {colApps.length === 0 && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-8">
                      No applications in this stage
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Detail Modal with Timeline & Audit Log */}
      <ApplicationDetailModal
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onUpdateStatus={onUpdateStatus}
        fetchTimeline={fetchTimeline}
      />
    </div>
  );
};
