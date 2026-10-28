import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  loadDatabase,
  saveDatabase,
  logActivity,
  CandidateProfile,
  JobListing,
} from './src/server/db.js';
import {
  extractResumeProfile,
  matchCandidateToJob,
  calculateDeterministicMatch,
  generateTailoredResume,
  generateTailoredCoverLetter,
  answerScreeningQuestions,
} from './src/server/gemini.js';
import { extractTextFromFile } from './src/server/parser.js';
import {
  generateResumeDocx,
  generateCoverLetterDocx,
} from './src/server/docxGenerator.js';
import {
  runJobDiscovery,
  parseJobFromTextOrUrl,
} from './src/server/jobConnectors.js';
import { buildApplicationPackage } from './src/server/automation.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Memory storage for uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. Health & Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiKeyPresent: !!process.env.GEMINI_API_KEY,
  });
});

// 2. Full State
app.get('/api/db', (req: Request, res: Response) => {
  const db = loadDatabase();
  res.json(db);
});

// 3. Resume Upload (PDF / DOCX / TXT)
app.post('/api/resume/upload', upload.single('resume'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No resume file uploaded.' });
      return;
    }

    const { buffer, mimetype, originalname } = req.file;
    logActivity('Resume Uploaded', `File: ${originalname} (${(buffer.length / 1024).toFixed(1)} KB)`);

    // Extract text
    const extracted = await extractTextFromFile(buffer, mimetype, originalname);
    if (!extracted.text && !extracted.pdfBase64) {
      res.status(400).json({ error: 'Could not extract text from the uploaded document.' });
      return;
    }

    // Call Gemini to parse into structured candidate profile
    logActivity('Resume Extraction', 'Analyzing structure, experience, and technical competencies...');
    const parsedProfile = await extractResumeProfile(extracted.text, extracted.pdfBase64);

    const fullProfile: CandidateProfile = {
      id: `cand-${Date.now()}`,
      fullName: parsedProfile.fullName || 'Candidate',
      email: parsedProfile.email || '',
      phone: parsedProfile.phone || '',
      location: parsedProfile.location || '',
      headline: parsedProfile.headline || 'Software Professional',
      summary: parsedProfile.summary || '',
      linkedinUrl: parsedProfile.linkedinUrl || '',
      githubUrl: parsedProfile.githubUrl || '',
      portfolioUrl: parsedProfile.portfolioUrl || '',
      workAuthorization: parsedProfile.workAuthorization || 'Authorized to work',
      yearsOfExperience: parsedProfile.yearsOfExperience || 3,
      seniorityLevel: (parsedProfile.seniorityLevel as any) || 'Mid',
      targetJobTitles: parsedProfile.targetJobTitles || ['Software Engineer'],
      targetLocations: parsedProfile.targetLocations || ['Remote'],
      remotePreference: 'any',
      technicalSkills: parsedProfile.technicalSkills || [],
      softSkills: parsedProfile.softSkills || [],
      toolsAndFrameworks: parsedProfile.toolsAndFrameworks || [],
      spokenLanguages: parsedProfile.spokenLanguages || ['English'],
      experiences: parsedProfile.experiences || [],
      education: parsedProfile.education || [],
      projects: parsedProfile.projects || [],
      certifications: parsedProfile.certifications || [],
      originalResumeFileName: originalname,
      originalResumeText: extracted.text,
      extractedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isApproved: false, // User must review & approve!
      missingInformationNotes: parsedProfile.missingInformationNotes || [],
    };

    const db = loadDatabase();
    db.profile = fullProfile;
    // Update preferences target titles if inferred
    if (fullProfile.targetJobTitles.length) {
      db.preferences.targetTitles = Array.from(
        new Set([...fullProfile.targetJobTitles, ...db.preferences.targetTitles])
      ).slice(0, 8);
    }

    // Instantly calculate match scores for all existing jobs against the new profile
    if (db.jobs.length > 0) {
      for (const job of db.jobs) {
        job.matchDetails = calculateDeterministicMatch(fullProfile, job);
        if (job.status === 'Discovered' && job.matchDetails.overallScore >= db.preferences.matchScoreThreshold) {
          job.status = 'Shortlisted';
        }
      }
    }
    saveDatabase(db);

    logActivity(
      'Profile Extracted',
      `Identified ${fullProfile.experiences.length} roles, ${fullProfile.technicalSkills.length} skills for ${fullProfile.fullName}`,
      'success'
    );

    res.json({ success: true, profile: fullProfile });
  } catch (err: any) {
    console.error('Error during resume processing:', err);
    logActivity('Resume Processing Failed', err.message || 'Unknown error', 'error');
    res.status(500).json({ error: err.message || 'Failed to process resume' });
  }
});

