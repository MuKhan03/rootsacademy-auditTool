import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, FileText, Users, BookOpen, Building2, Eye, UserCheck, Plus, Download, ArrowLeft, Sparkles, AlertCircle, CheckCircle2, Clock, Trash2, Edit3, Heart } from 'lucide-react';

// ============================================================================
// FRAMEWORK DATA - The audit framework encoded directly
// ============================================================================

const FRAMEWORKS = {
  F1: {
    name: "Teacher in the Classroom",
    description: "When a student walks out of this classroom, have they encountered a teacher who embodies the values they are being asked to develop?",
    sections: {
      "1A": {
        name: "Teacher Character & Presence",
        indicators: {
          "1A1": { name: "Adab with Students", focus: "Quality of relational conduct - does it reflect Islamic values of respect, warmth, and dignity?" },
          "1A2": { name: "Self-Regulation Under Pressure", focus: "Does the teacher model sabr when disrupted or challenged?" },
          "1A3": { name: "Building Trust and Rapport", focus: "Does the teacher genuinely know their students?" },
          "1A4": { name: "Modelling Islamic Character", focus: "Is the teacher's visible conduct itself a lesson in Islamic values?" },
          "1A5": { name: "Dignity in Correction", focus: "Does the teacher's response protect student dignity?" },
        }
      },
      "1B": {
        name: "Islamic Integration in Lesson Delivery",
        indicators: {
          "1B1": { name: "Tawheed Connection", focus: "Does the teacher connect subject matter to Allah, creation, or Islamic worldview? ALL subjects." },
          "1B2": { name: "Gratitude and Basmala Culture", focus: "Is Islamic intention and gratitude meaningful or purely habitual?" },
          "1B3": { name: "Use of Prophetic Examples", focus: "Is the Seerah a living resource in this teacher's delivery?" },
          "1B4": { name: "Questions That Develop Thinking About Deen", focus: "Do questions invite students to connect knowledge to Muslim identity?" },
          "1B5": { name: "Integration with 5D Thinking Framework", focus: "Does the teacher apply the school's 5D Thinking approach?" },
        }
      },
      "1C": {
        name: "Classroom Environment & Culture",
        indicators: {
          "1C1": { name: "Physical Environment", focus: "Does the classroom communicate active Islamic identity connected to formation?" },
          "1C2": { name: "Culture of Respect and Cooperation", focus: "Do students treat each other with Islamic fraternity (ukhuwwah)?" },
          "1C3": { name: "Accountability Without Humiliation", focus: "Does accountability reflect Islamic balance of justice and rahma?" },
          "1C4": { name: "Student Voice Is Heard", focus: "Are students genuinely invited to think, question, and contribute?" },
          "1C5": { name: "Safe Space for Questions About Deen", focus: "Do students feel safe enough to raise honest questions about faith?" },
        }
      },
      "1D": {
        name: "Pastoral Awareness",
        indicators: {
          "1D1": { name: "Awareness of Student Wellbeing", focus: "Does the teacher notice the whole student (murabbi practice)?" },
          "1D2": { name: "Behaviour as Communication", focus: "Does the teacher ask what is happening for the student before consequence?" },
          "1D3": { name: "Connection to Islamic Support Frameworks", focus: "Does the teacher know and use school frameworks connected to Islamic values?" },
          "1D4": { name: "Communication with Parents", focus: "Does this teacher communicate with parents as partners in Islamic formation?" },
        }
      }
    }
  },
  F2: {
    name: "School Ethos & Culture",
    description: "If a student spends six years in this school, what will they absorb about what it means to be Muslim?",
    sections: {
      "2A": {
        name: "Leadership & Vision",
        indicators: {
          "2A1": { name: "Clarity of Islamic Vision", focus: "Is there a single, clearly articulated Islamic formation vision owned by all?" },
          "2A2": { name: "Leadership Models Islamic Character", focus: "Is Islamic character visible in how leadership actually behaves?" },
          "2A3": { name: "Tarbiyyah as Strategic Priority", focus: "Is tarbiyyah resourced, measured, and discussed alongside academic priorities?" },
          "2A4": { name: "Coherence of Programmes", focus: "Can staff explain how 5D, REAL Schools, Murabbi Project, and Islamic Studies connect?" },
          "2A5": { name: "Scholarly / Spiritual Guidance", focus: "Is there a trusted scholarly presence guiding the school's tarbiyyah direction?" },
        }
      },
      "2B": {
        name: "School Environment & Physical Culture",
        indicators: {
          "2B1": { name: "Visual Islamic Presence", focus: "Does the physical environment communicate active Islamic identity?" },
          "2B2": { name: "Sound and Rhythm of the School Day", focus: "Does the Islamic rhythm feel real or like procedural interruption?" },
          "2B3": { name: "Salah Culture", focus: "Is salah treated as formation or administration?" },
          "2B4": { name: "Language and Communication", focus: "Does school communication use Islamic language meaningfully?" },
          "2B5": { name: "Feel of Transitions and Informal Time", focus: "What do corridors, breaks, informal spaces tell you about formation?" },
        }
      },
      "2C": {
        name: "Pastoral Care & Behaviour Framework",
        indicators: {
          "2C1": { name: "Islamic Overlay on REAL Schools Framework", focus: "Does behaviour management carry Islamic soul or secular framework with Islamic words?" },
          "2C2": { name: "Root-Cause Approach to Behaviour", focus: "Is misbehaviour treated as communication or rule violation?" },
          "2C3": { name: "Student Support and Mentoring (Murabbi Culture)", focus: "Is there genuine murabbi culture across multiple adults?" },
          "2C4": { name: "Wellbeing and Mental Health Through Islamic Lens", focus: "Is wellbeing addressed through integrated Islamic and professional framework?" },
          "2C5": { name: "Inclusion and Dignity", focus: "Does the community embody active inclusion grounded in Islamic values?" },
        }
      },
      "2D": {
        name: "Staff Formation & Culture",
        indicators: {
          "2D1": { name: "Staff Islamic Formation", focus: "Are staff growing in their own Islamic formation as part of working here?" },
          "2D2": { name: "Staff as Murabbis", focus: "Do ALL staff see themselves as formative agents in Islamic development?" },
          "2D3": { name: "Teacher Knowledge of Behaviour Framework", focus: "Can all staff confidently apply frameworks and connect them to Islamic values?" },
          "2D4": { name: "Collaborative Tarbiyyah Culture Among Staff", focus: "Do staff share language and approach to Islamic formation?" },
          "2D5": { name: "Staff Wellbeing and Sense of Purpose", focus: "Do staff feel supported and part of meaningful mission, not burdened?" },
        }
      },
      "2E": {
        name: "Parent & Community Engagement",
        indicators: {
          "2E1": { name: "Parent Understanding of School's Islamic Vision", focus: "Do parents understand the school's tarbiyyah approach?" },
          "2E2": { name: "Consistency Between School and Home", focus: "Is there active alignment between school and home formation?" },
          "2E3": { name: "Parent Education and Empowerment", focus: "Does the school equip parents as formative agents?" },
          "2E4": { name: "Community Voices in School Life", focus: "Is the school embedded in wider Muslim community?" },
          "2E5": { name: "School-Parent Relationship Quality", focus: "Is the relationship warm and trust-based or transactional?" },
        }
      }
    }
  },
  F3: {
    name: "The Curriculum",
    description: "Is the Islamic curriculum producing students who know Islam, or students who are becoming Muslim?",
    sections: {
      "3A": {
        name: "Islamic Studies, Adab & Quran",
        indicators: {
          "3A1": { name: "Coherence Across Year Groups", focus: "Is there clear, sequenced Islamic knowledge framework?" },
          "3A2": { name: "Formation vs Information", focus: "Are lessons content delivery or vehicles for formation?" },
          "3A3": { name: "Adab Programme Quality and Use", focus: "Is Adab a meaningful formation tool or treated as filler?" },
          "3A4": { name: "Quran Programme - Depth Beyond Recitation", focus: "Are students developing living, reflective relationship with Quran?" },
          "3A5": { name: "Applied Islam - Practical Formation", focus: "Are students equipped to navigate modern Muslim life through Islamic lens?" },
        }
      },
      "3B": {
        name: "Islamic Integration Across General Curriculum",
        indicators: {
          "3B1": { name: "5D Framework Integration", focus: "Is tawheed-integrated teaching a reality across general curriculum?" },
          "3B2": { name: "Cross-Curricular Islamic Perspectives", focus: "Are Islamic intellectual tradition and contributions visible across subjects?" },
          "3B3": { name: "Islamic Values in Assessment and Expectations", focus: "Is academic achievement communicated within Islamic framework?" },
          "3B4": { name: "Critical Thinking Through Islamic Lens", focus: "Are students equipped to evaluate knowledge from Islamic epistemological foundation?" },
          "3B5": { name: "Connection Between Subjects and Iman", focus: "Do students experience academic learning as part of seamless Islamic worldview?" },
        }
      },
      "3C": {
        name: "Prophetic Pedagogy in Teaching Approach",
        indicators: {
          "3C1": { name: "Personalised and Contextual Teaching", focus: "Do teachers know each student's Islamic formation needs and adapt?" },
          "3C2": { name: "Questions Before Answers", focus: "Does teaching use questions to draw out wisdom, Prophetic-style?" },
          "3C3": { name: "Stories and Narrative as Formation", focus: "Is Seerah a central formation tool in curriculum?" },
          "3C4": { name: "Experiential and Reflective Learning", focus: "Is curriculum designed to create formation experiences?" },
          "3C5": { name: "Teacher as Murabbi in Curriculum Delivery", focus: "Is the murabbi role embedded in curriculum design?" },
        }
      },
      "3D": {
        name: "Student Outcomes & Minimum Nisab",
        indicators: {
          "3D1": { name: "Definition of Graduate Profile", focus: "Is there a clear, agreed profile of what an Al Siraat graduate should know and be?" },
          "3D2": { name: "Minimum Nisab Framework", focus: "Is there a defined minimum threshold being built toward?" },
          "3D3": { name: "Tracking Islamic Formation", focus: "Is there a systematic way of tracking student Islamic formation?" },
          "3D4": { name: "Student Identity and Belonging", focus: "Do graduates leave with secure, positive Muslim identity?" },
          "3D5": { name: "Student Engagement and Love of Deen", focus: "Do students show genuine love for and curiosity about their deen?" },
        }
      }
    }
  }
};

