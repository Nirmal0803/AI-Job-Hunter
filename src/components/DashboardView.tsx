import React from 'react';
import {
  Compass,
  FileCheck2,
  Send,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { CandidateProfile, JobListing, SearchPreferences } from '../types';
import { NavigationTab } from './Sidebar';

interface DashboardViewProps {
  profile: CandidateProfile | null;
  jobs: JobListing[];
  preferences: SearchPreferences;
  onNavigate: (tab: NavigationTab) => void;
  onSelectJobForStudio: (job: JobListing) => void;
  onSelectJobForApply: (job: JobListing) => void;
  onDiscover: () => void;
  isDiscovering: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  jobs,
  preferences,
  onNavigate,
  onSelectJobForStudio,
  onSelectJobForApply,
  onDiscover,
  isDiscovering,
}) => {
  // Metrics
  const totalDiscovered = jobs.length;
  const shortlisted = jobs.filter((j) => j.status === 'Shortlisted');
  const resumesReady = jobs.filter((j) => j.status === 'Resume Ready');
  const awaitingApproval = jobs.filter((j) => j.status === 'Awaiting Approval');
  const appliedJobs = jobs.filter((j) => ['Applied', 'Interview', 'Offer'].includes(j.status));
  const interviews = jobs.filter((j) => j.status === 'Interview');

  // Sorted by match score
  const bestMatches = [...jobs]
    .filter((j) => (j.matchDetails?.overallScore || 0) >= 70)
    .sort((a, b) => (b.matchDetails?.overallScore || 0) - (a.matchDetails?.overallScore || 0))
    .slice(0, 5);

  // Newest discovered
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Onboarding Banner if no profile */}
      {!profile && (
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">Step 1: Upload Your Master Resume</h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              AutoApply AI extracts your work history, skills, education, and metrics directly from your PDF or DOCX resume. No manual entry needed.
            </p>
          </div>
          <button
            onClick={() => onNavigate('resume')}
            className="px-5 py-2.5 bg-white text-slate-950 font-semibold text-xs rounded-lg hover:bg-slate-100 transition-colors shrink-0 shadow-sm flex items-center gap-2"
          >
            <span>Upload Resume Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Discovered</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
            {totalDiscovered}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Aggregated listings</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">High Affinity Matches</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-indigo-600 mt-1 block">
            {bestMatches.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Score ≥ 70%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Shortlisted</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
            {shortlisted.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Target opportunities</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Resumes Ready</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1 block">
            {resumesReady.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">ATS tailored</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Awaiting Approval</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-amber-600 mt-1 block">
            {awaitingApproval.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Requires your review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Submitted Applications</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
            {appliedJobs.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {interviews.length > 0 ? `${interviews.length} interviews` : 'Active pipeline'}
          </span>
        </div>
      </div>

      {/* Recommended Next Actions Workflow Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Autonomous Job-Hunting Flow</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('resume')}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              profile?.isApproved
                ? 'bg-slate-50 border-slate-200'
                : 'bg-indigo-50/60 border-indigo-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">1. Master Profile</span>
              {profile?.isApproved ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">Action</span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              {profile?.isApproved ? 'Resume parsed & verified' : 'Upload and verify skills'}
            </p>
          </div>

          <div
            onClick={onDiscover}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              jobs.length > 0
                ? 'bg-slate-50 border-slate-200'
                : 'bg-indigo-50/60 border-indigo-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">2. Scan Opportunities</span>
              <Compass className={`w-4 h-4 text-slate-600 ${isDiscovering ? 'animate-spin' : ''}`} />
            </div>
            <p className="text-xs text-slate-600">
              {jobs.length > 0 ? `${jobs.length} roles found across boards` : 'Start multi-source scan'}
            </p>
          </div>

          <div
            onClick={() => onNavigate('shortlisted')}
            className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">3. Tailor Resumes</span>
              <Sparkles className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-xs text-slate-600">
              Customize achievements & ATS keywords per job
            </p>
          </div>

          <div
            onClick={() => onNavigate('applications')}
            className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">4. Approve & Track</span>
              <Send className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-xs text-slate-600">
              Autofill form fields and review before submitting
            </p>
          </div>
        </div>
      </div>

      {/* Split Section: Best Matches vs Urgent Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 cols: Best Matching Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Top Job Matches for Your Profile
              </h2>
              <p className="text-xs text-slate-500">
                Ranked by technical competence overlap, experience depth, and salary preference
              </p>
            </div>
            <button
              onClick={() => onNavigate('discover')}
              className="text-xs text-slate-700 font-semibold hover:text-slate-900 flex items-center gap-1"
            >
              <span>View all {jobs.length}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {bestMatches.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-700">No match scores calculated yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Discover jobs and evaluate your profile against job requirements to see high-affinity opportunities.
              </p>
              <button
                onClick={onDiscover}
                disabled={isDiscovering}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                {isDiscovering ? 'Scanning...' : 'Scan Job Boards'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bestMatches.map((job) => {
                const score = job.matchDetails?.overallScore || 0;
                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold tabular-nums px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {score}% Match
                        </span>
                        <h4 className="font-semibold text-slate-900 text-sm truncate">
                          {job.title}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{job.company}</span>
                        <span aria-hidden="true">·</span>
                        <span>{job.location}</span>
                        <span aria-hidden="true">·</span>
                        <span>{job.workArrangement}</span>
                        {job.salaryRange && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-slate-700 font-medium">
                              {job.salaryRange}
                            </span>
                          </>
                        )}
                      </div>

                      {job.matchDetails?.scoreExplanation && (
                        <p className="text-xs text-slate-600 line-clamp-1 italic">
                          "{job.matchDetails.scoreExplanation}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onSelectJobForStudio(job)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Customize Resume</span>
                      </button>
                      <button
                        onClick={() => onSelectJobForApply(job)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <span>Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 col: Pipeline status & follow-ups */}
        <div className="space-y-6">
          {/* Applications Awaiting Approval */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Awaiting Your Approval</h3>
              <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {awaitingApproval.length} pending
              </span>
            </div>

            {awaitingApproval.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                No applications currently waiting for approval. When resumes and autofill data are ready, they will require your explicit authorization here.
              </p>
            ) : (
              <div className="space-y-3">
                {awaitingApproval.map((job) => (
                  <div key={job.id} className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 text-xs space-y-2">
                    <div className="font-semibold text-slate-900 truncate">{job.title}</div>
                    <div className="text-slate-600">{job.company}</div>
                    <button
                      onClick={() => onSelectJobForApply(job)}
                      className="w-full py-1.5 bg-slate-900 text-white font-medium rounded hover:bg-slate-800 transition-colors text-center"
                    >
                      Review & Approve Submission
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Applications Pipeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Submitted & Follow-ups</h3>
              <span className="text-xs font-mono font-semibold text-slate-700">
                {appliedJobs.length} active
              </span>
            </div>

            {appliedJobs.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                No submitted applications recorded yet. Once submitted with your approval, outcomes and interview schedules are tracked here.
              </p>
            ) : (
              <div className="space-y-3">
                {appliedJobs.slice(0, 4).map((job) => (
                  <div key={job.id} className="p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 truncate">{job.company}</span>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {job.status}
                      </span>
                    </div>
                    <div className="text-slate-500 truncate">{job.title}</div>
                    {job.appliedDate && (
                      <div className="text-[11px] text-slate-400">
                        Applied on {new Date(job.appliedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
