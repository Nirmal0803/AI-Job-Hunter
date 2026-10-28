import React, { useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
} from 'lucide-react';
import { CandidateProfile, WorkExperience, Education, Project } from '../types';
import { api } from '../services/api';

interface ResumeUploadViewProps {
  profile: CandidateProfile | null;
  onProfileUpdated: (profile: CandidateProfile) => void;
}

const SAMPLE_RESUME_TEXT = `Alex Mercer
alex.mercer.dev@example.com | +1 (555) 234-5678 | San Francisco, CA (Open to Remote)
LinkedIn: linkedin.com/in/alex-mercer-dev | GitHub: github.com/alexmercer-code | Portfolio: alexmercer.dev
Work Authorization: US Citizen / No sponsorship required

PROFESSIONAL SUMMARY
Senior Full Stack & AI Systems Engineer with 6+ years of experience designing scalable distributed web architectures, high-performance TypeScript/React frontend systems, and resilient LLM agent pipelines. Track record of improving system latency by 45%, leading cross-functional squads, and shipping production applications serving 250,000+ active users.

CORE TECHNICAL SKILLS
- Languages: TypeScript, JavaScript (ESNext), Python, SQL, Go (Intermediate), HTML5/CSS3
- Frontend: React 19, Next.js, Vite, Tailwind CSS, Redux Toolkit, WebSockets, Three.js, Accessibility (WCAG AA)
- Backend & Cloud: Node.js, Express, FastAPI, PostgreSQL, Cloud SQL, Redis, Docker, AWS (ECS, S3, Lambda), RESTful APIs, GraphQL
- AI & Tooling: Gemini API, OpenAI API, LangChain, Embeddings/Vector DBs, Playwright, Jest, Vitest, CI/CD GitHub Actions

PROFESSIONAL EXPERIENCE
Senior Full Stack Engineer | CloudScale Systems | San Francisco, CA
March 2022 - Present
- Architected and delivered real-time analytics dashboard with React 19, TypeScript, and Node.js microservices, cutting query latency by 42% for 120,000 enterprise users.
- Integrated automated agentic workflows using Gemini API and vector embeddings, automating 35% of manual telemetry report generation.
- Mentored 4 engineers, conducted weekly code architecture reviews, and reduced flaky E2E Playwright test runs by 60%.
- Spearheaded database migration to PostgreSQL with zero downtime, optimizing indexed queries and reducing connection pool exhaustion.

Full Stack Software Engineer | NexaTech Solutions | Austin, TX
July 2019 - February 2022
- Developed customer-facing self-service onboarding portal using React, Tailwind CSS, and Express, improving conversion rates by 28%.
- Built robust payment processing integration with Stripe and automated recurring billing webhooks.
- Standardized REST API error handling and input validation schemas, achieving 99.95% system uptime.
- Implemented comprehensive Playwright and Vitest testing suites, boosting unit test code coverage from 55% to 88%.

PROJECTS
Autonomous Code Review Agent (Open Source) | 2023
- Built an open-source agent in TypeScript and Node.js that performs AST analysis and automated diff reviews on GitHub Pull Requests.
- Achieved 1,200+ GitHub stars; featured on Hacker News front page.
- Technologies: TypeScript, Node.js, Octokit, Gemini API, Docker.

EDUCATION
Bachelor of Science in Computer Science | University of Texas at Austin
Graduated May 2019 | Dean's Honor List`;