// ============================================================================
// SESSION TYPES - Each with different scan-for prompts and relevant indicators
// ============================================================================

const SESSION_TYPES = {
  classroom: {
    name: "Classroom Observation",
    icon: Eye,
    primary: ["F1"],
    secondary: ["F3B", "F3C"],
    fields: ["teacher_name", "subject", "year_group", "lesson_topic"],
    scanFor: [
      "How the lesson opened (basmala, du'a, niyyah)",
      "Tawheed/Islamic connection made to the subject content",
      "Prophetic examples or Seerah references used",
      "How a correction/disruption was handled (public vs private, tone)",
      "Peer dynamics - do students treat each other with ukhuwwah?",
      "Physical environment - walls, displays, Islamic presence",
      "Questions asked - comprehension only, or reflective?",
      "Student voice - are students thinking or just answering?",
      "Teacher's emotional regulation under pressure",
      "Moments where teacher noticed a struggling student",
      "How the lesson closed (Hamdala, du'a, reflection)",
      "Use of student names (positive vs corrective)",
      "Any safe space moment for genuine faith questions",
    ]
  },
  teacher_meeting: {
    name: "Teacher 1-on-1 Meeting",
    icon: UserCheck,
    primary: ["F2D", "F3A"],
    secondary: ["F2A", "F2C"],
    fields: ["teacher_name", "role", "years_at_school"],
    scanFor: [
      "Can they articulate the school's tarbiyyah vision in their own words?",
      "Do they describe their role as murabbi or just subject teacher?",
      "How do they connect 5D, REAL Schools, Murabbi Project, and IS?",
      "What's their own Islamic formation journey - is it supported by the school?",
      "How do they handle faith questions from students?",
      "Do they feel overwhelmed by change management fatigue?",
      "How do they communicate with parents - deficit or formation focused?",
      "Can they describe specific students' formation journeys?",
      "Islamic rationale for behaviour framework - do they have one?",
      "What Islamic content lives in their general subject (if not IS)?",
    ]
  },
  teacher_focus_group: {
    name: "Teacher Focus Group",
    icon: Users,
    primary: ["F2D"],
    secondary: ["F2A", "F2C"],
    fields: ["participants", "departments", "session_focus"],
    scanFor: [
      "Shared language across departments (or lack of it)",
      "Do different departments talk to each other about formation?",
      "Collective sense of purpose vs siloed execution",
      "How do staff describe the leadership - modelling Islamic character?",
      "Fatigue, workload, and capacity for new initiatives",
      "Which programmes feel coherent, which feel fragmented?",
      "Who do they see as the scholarly anchor (post-Mufti Asim)?",
      "How do they describe the Murabbi Project's actual reach?",
      "Do they disagree with each other in healthy ways (shura culture)?",
      "Any tension they're willing to name about the tarbiyyah agenda?",
    ]
  },
  student_focus_group: {
    name: "Student Focus Group",
    icon: Users,
    primary: ["F3D"],
    secondary: ["F1", "F2B", "F2C", "F3A", "F3B"],
    fields: ["year_group", "number_of_students", "gender_mix"],
    scanFor: [
      "Can they articulate the school's Islamic vision?",
      "Do they name teachers as murabbis? Specifically who?",
      "Do they feel known by adults beyond grades?",
      "Can they describe Islamic content in non-IS subjects?",
      "How do they describe salah at school - meaningful or procedural?",
      "Is Adab class valuable or filler to them?",
      "Do they ask faith questions openly or mask doubts?",
      "What's their relationship with the Quran - recitation only or tadabbur?",
      "Identity - confident Muslim, or torn between Muslim and Australian?",
      "Love of deen - genuine or performance for school?",
      "What do they do Islamically that the school didn't teach them?",
      "Peer culture - ukhuwwah present or just general decency?",
      "Who do they go to with a personal/faith struggle?",
    ]
  },
  leadership_meeting: {
    name: "Leadership Meeting",
    icon: Building2,
    primary: ["F2A"],
    secondary: ["F2C", "F2D", "F3D"],
    fields: ["participants", "roles", "session_focus"],
    scanFor: [
      "How is tarbiyyah vision articulated - and does everyone agree?",
      "Is tarbiyyah resourced (budget, time, accountability)?",
      "How are trade-offs made when tarbiyyah competes with academics?",
      "Who is accountable for tarbiyyah outcomes specifically?",
      "How do they understand the coherence of their programmes?",
      "What's the plan post-Mufti Asim's departure?",
      "How do they describe their relationship with staff - shura or top-down?",
      "Graduate profile - is it defined, written, operational?",
      "Minimum Nisab - how developed is their thinking?",
      "What signals genuine commitment vs aspirational language?",
    ]
  },
  environment_walk: {
    name: "Environment Walk",
    icon: Building2,
    primary: ["F2B"],
    secondary: ["F2C"],
    fields: ["areas_covered", "time_of_day"],
    scanFor: [
      "Visual Islamic presence in corridors - meaningful or decorative?",
      "Are displays current, student-generated, connected to learning?",
      "Salah - how is it conducted, atmosphere, adult presence?",
      "Transitions between classes - dhikr, adab, rhythm?",
      "Informal time - student behaviour when unsupervised",
      "Peer dynamics - visible inclusion or hierarchy?",
      "Staff presence in informal spaces - relational or supervisory?",
      "Language overheard - Islamic vocabulary natural or absent?",
      "Masjid/prayer space - treated as sacred or functional?",
      "Student self-regulation around Islamic norms without teachers",
    ]
  },
  staff_culture_review: {
    name: "Staff Culture and Wellbeing Review",
    icon: Heart,
    primary: ["F2C", "F2D"],
    secondary: ["F1D", "F2A"],
    fields: ["staff_roles", "topic_focus", "format"],
    scanFor: [
      "Do staff feel supported in managing difficult behaviour?",
      "Is the behaviour framework viewed through an Islamic lens or purely punitive?",
      "Are staff growing in their own Islamic formation?",
      "Are staff experiencing burnout, or do they feel part of a meaningful mission?",
      "How is staff wellbeing actively measured and supported?",
      "Is misbehaviour treated as communication or rule violation?",
      "Is there genuine murabbi culture across multiple adults?",
      "Do ALL staff see themselves as formative agents in Islamic development?",
      "Do staff share language and approach to Islamic formation?",
      "Does the school support staff mental health through an integrated Islamic framework?",
    ]
  },
  document_review: {
    name: "Document Review",
    icon: FileText,
    primary: ["F3A", "F3B"],
    secondary: ["F2A"],
    fields: ["document_type", "year_groups_covered", "department"],
    scanFor: [
      "Coherence and sequencing across year groups",
      "Formation intent built into lesson plans vs content-only",
      "Tadabbur presence in Quran programme docs",
      "Applied Islam content - designed or improvised?",
      "Adab scope and sequence - real progression?",
      "5D integration visible in general subject schemes of work",
      "Pastoral/murabbi hooks in lesson design",
      "Assessment criteria - Islamic framing or purely academic?",
      "Graduate profile referenced in curriculum design?",
      "Evidence of review, iteration, improvement over time",
    ]
  }
};