// 4. Parse from plain text
app.post('/api/resume/parse-text', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, filename } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Resume text is required.' });
      return;
    }

    logActivity('Text Resume Parsing', 'Processing text representation of resume...');
    const parsedProfile = await extractResumeProfile(text);

    const fullProfile: CandidateProfile = {
      id: `cand-${Date.now()}`,
      fullName: parsedProfile.fullName || 'Candidate',
      email: parsedProfile.email || '',
      phone: parsedProfile.phone || '',
      location: parsedProfile.location || '',
      headline: parsedProfile.headline || 'Software Professional',
      summary: parsedProfile.summary || '',
      linkedinUrl: parsedProfile.linkedinUrl || '',
      githubUrl: parsedProfile.githubUrl || '',
      portfolioUrl: parsedProfile.portfolioUrl || '',
      workAuthorization: parsedProfile.workAuthorization || 'Authorized to work',
      yearsOfExperience: parsedProfile.yearsOfExperience || 3,
      seniorityLevel: (parsedProfile.seniorityLevel as any) || 'Mid',
      targetJobTitles: parsedProfile.targetJobTitles || ['Software Engineer'],
      targetLocations: parsedProfile.targetLocations || ['Remote'],
      remotePreference: 'any',
      technicalSkills: parsedProfile.technicalSkills || [],
      softSkills: parsedProfile.softSkills || [],
      toolsAndFrameworks: parsedProfile.toolsAndFrameworks || [],
      spokenLanguages: parsedProfile.spokenLanguages || ['English'],
      experiences: parsedProfile.experiences || [],
      education: parsedProfile.education || [],
      projects: parsedProfile.projects || [],
      certifications: parsedProfile.certifications || [],
      originalResumeFileName: filename || 'pasted-resume.txt',
      originalResumeText: text,
      extractedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isApproved: false,
      missingInformationNotes: parsedProfile.missingInformationNotes || [],
    };

    const db = loadDatabase();
    db.profile = fullProfile;

    // Instantly calculate match scores for all existing jobs against the new profile
    if (db.jobs.length > 0) {
      for (const job of db.jobs) {
        job.matchDetails = calculateDeterministicMatch(fullProfile, job);
        if (job.status === 'Discovered' && job.matchDetails.overallScore >= db.preferences.matchScoreThreshold) {
          job.status = 'Shortlisted';
        }
      }
    }
    saveDatabase(db);

    logActivity('Profile Inferred', `Inferred professional profile for ${fullProfile.fullName}`, 'success');
    res.json({ success: true, profile: fullProfile });
  } catch (err: any) {
    console.error('Error parsing resume text:', err);
    res.status(500).json({ error: err.message || 'Failed to parse text resume' });
  }
});

