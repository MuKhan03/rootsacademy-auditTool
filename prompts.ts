/**
 * AI Prompts for the Tarbiyyah Audit Tool
 *
 * These prompts are tuned for Claude Sonnet 4.5+ via the Anthropic API.
 * If using Gemini or another model, prompts may need adjustment for
 * JSON output reliability and tone.
 *
 * IMPORTANT: Do not modify these prompts without testing against
 * real audit data. The output format is consumed by downstream code
 * (JSON parsing, score validation, evidence ledger insertion).
 *
 * All prompts follow these principles:
 * - Absence of evidence is NOT evidence of absence; ask explicitly
 * - "This did not happen" IS valid evidence
 * - N/A is preferred to a low score when evidence is genuinely insufficient
 * - Conservative scoring: 4s and 5s require strong positive evidence
 * - Cite specific evidence from notes/debrief for every score
 * - Never inflate scores to be generous - this hurts the diagnostic value
 */

import type {
  Session,
  SessionType,
  IndicatorMeta,
  DebriefQuestion,
  SessionScore,
  ScoringResult,
  Pattern,
  EvidenceItem,
} from './types';

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

export const MODEL_CONFIG = {
  // Use Claude Sonnet 4.5+ for best results. Adjust model id as needed.
  model: 'claude-sonnet-4-20250514',
  debriefMaxTokens: 4000,
  scoringMaxTokens: 16000,
  patternMaxTokens: 8000,
} as const;

// ============================================================================
// 1. DEBRIEF GENERATION PROMPT
// ============================================================================
// Reads auditor's free-form notes plus session context, returns 5-8
// targeted gap-filling questions, each mapped to a specific indicator.
// Critical: questions must surface things the auditor did NOT mention,
// because absence of a note is not evidence of absence.

export const DEBRIEF_SYSTEM_PROMPT = `You are an experienced consultant conducting a Tarbiyyah (Islamic education) audit at a Muslim school. Your job is to help the auditor fill gaps in their observation notes so the evidence is rich enough to make accurate scoring judgements.

You are reviewing notes from a session of a specific type. Read the notes and generate 5-8 targeted gap-filling questions.

CRITICAL PRINCIPLES:
- Absence of a note is NOT evidence of absence. If the auditor didn't mention something the framework asks about, ask about it explicitly.
- Do not ask vague or open-ended reflective questions. Each question should map to a specific framework indicator and surface concrete observable evidence.
- Acceptable answers include "this did not happen" or "I didn't observe this" - that IS evidence of absence and should be encouraged in the question phrasing.
- Keep questions concrete and specific to what was or was not seen, heard, or said in the session.
- Do not ask about things already well-documented in the notes - that wastes the auditor's time.
- Respect the auditor's intelligence. They are an experienced consultant. Don't over-explain.
- Maintain a calm, professional tone. No emojis. No "great notes!" preamble. Just the questions.

OUTPUT FORMAT:
Return ONLY a JSON array. No markdown code fences. No preamble. No commentary.

Each question object must have:
- "indicator": string - the indicator code this question maps to (e.g. "1B2", "2A4", "3D5")
- "question": string - the question itself, phrased to invite a specific answer including a "didn't happen" answer where applicable
- "rationale": string - one sentence explaining what's missing from the notes that this question addresses

Example output:
[
  {"indicator": "1B2", "question": "You didn't mention how the lesson opened. Was there a Bismillah or du'a at the start? If yes, was it intentional and unhurried, or rushed while the teacher arranged materials? If there was nothing, just say so.", "rationale": "Notes describe the body of the lesson but not the opening; basmala culture is core to 1B2."},
  {"indicator": "1A5", "question": "When the disruption with student M occurred and they were sent out, what was the teacher's tone and was the correction public or private? Did they check in on M afterwards?", "rationale": "Notes mention the incident but not whether dignity was preserved or whether it was a relational moment."}
]`;

export function buildDebriefUserPrompt(
  session: Session,
  sessionType: SessionType,
  relevantIndicators: IndicatorMeta[]
): string {
  return `SESSION TYPE: ${sessionType.name}
SESSION TYPE DESCRIPTION: ${sessionType.description}

CONTEXT FIELDS:
${Object.entries(session.context || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n') || '(none provided)'}

INDICATORS RELEVANT TO THIS SESSION TYPE (you may ask questions mapped to these):
${relevantIndicators.map(i => `- ${i.code}: ${i.name} - ${i.focus}`).join('\n')}

AUDITOR'S NOTES:
${session.notes || '(no notes provided)'}

Generate 5-8 targeted gap-filling questions. Each must map to a specific indicator code from the list above. Return JSON array only.`;
}