// ============================================================================
// CLAUDE API INTEGRATION
// ============================================================================

async function callClaude(prompt, systemPrompt = "", maxTokens = 8000) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(`API error: ${data.error.message || JSON.stringify(data.error)}`);
  }
  return data.content?.[0]?.text || "";
}

// Robust JSON extraction - handles cases where Claude wraps output in markdown,
// adds preamble, or truncates. Extracts the first valid JSON object or array.
function extractJSON(text) {
  if (!text) return null;

  // Strip markdown fences
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Find first { or [ and matching close
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let start = -1;
    let openChar, closeChar;

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

    // Find matching close by counting depth, respecting strings
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
          try { return JSON.parse(candidate); } catch (e2) { return null; }
        }
      }
    }
    return null;
  }
}

// Generate AI debrief questions based on notes and session type
async function generateDebrief(session) {
  const sessionType = SESSION_TYPES[session.type];
  const relevantIndicators = getRelevantIndicators(session.type);

  const systemPrompt = `You are an experienced consultant conducting a Tarbiyyah (Islamic education) audit at a Muslim school. Your job is to help the auditor fill gaps in their observation notes so the evidence is rich enough to make accurate scoring judgements.

You are reviewing notes from a ${sessionType.name}. Read the notes and generate 5-8 targeted gap-filling questions.

CRITICAL PRINCIPLES:
- Absence of a note is NOT evidence of absence. If the auditor didn't mention something, ask about it explicitly.
- Do not ask vague questions. Each question should map to a specific indicator.
- Acceptable answers include "this did not happen" or "I didn't observe this" - that IS evidence.
- Keep questions concrete and specific to what was or wasn't seen/heard.
- Do not ask about things already well-documented in the notes.

Indicators being assessed in this session type:
${relevantIndicators.map(i => `- ${i.code}: ${i.name} - ${i.focus}`).join('\n')}

Return ONLY a JSON array of questions in this exact format:
[
  {"indicator": "1B2", "question": "You didn't mention how the lesson opened. Was there a Bismillah or du'a? If yes, was it intentional or rushed? If no, just say so."},
  {"indicator": "1A5", "question": "..."}
]

No markdown, no preamble. Just the JSON array.`;

  const prompt = `Session Type: ${sessionType.name}
Context fields: ${JSON.stringify(session.context)}

Auditor's notes:
${session.notes}

${session.scanForNotes ? `Scan-for quick notes:\n${JSON.stringify(session.scanForNotes)}` : ''}

Generate 5-8 targeted gap-filling questions.`;

  const response = await callClaude(prompt, systemPrompt, 4000);
  const parsed = extractJSON(response);
  if (!Array.isArray(parsed)) {
    console.error("Debrief parse failed. Raw response:", response);
    throw new Error("Could not parse debrief questions. Raw response logged to console.");
  }
  return parsed;
}