// 5. Update / Approve Candidate Profile
app.post('/api/profile/update', (req: Request, res: Response): void => {
  try {
    const { profile, markApproved } = req.body;
    if (!profile) {
      res.status(400).json({ error: 'Profile data is required.' });
      return;
    }

    const db = loadDatabase();
    db.profile = {
      ...db.profile,
      ...profile,
      isApproved: markApproved ? true : db.profile?.isApproved || false,
      lastUpdated: new Date().toISOString(),
    };

    // Re-score existing jobs when profile is updated or approved
    if (db.profile && db.jobs.length > 0) {
      for (const job of db.jobs) {
        job.matchDetails = calculateDeterministicMatch(db.profile, job);
        if (job.status === 'Discovered' && job.matchDetails.overallScore >= db.preferences.matchScoreThreshold) {
          job.status = 'Shortlisted';
        }
      }
    }
    saveDatabase(db);

    logActivity(
      'Profile Updated',
      markApproved ? 'Profile verified & approved by user' : 'Profile corrections saved',
      'success'
    );
    res.json({ success: true, profile: db.profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Discover Jobs
app.post('/api/jobs/discover', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = loadDatabase();
    logActivity('Job Discovery Started', 'Querying remote APIs and verified sources...');

    const { stats, newJobs } = await runJobDiscovery(db.jobs, db.preferences);

    // If candidate profile exists, score all newly discovered jobs with zero API quota usage
    if (db.profile && newJobs.length > 0) {
      logActivity('Scoring Opportunities', `Evaluating match suitability for ${newJobs.length} opportunities...`);
      for (const job of newJobs) {
        job.matchDetails = calculateDeterministicMatch(db.profile, job);
        if (job.matchDetails.overallScore >= db.preferences.matchScoreThreshold) {
          job.status = 'Shortlisted';
        }
      }
    }

    db.jobs = [...newJobs, ...db.jobs];
    db.preferences.lastScanTime = new Date().toISOString();
    saveDatabase(db);

    logActivity(
      'Discovery Complete',
      `Discovered ${newJobs.length} new opportunities (${stats.duplicatesSkipped} duplicates skipped).`,
      'success'
    );

    res.json({ success: true, stats, newCount: newJobs.length, jobs: db.jobs });
  } catch (err: any) {
    console.error('Job discovery failed:', err);
    logActivity('Discovery Error', err.message, 'error');
    res.status(500).json({ error: err.message || 'Job discovery failed' });
  }
});

// 7. Import Single Job from URL or Text
app.post('/api/jobs/import', async (req: Request, res: Response): Promise<void> => {
  try {
    const { input, isUrl } = req.body;
    if (!input) {
      res.status(400).json({ error: 'Input URL or job description is required.' });
      return;
    }

    logActivity('Importing Job', isUrl ? `Scraping: ${input}` : 'Parsing manual job description...');
    const parsed = await parseJobFromTextOrUrl(input, Boolean(isUrl));

    const db = loadDatabase();
    const newJob: JobListing = {
      id: `job-${Date.now()}`,
      title: parsed.title || 'Software Engineer',
      company: parsed.company || 'Direct Import',
      location: parsed.location || 'Remote',
      workArrangement: (parsed.workArrangement as any) || 'Remote',
      employmentType: (parsed.employmentType as any) || 'Full-time',
      salaryRange: parsed.salaryRange,
      source: parsed.source as any,
      sourceUrl: parsed.sourceUrl || '',
      applyUrl: parsed.applyUrl || '',
      description: parsed.description || '',
      requiredSkills: parsed.requiredSkills || [],
      preferredSkills: parsed.preferredSkills || [],
      seniorityLevel: parsed.seniorityLevel,
      discoveredAt: new Date().toISOString(),
      status: 'Shortlisted', // Imported by user, naturally shortlisted
    };

    if (db.profile) {
      const match = await matchCandidateToJob(db.profile, newJob);
      newJob.matchDetails = match;
    }

    db.jobs.unshift(newJob);
    saveDatabase(db);

    logActivity('Job Imported', `Added ${newJob.title} at ${newJob.company}`, 'success');
    res.json({ success: true, job: newJob });
  } catch (err: any) {
    console.error('Job import error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Re-evaluate Match for a Specific Job
app.post('/api/jobs/:id/match', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = loadDatabase();
    const job = db.jobs.find((j) => j.id === req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    if (!db.profile) {
      res.status(400).json({ error: 'Upload and approve a resume profile before matching.' });
      return;
    }

    logActivity('Evaluating Match', `Analyzing fit for ${job.title} at ${job.company}...`);
    const match = await matchCandidateToJob(db.profile, job, true);
    job.matchDetails = match;
    saveDatabase(db);

    logActivity('Match Evaluated', `${job.company} fit score: ${match.overallScore}%`, 'success');
    res.json({ success: true, matchDetails: match });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Update Job Status
app.post('/api/jobs/:id/status', (req: Request, res: Response): void => {
  try {
    const { status, notes, interviewDate, followUpDate } = req.body;
    const db = loadDatabase();
    const job = db.jobs.find((j) => j.id === req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const oldStatus = job.status;
    job.status = status;
    if (notes !== undefined) job.applicationNotes = notes;
    if (interviewDate !== undefined) job.interviewDate = interviewDate;
    if (followUpDate !== undefined) job.followUpDate = followUpDate;
    saveDatabase(db);

    logActivity('Status Updated', `${job.company} (${job.title}): ${oldStatus} → ${status}`);
    res.json({ success: true, job });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Generate Tailored Resume for Job
app.post('/api/jobs/:id/tailor-resume', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = loadDatabase();
    const job = db.jobs.find((j) => j.id === req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    if (!db.profile) {
      res.status(400).json({ error: 'Please upload and approve your resume profile first.' });
      return;
    }

    logActivity('Customizing Resume', `Optimizing ATS alignment for ${job.title} at ${job.company}...`);
    const tailored = await generateTailoredResume(db.profile, job);
    job.tailoredResume = tailored;
    if (job.status === 'Discovered' || job.status === 'Shortlisted') {
      job.status = 'Resume Ready';
    }
    saveDatabase(db);

    logActivity('Resume Tailored', `Generated custom resume version for ${job.company}`, 'success');
    res.json({ success: true, tailoredResume: tailored, job });
  } catch (err: any) {
    console.error('Tailoring error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 11. Generate Tailored Cover Letter
app.post('/api/jobs/:id/cover-letter', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tone } = req.body;
    const db = loadDatabase();
    const job = db.jobs.find((j) => j.id === req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    if (!db.profile) {
      res.status(400).json({ error: 'Profile not found.' });
      return;
    }

    logActivity('Cover Letter Generation', `Drafting executive letter for ${job.company}...`);
    const letter = await generateTailoredCoverLetter(db.profile, job, tone);
    job.tailoredCoverLetter = letter;
    saveDatabase(db);

    logActivity('Cover Letter Created', `Tailored letter ready for ${job.company}`, 'success');
    res.json({ success: true, coverLetter: letter, job });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Answer Screening Questions
app.post('/api/jobs/:id/screening-answers', async (req: Request, res: Response): Promise<void> => {
  try {
    const { questions } = req.body;
    const db = loadDatabase();
    const job = db.jobs.find((j) => j.id === req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    if (!db.profile) {
      res.status(400).json({ error: 'Candidate profile required.' });
      return;
    }

    const questionsToAnswer =
      Array.isArray(questions) && questions.length > 0
        ? questions
        : [
            `Why are you interested in this ${job.title} role at ${job.company}?`,
            'What is your experience with the primary technologies required for this position?',
            'What is your target compensation and earliest available start date?',
            'Describe a recent complex engineering challenge you resolved.',
          ];

    logActivity('Answering Screening Questions', `Generating verified responses for ${job.company}...`);
    const answers = await answerScreeningQuestions(db.profile, job, questionsToAnswer);
    job.screeningAnswers = answers;
    saveDatabase(db);

    logActivity('Screening Answers Ready', `Prepared ${answers.length} verified answers for ${job.company}`, 'success');
    res.json({ success: true, answers, job });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Download DOCX Resume
app.get('/api/jobs/:id/download-resume', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = loadDatabase();
    const job = db.jobs.find((j) => j.id === req.params.id);
    if (!job || !db.profile) {
      res.status(404).send('Job or Candidate Profile not found');
      return;
    }

    const docxBuffer = await generateResumeDocx(db.profile, job.tailoredResume);
    const sanitizedCompany = job.company.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedCandidate = db.profile.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedCandidate}_Resume_${sanitizedCompany}.docx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docxBuffer);
  } catch (err: any) {
    console.error('Error downloading resume docx:', err);
    res.status(500).send('Failed to generate DOCX resume');
  }
});

// 14. Download DOCX Cover Letter
app.get('/api/jobs/:id/download-cover-letter', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = loadDatabase();
    const job = db.jobs.find((j) => j.id === req.params.id);
    if (!job || !db.profile || !job.tailoredCoverLetter) {
      res.status(404).send('Cover letter not found');
      return;
    }

    const docxBuffer = await generateCoverLetterDocx(
      db.profile,
      job,
      job.tailoredCoverLetter.content
    );
    const sanitizedCompany = job.company.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedCandidate = db.profile.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedCandidate}_CoverLetter_${sanitizedCompany}.docx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docxBuffer);
  } catch (err: any) {
    res.status(500).send('Failed to generate DOCX cover letter');
  }
});

// 15. Application Automation Package (Form Field Mapping, Playwright, Bookmarklet)
app.get('/api/jobs/:id/application-package', (req: Request, res: Response): void => {
  try {
    const db = loadDatabase();
    const job = db.jobs.find((j) => j.id === req.params.id);
    if (!job || !db.profile) {
      res.status(404).json({ error: 'Job or profile not found.' });
      return;
    }

    const pkg = buildApplicationPackage(db.profile, job);
    res.json(pkg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 16. Explicit Approval & Submission Submission Gate
app.post('/api/jobs/:id/submit-application', (req: Request, res: Response): void => {
  try {
    const { approved, confirmationNotes } = req.body;
    if (!approved) {
      res.status(400).json({ error: 'Explicit user approval is required to mark application submitted.' });
      return;
    }

    const db = loadDatabase();
    const job = db.jobs.find((j) => j.id === req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    job.status = 'Applied';
    job.appliedDate = new Date().toISOString();
    job.submissionConfirmationId = `SUB-${Date.now().toString(36).toUpperCase()}`;
    job.applicationNotes = confirmationNotes || 'Application submitted with user approval.';

    saveDatabase(db);
    logActivity(
      'Application Submitted',
      `Application officially approved & submitted for ${job.title} at ${job.company} (Ref: ${job.submissionConfirmationId})`,
      'success'
    );

    res.json({ success: true, job });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 17. Preferences
app.post('/api/preferences', (req: Request, res: Response): void => {
  try {
    const db = loadDatabase();
    db.preferences = { ...db.preferences, ...req.body };
    saveDatabase(db);
    logActivity('Preferences Saved', 'Updated discovery filters and automation intervals');
    res.json({ success: true, preferences: db.preferences });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 18. Clear or Reset Database
app.post('/api/data/reset', (req: Request, res: Response): void => {
  try {
    const db = loadDatabase();
    db.jobs = [];
    db.profile = null;
    logActivity('Database Reset', 'Cleared candidate profile and all discovered jobs', 'warn');
    saveDatabase(db);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 19. Export Data JSON
app.get('/api/export', (req: Request, res: Response): void => {
  const db = loadDatabase();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="autoapply_backup.json"');
  res.send(JSON.stringify(db, null, 2));
});

// -------------------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVING
// -------------------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`AutoApply AI Server running on port ${PORT} [${isDev ? 'DEVELOPMENT' : 'PRODUCTION'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
