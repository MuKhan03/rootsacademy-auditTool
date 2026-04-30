import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notepad = await prisma.notepad.findUnique({
      where: { id },
    });
    return NextResponse.json(notepad || { content: "" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const notepad = await prisma.notepad.upsert({
      where: { id },
      update: { content: body.content },
      create: { id, content: body.content },
    });
    return NextResponse.json(notepad);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
