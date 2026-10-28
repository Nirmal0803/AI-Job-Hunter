import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { CandidateProfile, JobListing, WorkExperience, Project } from './db.js';

export async function generateResumeDocx(
  profile: CandidateProfile,
  tailored?: JobListing['tailoredResume']
): Promise<Buffer> {
  const experiences: WorkExperience[] = tailored?.experiences?.length
    ? tailored.experiences
    : profile.experiences;

  const projects: Project[] = tailored?.projects?.length
    ? tailored.projects
    : profile.projects;

  const skills: string[] = tailored?.skills?.length
    ? tailored.skills
    : profile.technicalSkills;

  const summary = tailored?.summary || profile.summary;

  const contactItems = [
    profile.email,
    profile.phone,
    profile.location,
    profile.linkedinUrl,
    profile.githubUrl,
  ].filter(Boolean);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 in
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          // Header / Full Name
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: profile.fullName.toUpperCase(),
                bold: true,
                size: 32, // 16pt
                font: 'Calibri',
                color: '1E293B',
              }),
            ],
          }),

          // Headline
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: profile.headline,
                italics: true,
                size: 22, // 11pt
                font: 'Calibri',
                color: '475569',
              }),
            ],
          }),

          // Contact Details
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 280 },
            children: [
              new TextRun({
                text: contactItems.join('  •  '),
                size: 19, // 9.5pt
                font: 'Calibri',
                color: '64748B',
              }),
            ],
          }),

          // SECTION: PROFESSIONAL SUMMARY
          new Paragraph({
            text: 'PROFESSIONAL SUMMARY',
            heading: HeadingLevel.HEADING_2,
            border: {
              bottom: {
                color: '94A3B8',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: summary,
                size: 21,
                font: 'Calibri',
                color: '334155',
              }),
            ],
          }),

          // SECTION: CORE COMPETENCIES & TECHNICAL SKILLS
          new Paragraph({
            text: 'SKILLS & COMPETENCIES',
            heading: HeadingLevel.HEADING_2,
            border: {
              bottom: {
                color: '94A3B8',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: skills.join('  •  '),
                size: 20,
                font: 'Calibri',
                color: '334155',
              }),
            ],
          }),

          // SECTION: WORK EXPERIENCE
          new Paragraph({
            text: 'PROFESSIONAL EXPERIENCE',
            heading: HeadingLevel.HEADING_2,
            border: {
              bottom: {
                color: '94A3B8',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { before: 200, after: 140 },
          }),

          ...experiences.flatMap((exp) => [
            new Paragraph({
              spacing: { before: 120, after: 60 },
              children: [
                new TextRun({
                  text: exp.title,
                  bold: true,
                  size: 22,
                  font: 'Calibri',
                  color: '0F172A',
                }),
                new TextRun({
                  text: `  |  ${exp.company}`,
                  size: 21,
                  font: 'Calibri',
                  color: '334155',
                }),
                new TextRun({
                  text: exp.location ? ` (${exp.location})` : '',
                  italics: true,
                  size: 19,
                  font: 'Calibri',
                  color: '64748B',
                }),
                new TextRun({
                  text: `\t${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || ''}`,
                  bold: true,
                  size: 19,
                  font: 'Calibri',
                  color: '475569',
                }),
              ],
            }),
            ...exp.bullets.map(
              (bullet) =>
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { after: 60 },
                  children: [
                    new TextRun({
                      text: bullet,
                      size: 20,
                      font: 'Calibri',
                      color: '334155',
                    }),
                  ],
                })
            ),
          ]),

          // SECTION: PROJECTS (if any)
          ...(projects && projects.length > 0
            ? [
                new Paragraph({
                  text: 'SELECTED PROJECTS & TECHNICAL INITIATIVES',
                  heading: HeadingLevel.HEADING_2,
                  border: {
                    bottom: {
                      color: '94A3B8',
                      space: 1,
                      style: BorderStyle.SINGLE,
                      size: 6,
                    },
                  },
                  spacing: { before: 240, after: 140 },
                }),
                ...projects.flatMap((proj) => [
                  new Paragraph({
                    spacing: { before: 100, after: 40 },
                    children: [
                      new TextRun({
                        text: proj.name,
                        bold: true,
                        size: 21,
                        font: 'Calibri',
                        color: '0F172A',
                      }),
                      new TextRun({
                        text: proj.technologies?.length ? ` (${proj.technologies.join(', ')})` : '',
                        italics: true,
                        size: 19,
                        font: 'Calibri',
                        color: '64748B',
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { after: 60 },
                    children: [
                      new TextRun({
                        text: proj.description,
                        size: 20,
                        font: 'Calibri',
                        color: '334155',
                      }),
                    ],
                  }),
                  ...proj.bullets.map(
                    (b) =>
                      new Paragraph({
                        bullet: { level: 0 },
                        spacing: { after: 40 },
                        children: [
                          new TextRun({
                            text: b,
                            size: 20,
                            font: 'Calibri',
                            color: '334155',
                          }),
                        ],
                      })
                  ),
                ]),
              ]
            : []),

          // SECTION: EDUCATION
          new Paragraph({
            text: 'EDUCATION',
            heading: HeadingLevel.HEADING_2,
            border: {
              bottom: {
                color: '94A3B8',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { before: 240, after: 120 },
          }),
          ...profile.education.map(
            (edu) =>
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: edu.degree,
                    bold: true,
                    size: 21,
                    font: 'Calibri',
                    color: '0F172A',
                  }),
                  new TextRun({
                    text: edu.field ? ` in ${edu.field}` : '',
                    size: 21,
                    font: 'Calibri',
                    color: '334155',
                  }),
                  new TextRun({
                    text: ` — ${edu.institution}`,
                    size: 20,
                    font: 'Calibri',
                    color: '475569',
                  }),
                  new TextRun({
                    text: edu.graduationYear ? ` (${edu.graduationYear})` : '',
                    italics: true,
                    size: 19,
                    font: 'Calibri',
                    color: '64748B',
                  }),
                ],
              })
          ),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

export async function generateCoverLetterDocx(
  profile: CandidateProfile,
  job: JobListing,
  content: string
): Promise<Buffer> {
  const paragraphs = content.split('\n\n').filter(Boolean);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1080, // 0.75 in
              right: 1080,
              bottom: 1080,
              left: 1080,
            },
          },
        },
        children: [
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: profile.fullName,
                bold: true,
                size: 28,
                font: 'Calibri',
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `${profile.email}  •  ${profile.phone}  •  ${profile.location}`,
                size: 19,
                font: 'Calibri',
                color: '64748B',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }),
                size: 21,
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `Hiring Team\n${job.company}\nRe: Application for ${job.title}`,
                size: 21,
                font: 'Calibri',
                color: '334155',
              }),
            ],
          }),
          ...paragraphs.map(
            (p) =>
              new Paragraph({
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: p.trim(),
                    size: 22,
                    font: 'Calibri',
                    color: '1E293B',
                  }),
                ],
              })
          ),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