// Auto-score based on notes + debrief answers
async function generateScores(session) {
  const sessionType = SESSION_TYPES[session.type];
  const relevantIndicators = getRelevantIndicators(session.type);

  const systemPrompt = `You are an experienced consultant scoring a Tarbiyyah audit session against the Roots Academy framework. You have the auditor's notes and their answers to gap-filling debrief questions.

SCORING SCALE:
1 = Absent: Element not observed at all
2 = Emerging: Briefly or unintentionally present; minimal impact
3 = Developing: Clearly present with some intentionality; inconsistent
4 = Strong: Consistent and intentional throughout; clear observable impact
5 = Embedded: Deeply embedded; students demonstrate it without prompting; culture holds without teacher driving it

CRITICAL RULES:
- Only score indicators relevant to this session type.
- If there is insufficient evidence for an indicator, mark it "N/A" not a low score. Low score = observed and absent. N/A = not assessable from this session.
- For every score, cite the specific evidence from notes or debrief. If you cannot cite evidence, mark N/A.
- Be conservative. 4 and 5 require strong positive evidence. Default is 2-3 if something is present but weak.
- Do NOT inflate scores to be generous. This is a diagnostic audit - inflated scores hurt the school.

Return ONLY valid JSON in this exact format:
{
  "scores": [
    {
      "indicator": "1A1",
      "score": 3,
      "confidence": "high",
      "evidence": "The auditor noted that the teacher used student names warmly in two instances and only raised voice once during a disruption, quickly recovering. The debrief confirmed corrections were handled quietly at the desk.",
      "reasoning": "Respectful tone in most interactions with warmth present but some inconsistency matches the Developing (3) level."
    }
  ],
  "summary": "Brief 2-3 sentence summary of this session's key findings",
  "primary_strength": "One sentence naming the strongest observed element with specific evidence",
  "priority_development": "One sentence naming the weakest area that would most benefit from development"
}

No markdown, no preamble. Just JSON.`;

  const prompt = `Session Type: ${sessionType.name}
Context: ${JSON.stringify(session.context)}

Relevant indicators to score:
${relevantIndicators.map(i => `${i.code}: ${i.name} - ${i.focus}`).join('\n')}

AUDITOR NOTES:
${session.notes}

DEBRIEF QUESTIONS AND ANSWERS:
${(session.debriefAnswers || []).map(d => `Q (${d.indicator}): ${d.question}\nA: ${d.answer}`).join('\n\n')}

Score every relevant indicator. Use N/A where evidence is genuinely insufficient.`;

  const response = await callClaude(prompt, systemPrompt, 16000);
  const parsed = extractJSON(response);
  if (!parsed || !parsed.scores) {
    console.error("Scoring parse failed. Raw response:", response);
    throw new Error("Could not parse scores. Raw response logged to browser console - check it and tell me what you see.");
  }
  return parsed;
}

