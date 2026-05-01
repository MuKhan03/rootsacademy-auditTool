import { NextRequest, NextResponse } from 'next/server';
import { 
  generateDebrief, 
  generateScores, 
  generatePatterns 
} from '@/prompts';

export async function POST(req: NextRequest) {
  try {
    const { action, session, sessionType, relevantIndicators, candidatePatterns, ledgerSummary } = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: { message: 'ANTHROPIC_API_KEY is not configured.' } }, { status: 500 });
    }

    let result;
    switch (action) {
      case 'debrief':
        result = await generateDebrief(apiKey, session, sessionType, relevantIndicators);
        break;
      case 'score':
        result = await generateScores(apiKey, session, sessionType, relevantIndicators);
        break;
      case 'patterns':
        result = await generatePatterns(apiKey, candidatePatterns, ledgerSummary);
        break;
      default:
        return NextResponse.json({ error: { message: 'Invalid action.' } }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('================ AI API ERROR ================');
    console.error('Message:', error.message);
    if (error.stack) console.error('Stack:', error.stack);
    console.error('==============================================');
    return NextResponse.json({ 
      error: { message: error.message || 'An error occurred during AI processing.' } 
    }, { status: 500 });
  }
}
