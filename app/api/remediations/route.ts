import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const remediations = await prisma.remediation.findMany({
      orderBy: { priorityRank: 'asc' }
    });
    return NextResponse.json(remediations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const remediation = await prisma.remediation.create({
      data: {
        title: data.title,
        rationale: data.rationale,
        impact: data.impact,
        feasibility: data.feasibility,
        priorityRank: data.priorityRank || 1,
        linkedPatterns: data.linkedPatterns ? JSON.stringify(data.linkedPatterns) : null,
      }
    });
    return NextResponse.json(remediation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