// Helper: get indicators relevant to a session type
function getRelevantIndicators(sessionType) {
  const config = SESSION_TYPES[sessionType];
  const codes = [...config.primary, ...config.secondary];
  const indicators = [];

  codes.forEach(code => {
    // Handle framework-level (F1, F2, F3) vs section-level (F2A, F3B)
    if (code.length === 2) {
      const framework = FRAMEWORKS[code];
      if (framework) {
        Object.entries(framework.sections).forEach(([secCode, section]) => {
          Object.entries(section.indicators).forEach(([indCode, ind]) => {
            indicators.push({ code: indCode, name: ind.name, focus: ind.focus });
          });
        });
      }
    } else if (code.length === 3) {
      // Section-level like F2A
      const fwCode = code.substring(0, 2);
      const secCode = code.substring(1);
      const framework = FRAMEWORKS[fwCode];
      if (framework && framework.sections[secCode]) {
        Object.entries(framework.sections[secCode].indicators).forEach(([indCode, ind]) => {
          indicators.push({ code: indCode, name: ind.name, focus: ind.focus });
        });
      }
    }
  });

  // Dedupe
  const seen = new Set();
  return indicators.filter(i => {
    if (seen.has(i.code)) return false;
    seen.add(i.code);
    return true;
  });
}

// ============================================================================
// STORAGE
// ============================================================================

async function saveSessions(sessions) {
  try {
    await window.storage.set('audit_sessions', JSON.stringify(sessions));
  } catch (e) {
    console.error("Save failed:", e);
  }
}

