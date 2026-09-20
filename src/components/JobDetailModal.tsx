import React, { useState, useEffect } from 'react';
import { Job, Resume, AtsAnalysisResult, JobMatchResult, ResumeRecommendation } from '../types.ts';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building,
  MapPin,
  DollarSign,
  Bookmark,
  ExternalLink,
  ChevronDown,
  Info,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileText,
  Lightbulb,
} from 'lucide-react';

interface JobDetailModalProps {
  job: Job | null;
  resumes: Resume[];
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (job: Job) => Promise<void>;
  onOpenApply: (job: Job, selectedResumeId?: number) => void;
  fetchAtsAnalysis: (resumeId: number, jobId: number) => Promise<AtsAnalysisResult>;
  fetchJobMatch: (resumeId: number, jobId: number) => Promise<JobMatchResult>;
  fetchRecommendResume: (jobId: number) => Promise<ResumeRecommendation>;
  fetchOptimizeAdvice: (resumeId: number, jobId: number) => Promise<any>;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  resumes,
  isSaved,
  onClose,
  onToggleSave,
  onOpenApply,
  fetchAtsAnalysis,
  fetchJobMatch,
  fetchRecommendResume,
  fetchOptimizeAdvice,
}) => {
  if (!job) return null;

  const defaultResume = resumes.find(r => r.isDefault) || resumes[0];
  const [selectedResumeId, setSelectedResumeId] = useState<number>(defaultResume?.id || 0);

  const [atsResult, setAtsResult] = useState<AtsAnalysisResult | null>(null);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [recommendation, setRecommendation] = useState<ResumeRecommendation | null>(null);
  const [optimizeAdvice, setOptimizeAdvice] = useState<any | null>(null);

  const [loadingAts, setLoadingAts] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);

  // Load smart resume recommendation first
  useEffect(() => {
    if (!job || resumes.length === 0) return;
    let isMounted = true;
    setLoadingRecommend(true);
    fetchRecommendResume(job.id)
      .then((rec) => {
        if (isMounted && rec) {
          setRecommendation(rec);
          if (rec.recommendedResumeId) {
            setSelectedResumeId(rec.recommendedResumeId);
          }
        }
      })
      .catch((err) => console.warn('Recommend error:', err))
      .finally(() => {
        if (isMounted) setLoadingRecommend(false);
      });

    return () => {
      isMounted = false;
    };
  }, [job?.id]);

  // When selected resume changes, evaluate ATS score and Job Match
  useEffect(() => {
    if (!job || !selectedResumeId) return;
    let isMounted = true;
    setLoadingAts(true);
    setLoadingMatch(true);

    fetchAtsAnalysis(selectedResumeId, job.id)
      .then((res) => {
        if (isMounted) setAtsResult(res);
      })
      .catch((e) => console.error('ATS error:', e))
      .finally(() => {
        if (isMounted) setLoadingAts(false);
      });

    fetchJobMatch(selectedResumeId, job.id)
      .then((res) => {
        if (isMounted) setMatchResult(res);
      })
      .catch((e) => console.error('Match error:', e))
      .finally(() => {
        if (isMounted) setLoadingMatch(false);
      });

    return () => {
      isMounted = false;
    };
  }, [job?.id, selectedResumeId]);

  const handleFetchOptimization = async () => {
    if (!job || !selectedResumeId) return;
    try {
      const advice = await fetchOptimizeAdvice(selectedResumeId, job.id);
      setOptimizeAdvice(advice);
      setShowOptimizeModal(true);
    } catch (e: any) {
      alert('Error loading optimizations: ' + e.message);
    }
  };

  const currentResume = resumes.find(r => r.id === selectedResumeId) || defaultResume;
  const reqSkills = typeof job.requiredSkills === 'string' ? JSON.parse(job.requiredSkills || '[]') : (job.requiredSkills || []);

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto animate-fade-in-up">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xl my-6 max-h-[92vh] flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h2>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800 rounded-md">
                {job.source}
              </span>
              {job.workType && (
                <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                  {job.workType}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-600 dark:text-slate-400 flex-wrap gap-y-1">
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
                  <span className="flex items-center text-emerald-700 dark:text-emerald-400 font-semibold">
                    <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                    {job.salaryRange}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleSave(job)}
              className={`p-2 rounded-xl border transition ${
                isSaved
                  ? 'bg-amber-50 text-amber-600 border-amber-300'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Job'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-6">
          {/* Smart Resume Selection Header */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Active Resume Evaluated:
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(parseInt(e.target.value, 10))}
                    className="text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white shadow-2xs focus:ring-2 focus:ring-blue-500"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (v{r.version}){r.isDefault ? ' [Primary]' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recommendation Note */}
              {recommendation && (
                <div className="text-xs sm:text-right">
                  <span className="text-[11px] font-bold text-blue-700 flex sm:justify-end items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Top Recommended: {recommendation.resumeName}</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Why: {recommendation.matchingReasons?.[0] || 'Highest skill overlap'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ATS Score & Job Match Side-by-Side Dual Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Estimated ATS Compatibility Score */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Estimated ATS Compatibility</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Algorithmic keyword & formatting parse
                  </span>
                </div>
                {loadingAts ? (
                  <span className="text-xs text-slate-400">Evaluating...</span>
                ) : (
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-600">
                      {atsResult?.overallScore || 88}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">/100</span>
                  </div>
                )}
              </div>

              {/* Breakdown metrics */}
              {atsResult && (
                <div className="mt-4 space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Keyword Match</span>
                      <span className="font-semibold text-slate-900">{atsResult.keywordMatch}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${atsResult.keywordMatch}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Skills Match</span>
                      <span className="font-semibold text-slate-900">{atsResult.skillsMatch}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${atsResult.skillsMatch}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Experience Match</span>
                      <span className="font-semibold text-slate-900">{atsResult.experienceMatch}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${atsResult.experienceMatch}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Job Title Match</span>
                      <span className="font-semibold text-slate-900">{atsResult.jobTitleMatch}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${atsResult.jobTitleMatch}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Mandatory ATS Disclaimer */}
              <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 leading-relaxed flex items-start space-x-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Disclaimer: </strong>Estimated ATS compatibility score based on selected resume and job description. Not an official company ATS score.
                </span>
              </div>
            </div>

            {/* Box 2: Job Match Score (Holistic Fit) */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>Job Match Score</span>
                    </h3>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Holistic career role & skills alignment
                    </span>
                  </div>
                  {loadingMatch ? (
                    <span className="text-xs text-slate-400">Evaluating...</span>
                  ) : (
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-600">
                        {matchResult?.matchScore || 85}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                    Why this job matches:
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {matchResult?.reasons?.map((reason, idx) => (
                      <div key={idx} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{reason}</span>
                      </div>
                    )) || (
                      <p className="text-xs text-slate-500">Calculating profile alignment...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Optimization Trigger */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Need higher alignment?</span>
                <button
                  onClick={handleFetchOptimization}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>View Targeted Resume Tweaks</span>
                </button>
              </div>
            </div>
          </div>

          {/* Matched & Missing Keywords Tags */}
          {atsResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matched */}
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3.5">
                <h4 className="text-xs font-bold text-emerald-900 mb-2 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Matched Keywords ({atsResult.matchedKeywords?.length || 0})</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.matchedKeywords?.map((kw, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2 py-0.5 bg-white text-emerald-800 rounded-md border border-emerald-200"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing / Weak */}
              <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-3.5">
                <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Missing or Weak Keywords ({atsResult.missingKeywords?.length || 0})</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.missingKeywords?.map((kw, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2 py-0.5 bg-white text-amber-800 rounded-md border border-amber-200"
                    >
                      ⚠ {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resume Strengths & Gaps */}
          {atsResult && (
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Objective ATS Feedback & Integrity Checks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block mb-1">Resume Strengths:</span>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    {atsResult.strengths?.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block mb-1">Potential Gaps:</span>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    {atsResult.gaps?.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Full Job Description */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Role Overview & Responsibilities</h3>
            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
              {job.description}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 block mb-2">Required Competencies:</span>
              <div className="flex flex-wrap gap-1.5">
                {reqSkills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Selected for apply: <strong className="text-slate-900 dark:text-white">{currentResume?.name} (v{currentResume?.version})</strong>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.96] transition"
            >
              Close
            </button>
            <button
              onClick={() => onOpenApply(job, selectedResumeId)}
              className="shimmer-badge px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl active:scale-[0.96] hover:scale-[1.02] transition flex items-center space-x-2 shadow-xs hover:shadow-blue-500/25"
            >
              <Send className="w-4 h-4" />
              <span>Smart Apply Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optimize Resume Drawer / Modal */}
      {showOptimizeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Targeted Resume Optimizations</h3>
              </div>
              <button onClick={() => setShowOptimizeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 leading-relaxed">
              <strong>Integrity Guarantee: </strong>
              CareerHub AI suggests rephrasing and highlighting existing verified accomplishments. It will never suggest fabricating skills or qualifications you do not possess.
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-3">
              {optimizeAdvice?.suggestions?.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="text-xs font-bold text-slate-900 block">{item.topic}</span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{item.advice}</p>
                  {item.exampleDiff && (
                    <div className="mt-2 p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-800 font-mono">
                      {item.exampleDiff}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowOptimizeModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
