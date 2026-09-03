import type { MatchVerdict, ScreeningAnalysis } from '../types.js';
import { verdictForScore } from '../types.js';

// The server's screening result IS the client-facing ScreeningAnalysis shape --
// one definition, imported everywhere, instead of two independently
// maintained copies that could silently drift apart.
export type ScreeningResult = ScreeningAnalysis;

export interface ScreenParams {
  jobTitle: string;
  jobCompany: string;
  jobDescription: string;
  candidate: {
    fullName?: string;
    currentLocation?: string;
    age?: string | number;
    email?: string;
  };
  resumeText: string;
}

function getGroqApiKey(): string | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'MY_GROQ_API_KEY') {
    return null;
  }
  return apiKey;
}

// Deterministic fallback evaluator when Groq API key is not present or offline
function performHeuristicScreening(params: {
  jobTitle: string;
  jobCompany: string;
  jobDescription: string;
  candidateName: string;
  resumeText: string;
}): ScreeningResult {
  const { jobTitle, jobCompany, jobDescription, candidateName, resumeText } = params;
  const jdLower = jobDescription.toLowerCase();
  const resumeLower = resumeText.toLowerCase();

  const tokens = Array.from(new Set(
    jdLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['with', 'from', 'that', 'this', 'have', 'will', 'your', 'about', 'role', 'team'].includes(w))
  ));

  let matchedTokens = 0;
  const foundKeywords: string[] = [];
  tokens.forEach((token) => {
    if (resumeLower.includes(token)) {
      matchedTokens++;
      if (foundKeywords.length < 8 && !foundKeywords.includes(token)) {
        foundKeywords.push(token);
      }
    }
  });

  const matchRatio = tokens.length > 0 ? matchedTokens / tokens.length : 0.5;
  let score = Math.round(45 + Math.min(matchRatio * 75, 48));

  if (resumeLower.includes('lead') || resumeLower.includes('manager') || resumeLower.includes('senior')) {
    score = Math.min(score + 4, 98);
  }

  const verdict = verdictForScore(score);

  return {
    matchScore: score,
    verdict,
    fitSummary: `${candidateName}'s profile demonstrates relevant alignment with the ${jobTitle} opening at ${jobCompany}. Key functional overlaps detected in ${foundKeywords.slice(0, 4).join(', ') || 'core operational areas'}.`,
    strengths: [
      `Direct experience reflected in domain keywords: ${foundKeywords.slice(0, 3).join(', ') || 'general problem solving'}`,
      `Documented track record in team collaboration and project deliverables`,
      `Clear resume narrative detailing quantifiable milestones`
    ],
    gaps: [
      `Requires deeper verification regarding specific years in high-growth environments expected by ${jobCompany}`,
      `Portfolio/work artifacts or specific case studies should be requested during initial screening`
    ],
    followUpQuestions: [
      `How does your past experience with ${foundKeywords[0] || 'strategic projects'} directly apply to the daily priorities at ${jobCompany}?`,
      `What is the most complex ambiguity you navigated in your previous role, and what was the outcome?`,
      `Can you share an example where you had to quickly learn an unfamiliar domain to meet a strict executive deadline?`
    ],
    modelUsed: 'heuristic-screener-v1',
    screenedAt: new Date().toISOString()
  };
}

