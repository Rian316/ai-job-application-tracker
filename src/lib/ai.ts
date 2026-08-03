import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export function isAiConfigured() {
  return openai !== null;
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function complete(system: string, messages: ChatMessage[], maxTokens = 800) {
  if (!openai) return null;

  try {
    const response = await openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });
    return response.choices[0]?.message?.content ?? null;
  } catch (error) {
    console.error("[ai] OpenAI request failed:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cover letters
// ---------------------------------------------------------------------------

export type CoverLetterInput = {
  company: string;
  position: string;
  jobDescription: string;
  resumeContent: string;
  tone?: string;
};

export async function generateCoverLetter(input: CoverLetterInput) {
  const system = [
    "You are an expert career coach who writes compelling, professional cover letters.",
    "Write 3-4 paragraphs: strong opening, relevant achievements matched to the job description,",
    "why this company, and a confident closing with a call to action.",
    "Use the candidate's resume details. Keep it under 350 words.",
    `Tone: ${input.tone ?? "professional"}.`,
    "Return only the letter body, no salutation or sign-off placeholders.",
  ].join(" ");

  const user = [
    `Company: ${input.company}`,
    `Position: ${input.position}`,
    `Job description:\n${input.jobDescription || "(not provided)"}`,
    `Resume:\n${input.resumeContent || "(not provided)"}`,
  ].join("\n\n");

  const generated = await complete(system, [{ role: "user", content: user }], 600);
  if (generated) return generated.trim();

  return fallbackCoverLetter(input);
}

function fallbackCoverLetter(input: CoverLetterInput) {
  return `Dear Hiring Team at ${input.company},

I am writing to express my strong interest in the ${input.position} position at ${input.company}. Your work in this space stands out to me, and I believe my background aligns closely with what you are looking for.

${
  input.jobDescription
    ? `Reading your description for the ${input.position} role, I was particularly drawn to the emphasis on ownership and impact. In my recent roles I have consistently taken end-to-end responsibility for delivering results, collaborating across teams, and iterating quickly based on feedback.`
    : `Over the course of my career I have consistently taken end-to-end ownership of projects, collaborated across teams, and shipped work that moved the needle. I bring the same drive and attention to detail that this role demands.`
}

${
  input.resumeContent
    ? `As detailed in my resume, I bring hands-on experience with the core technologies and practices this role requires, and I am excited about the opportunity to apply and deepen that experience at ${input.company}.`
    : `I am eager to apply my experience to ${input.company}'s goals and grow alongside a team that values craft and curiosity.`
}

I would welcome the opportunity to discuss how I can contribute to ${input.company}'s success. Thank you for your time and consideration — I look forward to hearing from you.

Best regards,
[Your Name]`;
}

// ---------------------------------------------------------------------------
// Resume analysis
// ---------------------------------------------------------------------------

export type ResumeAnalysis = {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

export async function analyzeResume(content: string): Promise<ResumeAnalysis> {
  const system = [
    "You are an expert ATS (Applicant Tracking System) resume reviewer.",
    "Analyze the resume and return STRICT JSON with keys:",
    'atsScore (0-100 number), strengths (array of 3 strings),',
    "weaknesses (array of 3 strings), suggestions (array of 4 actionable strings).",
    "No markdown, no prose outside the JSON.",
  ].join(" ");

  const generated = await complete(
    system,
    [{ role: "user", content: content.slice(0, 6000) }],
    700,
  );

  if (generated) {
    try {
      const cleaned = generated
        .replace(/```json\s*/g, "")
        .replace(/```/g, "")
        .trim();
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
        return {
          atsScore: clampScore(Number(parsed.atsScore)),
          strengths: toStringArray(parsed.strengths, 3),
          weaknesses: toStringArray(parsed.weaknesses, 3),
          suggestions: toStringArray(parsed.suggestions, 4),
        };
      }
    } catch (error) {
      console.error("[ai] Failed to parse resume analysis:", error);
    }
  }

  return fallbackResumeAnalysis(content);
}

function clampScore(value: number) {
  if (Number.isNaN(value)) return 60;
  return Math.max(5, Math.min(99, Math.round(value)));
}

function toStringArray(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .slice(0, limit)
    .map((v) => v.trim())
    .filter(Boolean);
}

function fallbackResumeAnalysis(content: string): ResumeAnalysis {
  const length = content.length;
  const hasEmail = /@|email/i.test(content);
  const hasPhone = /\+?\d[\d\s().-]{8,}/.test(content);
  const hasMetrics = /\d+%|\$\d|\d+x|improved|increased|reduced/i.test(content);
  const hasSection =
    /experience|education|skills|projects/i.test(content);

  let score = 55;
  if (hasEmail) score += 10;
  if (hasPhone) score += 5;
  if (hasSection) score += 10;
  if (hasMetrics) score += 10;
  if (length > 1200) score += 5;
  score = Math.min(95, score);

  return {
    atsScore: score,
    strengths: [
      hasSection
        ? "Clear section structure (experience, education, skills) that ATS parsers recognize."
        : "Content is present; adding standard section headings will help ATS parsing.",
      hasMetrics
        ? "Uses quantifiable achievements, which strongly signals impact to reviewers."
        : "Add quantifiable outcomes (%, $, counts) to demonstrate impact.",
      "Consistent length suitable for a one-page resume.",
    ],
    weaknesses: [
      hasEmail ? "" : "Missing a clear email contact line.",
      hasPhone ? "" : "Missing a phone number, which many ATS require.",
      hasMetrics ? "" : "Few quantified results — use numbers to stand out.",
    ].filter(Boolean),
    suggestions: [
      "Tailor the top third of the resume to each job description (mirror keywords).",
      "Replace generic bullets with STAR-format achievements that include metrics.",
      "Use standard section headings (Experience, Education, Skills, Projects) verbatim.",
      "Save as PDF with a single-column layout to maximize ATS parsing accuracy.",
    ],
  };
}

// ---------------------------------------------------------------------------
// Follow-up emails
// ---------------------------------------------------------------------------

export type FollowUpInput = {
  company: string;
  position: string;
  daysSinceApplied: number;
  status: string;
  recruiterName?: string | null;
  recruiterEmail?: string | null;
};

export async function generateFollowUpEmail(input: FollowUpInput) {
  const greeting = input.recruiterName
    ? `Hi ${input.recruiterName}`
    : "Hi there";
  const stage = input.status.toLowerCase().replaceAll("_", " ");

  const system = [
    "You are a job-search communication coach.",
    "Write a short, polite follow-up email (120-180 words) for a job application.",
    "Reference the position and company, express continued interest, mention",
    "availability for next steps, and close warmly.",
  ].join(" ");

  const user = [
    `Company: ${input.company}`,
    `Position: ${input.position}`,
    `Status: ${stage}`,
    `Days since application: ${input.daysSinceApplied}`,
    `Recruiter: ${input.recruiterName ?? "unknown"}`,
  ].join("\n");

  const generated = await complete(system, [{ role: "user", content: user }], 400);
  if (generated) return generated.trim();

  return `Subject: Following up on ${input.position} at ${input.company}

${greeting},

I hope you're having a great week. I applied for the ${input.position} role at ${input.company} ${input.daysSinceApplied} days ago and wanted to follow up.

I remain very interested in the opportunity — the work your team is doing is exactly the kind of challenge I'm looking for, and I'm confident my background would let me contribute quickly.

If there are any updates on the process, I'd love to hear them. I'm also happy to provide any additional information or take part in the next steps whenever convenient.

Thank you again for your time and consideration.

Best regards,
[Your Name]`;
}

// ---------------------------------------------------------------------------
// Assistant chat
// ---------------------------------------------------------------------------

export type AssistantContext = {
  applicationCount: number;
  interviewCount: number;
  offerCount: number;
  rejectedCount: number;
  upcomingInterviews: Array<{ company: string; position: string; when: string }>;
  openTasks: number;
};

export async function assistantReply(
  context: AssistantContext,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  question: string,
) {
  const system = [
    "You are the AI job search assistant inside a job application tracker.",
    "You help with: application strategy, follow-up timing, interview prep, salary negotiation, resumes, cover letters, and productivity.",
    "Be concise, practical, and encouraging. Use short paragraphs or bullets.",
    "Use the user's live stats below to personalize answers.",
    `Current stats: ${JSON.stringify(context)}`,
  ].join(" ");

  const generated = await complete(
    system,
    [...history, { role: "user" as const, content: question }],
    700,
  );
  if (generated) return generated.trim();

  const lower = question.toLowerCase();
  if (/follow.?up|follow up/.test(lower)) {
    return `Great question. Here's my advice on follow-ups:\n\n- Wait 5–7 business days after applying before following up.\n- Send a short, polite email referencing the role and your continued interest.\n- If you interviewed, follow up within 24 hours with a thank-you note.\n- Keep the same thread; don't start new emails.\n\nYou have ${context.openTasks} open tasks and ${context.upcomingInterviews.length} upcoming interview${context.upcomingInterviews.length === 1 ? "" : "s"} — turning follow-ups into tasks is a good way to stay on schedule.`;
  }
  if (/interview|prepare/.test(lower)) {
    return `For interview prep:\n\n- Research the company's product, recent news, and competitors.\n- Prepare 3–4 STAR stories that show measurable impact.\n- Practice aloud and time your answers (aim for 1–2 minutes each).\n- Prepare 3 smart questions to ask the interviewer.\n\nYou have ${context.upcomingInterviews.length} upcoming interview${context.upcomingInterviews.length === 1 ? "" : "s"}: ${context.upcomingInterviews.map((i) => `${i.company} (${i.position})`).join(", ") || "none scheduled"}. Would you like a mock interview? Try the Interview Coach.`;
  }
  if (/salary|negotiat/.test(lower)) {
    return `Salary negotiation tips:\n\n- Always get the offer in writing before negotiating.\n- Anchor with market data (levels.fyi, Glassdoor) for your level and location.\n- Negotiate the whole package — base, bonus, equity, and time off.\n- Never share a number first; ask for their budget range.\n- Keep it collaborative: "I'm excited about the role; based on my research, I'd expect..."`;
  }
  if (/resume|ats/.test(lower)) {
    return `To improve your resume ATS score:\n\n- Mirror keywords from the job description verbatim.\n- Use standard headings: Experience, Education, Skills, Projects.\n- Quantify achievements with metrics (%, $, time saved).\n- Avoid tables, columns, images, and fancy fonts — ATS parses them poorly.\n\nYou can analyze any resume in the Resume Library with one click.`;
  }
  return `Here's a quick overview to help you plan:\n\n- You're tracking ${context.applicationCount} applications with ${context.offerCount} offer${context.offerCount === 1 ? "" : "s"} and ${context.rejectedCount} rejection${context.rejectedCount === 1 ? "" : "s"}.\n- ${context.upcomingInterviews.length} upcoming interview${context.upcomingInterviews.length === 1 ? "" : "s"} and ${context.openTasks} open tasks.\n\nWhat would you like help with — application strategy, follow-ups, interview prep, salary negotiation, or resumes?`;
}

