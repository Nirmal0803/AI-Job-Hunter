import React, { useState, useEffect } from 'react';
import {
  Send,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Clock,
  Calendar,
  Building2,
  FileCheck2,
  ShieldCheck,
  Check,
  X,
  Code,
  Copy,
  Plus,
  Bookmark,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { JobListing, CandidateProfile, ApplicationPackage } from '../types';
import { api } from '../services/api';

interface ApplicationsViewProps {
  jobs: JobListing[];
  profile: CandidateProfile | null;
  selectedJobForModal: JobListing | null;
  onClearSelectedJobModal: () => void;
  onRefreshJobs: () => void;
  onNavigateToStudio: (job: JobListing) => void;
}

const statusColumns: JobListing['status'][] = [
  'Awaiting Approval',
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
];

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  jobs,
  profile,
  selectedJobForModal,
  onClearSelectedJobModal,
  onRefreshJobs,
  onNavigateToStudio,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Application Package Modal
  const [activeJobPackage, setActiveJobPackage] = useState<JobListing | null>(
    selectedJobForModal
  );
  const [appPackageData, setAppPackageData] = useState<ApplicationPackage | null>(null);
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [userExplicitlyApproved, setUserExplicitlyApproved] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Sync if selectedJobForModal changes
  useEffect(() => {
    if (selectedJobForModal) {
      setActiveJobPackage(selectedJobForModal);
      loadApplicationPackage(selectedJobForModal.id);
    }
  }, [selectedJobForModal]);

  const loadApplicationPackage = async (jobId: string) => {
    setIsLoadingPackage(true);
    try {
      const data = await api.getApplicationPackage(jobId);
      setAppPackageData(data);
      setUserExplicitlyApproved(false);
    } catch (err) {
      console.error('Failed to load application package:', err);
    } finally {
      setIsLoadingPackage(false);
    }
  };

  const handleOpenApplicationModal = (job: JobListing) => {
    setActiveJobPackage(job);
    loadApplicationPackage(job.id);
  };

  const handleConfirmSubmission = async () => {
    if (!activeJobPackage || !userExplicitlyApproved) return;
    setIsSubmitting(true);
    try {
      await api.submitApplication(activeJobPackage.id, submissionNotes);
      setActiveJobPackage(null);
      setAppPackageData(null);
      onClearSelectedJobModal();
      onRefreshJobs();
    } catch (err: any) {
      alert(`Submission recording failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: JobListing['status']) => {
    try {
      await api.updateJobStatus(jobId, { status: newStatus });
      onRefreshJobs();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Filtered applications
  const applicationJobs = jobs.filter((job) => {
    // Only jobs in pipeline
    const inPipeline = [
      'Resume Ready',
      'Awaiting Approval',
      'Applied',
      'Interview',
      'Offer',
      'Rejected',
    ].includes(job.status);

    const matchesStatus =
      statusFilter === 'all' || job.status.toLowerCase() === statusFilter.toLowerCase();

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q);

    return inPipeline && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Application Automation & Pipeline Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browser-assisted form autofill with mandatory human approval gates, outcome tracking, and interview schedules.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 font-medium rounded transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 font-medium rounded transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Pipeline Board
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracked applications..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 font-medium">Status:</span>
          {['all', 'Awaiting Approval', 'Applied', 'Interview', 'Offer', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main View: Table vs Kanban */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {applicationJobs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Send className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No active applications in pipeline</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Shortlist a job, generate a tailored resume, and launch the application workflow to populate your pipeline.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Company & Role</th>
                    <th className="py-3 px-4">Match Score</th>
                    <th className="py-3 px-4">Resume Version</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Applied Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applicationJobs.map((job) => {
                    const score = job.matchDetails?.overallScore;
                    return (
                      <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-xs">{job.title}</div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                            <span className="font-medium text-slate-700">{job.company}</span>
                            <span aria-hidden="true">·</span>
                            <span>{job.location}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {score !== undefined ? (
                            <span className="font-mono text-xs font-bold tabular-nums text-slate-800">
                              {score}%
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {job.tailoredResume ? (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Tailored ATS
                            </span>
                          ) : (
                            <button
                              onClick={() => onNavigateToStudio(job)}
                              className="text-[11px] text-indigo-600 hover:underline"
                            >
                              Tailor Resume →
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={job.status}
                            onChange={(e) => handleStatusChange(job.id, e.target.value as any)}
                            className="text-xs font-semibold py-1 px-2 rounded bg-slate-50 border border-slate-200 text-slate-800 focus:outline-slate-900"
                          >
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Resume Ready">Resume Ready</option>
                            <option value="Awaiting Approval">Awaiting Approval</option>
                            <option value="Applied">Applied</option>
                            <option value="Interview">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Not Interested">Not Interested</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {job.appliedDate ? (
                            new Date(job.appliedDate).toLocaleDateString()
                          ) : (
                            <span className="text-slate-400">Not submitted</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenApplicationModal(job)}
                              className="px-2.5 py-1 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                            >
                              Autofill & Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {statusColumns.map((colStatus) => {
            const colJobs = applicationJobs.filter((j) => j.status === colStatus);
            return (
              <div
                key={colStatus}
                className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 space-y-3 min-w-[220px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800 truncate">{colStatus}</span>
                  <span className="font-mono text-xs font-semibold bg-white text-slate-700 px-1.5 py-0.5 rounded shadow-xs">
                    {colJobs.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {colJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleOpenApplicationModal(job)}
                      className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="font-semibold text-slate-900 text-xs truncate">
                        {job.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{job.company}</div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="font-mono font-bold text-slate-700">
                          {job.matchDetails?.overallScore ? `${job.matchDetails.overallScore}% Fit` : ''}
                        </span>
                        {job.appliedDate && (
                          <span className="text-slate-400">
                            {new Date(job.appliedDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* APPLICATION AUTOMATION & APPROVAL MODAL */}
      {/* ------------------------------------------------------------- */}
      {activeJobPackage && appPackageData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 space-y-6 border border-slate-200 my-8">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                  Application Automation Engine
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {activeJobPackage.title} · {activeJobPackage.company}
                </h3>
                <a
                  href={appPackageData.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mt-0.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{appPackageData.applyUrl || 'Direct Application Page'}</span>
                </a>
              </div>

              <button
                onClick={() => {
                  setActiveJobPackage(null);
                  setAppPackageData(null);
                  onClearSelectedJobModal();
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Autofill Field Mappings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  1. Mapped Form Fields (Greenhouse / Lever / ATS Standard)
                </h4>
                <span className="text-[11px] text-slate-500">
                  Pre-populated from verified profile
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
                {appPackageData.mappedFields.map((field) => (
                  <div
                    key={field.fieldKey}
                    className={`p-2.5 rounded-lg border text-xs space-y-0.5 ${
                      field.needsReview
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 text-[11px]">{field.label}</span>
                      {field.needsReview ? (
                        <span className="text-[10px] text-amber-700 font-bold">Needs Value</span>
                      ) : (
                        <Check className="w-3 h-3 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-slate-900 font-medium truncate">
                      {field.value || 'Not provided'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tailored Artifacts Verified */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">
                2. Application Attachments Selected
              </span>
              <div className="flex items-center gap-4 text-slate-700">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <FileCheck2 className="w-4 h-4" />
                  {activeJobPackage.tailoredResume
                    ? 'Tailored ATS Resume Ready'
                    : 'Master Baseline Resume'}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {activeJobPackage.tailoredCoverLetter
                    ? 'Tailored Cover Letter Attached'
                    : 'No Cover Letter'}
                </span>
              </div>
            </div>

            {/* Playwright Script / 1-Click Autofill Bookmarklet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  3. Browser-Assisted Automation Payload
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(appPackageData.playwrightScript);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 2000);
                  }}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                >
                  <Code className="w-3 h-3" />
                  <span>{copiedScript ? 'Copied Script!' : 'Copy Playwright Script'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                You can run the script via local Playwright or open the application page and paste your mapped values. Anti-bot protections and CAPTCHAs are never bypassed without user presence.
              </p>
            </div>

            {/* MANDATORY USER APPROVAL GATE */}
            <div className="p-5 bg-amber-50/80 border-2 border-amber-300 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-900">
                    Mandatory Human Approval Gate
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Under no circumstances does AutoApply AI submit an application without your explicit personal authorization. Check the box below once you have reviewed the application package.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={userExplicitlyApproved}
                  onChange={(e) => setUserExplicitlyApproved(e.target.checked)}
                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                />
                <span className="text-xs font-bold text-slate-900">
                  I explicitly authorize and approve submitting this application to {activeJobPackage.company}.
                </span>
              </label>

              <input
                type="text"
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Optional submission notes or confirmation ID..."
                className="w-full text-xs p-2 bg-white border border-amber-200 rounded focus:outline-slate-900"
              />
            </div>

            {/* Final Action Controls */}
            <div className="flex items-center justify-between pt-2">
              <a
                href={appPackageData.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5"
              >
                <span>Open Application in Browser</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveJobPackage(null);
                    setAppPackageData(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmission}
                  disabled={!userExplicitlyApproved || isSubmitting}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isSubmitting ? 'Recording...' : 'Authorize & Mark Submitted'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