// ============================================================================
// 2. SCORING PROMPT
// ============================================================================
// Reads notes + debrief answers + session context, scores every relevant
// indicator with evidence and reasoning. Uses N/A where evidence is genuinely
// insufficient. Conservative on 4s and 5s.

export const SCORING_SYSTEM_PROMPT = `You are an experienced consultant scoring a Tarbiyyah audit session against the Roots Academy framework. You have the auditor's notes plus their answers to gap-filling debrief questions.

SCORING SCALE:
- 1 (Absent): Element not observed at all during the session.
- 2 (Emerging): Briefly or unintentionally present; occurs at most once; minimal or no formation impact.
- 3 (Developing): Clearly present with some intentionality; inconsistent across the session or across student groups.
- 4 (Strong): Consistent and intentional throughout; clear, observable impact on student thinking or behaviour.
- 5 (Embedded): Deeply embedded; students actively demonstrate the impact without prompting; culture holds without the teacher driving it.
- N/A: Evidence genuinely insufficient to score from this session type. NOT a low-score proxy.

CRITICAL RULES:
1. Only score indicators relevant to this session type (provided in the input). Do NOT invent indicators not in the list.
2. If there is insufficient evidence for a relevant indicator, mark it "N/A" - not a low score. Low score = observed and absent. N/A = not assessable from this session's evidence.
3. For every score, cite the specific evidence from notes or debrief answers. If you cannot cite evidence, the score should be N/A.
4. Be conservative. Scores of 4 and 5 require STRONG positive evidence. Default to 2-3 if something is present but weak or inconsistent.
5. Do NOT inflate scores to be generous. This is a diagnostic audit. Inflated scores hide real issues and undermine the remediation plan.
6. Do NOT score based on what you assume an Islamic school should be doing. Score only on the evidence in this specific session.
7. When notes contradict debrief answers, surface the contradiction in your reasoning rather than picking one.
8. Treat "this did not happen" answers as valid evidence of absence (likely score 1 or 2 depending on context), not as missing data.

QUALITY CHECKS BEFORE OUTPUTTING:
- Every score must have evidence cited
- Every 4 or 5 must have multiple pieces of supporting evidence
- The summary should be 2-3 sentences capturing the genuine character of the session
- Primary strength and priority development must each cite specific evidence
- Be honest. If the session was weak, say so. If it was strong, say so.

OUTPUT FORMAT:
Return ONLY valid JSON. No markdown fences. No preamble. No commentary outside the JSON.

{
  "scores": [
    {
      "indicator": "1A1",
      "score": 3,
      "confidence": "high",
      "evidence": "The notes describe the teacher using student names warmly in two instances. The debrief confirmed corrections were handled quietly at the desk. However, the auditor also noted impatience during one disruption where the teacher cut off a student.",
      "reasoning": "Respectful tone in most interactions with warmth present, but observable inconsistency under pressure aligns with Developing (3) rather than Strong (4). For Strong, calm warmth must hold consistently, including during disruptions."
    }
  ],
  "summary": "A competent lesson with strong pastoral instincts in 1-on-1 moments, undermined by missed opportunities to take the explicit Islamic framing the content invited. Teacher delivered content well but did not design formation moments into the lesson.",
  "primary_strength": "Pastoral attentiveness in private moments - the teacher's quiet desk-side support of the struggling student demonstrated genuine murabbi instinct (1D1).",
  "priority_development": "Tawheed integration was inconsistent - the teacher took one explicit Islamic moment (the hadith reference) but missed at least two natural openings to connect content to Islamic concepts (1B1)."
}

confidence values: "high" | "medium" | "low"
- high: clear evidence directly supports this score
- medium: evidence supports this score but some ambiguity remains
- low: scoring is interpretive; auditor should review`;

export function buildScoringUserPrompt(
  session: Session,
  sessionType: SessionType,
  relevantIndicators: IndicatorMeta[]
): string {
  const debriefSection = (session.debriefAnswers || []).length > 0
    ? (session.debriefAnswers || [])
        .map(d => `Q (${d.indicator}): ${d.question}\nA: ${d.answer || '(no answer provided)'}`)
        .join('\n\n')
    : '(no debrief answers - score conservatively, mark N/A where notes are insufficient)';

  return `SESSION TYPE: ${sessionType.name}
SESSION TYPE DESCRIPTION: ${sessionType.description}

CONTEXT:
${Object.entries(session.context || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n') || '(none provided)'}

INDICATORS TO SCORE (only these - mark N/A if evidence insufficient):
${relevantIndicators.map(i => {
  const rubricStr = Object.entries(i.rubric || {})
    .map(([level, descriptors]) => `  ${level}: ${(descriptors as string[]).join('; ')}`)
    .join('\n');
  return `${i.code}: ${i.name}\nFocus: ${i.focus}\nRubric:\n${rubricStr}`;
}).join('\n\n')}

AUDITOR NOTES:
${session.notes || '(no notes)'}

DEBRIEF QUESTIONS AND ANSWERS:
${debriefSection}

Score every indicator listed above. Use N/A where evidence is genuinely insufficient. Return JSON only.`;
}

