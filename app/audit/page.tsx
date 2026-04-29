'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  FileText, 
  Users, 
  BookOpen, 
  Building2, 
  Eye, 
  UserCheck, 
  Plus, 
  Download, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3,
  Loader2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  ListFilter,
  Save,
  Search,
  Filter,
  Users2,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Globe,
  PieChart,
  Notebook,
  Zap,
  PlusSquare
} from 'lucide-react';
import { 
  Session, 
  SessionScore, 
  Pattern, 
  EvidenceItem,
  SessionStatus,
  IndicatorMeta,
  DebriefQuestion,
  DebriefAnswer,
  ScoringResult
} from '@/types';
import { getLedgerSummary, detectCandidatePatterns } from '@/lib/analytics';

// ============================================================================
// DATA LOADING
// ============================================================================

import frameworkData from '@/framework.json';
import sessionTypeData from '@/session_types.json';

const FRAMEWORKS: any = frameworkData.frameworks;
const SESSION_TYPES: any = sessionTypeData.sessionTypes;

// ============================================================================
// AI API CALL HELPERS
// ============================================================================

async function callAIAction(action: string, data: any) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data })
  });
  const result = await response.json();
  if (result.error) throw new Error(result.error.message);
  return result;
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#f5f0e8] text-[#1a1815] font-sans selection:bg-stitch-accent/20">
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      :root {
        --bg: #f8fafc;
        --surface: #ffffff;
        --surface-2: #f1f5f9;
        --ink: #1e293b;
        --ink-2: #475569;
        --ink-3: #94a3b8;
        --accent: #1ca8a2;
        --navy: #2a4d5e;
        --border: #e2e8f0;
        --font-sans: 'Inter', sans-serif;
      }
      
      body { font-family: var(--font-sans); background-color: var(--bg); }
      .h-display { font-family: var(--font-sans); font-weight: 700; letter-spacing: -0.02em; }
      .h-serif { font-family: var(--font-sans); font-weight: 600; }
      .mono { font-family: ui-monospace, sans-serif; font-size: 0.7rem; letter-spacing: 0.05em; text-transform: uppercase; }
      
      .btn {
        padding: 0.6rem 1.2rem;
        border-radius: 6px;
        border: 1px solid var(--border);
        background: var(--surface);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        font-weight: 500;
        font-size: 0.85rem;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .btn:hover { border-color: var(--accent); background: var(--surface-2); transform: translateY(-1px); }
      
      .btn-primary { background: var(--accent); color: white; border-color: var(--accent); }
      .btn-primary:hover { background: #18918b; border-color: #18918b; box-shadow: 0 4px 12px rgba(28, 168, 162, 0.2); }
      
      .btn-ghost { border-color: transparent; background: transparent; }
      .btn-ghost:hover { background: rgba(0,0,0,0.03); }

      .card { 
        background: var(--surface); 
        border: 1px solid var(--border); 
        border-radius: 8px; 
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
      }
      .card-hover:hover {
        border-color: var(--accent);
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
        transform: translateY(-2px);
      }
      
      input, textarea, select {
        padding: 0.7rem 0.9rem;
        border: 1px solid var(--border);
        border-radius: 6px;
        background: var(--surface);
        width: 100%;
        font-size: 0.9rem;
        color: var(--ink);
        transition: all 0.2s;
      }
      input:focus, textarea:focus { outline: none; border-color: var(--accent); ring: 2px; ring-color: rgba(28,168,162,0.1); }
      
      .score-pill {
        width: 32px; height: 32px; border-radius: 6px;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.9rem; font-weight: 600;
      }
      
      .bg-pattern {
        background-image: radial-gradient(#1ca8a2 0.5px, transparent 0.5px);
        background-size: 24px 24px;
        opacity: 0.03;
      }
      
      .indicator-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
      
      .stepper { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
      .step { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 500; color: var(--ink-3); }
      .step-active { color: var(--ink); }
      .step-done { color: var(--accent); }

      /* Animation classes */
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .fade-in { animation: fadeIn 0.4s ease forwards; }

      @media print {
        .no-print { display: none !important; }
        .Shell { background: white !important; }
        .card { border: 1px solid #eee !important; box-shadow: none !important; break-inside: avoid; }
        .max-w-6xl { max-width: 100% !important; padding: 0 !important; }
        body { background: white !important; }
      }
    `}</style>
    {children}
  </div>
);

// ============================================================================
// MAIN APPLICATION
// ============================================================================

export default function AuditTool() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [pendingSessionType, setPendingSessionType] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'session' | 'ledger' | 'dashboard'>('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiPatterns, setAiPatterns] = useState<any[]>([]);
  const [analyzingPatterns, setAnalyzingPatterns] = useState(false);
  const [remediations, setRemediations] = useState<any[]>([]);

  // Persistence & Auth
  const [currentAuditor, setCurrentAuditor] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  useEffect(() => {
    const savedName = localStorage.getItem('roots_auditor_name');
    if (!savedName) {
      window.location.href = '/';
      return;
    }
    setCurrentAuditor(savedName);
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRemediations = async () => {
    try {
      const response = await fetch('/api/remediations');
      const data = await response.json();
      if (Array.isArray(data)) {
        setRemediations(data);
      }
    } catch (err) {
      console.error('Failed to fetch remediations:', err);
    }
  };

  useEffect(() => {
    fetchRemediations();
    const interval = setInterval(fetchRemediations, 10000);
    return () => clearInterval(interval);
  }, []);

  const generateAiPatterns = async () => {
    setAnalyzingPatterns(true);
    try {
      const summary = getLedgerSummary(sessions);
      const candidates = detectCandidatePatterns(summary);
      
      const result = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'patterns', 
          candidatePatterns: candidates,
          ledgerSummary: summary
        })
      });
      
      const data = await result.json();
      if (data.patterns) {
        setAiPatterns(data.patterns);
      }
    } catch (err) {
      console.error('Core AI Analysis failed:', err);
    } finally {
      setAnalyzingPatterns(false);
    }
  };

  const saveRemediation = async (data: any) => {
    try {
      const response = await fetch('/api/remediations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        fetchRemediations();
      }
    } catch (err) {
      console.error('Failed to save remediation:', err);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const startNewSession = async (type: string) => {
    const id = Math.random().toString(36).substring(7);
    const newSession: Session = {
      id,
      type,
      status: 'draft',
      createdAt: new Date().toISOString(),
      context: {},
      notes: '',
      scanForNotes: {},
      debriefQuestions: [],
      debriefAnswers: [],
      scores: null,
      summary: '',
      auditor: currentAuditor || 'Unknown'
    };

    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setView('session');
    setError(null);

    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });
    } catch (err) {
      console.error('Failed to save new session:', err);
    }
  };

  const updateSession = async (id: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    
    try {
      await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Failed to update session:', err);
    }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this session? This cannot be undone.')) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) setView('home');
      
      try {
        await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete session:', err);
      }
    }
  };

  const getRelevantIndicators = (session: Session) => {
    const typeConfig = SESSION_TYPES[session.type];
    const allCodes = [...typeConfig.primaryIndicators, ...typeConfig.secondaryIndicators];
    
    const indicators: IndicatorMeta[] = [];
    Object.values(FRAMEWORKS).forEach((fw: any) => {
      Object.values(fw.sections).forEach((section: any) => {
        Object.entries(section.indicators).forEach(([code, data]: [string, any]) => {
          if (allCodes.includes(code)) {
            indicators.push({ code, ...data });
          }
        });
      });
    });
    return indicators;
  };

  // AI Actions
  const runDebrief = async () => {
    if (!activeSession) return;
    setLoading(true);
    setError(null);
    try {
      const typeConfig = SESSION_TYPES[activeSession.type];
      const indicators = getRelevantIndicators(activeSession);
      const result = await callAIAction('debrief', {
        session: activeSession,
        sessionType: typeConfig,
        relevantIndicators: indicators
      });
      updateSession(activeSession.id, { 
        debriefQuestions: result,
        status: 'debrief'
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runScoring = async () => {
    if (!activeSession) return;
    setLoading(true);
    setError(null);
    try {
      const typeConfig = SESSION_TYPES[activeSession.type];
      const indicators = getRelevantIndicators(activeSession);
      const result: ScoringResult = await callAIAction('score', {
        session: activeSession,
        sessionType: typeConfig,
        relevantIndicators: indicators
      });
      updateSession(activeSession.id, { 
        scores: result.scores,
        summary: result.summary,
        primary_strength: result.primary_strength,
        priority_development: result.priority_development,
        status: 'complete'
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Views
  if (view === 'home') {
    return (
      <Shell>
        <div className="max-w-6xl mx-auto p-8 lg:p-16">
          <header className="mb-16 border-b border-[#e2e8f0] pb-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern -z-10" />
            <div className="flex justify-between items-start">
              <div>
                <img src="/logos/Roots Logo.png" alt="Roots Academy" className="h-14 mb-8 object-contain" />
                <div className="mono text-[#94a3b8] mb-3">Tarbiyyah Framework v1.0</div>
                <h1 className="h-display text-5xl mb-6 text-[#2a4d5e]">Tarbiyyah Workspace</h1>
                <p className="text-[#475569] text-xl max-w-2xl leading-relaxed">
                  An internal space for capturing authentic growth and character formation through structured observation.
                </p>
                {currentAuditor && (
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#1ca8a2]">
                    <UserCheck size={16} /> Welcome back, {currentAuditor}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-4">
                <div className="flex gap-2">
                  <a href="/notepad" className="btn hover:text-[#1ca8a2] shadow-sm"><Notebook size={16} /> Rough Notepad</a>
                </div>
                <div className="flex gap-2">
                  <button className="btn text-xs" onClick={() => setView('ledger')}><ListFilter size={14} /> Evidence Ledger</button>
                  <button className="btn text-xs" onClick={() => setView('dashboard')}><BarChart3 size={14} /> Stakeholder Dashboard</button>
                </div>
              </div>
            </div>
          </header>

          <section className="mb-20">
            <h2 className="h-serif text-2xl mb-8 flex items-center gap-3 text-[#2a4d5e]">
              <div className="w-10 h-10 rounded-full bg-[#1ca8a2]/10 flex items-center justify-center">
                 <Plus size={20} className="text-[#1ca8a2]" />
              </div>
              Start New Observation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(SESSION_TYPES).map(([key, config]: [string, any]) => {
                const Icon = config.icon === 'Eye' ? Eye : config.icon === 'UserCheck' ? UserCheck : config.icon === 'Users' ? Users : Building2;
                return (
                  <button 
                    key={key} 
                    className="card card-hover p-6 text-left group flex flex-col h-full transform transition-all active:scale-95" 
                    onClick={() => setPendingSessionType(key)}
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mb-6 text-[#1ca8a2] group-hover:bg-[#1ca8a2] group-hover:text-white transition-all duration-300">
                      <Icon size={24} />
                    </div>
                    <div className="font-bold text-lg mb-2 text-[#1e293b]">{config.name}</div>
                    <p className="text-xs text-[#64748b] leading-relaxed flex-1">{config.description}</p>
                    <div className="mono text-[9px] text-[#94a3b8] mt-4 pt-4 border-t border-[#e2e8f0]">
                      Focus: {config.primaryFrameworks.join(', ')}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Pending Session Modal Overlay */}
          {pendingSessionType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm fade-in">
              <div className="card w-full max-w-2xl bg-[#fdfaf4] shadow-2xl p-0 overflow-hidden slide-up">
                <div className="h-40 bg-[#ede6d6] flex items-center justify-center relative">
                  <button 
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center hover:bg-white transition-colors"
                    onClick={() => setPendingSessionType(null)}
                  >
                    <Plus size={20} className="rotate-45" />
                  </button>
                  {(() => {
                    const cfg = SESSION_TYPES[pendingSessionType];
                    const Icon = cfg.icon === 'Eye' ? Eye : cfg.icon === 'UserCheck' ? UserCheck : cfg.icon === 'Users' ? Users : Building2;
                    return <Icon size={64} className="text-[#2a9d8f]" />;
                  })()}
                </div>
                
                <div className="p-10">
                  <div className="mono text-[#2a9d8f] mb-2">{SESSION_TYPES[pendingSessionType].name}</div>
                  <h2 className="h-display text-4xl mb-6">Initialize Observation</h2>
                  <p className="text-[#4a4540] mb-8 leading-relaxed">
                    {SESSION_TYPES[pendingSessionType].description}
                  </p>
                  
                  <div className="bg-[#ede6d6]/50 rounded-xl p-6 mb-8 border border-[#d9d0bf]/30">
                    <h3 className="mono text-[10px] text-[#8a857c] mb-3">Primary Assessment Focus</h3>
                    <div className="flex flex-wrap gap-2">
                       {SESSION_TYPES[pendingSessionType].primaryFrameworks.map((f: string) => (
                         <span key={f} className="px-2 py-1 bg-white border border-[#d9d0bf] rounded text-[10px] font-semibold">{f}</span>
                       ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      className="btn flex-1 py-4 text-lg btn-primary h-auto"
                      onClick={() => {
                        const type = pendingSessionType;
                        setPendingSessionType(null);
                        startNewSession(type);
                      }}
                    >
                      Begin Now <ChevronRight size={20} />
                    </button>
                    <button className="btn px-6" onClick={() => setPendingSessionType(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {sessions.filter(s => s.notes && s.notes.trim().length > 0 || (s.scores && s.scores.length > 0)).length > 0 && (
            <section className="fade-in">
              <div className="flex justify-between items-center mb-8">
                <h2 className="h-serif text-2xl">Recent Sessions</h2>
                <div className="mono text-[#8a857c]">{sessions.filter(s => s.notes && s.notes.trim().length > 0 || (s.scores && s.scores.length > 0)).length} total</div>
              </div>
              <div className="grid gap-3">
                {sessions.filter(s => s.notes && s.notes.trim().length > 0 || (s.scores && s.scores.length > 0)).map(s => (
                  <div 
                    key={s.id} 
                    className="card p-5 flex items-center gap-6 cursor-pointer hover:bg-[#ede6d6] transition-all group" 
                    onClick={() => { setActiveSessionId(s.id); setView('session'); }}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      s.status === 'complete' ? 'bg-[#2a9d8f]' : 
                      s.status === 'notes' || s.status === 'debrief' ? 'bg-orange-400' : 'bg-[#8a857c]'
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="font-semibold text-stitch-ink truncate">
                          {s.context?.teacher_name || s.context?.focus_area || s.context?.document_title || 'Untitled Session'}
                        </div>
                        <span className="mono text-[10px] px-2 py-0.5 bg-[#ede6d6] rounded text-[#4a4540]">
                          {SESSION_TYPES[s.type].name}
                        </span>
                      </div>
                      <div className="mono text-[10px] text-[#8a857c]">
                        {new Date(s.createdAt).toLocaleDateString()} · Status: {s.status}
                        {s.context?.subject && ` · ${s.context.subject}`}
                        {s.auditor && ` · ${s.auditor}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {s.scores && (
                        <div className="flex -space-x-2">
                          {s.scores.slice(0, 3).map((sc, i) => (
                            <div key={i} className="score-pill bg-white border border-[#d9d0bf] text-[10px]">
                              {sc.score}
                            </div>
                          ))}
                        </div>
                      )}
                      <button 
                        className="p-2 hover:text-red-500 hover:bg-white rounded-lg transition-colors opacity-0 group-hover:opacity-100" 
                        onClick={(e) => deleteSession(s.id, e)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight size={20} className="text-[#d9d0bf] group-hover:text-stitch-ink" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </Shell>
    );
  }

  if (view === 'session' && activeSession) {
    const config = SESSION_TYPES[activeSession.type];
    const Icon = config.icon === 'Eye' ? Eye : config.icon === 'UserCheck' ? UserCheck : config.icon === 'Users' ? Users : Building2;

    const renderStepContent = () => {
      switch (activeSession.status) {
        case 'draft':
        case 'notes':
          return (
            <div className="grid gap-8 fade-in">
              <div className="card p-8 bg-white border-none shadow-sm">
                <h3 className="h-serif mb-8 text-xl flex items-center gap-2">
                  <FileText size={20} className="text-[#2a9d8f]" />
                  Context & Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {config.contextFields.map((f: any) => (
                    <div key={f.key}>
                      <label className="block mono mb-3 text-[#8a857c]">
                        {f.label} {f.required && <span className="text-red-400">*</span>}
                      </label>
                      {f.type === 'textarea' ? (
                        <textarea 
                          rows={2}
                          value={activeSession.context[f.key] || ''} 
                          onChange={e => updateSession(activeSession.id, { context: { ...activeSession.context, [f.key]: e.target.value } })}
                        />
                      ) : (
                        <input 
                          type={f.type === 'number' ? 'number' : 'text'} 
                          value={activeSession.context[f.key] || ''} 
                          onChange={e => updateSession(activeSession.id, { context: { ...activeSession.context, [f.key]: e.target.value } })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-8 bg-white border-none shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="h-serif text-xl flex items-center gap-2">
                    <Sparkles size={20} className="text-[#2a9d8f]" />
                    Observation Notes
                  </h3>
                  <div className="mono text-[#8a857c]">
                    {activeSession.notes.split(/\s+/).filter(Boolean).length} words
                  </div>
                </div>
                <textarea 
                  className="w-full text-lg placeholder:text-[#d9d0bf]"
                  placeholder="Describe what you see and hear. Capture specific dialogue, classroom dynamics, and evidence of character integration..."
                  value={activeSession.notes}
                  onChange={e => {
                    const newNotes = e.target.value;
                    updateSession(activeSession.id, { 
                      notes: newNotes,
                      status: newNotes.length > 50 ? 'notes' : 'draft'
                    });
                  }}
                />
                
                <div className="mt-12 bg-[#f5f0e8] p-6 rounded-xl border border-[#d9d0bf]/30">
                  <h4 className="mono mb-6 text-[#8a857c] flex items-center gap-2">
                    <ListFilter size={14} /> Indicator Scan-For List
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {config.scanFor.map((item: string) => (
                      <div 
                        key={item} 
                        className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                          activeSession.scanForNotes[item] 
                            ? 'bg-[#2a9d8f] text-white border-[#2a9d8f]' 
                            : 'bg-white border-[#d9d0bf] text-[#4a4540] hover:border-[#2a9d8f]'
                        }`}
                        onClick={() => {
                          const val = !activeSession.scanForNotes[item];
                          updateSession(activeSession.id, { scanForNotes: { ...activeSession.scanForNotes, [item]: val } });
                        }}
                      >
                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${activeSession.scanForNotes[item] ? 'bg-white' : 'bg-[#d9d0bf]'}`} />
                        <span className="text-xs leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 p-8">
                 <button 
                  className="btn btn-primary" 
                  disabled={loading || activeSession.notes.length < 100} 
                  onClick={runDebrief}
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={18} /> Analysing Evidence...</>
                  ) : (
                    <><Sparkles size={18} /> Generate AI Debrief</>
                  )}
                </button>
              </div>
            </div>
          );

        case 'debrief':
          return (
            <div className="grid gap-8 fade-in">
              <div className="bg-[#2a9d8f]/10 p-6 rounded-xl border border-[#2a9d8f]/20 mb-4">
                <p className="text-sm text-[#1a1815]">
                  <strong>AI Analysis:</strong> Based on your notes, I've identified several indicators where the evidence is thin. Please answer these questions to provide more context before I calculate the final scores.
                </p>
              </div>

              {activeSession.debriefQuestions.map((q, idx) => (
                <div key={idx} className="card p-8 bg-white border-none shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="mono px-2 py-1 bg-[#ede6d6] rounded text-stitch-ink">Indicator {q.indicator}</div>
                    <div className="text-xs italic text-[#8a857c]">{q.rationale}</div>
                  </div>
                  <h4 className="h-serif text-lg mb-6 leading-relaxed">{q.question}</h4>
                  <textarea 
                    placeholder="Your answer..."
                    className="min-h-[100px]"
                    value={activeSession.debriefAnswers.find(a => a.indicator === q.indicator)?.answer || ''}
                    onChange={e => {
                      const answers = [...activeSession.debriefAnswers];
                      const existingIdx = answers.findIndex(a => a.indicator === q.indicator);
                      if (existingIdx >= 0) {
                        answers[existingIdx].answer = e.target.value;
                      } else {
                        answers.push({ indicator: q.indicator, question: q.question, answer: e.target.value });
                      }
                      updateSession(activeSession.id, { debriefAnswers: answers });
                    }}
                  />
                </div>
              ))}

              <div className="flex justify-between gap-4 p-8">
                <button className="btn" onClick={() => updateSession(activeSession.id, { status: 'notes' })}>
                  <Edit3 size={18} /> Edit Notes
                </button>
                <button 
                  className="btn btn-primary" 
                  disabled={loading} 
                  onClick={runScoring}
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={18} /> Scoring System...</>
                  ) : (
                    <><CheckCircle2 size={18} /> Finalise Scoring</>
                  )}
                </button>
              </div>
            </div>
          );

        case 'scoring':
        case 'complete':
          return (
            <div className="grid gap-8 fade-in">
              <div className="card p-8 bg-white border-none shadow-sm">
                <h3 className="h-serif mb-6 text-2xl">Executive Summary</h3>
                <p className="text-lg leading-relaxed text-[#4a4540]">{activeSession.summary}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                  <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                    <h4 className="mono text-green-700 mb-3 flex items-center gap-2">
                       <CheckCircle2 size={14} /> Primary Strength
                    </h4>
                    <p className="text-sm font-medium">{activeSession.primary_strength}</p>
                  </div>
                  <div className="p-6 bg-orange-50 rounded-xl border border-orange-100">
                    <h4 className="mono text-orange-700 mb-3 flex items-center gap-2">
                       <AlertCircle size={14} /> Priority Development
                    </h4>
                    <p className="text-sm font-medium">{activeSession.priority_development}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <h3 className="h-serif text-xl mb-4">Indicator Scores</h3>
                {activeSession.scores?.map((s, idx) => (
                  <div key={idx} className="card p-6 bg-white border-none shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className={`score-pill shrink-0 ${
                        s.score === 'N/A' ? 'bg-[#ede6d6] text-[#8a857c]' : 
                        s.score >= 4 ? 'bg-[#2a9d8f] text-white' : 
                        s.score >= 3 ? 'bg-orange-100 text-orange-700' : 
                        'bg-red-50 text-red-700'
                      }`}>
                        {s.score}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-3">
                          <div className="font-semibold text-lg">{s.indicator}</div>
                          <div className={`mono text-[10px] px-2 py-0.5 rounded ${
                            s.confidence === 'high' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                          }`}>
                            Confidence: {s.confidence}
                          </div>
                        </div>
                        <div className="text-sm text-[#4a4540] mb-4 p-4 bg-[#f5f0e8] rounded-lg border border-[#d9d0bf]/30">
                          <strong>Evidence:</strong> {s.evidence}
                        </div>
                        <div className="text-xs text-[#8a857c] leading-relaxed">
                          <strong>Reasoning:</strong> {s.reasoning}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 p-8">
                <button className="btn" onClick={() => updateSession(activeSession.id, { status: 'debrief' })}>
                  <ArrowLeft size={18} /> Review Debrief
                </button>
                <button className="btn btn-primary" onClick={() => setView('home')}>
                   Return to Dashboard
                </button>
              </div>
            </div>
          );
      }
    };

    return (
      <Shell>
        <div className="max-w-4xl mx-auto p-12">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <button className="btn btn-ghost" onClick={() => setView('home')}>
              <ArrowLeft size={18} /> Dashboard
            </button>
            <div className="flex items-center gap-4">
              <div className={`mono text-[10px] px-3 py-1 rounded-full ${
                activeSession.status === 'complete' ? 'bg-[#2a9d8f] text-white' : 'bg-[#ede6d6] text-stitch-ink'
              }`}>
                {activeSession.status.toUpperCase()}
              </div>
              <button 
                className="p-2 hover:bg-[#ede6d6] rounded-lg text-red-500"
                onClick={(e) => deleteSession(activeSession.id, e)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-[#ede6d6] flex items-center justify-center text-[#2a9d8f]">
              <Icon size={32} />
            </div>
            <div>
              <h2 className="h-display text-4xl mb-2">{config.name}</h2>
              <div className="flex items-center gap-4 mono text-[#8a857c]">
                <span>{new Date(activeSession.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>ID: {activeSession.id}</span>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="stepper mb-16 px-4">
            <div className={`step ${['notes', 'debrief', 'scoring', 'complete'].includes(activeSession.status) ? 'step-done' : 'step-active'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${activeSession.status !== 'draft' ? 'bg-[#2a9d8f] border-[#2a9d8f] text-white' : 'border-[#d9d0bf]'}`}>1</div>
              Notes
            </div>
            <div className="h-px bg-[#d9d0bf] flex-1" />
            <div className={`step ${['debrief', 'scoring', 'complete'].includes(activeSession.status) ? 'step-done' : activeSession.status === 'debrief' ? 'step-active' : ''}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${['debrief', 'scoring', 'complete'].includes(activeSession.status) ? 'bg-[#2a9d8f] border-[#2a9d8f] text-white' : 'border-[#d9d0bf]'}`}>2</div>
              Debrief
            </div>
            <div className="h-px bg-[#d9d0bf] flex-1" />
            <div className={`step ${activeSession.status === 'complete' ? 'step-done' : activeSession.status === 'scoring' ? 'step-active' : ''}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${activeSession.status === 'complete' ? 'bg-[#2a9d8f] border-[#2a9d8f] text-white' : 'border-[#d9d0bf]'}`}>3</div>
              Results
            </div>
          </div>

          {error && (
            <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-xl flex gap-4 text-red-700 animate-pulse">
              <AlertCircle className="shrink-0" />
              <div>
                <p className="font-semibold mb-1">Workflow Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          {renderStepContent()}
        </div>
      </Shell>
    );
  }

  // ============================================================================
  // LEDGER VIEW
  // ============================================================================

  if (view === 'ledger') {
    const summary = getLedgerSummary(sessions);
    return (
      <Shell>
        <div className="max-w-6xl mx-auto p-12">
          <header className="mb-12 flex justify-between items-end border-b border-[#d9d0bf] pb-8">
            <div>
              <button className="btn btn-ghost mb-4 -ml-4" onClick={() => setView('home')}><ArrowLeft size={16} /> Dashboard</button>
              <h1 className="h-display text-4xl">Evidence Ledger</h1>
              <p className="text-[#8a857c] mt-2">Individual evidence items across all {summary.totalSessions} completed sessions.</p>
            </div>
            <div className="flex gap-2">
              <button className="btn text-xs"><Download size={14} /> Export CSV</button>
            </div>
          </header>

          <div className="grid gap-4">
            {summary.allEvidence.length === 0 ? (
              <div className="card p-20 text-center border-dashed">
                <p className="text-[#8a857c]">No completed sessions with scores found.</p>
              </div>
            ) : (
              summary.allEvidence.map((e, idx) => (
                <div key={idx} className="card p-5 flex gap-6 items-start bg-white border-none shadow-sm fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className={`score-pill shrink-0 ${e.score >= 4 ? 'bg-[#2a9d8f] text-white' : 'bg-[#ede6d6] text-[#4a4540]'}`}>
                    {e.score}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <div className="font-semibold text-stitch-ink">Indicator {e.indicator}</div>
                      <div className="mono text-[10px] text-[#8a857c]">{e.sessionTitle} · {SESSION_TYPES[e.sessionType].name}</div>
                    </div>
                    <p className="text-sm text-[#4a4540] italic leading-relaxed">"{e.evidence}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Shell>
    );
  }

  // ============================================================================
  // DASHBOARD VIEW
  // ============================================================================

  if (view === 'dashboard') {
    const summary = getLedgerSummary(sessions);
    const candidatePatterns = detectCandidatePatterns(summary);

    return (
      <Shell>
        <div className="max-w-6xl mx-auto p-12">
          <header className="mb-12 flex justify-between items-end border-b border-[#d9d0bf] pb-8 no-print">
            <div>
              <button className="btn btn-ghost mb-4 -ml-4" onClick={() => setView('home')}><ArrowLeft size={16} /> Dashboard</button>
              <h1 className="h-display text-4xl">Stakeholder Dashboard</h1>
              <p className="text-[#8a857c] mt-2">Diagnostic overview and anonymized formation trends for school leadership.</p>
            </div>
            <div className="flex gap-3">
               <button 
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                <Download size={18} /> Generate Audit Report
              </button>
            </div>
          </header>

          <header className="hidden print:block mb-12 border-b-2 border-stitch-ink pb-8">
            <h1 className="h-display text-5xl mb-4">Diagnostic Audit Report</h1>
            <div className="flex justify-between items-center text-[#8a857c] mono">
              <div>Roots Academy · Tarbiyyah Evaluation</div>
              <div>Report Date: {new Date().toLocaleDateString()}</div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card p-6 bg-white border-none shadow-sm flex flex-col justify-center">
              <div className="mono text-[#8a857c] mb-2 flex items-center gap-2">
                <PieChart size={14} /> Total Observations
              </div>
              <div className="text-4xl h-display">{summary.totalSessions}</div>
              <div className="text-xs text-[#8a857c] mt-2">Completed & Scored</div>
            </div>
            <div className="card p-6 bg-white border-none shadow-sm flex flex-col justify-center">
              <div className="mono text-[#8a857c] mb-2 flex items-center gap-2">
                <Globe size={14} /> Framework Compliance
              </div>
              <div className="text-4xl h-display">
                {(Object.values(summary.indicatorAverages).reduce((a, b) => a + (b.average || 0), 0) / Object.values(summary.indicatorAverages).length || 0).toFixed(1)}
              </div>
              <div className="text-xs text-[#8a857c] mt-2">Average across 18 indicators</div>
            </div>
            <div className="card p-6 bg-white border-none shadow-sm flex flex-col justify-center">
              <div className="mono text-[#8a857c] mb-2 flex items-center gap-2">
                <Notebook size={14} /> Indicator Coverage
              </div>
              <div className="text-4xl h-display">{Object.keys(summary.indicatorAverages).length}/18</div>
              <div className="text-xs text-[#8a857c] mt-2">Assessed in this cycle</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="card p-8 bg-white border-none shadow-sm">
              <h2 className="h-serif text-xl mb-8 flex items-center gap-2">
                <TrendingUp size={20} className="text-[#2a9d8f]" />
                Highest Performing Indicators
              </h2>
              <div className="grid gap-4">
                {Object.entries(summary.indicatorAverages)
                  .sort((a, b) => (b[1].average || 0) - (a[1].average || 0))
                  .slice(0, 5)
                  .map(([code, data]) => (
                    <div key={code} className="flex items-center gap-4">
                      <div className="mono w-12 text-[#8a857c]">{code}</div>
                      <div className="flex-1 h-2 bg-[#ede6d6] rounded-full overflow-hidden">
                        <div className="h-full bg-[#2a9d8f]" style={{ width: `${(data.average || 0) * 20}%` }} />
                      </div>
                      <div className="font-semibold w-8 text-right">{data.average?.toFixed(1)}</div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="card p-8 bg-white border-none shadow-sm">
              <h2 className="h-serif text-xl mb-8 flex items-center gap-2">
                <TrendingDown size={20} className="text-orange-400" />
                Priority Development Areas
              </h2>
              <div className="grid gap-4">
                {Object.entries(summary.indicatorAverages)
                  .sort((a, b) => (a[1].average || 0) - (b[1].average || 0))
                  .slice(0, 5)
                  .map(([code, data]) => (
                    <div key={code} className="flex items-center gap-4">
                      <div className="mono w-12 text-[#8a857c]">{code}</div>
                      <div className="flex-1 h-2 bg-[#ede6d6] rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400" style={{ width: `${(data.average || 0) * 20}%` }} />
                      </div>
                      <div className="font-semibold w-8 text-right">{data.average?.toFixed(1)}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <section className="mb-12">
            <div className="flex justify-between items-center mb-8 no-print">
              <h2 className="h-serif text-2xl flex items-center gap-2">
                <Sparkles size={24} className="text-[#2a9d8f]" />
                Deep AI Pattern Analysis
              </h2>
              <button 
                className={`btn btn-primary no-print ${analyzingPatterns ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={generateAiPatterns}
              >
                {analyzingPatterns ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                Run Full Pattern Engine
              </button>
            </div>

            <h2 className="h-serif text-2xl mb-8 hidden print:flex items-center gap-2">
              <Sparkles size={24} className="text-[#2a9d8f]" />
              Strategic Pattern Detection
            </h2>

            <div className="grid gap-6">
              {aiPatterns.length === 0 ? (
                <div className="card p-12 text-center border-dashed">
                  <p className="text-[#8a857c]">No deep patterns generated yet. Click 'Run Full Pattern Engine' to analyze raw evidence.</p>
                  
                  {candidatePatterns.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-dashed border-[#d9d0bf] text-left">
                      <p className="mono mb-4 text-[10px] text-[#8a857c]">Draft Signals (Rule-Based):</p>
                      <div className="grid gap-2">
                        {candidatePatterns.map((p, i) => (
                          <div key={i} className="text-xs p-3 bg-white rounded border border-[#d9d0bf] flex justify-between">
                            <span>{p.title}</span>
                            <span className="mono text-[#8a857c]">{p.rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                aiPatterns.map((p, idx) => (
                  <div key={idx} className="card p-8 bg-white border-none shadow-sm fade-in">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.severity === 'high' ? 'bg-red-100 text-red-700' : 
                        p.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {p.severity} Priority · {p.type?.replace('_', ' ')}
                      </div>
                      <div className="mono text-[10px] text-[#8a857c]">Pattern Confidence: {p.tentative ? 'Tentative' : 'Validated'}</div>
                    </div>
                    
                    <h3 className="h-serif text-2xl mb-4">{p.title}</h3>
                    <p className="text-[#4a4540] leading-relaxed mb-6">{p.summary}</p>
                    
                    <div className="bg-[#f5f0e8] p-6 rounded-xl border border-[#d9d0bf]/30 mb-6">
                      <div className="mono text-[10px] text-[#8a857c] mb-4">Supporting Evidence:</div>
                      <p className="text-sm italic text-[#4a4540]">"{p.evidence}"</p>
                    </div>

                    <div className="flex justify-between items-center no-print">
                      <div className="flex gap-2">
                        {p.indicators.map((i: string) => (
                          <span key={i} className="px-2 py-1 bg-[#ede6d6] rounded text-[10px] font-medium">{i}</span>
                        ))}
                      </div>
                      <button 
                        className="btn btn-ghost text-xs text-[#2a9d8f]"
                        onClick={() => saveRemediation({
                          title: `Address: ${p.title}`,
                          rationale: p.summary,
                          impact: p.implications || "High impact on character formation",
                          feasibility: "Medium",
                          priorityRank: p.severity === 'high' ? 1 : 2,
                          linkedPatterns: [p.id]
                        })}
                      >
                        <PlusSquare size={14} /> Add to Action Plan
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="mt-20">
            <h2 className="h-serif text-2xl mb-8 flex items-center gap-2">
              <ShieldCheck size={24} className="text-[#2a9d8f]" />
              Strategic Action Plan (Remediation)
            </h2>
            
            <div className="grid gap-6">
              {remediations.length === 0 ? (
                <div className="card p-12 text-center border-dashed">
                  <p className="text-[#8a857c]">No action items defined. Use AI insights or manual entry to begin the remediation plan.</p>
                </div>
              ) : (
                remediations.map((r, idx) => (
                  <div key={idx} className="card p-8 bg-white border-none shadow-sm flex gap-8 items-start">
                    <div className="w-12 h-12 rounded-full bg-[#2a9d8f]/10 text-[#2a9d8f] flex items-center justify-center shrink-0 font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="h-serif text-xl">{r.title}</h3>
                        <div className="mono text-[10px] px-2 py-1 bg-[#ede6d6] rounded">Priority {r.priorityRank}</div>
                      </div>
                      <p className="text-sm text-[#4a4540] mb-4">{r.rationale}</p>
                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#f5f0e8]">
                        <div>
                          <div className="mono text-[10px] text-[#8a857c]">Expected Impact</div>
                          <div className="text-sm font-medium">{r.impact}</div>
                        </div>
                        <div>
                          <div className="mono text-[10px] text-[#8a857c]">Feasibility</div>
                          <div className="text-sm font-medium">{r.feasibility}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div className="card p-8 bg-[#2a9d8f]/5 border-dashed border-[#2a9d8f]/30 no-print">
                <h4 className="h-serif text-lg mb-6">Manually Add Action Item</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Action Item Title" id="r_title" className="bg-white" />
                  <input type="text" placeholder="Expected Impact" id="r_impact" className="bg-white" />
                </div>
                <textarea placeholder="Rationale..." id="r_rationale" className="w-full bg-white mb-4" rows={2} />
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const title = (document.getElementById('r_title') as HTMLInputElement).value;
                    const rationale = (document.getElementById('r_rationale') as HTMLTextAreaElement).value;
                    const impact = (document.getElementById('r_impact') as HTMLInputElement).value;
                    if (title && rationale) {
                      saveRemediation({ title, rationale, impact, feasibility: 'High', priorityRank: 3 });
                      (document.getElementById('r_title') as HTMLInputElement).value = '';
                      (document.getElementById('r_rationale') as HTMLTextAreaElement).value = '';
                      (document.getElementById('r_impact') as HTMLInputElement).value = '';
                    }
                  }}
                >
                  Save Manually
                </button>
              </div>
            </div>
          </section>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#2a9d8f]" size={48} />
      </div>
    </Shell>
  );
}
