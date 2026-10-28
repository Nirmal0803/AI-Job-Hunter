import React, { useState } from 'react';
import {
  Compass,
  Search,
  Filter,
  Plus,
  Sparkles,
  ExternalLink,
  Bookmark,
  Check,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown,
  X,
  FileCheck,
} from 'lucide-react';
import { JobListing, CandidateProfile, SearchPreferences, JobMatchDetails } from '../types';
import { api } from '../services/api';

interface DiscoverJobsViewProps {
  jobs: JobListing[];
  profile: CandidateProfile | null;
  preferences: SearchPreferences;
  onRefreshJobs: () => void;
  onSelectJobForStudio: (job: JobListing) => void;
  onSelectJobForApply: (job: JobListing) => void;
  isDiscovering: boolean;
  onDiscover: () => void;
}

export const DiscoverJobsView: React.FC<DiscoverJobsViewProps> = ({
  jobs,
  profile,
  preferences,
  onRefreshJobs,
  onSelectJobForStudio,
  onSelectJobForApply,
  isDiscovering,
  onDiscover,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRemote, setFilterRemote] = useState<string>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'match' | 'recent' | 'company'>('match');

  // URL / Text Job Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [isUrlImport, setIsUrlImport] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  // Selected job for match details inspector modal
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobListing | null>(null);
  const [isEvaluatingMatch, setIsEvaluatingMatch] = useState<string | null>(null);

  // Filter logic
  const filteredJobs = jobs.filter((job) => {
    // Search query
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.requiredSkills.some((s) => s.toLowerCase().includes(q));

    // Remote arrangement
    const matchesRemote =
      filterRemote === 'all' ||
      (filterRemote === 'remote' && job.workArrangement === 'Remote') ||
      (filterRemote === 'hybrid' && job.workArrangement === 'Hybrid') ||
      (filterRemote === 'onsite' && job.workArrangement === 'Onsite');

    // Score filter
    const score = job.matchDetails?.overallScore || 0;
    const matchesScore = minScoreFilter === 0 || score >= minScoreFilter;

    return matchesSearch && matchesRemote && matchesScore;
  });

  // Sort logic
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'match') {
      const scoreA = a.matchDetails?.overallScore ?? -1;
      const scoreB = b.matchDetails?.overallScore ?? -1;
      return scoreB - scoreA;
    }
    if (sortBy === 'recent') {
      return new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime();
    }
    if (sortBy === 'company') {
      return a.company.localeCompare(b.company);
    }
    return 0;
  });

  const handleImportJob = async () => {
    if (!importInput.trim()) return;
    setIsImporting(true);
    try {
      await api.importJob(importInput.trim(), isUrlImport);
      setShowImportModal(false);
      setImportInput('');
      onRefreshJobs();
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleToggleShortlist = async (job: JobListing) => {
    const nextStatus = job.status === 'Shortlisted' ? 'Discovered' : 'Shortlisted';
    try {
      await api.updateJobStatus(job.id, { status: nextStatus });
      onRefreshJobs();
    } catch (err: any) {
      console.error('Failed to toggle shortlist:', err);
    }
  };

  const handleEvaluateMatch = async (job: JobListing) => {
    if (!profile) {
      alert('Please upload and verify your resume profile first.');
      return;
    }
    setIsEvaluatingMatch(job.id);
    try {
      const res = await api.matchJob(job.id);
      job.matchDetails = res.matchDetails;
      onRefreshJobs();
      setSelectedJobForModal({ ...job, matchDetails: res.matchDetails });
    } catch (err: any) {
      alert(`Match analysis failed: ${err.message}`);
    } finally {
      setIsEvaluatingMatch(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Controls Strip */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Job Discovery & AI Suitability Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-board discovery across RemoteOK, Arbeitnow, and custom URL imports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Import Job URL</span>
          </button>

          <button
            onClick={onDiscover}
            disabled={isDiscovering}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Compass className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
            <span>{isDiscovering ? 'Scanning Job Boards...' : 'Scan Job Boards Now'}</span>
          </button>
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
            placeholder="Search titles, companies, or skills..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-slate-900"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto text-xs">
          {/* Remote selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg shrink-0">
            {['all', 'remote', 'hybrid', 'onsite'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterRemote(type)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  filterRemote === type
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Minimum Match Score selector */}
          <select
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(Number(e.target.value))}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-slate-900"
          >
            <option value={0}>All Scores</option>
            <option value={70}>Match ≥ 70%</option>
            <option value={80}>Match ≥ 80%</option>
            <option value={90}>Match ≥ 90%</option>
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-slate-900"
          >
            <option value="match">Sort by Match Score</option>
            <option value="recent">Sort by Most Recent</option>
            <option value="company">Sort by Company</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid / List */}
      {sortedJobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Compass className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No matching jobs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {jobs.length === 0
              ? 'Click "Scan Job Boards Now" to discover opportunities or import a custom job URL.'
              : 'Try clearing your search query or loosening your filters.'}
          </p>
          {jobs.length === 0 && (
            <button
              onClick={onDiscover}
              disabled={isDiscovering}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
            >
              Scan Job Boards
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedJobs.map((job) => {
            const match = job.matchDetails;
            const score = match?.overallScore;
            const isShortlisted = job.status === 'Shortlisted';

            return (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                      {score !== undefined ? (
                        <button
                          onClick={() => setSelectedJobForModal(job)}
                          className={`font-mono text-xs font-bold tabular-nums px-2 py-0.5 rounded cursor-pointer transition-colors ${
                            score >= 80
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : score >= 60
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {score}% Match · View Diagnosis
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEvaluateMatch(job)}
                          disabled={isEvaluatingMatch === job.id}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{isEvaluatingMatch === job.id ? 'Evaluating...' : 'Calculate Fit'}</span>
                        </button>
                      )}
                    </div>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{job.company}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.location}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{job.workArrangement}</span>
                      {job.salaryRange && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-700 font-semibold">
                            {job.salaryRange}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400 text-[11px]">
                        Discovered {new Date(job.discoveredAt).toLocaleDateString()} via {job.source}
                      </span>
                    </div>
                  </div>

                  {/* Actions strip */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleShortlist(job)}
                      className={`p-2 rounded-lg border transition-colors ${
                        isShortlisted
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                      title={isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
                    >
                      <Bookmark className={`w-4 h-4 ${isShortlisted ? 'fill-amber-600 text-amber-600' : ''}`} />
                    </button>

                    <button
                      onClick={() => onSelectJobForStudio(job)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{job.tailoredResume ? 'View Tailored Resume' : 'Tailor Resume'}</span>
                    </button>

                    <button
                      onClick={() => onSelectJobForApply(job)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Prepare Application</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Score explanation snippet if present */}
                {match?.scoreExplanation && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{match.scoreExplanation}"
                  </p>
                )}

                {/* Required Skills tags */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                    <span className="text-slate-400 text-[11px] mr-1">Skills:</span>
                    {job.requiredSkills.slice(0, 8).map((skill) => {
                      const isMatch = match?.skillsMatch?.some(
                        (m) => m.toLowerCase() === skill.toLowerCase()
                      );
                      const isMissing = match?.missingMandatorySkills?.some(
                        (m) => m.toLowerCase() === skill.toLowerCase()
                      );
                      return (
                        <span
                          key={skill}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            isMatch
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isMissing
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Match Diagnosis Deep Modal */}
      {selectedJobForModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-600 block">AI Job-Suitability Diagnostic</span>
                <h3 className="font-bold text-slate-900 text-lg">
                  {selectedJobForModal.title} · {selectedJobForModal.company}
                </h3>
              </div>
              <button
                onClick={() => setSelectedJobForModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedJobForModal.matchDetails ? (
              <div className="space-y-4">
                {/* Score Banner */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Overall Fit Score</span>
                    <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                      {selectedJobForModal.matchDetails.overallScore}%
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 max-w-xs text-right">
                    Calculated objectively against your verified resume qualifications.
                  </div>
                </div>

                {/* Synthesis */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">
                    Recruiter Analysis
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedJobForModal.matchDetails.scoreExplanation}
                  </p>
                </div>

                {/* Skills Overlap vs Missing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Matching Verified Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedJobForModal.matchDetails.skillsMatch.length ? (
                        selectedJobForModal.matchDetails.skillsMatch.map((s) => (
                          <span
                            key={s}
                            className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">None explicitly detected</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Missing Mandatory Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedJobForModal.matchDetails.missingMandatorySkills.length ? (
                        selectedJobForModal.matchDetails.missingMandatorySkills.map((s) => (
                          <span
                            key={s}
                            className="text-[11px] px-2 py-0.5 rounded bg-rose-50 text-rose-800 font-medium border border-rose-200"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No core skill gaps identified!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Relevant highlights */}
                {selectedJobForModal.matchDetails.relevantExperienceHighlights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">Relevant Experience Highlights</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                      {selectedJobForModal.matchDetails.relevantExperienceHighlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-slate-500">Match score has not yet been computed for this role.</p>
                <button
                  onClick={() => handleEvaluateMatch(selectedJobForModal)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                >
                  Run Deep Match Evaluation
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedJobForModal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const job = selectedJobForModal;
                  setSelectedJobForModal(null);
                  onSelectJobForStudio(job);
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Customize Resume for this Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Single Job Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Import Single Job Opening</h3>
            <p className="text-xs text-slate-500">
              Provide a job listing URL (Greenhouse, Lever, LinkedIn, career page) or paste the job description text.
            </p>

            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setIsUrlImport(true)}
                className={`flex-1 py-1 font-medium rounded ${
                  isUrlImport ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Job Posting URL
              </button>
              <button
                onClick={() => setIsUrlImport(false)}
                className={`flex-1 py-1 font-medium rounded ${
                  !isUrlImport ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Paste Job Description
              </button>
            </div>

            {isUrlImport ? (
              <input
                type="url"
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="https://jobs.lever.co/company/role-id..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-slate-900"
              />
            ) : (
              <textarea
                rows={8}
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="Paste role title, company, requirements, and job description..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-slate-900 resize-none font-mono"
              />
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleImportJob}
                disabled={!importInput.trim() || isImporting}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                {isImporting ? 'Importing & Scoring...' : 'Import & Evaluate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