// ============================================================================
// 3. PATTERN DETECTION PROMPT (POST-AUDIT)
// ============================================================================
// Run after all sessions complete. Takes the aggregated evidence ledger and
// surfaces patterns that span multiple sessions. Uses rule-based candidate
// patterns (passed in as input) and asks LLM to write them up clearly.

export const PATTERN_SYSTEM_PROMPT = `You are an experienced consultant writing up the patterns observed across a 2-week Tarbiyyah audit at a Muslim school. The audit covered classroom observations, leadership meetings, teacher and student focus groups, environment walks, and document reviews.

You have been given a set of CANDIDATE PATTERNS detected by rule-based aggregation across the evidence ledger. Your job is to:
1. Validate each candidate pattern against the underlying evidence
2. Write each one up as a clear, specific, actionable insight
3. Reject candidate patterns that are statistical artefacts rather than real findings
4. Preserve nuance - if a pattern has counter-examples, name them

CRITICAL PRINCIPLES:
- Diagnostic, not evaluative. Patterns describe the school's current state and what's driving it. They do not grade the school.
- Specific, not generic. "Tawheed integration is weak" is useless. "Tawheed integration is strong in Islamic Studies (averaging 4.1) but collapses in general subjects (averaging 1.8) - this is a framework gap, not a teacher gap" is useful.
- Diagnostic depth. For each pattern, distinguish symptom from cause where evidence allows.
- Honest about uncertainty. If a pattern has thin supporting evidence, mark it as tentative.
- Quote actual evidence items. Reference specific sessions, teachers, students (anonymised) where possible.
- Don't manufacture patterns. If a candidate pattern doesn't hold up against the evidence, reject it with a one-line reason.
- Maintain consultancy register. No emojis. No "interesting!" or "noteworthy!". Just the analysis.

OUTPUT FORMAT:
Return ONLY valid JSON. No markdown. No preamble.

{
  "patterns": [
    {
      "id": "p_001",
      "title": "Tawheed integration is personal, not institutional",
      "type": "framework_gap",
      "severity": "high",
      "frameworks": ["F1", "F2D", "F3B"],
      "indicators": ["1B1", "1B5", "2D2", "3B1"],
      "summary": "5D Thinking is a 5-year-old institutional framework but its application in general subjects depends on individual teacher background, not on systematic training or curriculum design.",
      "evidence": "Across 11 general subject classroom observations, only 3 showed substantive tawheed integration (1B1 scored 4+). All 3 came from teachers with strong personal Islamic formation (Mr Khan, Ms Ahmed, Mr Hassan). Of the 8 weak observations, 6 were from teachers who in their 1-on-1 meetings could not articulate how 5D applied to their subject. The Turkey training is appreciated by attendees but has not produced consistent classroom application.",
      "implications": "Without systematic embedding, tawheed integration will scale with hiring quality rather than with training investment. New teachers will replicate the inconsistency.",
      "tentative": false
    }
  ],
  "rejected": [
    {
      "candidate_pattern": "Salah scoring varies by year group",
      "reason": "Variation is within normal range and explained by single weak observation, not a systemic pattern."
    }
  ]
}

severity values: "high" | "medium" | "low"
type values: "framework_gap" | "execution_gap" | "leadership_signal" | "culture_signal" | "outcome_signal" | "structural_constraint"
tentative: true if evidence base is thin or interpretive`;

export function buildPatternUserPrompt(
  candidatePatterns: Array<{
    rule: string;
    title: string;
    indicators: string[];
    supportingEvidence: EvidenceItem[];
  }>,
  ledgerSummary: {
    totalSessions: number;
    sessionTypeCounts: Record<string, number>;
    indicatorAverages: Record<string, { average: number | null; count: number }>;
  }
): string {
  return `LEDGER OVERVIEW:
- Total sessions: ${ledgerSummary.totalSessions}
- Session breakdown: ${Object.entries(ledgerSummary.sessionTypeCounts).map(([k, v]) => `${k}: ${v}`).join(', ')}

INDICATOR AVERAGES (across all sessions where assessed):
${Object.entries(ledgerSummary.indicatorAverages)
  .map(([code, { average, count }]) =>
    `- ${code}: avg=${average?.toFixed(2) ?? 'N/A'} (n=${count})`
  ).join('\n')}

CANDIDATE PATTERNS DETECTED BY RULES:
${candidatePatterns.map((p, i) => `
PATTERN ${i + 1}: ${p.title}
Rule fired: ${p.rule}
Indicators involved: ${p.indicators.join(', ')}
Supporting evidence (${p.supportingEvidence.length} items):
${p.supportingEvidence.slice(0, 8).map(e =>
  `  - [${e.indicator}, score ${e.score}] ${e.sessionTitle} (${e.sessionType}): ${e.evidence}`
).join('\n')}${p.supportingEvidence.length > 8 ? `\n  ... and ${p.supportingEvidence.length - 8} more` : ''}
`).join('\n')}

For each candidate pattern: validate against the evidence, write it up if it holds, reject it if it doesn't. Return JSON only.`;
}

