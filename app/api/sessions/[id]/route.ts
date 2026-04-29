import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    // ... rest of logic remains same ...
    const data: any = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.summary !== undefined) data.summary = body.summary;
    if (body.context !== undefined) data.context = JSON.stringify(body.context);
    if (body.scanForNotes !== undefined) data.scanForNotes = JSON.stringify(body.scanForNotes);
    if (body.debriefQuestions !== undefined) data.debriefQuestions = JSON.stringify(body.debriefQuestions);
    if (body.debriefAnswers !== undefined) data.debriefAnswers = JSON.stringify(body.debriefAnswers);
    if (body.scores !== undefined) data.scores = JSON.stringify(body.scores);

    const session = await prisma.session.update({
      where: { id },
      data,
    });

    return NextResponse.json(session);
  } catch (error: any) {
    console.error("PATCH session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.session.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
