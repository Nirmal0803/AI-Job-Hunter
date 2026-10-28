# AutoApply AI - Autonomous Personal Job-Hunting Agent

AutoApply AI is a local-first, personal job-hunting application. It automatically reads and extracts your resume, discovers and ranks matching jobs from supported sources, generates ATS-customized resumes and cover letters (with 100% factual accuracy preserved), assists in browser form autofilling, and tracks your application pipeline with an explicit human approval gate.

---

## Quick Start on Your Computer (Windows / macOS / Linux)

### 1. Prerequisites
- **Node.js**: Version 18, 20, or newer ([Download Node.js](https://nodejs.org/)).
- That's it! Everything else (database, document parsers, DOCX generator, web connectors) is self-contained.

---

### 2. Setup & Installation

1. Open your terminal (PowerShell, Command Prompt, or Terminal) in the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```

---

### 3. Environment Variables (Optional but Recommended)

Create a file named `.env` in the root folder:

```env
# Optional: Required for deep Gemini AI reasoning.
# If omitted, AutoApply AI's local heuristic extraction and deterministic matching engine will still run seamlessly!
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# Port (defaults to 3000)
PORT=3000
```

> **Note on Privacy & Local-First Design**:  
> All your profile data, original resumes, and tracked jobs are saved locally on your computer in `./data/database.json`. Your personal information is never uploaded to any third-party databases.

---

### 4. Run the Application

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## Complete Job-Hunting Workflow

```
   1. UPLOAD RESUME
          ↓
   2. REVIEW & APPROVE PROFILE
          ↓
   3. DISCOVER & RANK JOBS
          ↓
   4. SHORTLIST TARGET ROLES
          ↓
   5. ATS RESUME & COVER LETTER STUDIO
          ↓
   6. BROWSER FORM AUTOFILL ASSISTANT
          ↓
   7. EXPLICIT HUMAN APPROVAL GATE
          ↓
   8. TRACK APPLICATIONS & INTERVIEWS
```

### Step 1: Upload Your Master Resume
- Go to the **Upload Resume** tab.
- Drag & drop any `.pdf`, `.docx`, `.doc`, or text file (or click **"Load Full Sample Resume"** to test instantly).
- The engine automatically extracts work experience, metrics, technical competencies, education, and detects any missing information.
- Review and edit any field, then click **"Save & Approve Profile"**.

### Step 2: Discover Opportunities & Match Engine
- Go to the **Discover Jobs** tab and click **"Scan Job Boards Now"**.
- The system queries supported APIs (RemoteOK, Arbeitnow, Curated tech roles).
- You can also paste any individual job URL (Greenhouse, Lever, LinkedIn, career page) using **"Import Job URL"**.
- Every listing is scored between **0% and 100%** based on technical overlap, seniority, and work arrangement.
- Click on any score badge to view the **AI Recruiter Diagnostic** (matching skills, missing skills, and score explanation).

### Step 3: Resume & Cover Letter Studio
- Select any shortlisted opportunity to open the **Resume Studio**.
- Click **"Generate Tailored Resume"**: The agent reorganizes your real achievements and emphasizes keywords matching the job description while strictly preserving 100% factual truth (never fabricates unheld titles or degrees).
- Review the **Side-by-Side Comparison** (Master Baseline vs. Tailored ATS).
- Download as real **.DOCX** or click **Print / PDF** to save as PDF.
- Switch to **Custom Cover Letter** to generate a targeted letter, or **Screening Questions** to get verified answers to common recruiter prompts.

### Step 4: Browser-Assisted Application & Approval Gate
- Go to **Applications** and click **Autofill & Review** on any role.
- AutoApply maps your candidate data directly to ATS form standards (First Name, Last Name, Email, Phone, LinkedIn, GitHub, Work Auth, Desired Salary).
- Generates an automated **Playwright Script** and **1-Click Bookmarklet**.
- **Mandatory Approval Gate**: AutoApply will never submit an application without your explicit personal authorization checkbox.
- Check the approval box and click **"Authorize & Mark Submitted"** to record your submission with an official reference ID and timestamp.

### Step 5: Application Pipeline Tracking
- Track roles through `Awaiting Approval`, `Applied`, `Interview`, `Offer`, and `Rejected`.
- Toggle between **Table View** and **Pipeline Board (Kanban)**.
- Set interview dates and follow-up notes.

---

## Project Structure

```
├── data/
│   └── database.json          # Persistent local JSON database (profile, jobs, preferences)
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx        # Funnel navigation with live badge counts
│   │   ├── TopBar.tsx         # Contextual header with quick actions
│   │   ├── DashboardView.tsx  # KPI overview, top matches, upcoming actions
│   │   ├── ResumeUploadView.tsx # Resume extraction & profile review editor
│   │   ├── DiscoverJobsView.tsx # Job discovery, filters, and match diagnostics
│   │   ├── ShortlistedJobsView.tsx # Curated shortlist manager
│   │   ├── StudioView.tsx     # Side-by-side ATS resume & cover letter studio
│   │   ├── ApplicationsView.tsx # Autofill assistant, approval gate, and tracker
│   │   └── SettingsView.tsx   # Preferences, scan frequency, and data export
│   ├── server/
│   │   ├── db.ts              # Local database engine & schema definitions
│   │   ├── gemini.ts          # Server-side Gemini AI & deterministic match engine
│   │   ├── parser.ts          # PDF (pdf-parse) & DOCX (mammoth) document text extractor
│   │   ├── docxGenerator.ts   # Clean ATS .docx document generator
│   │   ├── jobConnectors.ts   # Multi-source job discovery connectors & deduplicator
│   │   └── automation.ts      # Form field mapping & Playwright script generator
│   ├── App.tsx                # Main application controller
│   └── types.ts               # Shared TypeScript domain models
├── server.ts                  # Express full-stack server with Vite middleware
├── package.json
└── tsconfig.json
```

---

## Production Build

To bundle the application for production:
```bash
npm run build
npm start
```