export const ResumeUploadView: React.FC<ResumeUploadViewProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPastedTextModal, setShowPastedTextModal] = useState(false);
  const [pastedText, setPastedText] = useState('');

  // Editable local state for reviewing/modifying extracted profile
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<CandidateProfile | null>(profile);

  // Sync formData when profile changes
  React.useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.uploadResume(file);
      onProfileUpdated(res.profile);
      setFormData(res.profile);
      setSuccessMessage('Resume parsed successfully! Please review the extracted fields below and approve.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload and parse resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleParseText = async (text: string) => {
    if (!text.trim()) return;
    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.parseResumeText(text, 'alex-mercer-resume.txt');
      onProfileUpdated(res.profile);
      setFormData(res.profile);
      setShowPastedTextModal(false);
      setSuccessMessage('Resume parsed successfully! Review the extracted details below.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse resume text.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (markApproved: boolean) => {
    if (!formData) return;
    try {
      const res = await api.updateProfile(formData, markApproved);
      onProfileUpdated(res.profile);
      setFormData(res.profile);
      setEditMode(false);
      setSuccessMessage(
        markApproved
          ? 'Profile verified & approved! The agent will now match opportunities against your verified data.'
          : 'Profile modifications saved successfully.'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save profile changes.');
    }
  };

  // Skill management helpers
  const handleAddSkill = (skill: string) => {
    if (!formData || !skill.trim()) return;
    if (formData.technicalSkills.includes(skill.trim())) return;
    setFormData({
      ...formData,
      technicalSkills: [...formData.technicalSkills, skill.trim()],
    });
  };

  const handleRemoveSkill = (skill: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      technicalSkills: formData.technicalSkills.filter((s) => s !== skill),
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Description */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Resume Intelligence & Profile Grounding
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Upload your original master resume. The AI agent extracts your full experience, technical competencies, and achievements. You have 100% control to review, edit, and approve every field before it is used.
        </p>
      </div>

      {/* Upload Zone & Quick Sample Button */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Drag & Drop Box */}
          <label className="flex-1 w-full border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/80 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
            <Upload className={`w-8 h-8 text-slate-400 mb-2 ${isUploading ? 'animate-bounce' : ''}`} />
            <span className="text-sm font-semibold text-slate-800">
              {isUploading ? 'Extracting Resume Intelligence...' : 'Upload PDF or DOCX Resume'}
            </span>
            <span className="text-xs text-slate-500 mt-1">
              Supports .pdf, .docx, .doc, and text resumes (Max 20MB)
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          <div className="text-xs text-slate-400 font-medium md:py-8">OR</div>

          {/* Quick Actions (Paste text / Load Sample) */}
          <div className="w-full md:w-64 space-y-2 shrink-0">
            <button
              onClick={() => handleParseText(SAMPLE_RESUME_TEXT)}
              disabled={isUploading}
              className="w-full py-2.5 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Load Full Sample Resume</span>
            </button>

            <button
              onClick={() => setShowPastedTextModal(true)}
              disabled={isUploading}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors border border-slate-200"
            >
              Paste Resume as Text
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Paste Resume Modal */}
      {showPastedTextModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Paste Resume Text</h3>
            <p className="text-xs text-slate-500">
              Copy and paste your resume text here. The AI will extract all structured entities without altering your source facts.
            </p>
            <textarea
              rows={12}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste resume text including experience, skills, education..."
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-slate-900 resize-none"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPastedTextModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleParseText(pastedText)}
                disabled={!pastedText.trim() || isUploading}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                Parse Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Profile Review Section */}
      {formData && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Action Bar */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Extracted Professional Profile
                </h3>
                {formData.isApproved ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Approved
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Needs Approval
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 block">
                Last extracted: {formData.extractedAt ? new Date(formData.extractedAt).toLocaleString() : 'Recent'} · Original: {formData.originalResumeFileName || 'Uploaded Resume'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{editMode ? 'Exit Edit' : 'Edit Profile'}</span>
              </button>

              <button
                onClick={() => handleSaveProfile(true)}
                className="px-4 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save & Approve Profile</span>
              </button>
            </div>
          </div>

          {/* Missing / Ambiguous Notes Banner */}
          {formData.missingInformationNotes && formData.missingInformationNotes.length > 0 && (
            <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-200/80 text-xs text-amber-800 flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-semibold block">Missing or Ambiguous Information Detected:</span>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-amber-700">
                  {formData.missingInformationNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Profile Form Details */}
          <div className="p-6 space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-slate-900"
                  />
                ) : (
                  <div className="text-sm font-bold text-slate-900">{formData.fullName}</div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                {editMode ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-slate-900"
                  />
                ) : (
                  <div className="text-xs text-slate-800 font-medium">{formData.email || 'None provided'}</div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Phone</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-slate-900"
                  />
                ) : (
                  <div className="text-xs text-slate-800">{formData.phone || 'None provided'}</div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Location</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-slate-900"
                  />
                ) : (
                  <div className="text-xs text-slate-800">{formData.location || 'Remote'}</div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Estimated Seniority</label>
                {editMode ? (
                  <select
                    value={formData.seniorityLevel}
                    onChange={(e) => setFormData({ ...formData, seniorityLevel: e.target.value as any })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-slate-900"
                  >
                    <option value="Entry">Entry</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Staff/Principal">Staff / Principal</option>
                  </select>
                ) : (
                  <div className="text-xs font-semibold text-indigo-700">
                    {formData.seniorityLevel} (~{formData.yearsOfExperience} years)
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Work Authorization</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.workAuthorization || ''}
                    onChange={(e) => setFormData({ ...formData, workAuthorization: e.target.value })}
                    placeholder="e.g. US Citizen / Authorized without sponsorship"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-slate-900"
                  />
                ) : (
                  <div className="text-xs text-slate-800">{formData.workAuthorization || 'Authorized'}</div>
                )}
              </div>
            </div>

            {/* Headline & Summary */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Professional Headline</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-slate-900"
                  />
                ) : (
                  <div className="text-sm font-semibold text-slate-900">{formData.headline}</div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Executive Summary</label>
                {editMode ? (
                  <textarea
                    rows={3}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-slate-900 resize-none leading-relaxed"
                  />
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {formData.summary}
                  </p>
                )}
              </div>
            </div>

            {/* Technical Skills */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Extracted Technical Skills & Competencies ({formData.technicalSkills.length})
                </label>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {formData.technicalSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-medium flex items-center gap-1.5"
                  >
                    <span>{skill}</span>
                    {editMode && (
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Work Experience */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-600" />
                  <label className="text-xs font-bold text-slate-900">
                    Work Experience ({formData.experiences.length})
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                {formData.experiences.map((exp, idx) => (
                  <div key={exp.id || idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                      <div className="font-bold text-slate-900 text-sm">
                        {exp.title} <span className="font-normal text-slate-600">at</span> {exp.company}
                      </div>
                      <div className="font-mono text-slate-500 text-[11px]">
                        {exp.startDate || 'Past'} – {exp.current ? 'Present' : exp.endDate || 'Past'}
                      </div>
                    </div>
                    {exp.location && <div className="text-slate-500">{exp.location}</div>}
                    <ul className="list-disc list-inside space-y-1 text-slate-700 mt-2">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Education & Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-600" />
                  <label className="text-xs font-bold text-slate-900">Education</label>
                </div>
                {formData.education.map((edu, idx) => (
                  <div key={edu.id || idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-0.5">
                    <div className="font-semibold text-slate-900">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                    <div className="text-slate-600">{edu.institution}</div>
                    {edu.graduationYear && <div className="text-slate-400 font-mono text-[11px]">{edu.graduationYear}</div>}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-600" />
                  <label className="text-xs font-bold text-slate-900">Projects & Achievements</label>
                </div>
                {formData.projects.length === 0 ? (
                  <p className="text-xs text-slate-400">No standalone projects extracted.</p>
                ) : (
                  formData.projects.map((proj, idx) => (
                    <div key={proj.id || idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="font-semibold text-slate-900">{proj.name}</div>
                      <p className="text-slate-600 text-[11px]">{proj.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
