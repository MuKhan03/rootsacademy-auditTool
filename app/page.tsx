'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Notebook, ListFilter, User, ChevronRight } from 'lucide-react';

const AUDITORS = [
  "Ustadh Mohammad Al Kayani",
  "Ustadha Marium Syed",
  "MZK"
];

export default function Home() {
  const [selectedAuditor, setSelectedAuditor] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('roots_auditor_name');
    if (saved) setSelectedAuditor(saved);
    setCheckingAuth(false);
  }, []);

  const login = (name: string) => {
    localStorage.setItem('roots_auditor_name', name);
    setSelectedAuditor(name);
  };

  if (checkingAuth) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans selection:bg-[#1ca8a2]/20 relative overflow-hidden">
      {/* Background Graphic Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none -z-10 rotate-12 transform translate-x-1/4">
        <div className="text-[40rem] font-bold text-[#1ca8a2]">الروتس</div>
      </div>
      
      <main className="max-w-6xl mx-auto px-8 py-20 lg:py-32 relative">
        <div className="flex flex-col items-start gap-12 slide-up">
          <img src="/logos/Roots Logo.png" alt="Roots Academy" className="h-16 md:h-20 object-contain mb-8" />
          
          {!selectedAuditor ? (
            <div className="w-full max-w-2xl bg-white/50 backdrop-blur-md p-10 rounded-3xl border border-white shadow-2xl">
              <div className="mono text-[#1ca8a2] mb-3">Auditor Access</div>
              <h1 className="text-5xl font-bold text-[#2a4d5e] mb-8 leading-tight">Welcome, <br/>Please select your profile.</h1>
              
              <div className="grid gap-3">
                {AUDITORS.map(name => (
                  <button 
                    key={name}
                    onClick={() => login(name)}
                    className="flex justify-between items-center p-6 bg-white rounded-2xl border border-[#e2e8f0] text-lg font-medium text-[#2a4d5e] hover:border-[#1ca8a2] hover:bg-[#f8fafc] group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#1ca8a2]/10 flex items-center justify-center text-[#1ca8a2]">
                        <User size={24} />
                      </div>
                      {name}
                    </div>
                    <ChevronRight size={20} className="text-[#cbd5e1] group-hover:text-[#1ca8a2] group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
              <p className="mt-8 text-sm text-[#94a3b8] italic">
                Authentication is required to ensure observations are correctly attributed and synchronized across the team.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6 max-w-4xl">
                <div className="flex items-center gap-2 mono text-[#1ca8a2] font-semibold">
                  <User size={14} /> Signed in as {selectedAuditor}
                </div>
                <h1 className="text-7xl md:text-8xl font-bold tracking-tight text-[#2a4d5e] leading-[1.1]">
                  The Tarbiyyah <br/>
                  <span className="text-[#1ca8a2]">Workspace.</span>
                </h1>
                <p className="text-xl md:text-2xl text-[#64748b] leading-relaxed max-w-2xl">
                  An internal platform for capturing evidence and reflecting on our spiritual formation goals at Roots Academy.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <a 
                  href="/audit" 
                  className="px-10 py-5 bg-[#1ca8a2] text-white rounded-xl text-lg font-semibold hover:bg-[#18918b] transition-all hover:shadow-[0_20px_50px_-10px_rgba(28,168,162,0.4)] flex items-center gap-3 group"
                >
                  Launch Audit Tool 
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a 
                  href="/notepad" 
                  className="px-10 py-5 bg-white border border-[#e2e8f0] text-[#2a4d5e] rounded-xl text-lg font-semibold hover:bg-[#f1f5f9] transition-all flex items-center gap-3"
                >
                  <Notebook size={20} /> Rough Notepad
                </a>
                <button 
                  onClick={() => { localStorage.removeItem('roots_auditor_name'); setSelectedAuditor(null); }}
                  className="text-xs text-[#94a3b8] hover:text-red-500 underline mt-4 w-full text-left"
                >
                  Sign in as different user
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 pt-12 border-t border-[#e2e8f0] w-full">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1ca8a2]/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-[#1ca8a2]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">The Framework</h3>
                    <p className="text-sm text-[#64748b]">Aligned with the Roots Academy 18-indicator spiritual journey.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1ca8a2]/10 flex items-center justify-center shrink-0">
                    <Sparkles className="text-[#1ca8a2]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Insight Generator</h3>
                    <p className="text-sm text-[#64748b]">Refining raw observations into meaningful growth indicators.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1ca8a2]/10 flex items-center justify-center shrink-0">
                    <ListFilter className="text-[#1ca8a2]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Team Collaboration</h3>
                    <p className="text-sm text-[#64748b]">A shared repository of observations to support school-wide growth.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-8 py-12 text-[#94a3b8] text-xs mono flex justify-between items-center">
        <div>© 2026 ROOTS ACADEMY · ALL RIGHTS RESERVED</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#1ca8a2]">FRAMEWORK</a>
          <a href="#" className="hover:text-[#1ca8a2]">DOCUMENTATION</a>
          <a href="#" className="hover:text-[#1ca8a2]">SUPPORT</a>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-up {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