async function loadSessions() {
  try {
    const result = await window.storage.get('audit_sessions');
    return result ? JSON.parse(result.value) : [];
  } catch (e) {
    return [];
  }
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

const Shell = ({ children }) => (
  <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
    <style>{`
      :root {
        --bg: #f5f1ea;
        --surface: #fdfbf7;
        --surface-2: #ebe4d6;
        --ink: #1a1815;
        --ink-2: #4a4640;
        --ink-3: #8a857c;
        --accent: #8b6f3a;
        --accent-2: #c2a25f;
        --green: #4a6b3d;
        --red: #9a3a2a;
        --amber: #b8742a;
        --border: #d9d0bf;
        --font-display: 'Fraunces', 'Playfair Display', Georgia, serif;
        --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
      }
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

      * { box-sizing: border-box; }
      body { margin: 0; }

      .h-display { font-family: var(--font-display); font-weight: 400; letter-spacing: -0.02em; }
      .h-serif { font-family: var(--font-display); font-weight: 500; }
      .mono { font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase; }

      .btn {
        font-family: var(--font-body);
        font-size: 0.875rem;
        font-weight: 500;
        padding: 0.625rem 1rem;
        border-radius: 4px;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--ink);
        cursor: pointer;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .btn:hover { border-color: var(--ink); }
      .btn-primary {
        background: var(--ink);
        color: var(--surface);
        border-color: var(--ink);
      }
      .btn-primary:hover { background: var(--accent); border-color: var(--accent); }
      .btn-ghost { background: transparent; border-color: transparent; }
      .btn-ghost:hover { background: var(--surface-2); }

      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 6px;
      }

      input, textarea, select {
        font-family: var(--font-body);
        font-size: 0.9375rem;
        padding: 0.625rem 0.75rem;
        border: 1px solid var(--border);
        border-radius: 4px;
        background: var(--surface);
        color: var(--ink);
        width: 100%;
      }
      input:focus, textarea:focus, select:focus { outline: none; border-color: var(--accent); }
      textarea { resize: vertical; min-height: 120px; font-family: var(--font-body); line-height: 1.6; }

      .scan-chip {
        font-size: 0.8125rem;
        padding: 0.375rem 0.625rem;
        border-radius: 20px;
        background: var(--surface-2);
        color: var(--ink-2);
        border: 1px solid transparent;
        cursor: default;
        display: inline-block;
        margin: 0.125rem;
      }

      .score-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 28px;
        padding: 0 0.5rem;
        border-radius: 14px;
        font-family: var(--font-mono);
        font-size: 0.8125rem;
        font-weight: 600;
      }
      .score-1 { background: #efdfd8; color: #7a2d1f; }
      .score-2 { background: #f0e0cf; color: #8c5016; }
      .score-3 { background: #ece5cd; color: #7a6818; }
      .score-4 { background: #dce6cf; color: #3f5a2f; }
      .score-5 { background: #c8d8bb; color: #2d4620; }
      .score-na { background: var(--surface-2); color: var(--ink-3); }

      .tab {
        padding: 0.5rem 0.875rem;
        font-size: 0.875rem;
        color: var(--ink-2);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.15s;
      }
      .tab.active { color: var(--ink); border-bottom-color: var(--accent); }
      .tab:hover { color: var(--ink); }

      .spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid var(--border);
        border-top-color: var(--accent);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      .fade-in { animation: fadeIn 0.4s ease; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    `}</style>
    {children}
  </div>
);

// ============================================================================
// HOME / DASHBOARD
// ============================================================================

const Home = ({ sessions, onNewSession, onOpenSession, onOpenLedger, onDelete }) => {
  const inProgress = sessions.filter(s => s.status !== 'complete');
  const complete = sessions.filter(s => s.status === 'complete');

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div>
          <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: '0.5rem' }}>Roots Academy · Phase 1</div>
          <h1 className="h-display" style={{ fontSize: '2.75rem', margin: 0, lineHeight: 1.1 }}>
            Tarbiyyah Audit
          </h1>
          <div style={{ color: 'var(--ink-2)', marginTop: '0.5rem', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
            Al Siraat College · Melbourne
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn" onClick={onOpenLedger}>
            <FileText size={14} /> Evidence Ledger
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 className="h-serif" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--ink-2)' }}>Begin a new session</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {Object.entries(SESSION_TYPES).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                className="card"
                onClick={() => onNewSession(key)}
                style={{
                  padding: '1.25rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: 'var(--surface)',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Icon size={18} style={{ color: 'var(--accent)', marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{config.name}</div>
                <div className="mono" style={{ color: 'var(--ink-3)', marginTop: '0.5rem' }}>
                  {config.primary.join(' · ')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {inProgress.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 className="h-serif" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--ink-2)' }}>
            In progress <span className="mono" style={{ color: 'var(--ink-3)' }}>({inProgress.length})</span>
          </h2>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {inProgress.map(s => (
              <SessionRow key={s.id} session={s} onOpen={() => onOpenSession(s.id)} onDelete={() => onDelete(s.id)} />
            ))}
          </div>
        </div>
      )}

      {complete.length > 0 && (
        <div>
          <h2 className="h-serif" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--ink-2)' }}>
            Completed <span className="mono" style={{ color: 'var(--ink-3)' }}>({complete.length})</span>
          </h2>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {complete.map(s => (
              <SessionRow key={s.id} session={s} onOpen={() => onOpenSession(s.id)} onDelete={() => onDelete(s.id)} />
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
          No sessions yet. Begin with a classroom observation or a focus group.
        </div>
      )}
    </div>
  );
};

const SessionRow = ({ session, onOpen, onDelete }) => {
  const config = SESSION_TYPES[session.type];
  const Icon = config.icon;
  const statusLabel = {
    draft: 'Draft',
    notes: 'Notes taken',
    debrief: 'Debrief pending',
    scoring: 'Scoring...',
    complete: 'Complete'
  }[session.status] || 'Draft';

  const title = session.context?.teacher_name || session.context?.session_focus || session.context?.year_group || session.context?.document_type || 'Untitled';

  return (
    <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={onOpen}>
      <Icon size={16} style={{ color: 'var(--ink-3)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{title}</div>
        <div className="mono" style={{ color: 'var(--ink-3)', marginTop: '0.25rem' }}>
          {config.name} · {new Date(session.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · {statusLabel}
        </div>
      </div>
      {session.status === 'complete' && session.scores && (
        <div className="mono" style={{ color: 'var(--ink-2)' }}>
          {session.scores.scores.filter(s => s.score !== 'N/A').length} scored
        </div>
      )}
      <button className="btn-ghost btn" onClick={e => { e.stopPropagation(); if (confirm('Delete this session?')) onDelete(); }} style={{ padding: '0.375rem' }}>
        <Trash2 size={14} style={{ color: 'var(--ink-3)' }} />
      </button>
      <ChevronRight size={16} style={{ color: 'var(--ink-3)' }} />
    </div>
  );
};

// ============================================================================
// SESSION VIEW (main work surface)
// ============================================================================

const SessionView = ({ session, onUpdate, onBack }) => {
  const [step, setStep] = useState(session.status === 'draft' ? 'context' : (session.status === 'notes' ? 'notes' : (session.status === 'debrief' ? 'debrief' : 'complete')));
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState(null);
  const config = SESSION_TYPES[session.type];

  const updateSession = (changes) => {
    const updated = { ...session, ...changes };
    onUpdate(updated);
  };

  const runDebrief = async () => {
    setError(null);
    setLoading(true);
    setLoadingMsg('Reading your notes and identifying gaps...');
    try {
      const questions = await generateDebrief(session);
      updateSession({ debriefQuestions: questions, debriefAnswers: questions.map(q => ({ ...q, answer: '' })), status: 'debrief' });
      setStep('debrief');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMsg('');
      setLoading(false);
    }
  };

  const runScoring = async () => {
    setError(null);
    setLoading(true);
    setLoadingMsg('Scoring against framework (this may take 30-60s)...');
    try {
      const result = await generateScores(session);
      updateSession({ scores: result, status: 'complete' });
      setStep('complete');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMsg('');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={14} /> All sessions
      </button>

      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: '0.5rem' }}>{config.name}</div>
        <h1 className="h-display" style={{ fontSize: '2rem', margin: 0 }}>
          {session.context?.teacher_name || session.context?.session_focus || session.context?.year_group || session.context?.document_type || 'New session'}
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <div className={`tab ${step === 'context' ? 'active' : ''}`} onClick={() => setStep('context')}>1. Context</div>
        <div className={`tab ${step === 'notes' ? 'active' : ''}`} onClick={() => setStep('notes')}>2. Notes</div>
        <div className={`tab ${step === 'debrief' ? 'active' : ''}`} onClick={() => setStep('debrief')}>3. Debrief</div>
        <div className={`tab ${step === 'complete' ? 'active' : ''}`} onClick={() => setStep('complete')}>4. Scores</div>
      </div>

      {loading && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }} />
          <div style={{ color: 'var(--ink-2)' }}>{loadingMsg}</div>
        </div>
      )}

      {error && !loading && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: '#efdfd8', borderColor: '#9a3a2a' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <AlertCircle size={18} style={{ color: '#7a2d1f', marginTop: '0.125rem' }} />
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ color: '#7a2d1f', marginBottom: '0.5rem' }}>Something went wrong</div>
              <div style={{ color: '#7a2d1f', fontSize: '0.9375rem', marginBottom: '1rem' }}>{error}</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {step === 'notes' && <button className="btn" onClick={runDebrief}>Retry debrief</button>}
                {step === 'debrief' && <button className="btn" onClick={runScoring}>Retry scoring</button>}
                <button className="btn btn-ghost" onClick={() => setError(null)}>Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && step === 'context' && (
        <ContextStep session={session} config={config} onUpdate={updateSession} onNext={() => setStep('notes')} />
      )}

      {!loading && step === 'notes' && (
        <NotesStep session={session} config={config} onUpdate={updateSession} onNext={() => { updateSession({ status: 'notes' }); runDebrief(); }} />
      )}

      {!loading && step === 'debrief' && (
        <DebriefStep session={session} onUpdate={updateSession} onNext={runScoring} />
      )}

      {!loading && step === 'complete' && session.scores && (
        <ScoresStep session={session} />
      )}
    </div>
  );
};