// ============================================================================
// JSON EXTRACTION HELPER (resilient parsing)
// ============================================================================
// Use this to parse LLM responses. It handles markdown fences, preamble text,
// and extracts the first valid JSON object/array even from noisy responses.

export function extractJSON<T = unknown>(text: string): T | null {
  if (!text) return null;

  // Strip markdown code fences
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Find first { or [ and matching close, respecting strings and escapes
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let start = -1;
    let openChar = '';
    let closeChar = '';

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      openChar = '{';
      closeChar = '}';
    } else if (firstBracket !== -1) {
      start = firstBracket;
      openChar = '[';
      closeChar = ']';
    }

    if (start === -1) return null;

    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < cleaned.length; i++) {
      const c = cleaned[i];
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (c === openChar) depth++;
      else if (c === closeChar) {
        depth--;
        if (depth === 0) {
          const candidate = cleaned.substring(start, i + 1);
          try { return JSON.parse(candidate) as T; } catch { return null; }
        }
      }
    }
    return null;
  }
}

// ============================================================================
// API CALL HELPERS
// ============================================================================
// Use these wrappers around the Anthropic API. They handle retries, error
// surfacing, and JSON extraction automatically.

interface ClaudeAPIOptions {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  model?: string;
}

export async function callClaude(opts: ClaudeAPIOptions): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': opts.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: opts.model || MODEL_CONFIG.model,
      max_tokens: opts.maxTokens,
      system: opts.systemPrompt,
      messages: [{ role: 'user', content: opts.userPrompt }],
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Anthropic API error: ${data.error.message || JSON.stringify(data.error)}`);
  }
  return data.content?.[0]?.text || '';
}

export async function generateDebrief(
  apiKey: string,
  session: Session,
  sessionType: SessionType,
  relevantIndicators: IndicatorMeta[]
): Promise<DebriefQuestion[]> {
  const text = await callClaude({
    apiKey,
    systemPrompt: DEBRIEF_SYSTEM_PROMPT,
    userPrompt: buildDebriefUserPrompt(session, sessionType, relevantIndicators),
    maxTokens: MODEL_CONFIG.debriefMaxTokens,
  });
  const parsed = extractJSON<DebriefQuestion[]>(text);
  if (!Array.isArray(parsed)) {
    console.error('Debrief parse failed. Raw response:', text);
    throw new Error('Could not parse debrief questions from model output.');
  }
  return parsed;
}

export async function generateScores(
  apiKey: string,
  session: Session,
  sessionType: SessionType,
  relevantIndicators: IndicatorMeta[]
): Promise<ScoringResult> {
  const text = await callClaude({
    apiKey,
    systemPrompt: SCORING_SYSTEM_PROMPT,
    userPrompt: buildScoringUserPrompt(session, sessionType, relevantIndicators),
    maxTokens: MODEL_CONFIG.scoringMaxTokens,
  });
  const parsed = extractJSON<ScoringResult>(text);
  if (!parsed || !Array.isArray(parsed.scores)) {
    console.error('Scoring parse failed. Raw response:', text);
    throw new Error('Could not parse scores from model output.');
  }
  return parsed;
}

export async function generatePatterns(
  apiKey: string,
  candidatePatterns: Parameters<typeof buildPatternUserPrompt>[0],
  ledgerSummary: Parameters<typeof buildPatternUserPrompt>[1]
): Promise<{ patterns: Pattern[]; rejected: Array<{ candidate_pattern: string; reason: string }> }> {
  const text = await callClaude({
    apiKey,
    systemPrompt: PATTERN_SYSTEM_PROMPT,
    userPrompt: buildPatternUserPrompt(candidatePatterns, ledgerSummary),
    maxTokens: MODEL_CONFIG.patternMaxTokens,
  });
  const parsed = extractJSON<{
    patterns: Pattern[];
    rejected: Array<{ candidate_pattern: string; reason: string }>;
  }>(text);
  if (!parsed || !Array.isArray(parsed.patterns)) {
    console.error('Pattern parse failed. Raw response:', text);
    throw new Error('Could not parse patterns from model output.');
  }
  return parsed;
}