// ---------------------------------------------------------------------------
// Interview coach
// ---------------------------------------------------------------------------

export type CoachQuestion = {
  question: string;
  topic: string;
};

const COACH_QUESTIONS: CoachQuestion[] = [
  { topic: "Experience", question: "Tell me about yourself and your background." },
  { topic: "Projects", question: "Walk me through a project you're most proud of." },
  { topic: "Conflict", question: "Tell me about a time you disagreed with a teammate or manager." },
  { topic: "Failure", question: "Describe a time you failed and what you learned." },
  { topic: "Technical", question: "How do you approach debugging a tricky production issue?" },
  { topic: "Leadership", question: "Tell me about a time you led without authority." },
  { topic: "Priorities", question: "How do you handle multiple competing deadlines?" },
  { topic: "Growth", question: "What's a skill you recently learned and how did you use it?" },
];

export async function coachReply(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  answer: string,
) {
  const system = [
    "You are an interview coach conducting a mock interview.",
    "After each candidate answer, give a score from 1-10, one-line critique,",
    "then a better way to structure the answer using STAR (Situation, Task, Action, Result).",
    "Keep feedback to 3-4 sentences. Be encouraging but specific.",
  ].join(" ");

  const generated = await complete(
    system,
    [...history, { role: "user" as const, content: answer }],
    500,
  );
  if (generated) return generated.trim();

  const words = answer.trim().split(/\s+/).length;
  if (words < 30) {
    return `Score: 4/10 — your answer was a bit brief to make an impression.\n\nCritique: Hiring managers need concrete details to evaluate you.\n\nTry the STAR structure: Situation (context), Task (your responsibility), Action (what you specifically did), Result (the measurable outcome). Aim for 60–90 seconds per answer.`;
  }
  return `Score: 7/10 — solid content, good level of detail.\n\nCritique: Keep an eye on structure; a clear STAR format makes your impact stand out.\n\nNext time, front-load the Result (e.g., "shipped a feature that cut load time 40%") and then explain the Situation and your specific Actions.`;
}