const ContextStep = ({ session, config, onUpdate, onNext }) => {
  const [fields, setFields] = useState(session.context || {});

  const save = () => {
    onUpdate({ context: fields });
    onNext();
  };

  const fieldLabels = {
    teacher_name: "Teacher name",
    subject: "Subject",
    year_group: "Year group",
    lesson_topic: "Lesson topic",
    role: "Role",
    years_at_school: "Years at the school",
    participants: "Participants",
    departments: "Departments",
    session_focus: "Session focus",
    number_of_students: "Number of students",
    gender_mix: "Gender mix",
    roles: "Roles",
    areas_covered: "Areas covered",
    time_of_day: "Time of day",
    document_type: "Document type",
    year_groups_covered: "Year groups covered",
    department: "Department"
  };

  return (
    <div className="fade-in">
      <div className="card" style={{ padding: '2rem' }}>
        <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: '1rem' }}>Step 1 · Context</div>
        <p style={{ color: 'var(--ink-2)', marginTop: 0, marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontStyle: 'italic' }}>
          Who, where, when. Keep it minimal.
        </p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {config.fields.map(f => (
            <div key={f}>
              <label className="mono" style={{ color: 'var(--ink-2)', display: 'block', marginBottom: '0.375rem' }}>{fieldLabels[f] || f}</label>
              <input
                value={fields[f] || ''}
                onChange={e => setFields({ ...fields, [f]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={save}>Start taking notes <ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
};

const NotesStep = ({ session, config, onUpdate, onNext }) => {
  const [notes, setNotes] = useState(session.notes || '');
  const [showScanFor, setShowScanFor] = useState(true);

  const save = () => {
    onUpdate({ notes });
  };

  useEffect(() => {
    const t = setTimeout(save, 800);
    return () => clearTimeout(t);
  }, [notes]);

  return (
    <div className="fade-in">
      {showScanFor && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div className="mono" style={{ color: 'var(--ink-2)' }}>Scan for · keep these in the back of your mind</div>
            <button className="btn btn-ghost" onClick={() => setShowScanFor(false)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Hide</button>
          </div>
          <div>
            {config.scanFor.map((item, i) => (
              <span key={i} className="scan-chip">{item}</span>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '2rem' }}>
        <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: '1rem' }}>Step 2 · Field notes</div>
        <p style={{ color: 'var(--ink-2)', marginTop: 0, marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontStyle: 'italic' }}>
          Type freely. Specific over general. Quotes where you can. The debrief will fill gaps after.
        </p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Year 9 Maths. 24 students. Teacher opened with 'okay, page 47' — no Bismillah observed. When student A struggled with question 3, teacher walked over quietly and knelt by the desk..."
          style={{ minHeight: '400px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <div className="mono" style={{ color: 'var(--ink-3)' }}>{notes.length} characters · autosaved</div>
          <button className="btn btn-primary" onClick={onNext} disabled={notes.length < 50}>
            <Sparkles size={14} /> Run debrief
          </button>
        </div>
      </div>
    </div>
  );
};

const DebriefStep = ({ session, onUpdate, onNext }) => {
  const [answers, setAnswers] = useState(session.debriefAnswers || []);

  const updateAnswer = (i, answer) => {
    const next = [...answers];
    next[i] = { ...next[i], answer };
    setAnswers(next);
    onUpdate({ debriefAnswers: next });
  };

  const allAnswered = answers.every(a => a.answer && a.answer.trim().length > 0);

  return (
    <div className="fade-in">
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: '1rem' }}>Step 3 · Gap-filling debrief</div>
        <p style={{ color: 'var(--ink-2)', marginTop: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontStyle: 'italic' }}>
          A few targeted questions to close gaps in the notes. "This didn't happen" is a valid answer and IS evidence.
        </p>
      </div>

      {answers.map((q, i) => (
        <div key={i} className="card" style={{ padding: '1.5rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span className="mono" style={{ color: 'var(--accent)', marginTop: '0.125rem' }}>{q.indicator}</span>
            <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: '1.0625rem', lineHeight: 1.5 }}>{q.question}</div>
          </div>
          <textarea
            value={q.answer || ''}
            onChange={e => updateAnswer(i, e.target.value)}
            placeholder="Your answer..."
            style={{ minHeight: '70px' }}
          />
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button className="btn btn-primary" onClick={onNext} disabled={!allAnswered}>
          <Sparkles size={14} /> Generate scores
        </button>
      </div>
    </div>
  );
};

const ScoresStep = ({ session }) => {
  const { scores, summary, primary_strength, priority_development } = session.scores;

  return (
    <div className="fade-in">
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: '1rem' }}>Session summary</div>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.6, marginTop: 0, fontFamily: 'var(--font-display)' }}>{summary}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ padding: '1rem', background: '#dce6cf', borderRadius: '4px' }}>
            <div className="mono" style={{ color: '#3f5a2f', marginBottom: '0.5rem' }}>Primary strength</div>
            <div style={{ color: '#2d4620', fontSize: '0.9375rem', lineHeight: 1.5 }}>{primary_strength}</div>
          </div>
          <div style={{ padding: '1rem', background: '#f0e0cf', borderRadius: '4px' }}>
            <div className="mono" style={{ color: '#8c5016', marginBottom: '0.5rem' }}>Priority development</div>
            <div style={{ color: '#7a2d1f', fontSize: '0.9375rem', lineHeight: 1.5 }}>{priority_development}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: '1rem' }}>Indicator scores</div>
        {scores.map((s, i) => (
          <ScoreRow key={i} score={s} />
        ))}
      </div>
    </div>
  );
};

const ScoreRow = ({ score }) => {
  const [expanded, setExpanded] = useState(false);
  const scoreClass = score.score === 'N/A' ? 'score-na' : `score-${score.score}`;

  // Find indicator name
  let indName = score.indicator;
  Object.values(FRAMEWORKS).forEach(fw => {
    Object.values(fw.sections).forEach(sec => {
      if (sec.indicators[score.indicator]) indName = sec.indicators[score.indicator].name;
    });
  });

  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '0.875rem 0', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span className={`score-pill ${scoreClass}`}>{score.score}</span>
        <span className="mono" style={{ color: 'var(--accent)', minWidth: '32px' }}>{score.indicator}</span>
        <span style={{ flex: 1, fontSize: '0.9375rem' }}>{indName}</span>
        {score.score >= 4 && score.score !== 'N/A' && (
          <AlertCircle size={14} style={{ color: 'var(--amber)' }} title="High score - review required" />
        )}
        <ChevronRight size={14} style={{ color: 'var(--ink-3)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
      </div>
      {expanded && (
        <div style={{ marginTop: '0.75rem', paddingLeft: '2.5rem', color: 'var(--ink-2)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--ink)' }}>Evidence: </strong>{score.evidence}</div>
          <div><strong style={{ color: 'var(--ink)' }}>Reasoning: </strong>{score.reasoning}</div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EVIDENCE LEDGER
// ============================================================================

const Ledger = ({ sessions, onBack }) => {
  const [filter, setFilter] = useState('');

  // Flatten all scored indicators across sessions
  const allEvidence = [];
  sessions.forEach(s => {
    if (s.scores?.scores) {
      s.scores.scores.forEach(sc => {
        allEvidence.push({
          ...sc,
          sessionId: s.id,
          sessionType: SESSION_TYPES[s.type].name,
          sessionTitle: s.context?.teacher_name || s.context?.session_focus || s.context?.year_group || 'Untitled',
          date: s.createdAt
        });
      });
    }
  });

  // Group by indicator
  const byIndicator = {};
  allEvidence.forEach(e => {
    if (!byIndicator[e.indicator]) byIndicator[e.indicator] = [];
    byIndicator[e.indicator].push(e);
  });

  // Compute averages
  const indicatorStats = Object.entries(byIndicator).map(([code, entries]) => {
    const numeric = entries.filter(e => e.score !== 'N/A');
    const avg = numeric.length > 0 ? numeric.reduce((sum, e) => sum + e.score, 0) / numeric.length : null;
    return { code, entries, avg, count: numeric.length };
  }).filter(i => filter === '' || i.code.toLowerCase().includes(filter.toLowerCase())).sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={14} /> Home
      </button>

      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <h1 className="h-display" style={{ fontSize: '2.25rem', margin: 0 }}>Evidence Ledger</h1>
        <div style={{ color: 'var(--ink-2)', marginTop: '0.5rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          {allEvidence.length} evidence items across {sessions.filter(s => s.status === 'complete').length} scored sessions
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          placeholder="Filter by indicator code (e.g. 1B, 2A3)..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      {indicatorStats.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
          Complete some sessions to populate the ledger.
        </div>
      )}

      {indicatorStats.map(stat => (
        <IndicatorCard key={stat.code} stat={stat} />
      ))}
    </div>
  );
};

const IndicatorCard = ({ stat }) => {
  const [expanded, setExpanded] = useState(false);

  // Find indicator name
  let indName = stat.code;
  Object.values(FRAMEWORKS).forEach(fw => {
    Object.values(fw.sections).forEach(sec => {
      if (sec.indicators[stat.code]) indName = sec.indicators[stat.code].name;
    });
  });

  const avgRounded = stat.avg ? Math.round(stat.avg * 10) / 10 : null;
  const scoreClass = avgRounded ? `score-${Math.round(stat.avg)}` : 'score-na';

  return (
    <div className="card" style={{ marginBottom: '0.5rem' }}>
      <div
        style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`score-pill ${scoreClass}`}>{avgRounded || 'N/A'}</span>
        <span className="mono" style={{ color: 'var(--accent)', minWidth: '40px' }}>{stat.code}</span>
        <span style={{ flex: 1, fontSize: '0.9375rem' }}>{indName}</span>
        <span className="mono" style={{ color: 'var(--ink-3)' }}>{stat.count} obs</span>
        <ChevronRight size={14} style={{ color: 'var(--ink-3)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
      </div>
      {expanded && (
        <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          {stat.entries.map((e, i) => (
            <div key={i} style={{ padding: '0.875rem 0', borderBottom: i < stat.entries.length - 1 ? '1px dashed var(--border)' : 'none' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className={`score-pill ${e.score === 'N/A' ? 'score-na' : `score-${e.score}`}`}>{e.score}</span>
                <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{e.sessionTitle}</span>
                <span className="mono" style={{ color: 'var(--ink-3)' }}>{e.sessionType}</span>
              </div>
              <div style={{ color: 'var(--ink-2)', fontSize: '0.875rem', lineHeight: 1.6, paddingLeft: '2.5rem' }}>
                {e.evidence}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ROOT APP
// ============================================================================

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [view, setView] = useState('home'); // home | session | ledger
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSessions().then(s => {
      setSessions(s || []);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveSessions(sessions);
  }, [sessions, loaded]);

  const newSession = (type) => {
    const session = {
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      status: 'draft',
      createdAt: Date.now(),
      context: {},
      notes: '',
      debriefQuestions: [],
      debriefAnswers: [],
      scores: null
    };
    setSessions([session, ...sessions]);
    setActiveSessionId(session.id);
    setView('session');
  };

  const openSession = (id) => {
    setActiveSessionId(id);
    setView('session');
  };

  const updateSession = (updated) => {
    setSessions(sessions.map(s => s.id === updated.id ? updated : s));
  };

  const deleteSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <Shell>
      {view === 'home' && (
        <Home
          sessions={sessions}
          onNewSession={newSession}
          onOpenSession={openSession}
          onOpenLedger={() => setView('ledger')}
          onDelete={deleteSession}
        />
      )}
      {view === 'session' && activeSession && (
        <SessionView
          session={activeSession}
          onUpdate={updateSession}
          onBack={() => setView('home')}
        />
      )}
      {view === 'ledger' && (
        <Ledger sessions={sessions} onBack={() => setView('home')} />
      )}
    </Shell>
  );
}
