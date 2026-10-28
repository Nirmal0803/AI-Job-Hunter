import { CandidateProfile, JobListing } from './db.js';

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

/**
 * Builds an intelligent form field mapping for application forms (Greenhouse, Lever, Ashby, Workday, etc.)
 */
export function buildApplicationPackage(
  profile: CandidateProfile,
  job: JobListing
): ApplicationPackage {
  const nameParts = profile.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const mappedFields: FormFieldMapping[] = [
    {
      fieldKey: 'first_name',
      label: 'First Name',
      value: firstName,
      confidence: 1.0,
    },
    {
      fieldKey: 'last_name',
      label: 'Last Name',
      value: lastName,
      confidence: 1.0,
    },
    {
      fieldKey: 'email',
      label: 'Email Address',
      value: profile.email,
      confidence: 1.0,
    },
    {
      fieldKey: 'phone',
      label: 'Phone Number',
      value: profile.phone || '',
      confidence: profile.phone ? 1.0 : 0.0,
      needsReview: !profile.phone,
      notes: profile.phone ? undefined : 'Phone is missing from profile.',
    },
    {
      fieldKey: 'location',
      label: 'Current Location',
      value: profile.location,
      confidence: 0.95,
    },
    {
      fieldKey: 'linkedin',
      label: 'LinkedIn Profile URL',
      value: profile.linkedinUrl || '',
      confidence: profile.linkedinUrl ? 1.0 : 0.3,
      needsReview: !profile.linkedinUrl,
    },
    {
      fieldKey: 'github',
      label: 'GitHub URL / Code Repository',
      value: profile.githubUrl || '',
      confidence: profile.githubUrl ? 1.0 : 0.4,
    },
    {
      fieldKey: 'portfolio',
      label: 'Portfolio / Personal Website',
      value: profile.portfolioUrl || '',
      confidence: profile.portfolioUrl ? 1.0 : 0.4,
    },
    {
      fieldKey: 'work_authorization',
      label: 'Work Authorization / Visa Sponsorship',
      value: profile.workAuthorization || 'Authorized to work without sponsorship',
      confidence: 0.9,
    },
    {
      fieldKey: 'notice_period',
      label: 'Earliest Start Date / Notice Period',
      value: '2-3 weeks notice',
      confidence: 0.85,
    },
    {
      fieldKey: 'desired_salary',
      label: 'Desired Compensation',
      value: profile.minDesiredSalary ? `$${profile.minDesiredSalary.toLocaleString()}/year` : 'Negotiable / Market rate',
      confidence: 0.85,
    },
  ];

  const screening = job.screeningAnswers || [];
  const missingMandatoryFields: string[] = [];

  if (!profile.fullName) missingMandatoryFields.push('Full Name');
  if (!profile.email) missingMandatoryFields.push('Email Address');
  if (!profile.phone) missingMandatoryFields.push('Phone Number');

  // Playwright automated script generator for testing or local execution
  const playwrightScript = `// AutoApply AI Playwright Automation Script
// Target: ${job.company} - ${job.title}
// URL: ${job.applyUrl}

import { chromium } from 'playwright';

async function autoApply() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to job application...');
  await page.goto('${job.applyUrl || 'about:blank'}');

  // 1. Fill standard fields if present
  const fieldMappings = ${JSON.stringify(
    mappedFields.reduce(
      (acc, f) => ({ ...acc, [f.fieldKey]: f.value }),
      {}
    ),
    null,
    2
  )};

  // Selectors for standard ATS (Greenhouse, Lever, Ashby, Workday)
  await page.fill('input[name*="first_name" i], input[id*="first_name" i]', fieldMappings.first_name).catch(() => {});
  await page.fill('input[name*="last_name" i], input[id*="last_name" i]', fieldMappings.last_name).catch(() => {});
  await page.fill('input[name*="email" i], input[type="email"]', fieldMappings.email).catch(() => {});
  await page.fill('input[name*="phone" i], input[type="tel"]', fieldMappings.phone).catch(() => {});
  await page.fill('input[name*="linkedin" i], input[placeholder*="linkedin" i]', fieldMappings.linkedin).catch(() => {});
  await page.fill('input[name*="github" i], input[placeholder*="github" i]', fieldMappings.github).catch(() => {});

  console.log('Form autofill populated.');
  console.log('CRITICAL: Awaiting explicit user approval before final submission.');
  // Do NOT auto-submit without user review.
}
`;

  // Quick 1-click Bookmarklet that fills any web application form with candidate data
  const bookmarkletCode = `javascript:(function(){
    var data = ${JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      name: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      linkedin: profile.linkedinUrl,
      github: profile.githubUrl,
      portfolio: profile.portfolioUrl,
    })};
    var inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(function(el) {
      var n = (el.name || el.id || el.placeholder || '').toLowerCase();
      if (n.includes('first') && n.includes('name')) el.value = data.first_name;
      else if (n.includes('last') && n.includes('name')) el.value = data.last_name;
      else if (n.includes('name') && !n.includes('user')) el.value = data.name;
      else if (n.includes('email') || el.type === 'email') el.value = data.email;
      else if (n.includes('phone') || el.type === 'tel') el.value = data.phone;
      else if (n.includes('linkedin')) el.value = data.linkedin;
      else if (n.includes('github')) el.value = data.github;
      else if (n.includes('portfolio') || n.includes('website')) el.value = data.portfolio;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    alert('AutoApply AI: Application form fields autofilled! Please review before submitting.');
  })();`;

  return {
    jobId: job.id,
    company: job.company,
    roleTitle: job.title,
    applyUrl: job.applyUrl || job.sourceUrl,
    candidateName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    mappedFields,
    screeningAnswers: screening.map((s) => ({ question: s.question, answer: s.answer })),
    selectedResumeType: job.tailoredResume ? 'Tailored ATS' : 'Original Master',
    hasTailoredCoverLetter: !!job.tailoredCoverLetter,
    missingMandatoryFields,
    playwrightScript,
    bookmarkletCode,
    readyForApproval: missingMandatoryFields.length === 0,
  };
}