export async function screenCandidate(params: ScreenParams): Promise<ScreeningResult> {
  const { jobTitle, jobCompany, jobDescription, candidate, resumeText } = params;

  if (!jobDescription || !resumeText) {
    throw new Error('Job description and resume text are required.');
  }

  const apiKey = getGroqApiKey();

  if (!apiKey) {
    return performHeuristicScreening({
      jobTitle: jobTitle || 'Target Role',
      jobCompany: jobCompany || 'Hiring Organization',
      jobDescription,
      candidateName: candidate?.fullName || 'Candidate',
      resumeText,
    });
  }

  const prompt = `You are an elite, objective Executive Talent Screener evaluating an applicant's resume against a specific Job Description (JD).

JOB OPENING:
- Title: ${jobTitle}
- Company: ${jobCompany}
- Full Job Description:
${jobDescription}

CANDIDATE DETAILS:
- Name: ${candidate?.fullName || 'Candidate'}
- Location: ${candidate?.currentLocation || 'Unspecified'}
- Age: ${candidate?.age || 'Unspecified'}
- Email: ${candidate?.email || 'Unspecified'}

CANDIDATE PARSED RESUME (.docx):
${resumeText}

INSTRUCTIONS:
1. Objectively evaluate the candidate against the requirements, responsibilities, and experience level of the JD.
2. Calculate a Match Score from 0 to 100 (where 90-100 = Exceptional/Strong Match, 75-89 = Potential Match, 60-74 = Moderate Match, <60 = Low Match).
3. Provide a concise, substantive 'fitSummary' (2-3 sentences) detailing exact alignment or mismatch.
4. Provide 3-4 specific 'strengths' directly tied to JD requirements.
5. Provide 2-3 specific 'gaps' or risks (e.g. missing skills, mismatch in scale, or unverified claims).
6. Provide 3 sharp, role-specific 'followUpQuestions' that the hiring manager can ask in an interview to probe these gaps.

Return ONLY a valid JSON object with the following structure:
{
  "matchScore": number,
  "verdict": "Strong Match" | "Potential Match" | "Moderate Match" | "Low Match",
  "fitSummary": "string",
  "strengths": ["string", "string", "string"],
  "gaps": ["string", "string"],
  "followUpQuestions": ["string", "string", "string"]
}`;

  const primaryModel = 'openai/gpt-oss-120b';
  const fallbackModel = 'openai/gpt-oss-20b';
  let modelUsed = primaryModel;

  async function callGroq(model: string): Promise<string> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Groq API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response received from Groq.');
    }
    return content;
  }

  let responseText: string;
  try {
    responseText = await callGroq(primaryModel);
  } catch (e) {
    console.warn(`${primaryModel} unavailable, attempting ${fallbackModel}:`, e);
    modelUsed = fallbackModel;
    responseText = await callGroq(fallbackModel);
  }

  const parsedData = JSON.parse(responseText);

  const matchScore = typeof parsedData.matchScore === 'number' ? Math.min(Math.max(parsedData.matchScore, 0), 100) : 75;
  let verdict: MatchVerdict = parsedData.verdict;
  const validVerdicts: MatchVerdict[] = ['Strong Match', 'Potential Match', 'Moderate Match', 'Low Match'];
  if (!validVerdicts.includes(verdict)) {
    verdict = verdictForScore(matchScore);
  }

  return {
    matchScore,
    verdict,
    fitSummary: parsedData.fitSummary || 'Candidate evaluated against job description requirements.',
    strengths: Array.isArray(parsedData.strengths) ? parsedData.strengths : ['Relevant domain experience'],
    gaps: Array.isArray(parsedData.gaps) ? parsedData.gaps : ['Experience depth requires validation'],
    followUpQuestions: Array.isArray(parsedData.followUpQuestions) ? parsedData.followUpQuestions : ['Can you elaborate on your relevant accomplishments?'],
    modelUsed,
    screenedAt: new Date().toISOString()
  };
}

export async function screenCandidateSafe(params: ScreenParams): Promise<ScreeningResult> {
  try {
    return await screenCandidate(params);
  } catch (error) {
    console.error('Error during Groq screening, using heuristic fallback:', error);
    return performHeuristicScreening({
      jobTitle: params.jobTitle || 'Target Role',
      jobCompany: params.jobCompany || 'Hiring Organization',
      jobDescription: params.jobDescription || '',
      candidateName: params.candidate?.fullName || 'Candidate',
      resumeText: params.resumeText || '',
    });
  }
}
