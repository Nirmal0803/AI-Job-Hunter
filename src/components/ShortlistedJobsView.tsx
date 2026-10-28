import React from 'react';
import {
  BookmarkCheck,
  Sparkles,
  ExternalLink,
  Trash2,
  MapPin,
  Building2,
  DollarSign,
  FileCheck2,
  ArrowRight,
  Send,
} from 'lucide-react';
import { JobListing, CandidateProfile } from '../types';
import { api } from '../services/api';

interface ShortlistedJobsViewProps {
  jobs: JobListing[];
  profile: CandidateProfile | null;
  onRefreshJobs: () => void;
  onSelectJobForStudio: (job: JobListing) => void;
  onSelectJobForApply: (job: JobListing) => void;
  onNavigateToDiscover: () => void;
}

export const ShortlistedJobsView: React.FC<ShortlistedJobsViewProps> = ({
  jobs,
  profile,
  onRefreshJobs,
  onSelectJobForStudio,
  onSelectJobForApply,
  onNavigateToDiscover,
}) => {
  const shortlistedJobs = jobs.filter((j) =>
    ['Shortlisted', 'Resume Ready', 'Awaiting Approval'].includes(j.status)
  );

  const handleRemoveFromShortlist = async (jobId: string) => {
    try {
      await api.updateJobStatus(jobId, { status: 'Discovered' });
      onRefreshJobs();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Shortlisted Opportunities ({shortlistedJobs.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Target openings selected for resume tailoring and browser-assisted application.
          </p>
        </div>

        <button
          onClick={onNavigateToDiscover}
          className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <span>Find More Roles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {shortlistedJobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <BookmarkCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Your shortlist is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse discovered opportunities and click the bookmark icon or "Shortlist" button to prioritize positions here.
          </p>
          <button
            onClick={onNavigateToDiscover}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
          >
            Explore Discovered Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {shortlistedJobs.map((job) => {
            const score = job.matchDetails?.overallScore;
            const hasTailoredResume = !!job.tailoredResume;
            const hasCoverLetter = !!job.tailoredCoverLetter;

            return (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                      {score !== undefined && (
                        <span className="font-mono text-xs font-bold tabular-nums px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {score}% Fit
                        </span>
                      )}
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {job.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{job.company}</span>
                      <span aria-hidden="true">·</span>
                      <span>{job.location}</span>
                      <span aria-hidden="true">·</span>
                      <span>{job.workArrangement}</span>
                      {job.salaryRange && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-700 font-medium">{job.salaryRange}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRemoveFromShortlist(job.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200 hover:bg-rose-50 transition-colors"
                      title="Remove from shortlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectJobForStudio(job)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{hasTailoredResume ? 'Edit Tailored Resume' : 'Customize Resume'}</span>
                    </button>

                    <button
                      onClick={() => onSelectJobForApply(job)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Apply Workflow</span>
                    </button>
                  </div>
                </div>

                {/* Prepared Artifacts Indicator */}
                <div className="flex items-center gap-4 text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Application Assets:</span>
                  <span className={`flex items-center gap-1 font-medium ${hasTailoredResume ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <FileCheck2 className="w-3.5 h-3.5" />
                    {hasTailoredResume ? 'ATS Resume Generated' : 'Resume Not Tailored Yet'}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className={`font-medium ${hasCoverLetter ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {hasCoverLetter ? 'Cover Letter Ready' : 'No Cover Letter'}
                  </span>
                  {job.screeningAnswers && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-indigo-700 font-medium">
                        {job.screeningAnswers.length} Screening Answers
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
