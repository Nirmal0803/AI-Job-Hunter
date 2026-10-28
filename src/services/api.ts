import {
  AppDatabase,
  CandidateProfile,
  JobListing,
  JobMatchDetails,
  TailoredResume,
  TailoredCoverLetter,
  ScreeningAnswer,
  ApplicationPackage,
  SearchPreferences,
} from '../types';

export const api = {
  async getDb(): Promise<AppDatabase> {
    const res = await fetch('/api/db');
    if (!res.ok) throw new Error('Failed to fetch state');
    return res.json();
  },

  async uploadResume(file: File): Promise<{ profile: CandidateProfile }> {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await fetch('/api/resume/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload and parse resume');
    }
    return res.json();
  },

  async parseResumeText(text: string, filename?: string): Promise<{ profile: CandidateProfile }> {
    const res = await fetch('/api/resume/parse-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, filename }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to parse resume text');
    }
    return res.json();
  },

  async updateProfile(profile: CandidateProfile, markApproved: boolean = false): Promise<{ profile: CandidateProfile }> {
    const res = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, markApproved }),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  async discoverJobs(): Promise<{ stats: any; newCount: number; jobs: JobListing[] }> {
    const res = await fetch('/api/jobs/discover', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Job discovery failed');
    }
    return res.json();
  },

  async importJob(input: string, isUrl: boolean): Promise<{ job: JobListing }> {
    const res = await fetch('/api/jobs/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, isUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to import job');
    }
    return res.json();
  },

  async matchJob(jobId: string): Promise<{ matchDetails: JobMatchDetails }> {
    const res = await fetch(`/api/jobs/${jobId}/match`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to evaluate match');
    }
    return res.json();
  },

  async updateJobStatus(
    jobId: string,
    payload: { status: JobListing['status']; notes?: string; interviewDate?: string; followUpDate?: string }
  ): Promise<{ job: JobListing }> {
    const res = await fetch(`/api/jobs/${jobId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update job status');
    return res.json();
  },

  async tailorResume(jobId: string): Promise<{ tailoredResume: TailoredResume; job: JobListing }> {
    const res = await fetch(`/api/jobs/${jobId}/tailor-resume`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to tailor resume');
    }
    return res.json();
  },

  async generateCoverLetter(
    jobId: string,
    tone: 'professional' | 'passionate' | 'concise' = 'professional'
  ): Promise<{ coverLetter: TailoredCoverLetter; job: JobListing }> {
    const res = await fetch(`/api/jobs/${jobId}/cover-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tone }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate cover letter');
    }
    return res.json();
  },

  async answerScreeningQuestions(
    jobId: string,
    questions?: string[]
  ): Promise<{ answers: ScreeningAnswer[]; job: JobListing }> {
    const res = await fetch(`/api/jobs/${jobId}/screening-answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate answers');
    }
    return res.json();
  },

  async getApplicationPackage(jobId: string): Promise<ApplicationPackage> {
    const res = await fetch(`/api/jobs/${jobId}/application-package`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to load application automation package');
    }
    return res.json();
  },

  async submitApplication(
    jobId: string,
    confirmationNotes?: string
  ): Promise<{ job: JobListing }> {
    const res = await fetch(`/api/jobs/${jobId}/submit-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: true, confirmationNotes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Application submission failed');
    }
    return res.json();
  },

  async updatePreferences(preferences: Partial<SearchPreferences>): Promise<{ preferences: SearchPreferences }> {
    const res = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    return res.json();
  },

  async resetData(): Promise<void> {
    const res = await fetch('/api/data/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset data');
  },

  getResumeDownloadUrl(jobId: string): string {
    return `/api/jobs/${jobId}/download-resume`;
  },

  getCoverLetterDownloadUrl(jobId: string): string {
    return `/api/jobs/${jobId}/download-cover-letter`;
  },
};
