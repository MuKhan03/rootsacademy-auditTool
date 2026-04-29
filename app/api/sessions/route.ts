import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // Parse JSON strings back to objects
    const parsedSessions = sessions.map((s: any) => ({
      ...s,
      context: s.context ? JSON.parse(s.context) : {},
      scanForNotes: s.scanForNotes ? JSON.parse(s.scanForNotes) : {},
      debriefQuestions: s.debriefQuestions ? JSON.parse(s.debriefQuestions) : [],
      debriefAnswers: s.debriefAnswers ? JSON.parse(s.debriefAnswers) : [],
      scores: s.scores ? JSON.parse(s.scores) : null,
    }));

    return NextResponse.json(parsedSessions);
  } catch (error: any) {
    console.error("GET sessions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const session = await prisma.session.create({
      data: {
        id: body.id,
        type: body.type,
        status: body.status,
        auditor: body.auditor,
        notes: body.notes || "",
        context: JSON.stringify(body.context || {}),
        scanForNotes: JSON.stringify(body.scanForNotes || {}),
        debriefQuestions: JSON.stringify(body.debriefQuestions || []),
        debriefAnswers: JSON.stringify(body.debriefAnswers || []),
        scores: body.scores ? JSON.stringify(body.scores) : null,
        summary: body.summary || "",
      },
    });

    return NextResponse.json(session);
  } catch (error: any) {
    console.error("POST session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
