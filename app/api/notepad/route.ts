import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const notepad = await prisma.notepad.findUnique({
      where: { id: "global" },
    });
    return NextResponse.json(notepad || { content: "" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const notepad = await prisma.notepad.upsert({
      where: { id: "global" },
      update: { content: body.content },
      create: { id: "global", content: body.content },
    });
    return NextResponse.json(notepad);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
