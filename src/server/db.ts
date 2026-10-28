import fs from 'fs';
import path from 'path';

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  bullets: string[];
  technologies?: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  graduationYear?: string;
  honors?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  bullets: string[];
  technologies: string[];
  link?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  workAuthorization?: string;
  yearsOfExperience: number;
  seniorityLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Staff/Principal';
  targetJobTitles: string[];
  targetLocations: string[];
  remotePreference: 'remote_only' | 'hybrid' | 'onsite' | 'any';
  minDesiredSalary?: number;
  currency?: string;
  technicalSkills: string[];
  softSkills: string[];
  toolsAndFrameworks: string[];
  spokenLanguages: string[];
  experiences: WorkExperience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  originalResumeFileName?: string;
  originalResumeText?: string;
  extractedAt?: string;
  lastUpdated: string;
  isApproved: boolean;
  missingInformationNotes?: string[];
}

export interface JobMatchDetails {
  overallScore: number; // 0-100
  skillsMatch: string[];
  missingMandatorySkills: string[];
  missingPreferredSkills: string[];
  relevantExperienceHighlights: string[];
  potentialConcerns: string[];
  scoreExplanation: string;
  recommendedRoleTitle?: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  workArrangement: 'Remote' | 'Hybrid' | 'Onsite';
  employmentType: 'Full-time' | 'Contract' | 'Part-time' | 'Internship';
  salaryRange?: string;
  minSalary?: number;
  maxSalary?: number;
  source: 'RemoteOK' | 'Arbeitnow' | 'HackerNews' | 'DirectURL' | 'Custom';
  sourceUrl: string;
  applyUrl: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  seniorityLevel?: string;
  discoveredAt: string;
  matchDetails?: JobMatchDetails;
  status: 'Discovered' | 'Shortlisted' | 'Resume Ready' | 'Awaiting Approval' | 'Applied' | 'Interview' | 'Rejected' | 'Offer' | 'Not Interested';
  tailoredResume?: {
    id: string;
    summary: string;
    skills: string[];
    experiences: WorkExperience[];
    projects: Project[];
    atsNotes: string;
    generatedAt: string;
    changeRationale: string[];
  };
  tailoredCoverLetter?: {
    id: string;
    content: string;
    generatedAt: string;
  };
  screeningAnswers?: {
    id: string;
    question: string;
    answer: string;
    category?: string;
  }[];
  applicationNotes?: string;
  appliedDate?: string;
  followUpDate?: string;
  interviewDate?: string;
  submissionConfirmationId?: string;
}

export interface SearchPreferences {
  targetTitles: string[];
  locations: string[];
  remotePreference: 'remote_only' | 'hybrid' | 'onsite' | 'any';
  experienceLevels: string[];
  minSalary?: number;
  excludedCompanies: string[];
  keywords: string[];
  autoScanEnabled: boolean;
  scanIntervalHours: number;
  lastScanTime?: string;
  autoPrepareResumeOnHighMatch: boolean;
  matchScoreThreshold: number; // e.g. 75
}

export interface AppDatabase {
  profile: CandidateProfile | null;
  jobs: JobListing[];
  preferences: SearchPreferences;
  activityLogs: {
    id: string;
    timestamp: string;
    action: string;
    details: string;
    level: 'info' | 'success' | 'warn' | 'error';
  }[];
}

const DB_PATH = path.resolve(process.cwd(), 'data', 'database.json');

// Default initial state
const defaultState: AppDatabase = {
  profile: null,
  jobs: [],
  preferences: {
    targetTitles: ['Full Stack Engineer', 'Frontend Engineer', 'Senior Software Engineer', 'AI Engineer'],
    locations: ['Remote', 'United States', 'Europe'],
    remotePreference: 'any',
    experienceLevels: ['Mid', 'Senior'],
    minSalary: 110000,
    excludedCompanies: [],
    keywords: ['React', 'TypeScript', 'Node.js', 'Python', 'Cloud'],
    autoScanEnabled: true,
    scanIntervalHours: 12,
    autoPrepareResumeOnHighMatch: false,
    matchScoreThreshold: 75,
  },
  activityLogs: [
    {
      id: 'log-init',
      timestamp: new Date().toISOString(),
      action: 'System Initialized',
      details: 'AutoApply AI Engine ready for personal job-hunting.',
      level: 'info',
    },
  ],
};

function ensureDataDirectory() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadDatabase(): AppDatabase {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(DB_PATH)) {
      saveDatabase(defaultState);
      return defaultState;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      preferences: { ...defaultState.preferences, ...(parsed.preferences || {}) },
      jobs: parsed.jobs || [],
      activityLogs: parsed.activityLogs || defaultState.activityLogs,
    };
  } catch (err) {
    console.error('Failed to load database, falling back to defaults:', err);
    return defaultState;
  }
}

export function saveDatabase(data: AppDatabase): void {
  try {
    ensureDataDirectory();
    const tempPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_PATH);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

export function logActivity(action: string, details: string, level: 'info' | 'success' | 'warn' | 'error' = 'info') {
  const db = loadDatabase();
  const entry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    level,
  };
  db.activityLogs.unshift(entry);
  if (db.activityLogs.length > 200) {
    db.activityLogs = db.activityLogs.slice(0, 200);
  }
  saveDatabase(db);
}
