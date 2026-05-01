'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Copy, 
  Check, 
  FileText, 
  Download,
  Share2,
  Clock,
  Sparkles
} from 'lucide-react';

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#f5f0e8] text-[#1a1815] font-sans selection:bg-stitch-accent/20">
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap');
      
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
      
      .notepad-paper {
        background-color: var(--surface);
        background-image: 
          linear-gradient(var(--border) 1px, transparent 1px);
        background-size: 100% 2.5rem;
        line-height: 2.5rem;
        padding-top: 2.5rem;
        padding-bottom: 2.5rem;
      }
      
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
        transition: all 0.2s;
      }
      .btn:hover { border-color: var(--accent); background: var(--surface-2); }
      
      .btn-primary { background: var(--accent); color: white; border-color: var(--accent); }
      .btn-primary:hover { background: #18918b; border-color: #18918b; }

      @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .slide-up { animation: slideUp 0.5s ease-out forwards; }
    `}</style>
    {children}
  </div>
);

export default function Notepad() {
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [notepadId, setNotepadId] = useState<string | null>(null);
  
  const contentRef = React.useRef('');

  // Initialise unique ID and Restore from LocalStorage first
  useEffect(() => {
    const auditorName = localStorage.getItem('roots_auditor_name') || 'anonymous';
    // Create a safe, deterministic ID tied to the user's name
    const safeId = 'notepad_' + auditorName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    setNotepadId(safeId);

    // Immediate restore from local backup if available
    const backup = localStorage.getItem(`roots_notepad_backup_${safeId}`);
    if (backup) {
      setContent(backup);
      contentRef.current = backup;
    }
  }, []);

  // Fetch from DB ONLY on mount to sync across devices if needed
  useEffect(() => {
    if (notepadId) {
      const initFetch = async () => {
        try {
          const response = await fetch(`/api/notepad/${notepadId}?t=${Date.now()}`, { cache: 'no-store' });
          if (response.ok) {
            const data = await response.json();
            // Only overwrite local if remote has data and we haven't typed yet
            if (data.content && !contentRef.current) {
              setContent(data.content);
              contentRef.current = data.content;
            }
          }
        } catch (e) {}
      };
      initFetch();
    }
  }, [notepadId]);

  // Sync contentRef with state
  useEffect(() => {
    contentRef.current = content;
    if (notepadId) {
      localStorage.setItem(`roots_notepad_backup_${notepadId}`, content);
    }
  }, [content, notepadId]);

  // Auto-Save to Database (Background only)
  useEffect(() => {
    if (!isDirty || !notepadId) return;
    
    const timer = setTimeout(() => {
      saveToDatabase();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [content, isDirty, notepadId]);

  // Safe Polling (Background sync for external changes)
  useEffect(() => {
    if (!notepadId) return;

    const poll = async () => {
      // DANGER GUARD: Do not pull data if the user is actively typing or has unsaved local changes!
      if (isFocused || isDirty) return;

      try {
        const response = await fetch(`/api/notepad/${notepadId}?t=${Date.now()}`, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          // Only overwrite if the remote data has changed
          if (data.content !== undefined && data.content !== contentRef.current) {
            setContent(data.content);
            contentRef.current = data.content;
          }
        }
      } catch (e) {}
    };

    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [notepadId, isFocused, isDirty]);

  const saveToDatabase = async (overrideContent?: string) => {
    if (!notepadId) return;
    const contentToSave = overrideContent !== undefined ? overrideContent : contentRef.current;
    
    try {
      const response = await fetch(`/api/notepad/${notepadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToSave })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsDirty(false);
        if (data.updatedAt) {
          setLastSaved(new Date(data.updatedAt).toLocaleTimeString());
        }
      }
    } catch (err) {
      console.error('Database sync failed, but local copy is safe.');
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearNotepad = async () => {
    if (confirm('Are you sure you want to clear your rough notes?')) {
      setContent('');
      contentRef.current = '';
      setIsDirty(false);
      if (notepadId) {
        localStorage.removeItem(`roots_notepad_backup_${notepadId}`);
        await saveToDatabase('');
      }
    }
  };

  return (
    <Shell>
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <a href="/audit" className="btn btn-ghost mb-6 -ml-4">
              <ArrowLeft size={18} /> Back to Audit
            </a>
            <img src="/logos/Roots Logo.png" alt="Roots Academy" className="h-12 mb-4 object-contain" />
            <h1 className="h-display text-4xl text-[#2a4d5e]">Internal Notepad</h1>
            <p className="text-[#94a3b8] mt-2">A private workspace for your preliminary observations and session notes.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="mono text-[10px] text-[#8a857c]">Last Auto-Saved</div>
              <div className="text-xs font-medium flex items-center gap-2 justify-end">
                <Clock size={12} className="text-[#2a9d8f]" />
                {lastSaved || 'Never'}
              </div>
            </div>
            <button className="btn" onClick={copyToClipboard}>
              {copied ? <Check size={18} className="text-[#2a9d8f]" /> : <Copy size={18} />}
              {copied ? 'Copied' : 'Copy All'}
            </button>
            <button className="btn text-red-500 hover:bg-red-50 hover:border-red-200" onClick={clearNotepad}>
              <Trash2 size={18} />
            </button>
          </div>
        </header>

        <div className="slide-up">
          <div className="card bg-white border-none shadow-lg overflow-hidden flex flex-col min-h-[70vh]">
            <div className="bg-[#f1f5f9] px-8 py-3 border-b border-[#e2e8f0] flex justify-between items-center">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1ca8a2]/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#2a4d5e]/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>
              <div className="mono text-[10px] text-[#94a3b8] flex items-center gap-2">
                <FileText size={16} /> ROUGH_NOTES_{localStorage.getItem('roots_auditor_name')?.toUpperCase() || 'ANONYMOUS'}.TXT
              </div>
            </div>
            
            <textarea
              className="flex-1 w-full notepad-paper px-12 md:px-20 py-12 text-lg leading-[2.5rem] placeholder:text-[#cbd5e1] border-none focus:ring-0 focus:outline-none resize-none bg-transparent"
              placeholder="Start typing your rough notes here..."
              value={content}
              onChange={handleContentChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            
            <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-between items-center px-8">
              <div className="text-xs text-[#64748b] flex items-center gap-2 font-medium">
                <Sparkles size={14} className="text-[#1ca8a2]" />
                {content.split(/\s+/).filter(Boolean).length} words
              </div>
              <div className="flex gap-2">
                 <button className="btn btn-ghost text-xs" onClick={() => window.print()}>
                  <Download size={14} /> Print / Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 bg-[#2a9d8f]/5 rounded-2xl border border-[#2a9d8f]/10">
          <h3 className="h-serif text-lg mb-3 flex items-center gap-2">
             <Check size={18} className="text-[#2a9d8f]" />
             Quick Workflow
          </h3>
          <p className="text-sm text-[#4a4540] leading-relaxed">
            Many auditors find it easier to keep this notepad open on a separate tab while moving around the school. When you're ready to formalise an observation, simply <strong>Copy All</strong> and paste the contents into the 'Observation Notes' section of the Audit Tool.
          </p>
        </div>
      </div>
    </Shell>
  );
}
