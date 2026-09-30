import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, ShieldCheck, Database, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { OnePromptAppStudio } from '../studio/OnePromptAppStudio';
import { DesktopAppModal } from '../desktop/DesktopAppModal';

export const Hero: React.FC = () => {
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);

  return (
    <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-18 lg:pt-32 lg:pb-24 overflow-hidden bg-gradient-to-b from-[#F8F9FA] via-white to-[#F8F9FA] text-[#0F172A]">
      <div className="max-w-7xl mx-auto w-full relative z-10 px-4 sm:px-6 lg:px-8 text-center">
        {/* Human, Friendly Product Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 mb-6 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>NEXUS · Talk to Supabase, Claude &amp; GPT-4o in One Place</span>
        </div>

        {/* Confident, Crystal Clear Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08] mb-5 max-w-4xl mx-auto">
          Work with all your AI in one prompt.<br />
          <span className="text-[#6D4AFF]">Supabase for DB. Claude for UI.</span>
        </h1>

        {/* Clear, Honest Human Subhead */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Tell <strong>Supabase</strong> to start working on the database via API, tell <strong>Claude</strong> to design the UI/UX frontend, and tell <strong>GPT-4o</strong> to wire backend server actions—all collaborating in one application.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <Link to="/signup">
            <Button size="lg" withArrow className="h-12 px-7 text-sm font-bold shadow-md shadow-[#6D4AFF]/25">
              Start Building Free
            </Button>
          </Link>

          <button
            type="button"
            onClick={() => setIsDesktopModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-sm font-bold text-slate-800 transition-all shadow-xs cursor-pointer"
          >
            <Monitor className="w-4 h-4 text-[#6D4AFF]" />
            <span>Download Desktop App</span>
          </button>
        </div>

        {/* Ultra-Friendly AI Studio (Consumer-Grade like Claude & ChatGPT) */}
        <div className="mb-14 text-left">
          <OnePromptAppStudio embedded onNavigateToFull={() => window.location.href = '/studio'} />
        </div>

        {/* Key Product Principles (Human-Crafted) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
              <Sparkles className="w-5 h-5 text-[#6D4AFF]" />
              <span>Claude for Frontend &amp; UI</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Claude designs responsive product layouts, cart drawers, and high-contrast dark/light styling live in the preview.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
              <Database className="w-5 h-5 text-emerald-600" />
              <span>Supabase for PostgreSQL Database</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Supabase generates tables, columns, constraints, and Row-Level Security policies via API without writing manual migrations.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Private &amp; BYOK by Default</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your API keys remain encrypted on your device. We never mark up inference costs or store your proprietary database records.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop App Modal */}
      <DesktopAppModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />
    </section>
  );
};

export default Hero;
