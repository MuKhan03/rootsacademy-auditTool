import { Session, SessionScore, Pattern, EvidenceItem } from '@/types';

/**
 * Aggregates all sessions into a summary format suitable for AI pattern detection.
 */
export function getLedgerSummary(sessions: Session[]) {
  const completedSessions = sessions.filter(s => s.status === 'complete');
  
  const indicatorAverages: Record<string, { sum: number; count: number }> = {};
  const sessionTypeCounts: Record<string, number> = {};
  const allEvidence: EvidenceItem[] = [];

  completedSessions.forEach(session => {
    sessionTypeCounts[session.type] = (sessionTypeCounts[session.type] || 0) + 1;
    
    if (session.scores) {
      session.scores.forEach((s: SessionScore) => {
        if (s.score !== 'N/A') {
          if (!indicatorAverages[s.indicator]) {
            indicatorAverages[s.indicator] = { sum: 0, count: 0 };
          }
          indicatorAverages[s.indicator].sum += s.score as number;
          indicatorAverages[s.indicator].count += 1;

          allEvidence.push({
            indicator: s.indicator,
            score: s.score as number,
            evidence: s.evidence,
            sessionTitle: session.context?.teacher_name || session.context?.focus_area || 'Untitled',
            sessionType: session.type
          });
        }
      });
    }
  });

  const averages: Record<string, { average: number | null; count: number }> = {};
  Object.entries(indicatorAverages).forEach(([code, data]) => {
    averages[code] = {
      average: data.sum / data.count,
      count: data.count
    };
  });

  return {
    totalSessions: completedSessions.length,
    sessionTypeCounts,
    indicatorAverages: averages,
    allEvidence
  };
}

/**
 * Detects simple rule-based candidate patterns to feed into the AI for deeper analysis.
 */
export function detectCandidatePatterns(summary: ReturnType<typeof getLedgerSummary>) {
  const candidates: any[] = [];

  // Low Average Pattern
  Object.entries(summary.indicatorAverages).forEach(([code, data]) => {
    if (data.average !== null && data.average < 2.5 && data.count >= 2) {
      candidates.push({
        rule: 'low_indicator_average',
        title: `Low average for ${code}`,
        indicators: [code],
        supportingEvidence: summary.allEvidence.filter(e => e.indicator === code)
      });
    }
  });

  // High Inconsistency Pattern
  Object.entries(summary.indicatorAverages).forEach(([code, data]) => {
    const scores = summary.allEvidence.filter(e => e.indicator === code).map(e => e.score);
    if (scores.length >= 3) {
      const max = Math.max(...scores);
      const min = Math.min(...scores);
      if (max - min >= 3) {
        candidates.push({
          rule: 'high_inconsistency',
          title: `Significant variation in ${code} across school`,
          indicators: [code],
          supportingEvidence: summary.allEvidence.filter(e => e.indicator === code)
        });
      }
    }
  });

  return candidates;
}
