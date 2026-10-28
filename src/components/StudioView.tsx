import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
  HelpCircle,
  Edit3,
  Printer,
} from 'lucide-react';
import { JobListing, CandidateProfile } from '../types';
import { api } from '../services/api';

interface StudioViewProps {
  jobs: JobListing[];
  profile: CandidateProfile | null;
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
  onRefreshJobs: () => void;
  onNavigateToApply: (job: JobListing) => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  jobs,
  profile,
  selectedJobId,
  onSelectJob,
  onRefreshJobs,
  onNavigateToApply,
}) => {
  const [activeTab, setActiveTab] = useState<'resume' | 'cover_letter' | 'screening'>('resume');
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [isAnsweringScreening, setIsAnsweringScreening] = useState(false);
  const [coverLetterTone, setCoverLetterTone] = useState<'professional' | 'passionate' | 'concise'>('professional');
  const [copiedText, setCopiedText] = useState(false);

  // Custom screening question input
  const [customQuestionInput, setCustomQuestionInput] = useState('');

  // Selected job
  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;

  const handleGenerateTailoredResume = async () => {
    if (!selectedJob) return;
    setIsGeneratingResume(true);
    try {
      await api.tailorResume(selectedJob.id);
      onRefreshJobs();
    } catch (err: any) {
      alert(`Resume tailoring failed: ${err.message}`);
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedJob) return;
    setIsGeneratingCoverLetter(true);
    try {
      await api.generateCoverLetter(selectedJob.id, coverLetterTone);
      onRefreshJobs();
    } catch (err: any) {
      alert(`Cover letter generation failed: ${err.message}`);
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleGenerateScreeningAnswers = async () => {
    if (!selectedJob) return;
    setIsAnsweringScreening(true);
    try {
      const customQuestions = customQuestionInput.trim() ? [customQuestionInput.trim()] : undefined;
      await api.answerScreeningQuestions(selectedJob.id, customQuestions);
      setCustomQuestionInput('');
      onRefreshJobs();
    } catch (err: any) {
      alert(`Screening question answering failed: ${err.message}`);
    } finally {
      setIsAnsweringScreening(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (!profile) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto space-y-3">
        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Master Resume Required</h2>
        <p className="text-xs text-slate-500">
          Upload and verify your resume first. The AI customizer will then adapt your verified accomplishments for specific jobs.
        </p>
      </div>
    );
  }

  if (!selectedJob) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto space-y-3">
        <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">No Job Selected</h2>
        <p className="text-xs text-slate-500">
          Select or shortlist a job opening from the Discover tab to begin tailoring your resume.
        </p>
      </div>
    );
  }

  const tailored = selectedJob.tailoredResume;
  const coverLetter = selectedJob.tailoredCoverLetter;
  const screening = selectedJob.screeningAnswers || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Job Selector Strip */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Target Role:</span>
            <select
              value={selectedJob.id}
              onChange={(e) => onSelectJob(e.target.value)}
              className="font-bold text-slate-900 text-sm bg-slate-50 border border-slate-200 rounded px-2.5 py-1 focus:outline-slate-900 max-w-md truncate"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} · {j.company} ({j.matchDetails?.overallScore ? `${j.matchDetails.overallScore}%` : 'Discovered'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{selectedJob.company}</span>
            <span aria-hidden="true">·</span>
            <span>{selectedJob.location}</span>
            <span aria-hidden="true">·</span>
            <span>{selectedJob.workArrangement}</span>
            {selectedJob.salaryRange && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-700 font-semibold">{selectedJob.salaryRange}</span>
              </>
            )}
          </div>
        </div>

        {/* Navigation to Apply workflow */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateToApply(selectedJob)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <span>Proceed to Application</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('resume')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'resume'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Tailored ATS Resume</span>
          {tailored && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        </button>

        <button
          onClick={() => setActiveTab('cover_letter')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'cover_letter'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Custom Cover Letter</span>
          {coverLetter && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        </button>

        <button
          onClick={() => setActiveTab('screening')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'screening'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Screening Questions ({screening.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TAB 1: TAILORED ATS RESUME */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'resume' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">
                Factual Integrity Guaranteed: No invented jobs or qualifications.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleGenerateTailoredResume}
                disabled={isGeneratingResume}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingResume ? 'animate-spin' : ''}`} />
                <span>{isGeneratingResume ? 'Tailoring with Gemini...' : tailored ? 'Re-Tailor Resume' : 'Generate Tailored Resume'}</span>
              </button>

              {tailored && (
                <>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200 shadow-xs"
                    title="Print or Save as PDF via browser print dialog"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Print / PDF</span>
                  </button>

                  <a
                    href={api.getResumeDownloadUrl(selectedJob.id)}
                    download
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .DOCX</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {!tailored ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Generate Your Job-Specific Resume</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Gemini will reorganize your verified work experience, emphasize achievements matching {selectedJob.company}'s requirements, and optimize ATS keyword placement.
              </p>
              <button
                onClick={handleGenerateTailoredResume}
                disabled={isGeneratingResume}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
              >
                {isGeneratingResume ? 'Generating...' : 'Customize Resume for this Job'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ATS Notes & Rationale */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 space-y-2">
                <span className="text-xs font-bold text-emerald-900 block">
                  ATS Customization Summary & Changes Made:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-emerald-800">
                  {tailored.changeRationale.map((rationale, idx) => (
                    <li key={idx}>{rationale}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-emerald-700 pt-1 italic">
                  Note: {tailored.atsNotes}
                </p>
              </div>

              {/* Side-by-Side Comparison: Master vs Tailored */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Original Master Profile Resume */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Original Master Resume
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Baseline</span>
                  </div>

                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{profile.fullName}</h4>
                      <p className="text-slate-500 text-[11px]">{profile.headline}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Professional Summary</span>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                        {profile.summary}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Top Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {profile.technicalSkills.slice(0, 12).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-2">Work Experience</span>
                      <div className="space-y-3">
                        {profile.experiences.map((exp, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded border border-slate-100 space-y-1">
                            <div className="font-semibold text-slate-800">
                              {exp.title} · {exp.company}
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                              {exp.bullets.map((b, bi) => (
                                <li key={bi}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Tailored ATS Resume */}
                <div className="bg-white rounded-xl border-2 border-indigo-200/80 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                        Tailored for {selectedJob.company}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      ATS Optimized
                    </span>
                  </div>

                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{profile.fullName}</h4>
                      <p className="text-indigo-700 font-semibold text-[11px]">
                        Targeted for: {selectedJob.title}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 block mb-1">Tailored Executive Summary</span>
                      <p className="text-slate-800 leading-relaxed bg-indigo-50/40 p-2.5 rounded border border-indigo-100">
                        {tailored.summary}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 block mb-1">Prioritized Skills for this Role</span>
                      <div className="flex flex-wrap gap-1">
                        {tailored.skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 font-medium text-[11px] border border-indigo-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 block mb-2">Emphasized Experience</span>
                      <div className="space-y-3">
                        {tailored.experiences.map((exp, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                            <div className="font-bold text-slate-900">
                              {exp.title} · {exp.company}
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                              {exp.bullets.map((b, bi) => (
                                <li key={bi} className="leading-relaxed">{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 2: CUSTOM COVER LETTER */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'cover_letter' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Tone:</span>
              <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
                {(['professional', 'passionate', 'concise'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCoverLetterTone(t)}
                    className={`px-3 py-1 font-medium rounded capitalize transition-colors ${
                      coverLetterTone === t
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingCoverLetter}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-200 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingCoverLetter ? 'animate-spin' : ''}`} />
                <span>{isGeneratingCoverLetter ? 'Drafting...' : coverLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}</span>
              </button>

              {coverLetter && (
                <a
                  href={api.getCoverLetterDownloadUrl(selectedJob.id)}
                  download
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .DOCX</span>
                </a>
              )}
            </div>
          </div>

          {!coverLetter ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Cover Letter Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate a targeted, high-conversion cover letter tailored specifically to {selectedJob.company}'s mission and {selectedJob.title} requirements.
              </p>
              <button
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingCoverLetter}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Draft Cover Letter
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-mono text-slate-400">
                  Drafted {new Date(coverLetter.generatedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleCopyText(coverLetter.content)}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>

              <div className="text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans space-y-3">
                {coverLetter.content}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 3: SCREENING QUESTIONS */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'screening' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Screening Question Assistant</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Prepare grounded answers for common ATS application forms. Grounded strictly in your verified profile.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={customQuestionInput}
                onChange={(e) => setCustomQuestionInput(e.target.value)}
                placeholder="Ask custom question: e.g. 'What is your experience with Kubernetes?'"
                className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-slate-900"
              />
              <button
                onClick={handleGenerateScreeningAnswers}
                disabled={isAnsweringScreening}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnsweringScreening ? 'animate-spin' : ''}`} />
                <span>{isAnsweringScreening ? 'Generating Answers...' : 'Generate Answers'}</span>
              </button>
            </div>
          </div>

          {screening.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Screening Answers Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click "Generate Answers" to prepare verified answers for standard recruiter questions (motivation, technical challenges, compensation, availability).
              </p>
              <button
                onClick={handleGenerateScreeningAnswers}
                disabled={isAnsweringScreening}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Generate Standard Answers
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {screening.map((qa, idx) => (
                <div key={qa.id || idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{qa.question}</span>
                    <button
                      onClick={() => handleCopyText(qa.answer)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {qa.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