export function getCoachQuestion(index: number) {
  return COACH_QUESTIONS[index % COACH_QUESTIONS.length];
}

// ---------------------------------------------------------------------------
// Weekly report
// ---------------------------------------------------------------------------

export type WeeklyReportStats = {
  applied: number;
  interviews: number;
  offers: number;
  rejected: number;
  responseRate: number;
  topCompany?: string | null;
  total: number;
};

export async function weeklyReport(stats: WeeklyReportStats) {
  const system = [
    "You are a job-search data analyst.",
    "Write a concise weekly report (under 200 words) with: key numbers,",
    "one insight about what is working or not, and 2-3 concrete actions for next week.",
    "Be specific and motivating.",
  ].join(" ");

  const generated = await complete(
    system,
    [{ role: "user", content: `My week: ${JSON.stringify(stats)}` }],
    500,
  );
  if (generated) return generated.trim();

  return `Weekly Report\n\nApplications sent: ${stats.applied}\nInterviews: ${stats.interviews}\nOffers: ${stats.offers}\nRejections: ${stats.rejected}\nResponse rate: ${stats.responseRate}%\n\n${
    stats.responseRate > 15
      ? `Great momentum — a ${stats.responseRate}% response rate means your targeting is working. Keep it up.`
      : "Your response rate is below average; tighten your targeting and tailor each resume to the job description."
  }\n\nNext week's actions:\n1. Send follow-ups to applications older than 7 days.\n2. Apply to ${Math.max(1, Math.min(10, stats.total > 0 ? Math.round(stats.applied * 0.6) : 5))} new roles matching your target.\n3. Prep one STAR story per upcoming interview.`;
}