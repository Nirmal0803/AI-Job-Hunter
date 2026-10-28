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
  overallScore: number;
  skillsMatch: string[];
  missingMandatorySkills: string[];
  missingPreferredSkills: string[];
  relevantExperienceHighlights: string[];
  potentialConcerns: string[];
  scoreExplanation: string;
  recommendedRoleTitle?: string;
}

export interface TailoredResume {
  id: string;
  summary: string;
  skills: string[];
  experiences: WorkExperience[];
  projects: Project[];
  atsNotes: string;
  generatedAt: string;
  changeRationale: string[];
}

export interface TailoredCoverLetter {
  id: string;
  content: string;
  generatedAt: string;
}

export interface ScreeningAnswer {
  id: string;
  question: string;
  answer: string;
  category?: string;
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
  status:
    | 'Discovered'
    | 'Shortlisted'
    | 'Resume Ready'
    | 'Awaiting Approval'
    | 'Applied'
    | 'Interview'
    | 'Rejected'
    | 'Offer'
    | 'Not Interested';
  tailoredResume?: TailoredResume;
  tailoredCoverLetter?: TailoredCoverLetter;
  screeningAnswers?: ScreeningAnswer[];
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
  matchScoreThreshold: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  level: 'info' | 'success' | 'warn' | 'error';
}

export interface AppDatabase {
  profile: CandidateProfile | null;
  jobs: JobListing[];
  preferences: SearchPreferences;
  activityLogs: ActivityLog[];
}

export interface FormFieldMapping {
  fieldKey: string;
  label: string;
  value: string;
  confidence: number;
  isCustomQuestion?: boolean;
  needsReview?: boolean;
  notes?: string;
}

export interface ApplicationPackage {
  jobId: string;
  company: string;
  roleTitle: string;
  applyUrl: string;
  candidateName: string;
  email: string;
  phone: string;
  location: string;
  mappedFields: FormFieldMapping[];
  screeningAnswers: { question: string; answer: string }[];
  selectedResumeType: 'Tailored ATS' | 'Original Master';
  hasTailoredCoverLetter: boolean;
  missingMandatoryFields: string[];
  playwrightScript: string;
  bookmarkletCode: string;
  readyForApproval: boolean;
}
