import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Terminal, Copy, Check, Sparkles, Monitor } from 'lucide-react';
import { DesktopAppModal } from '../desktop/DesktopAppModal';

export const FinalCTA: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const command = 'npx create-nexus-app@latest';

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="final-cta" className="relative py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#F6F6F3]">
      <div className="max-w-6xl mx-auto">
        {/* Elegant Light Elevated CTA Box with Subtle Lavender/Indigo Radiance */}
        <div className="relative rounded-3xl bg-gradient-to-br from-white via-[#FAF5FF] to-[#F3EEFF] text-[#111318] p-8 sm:p-12 lg:p-16 border border-[#E2D9FF] shadow-[0_20px_50px_rgba(109,74,255,0.08)] overflow-hidden text-center">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(109,74,255,0.12),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 text-xs font-mono font-semibold text-[#6D4AFF] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#6D4AFF]" />
              <span>THE FRONTIER AI ORCHESTRATION PLATFORM</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111318] leading-[1.08] mb-6">
              Build the system<br />
              your agents deserve.
            </h2>

            <p className="text-base sm:text-lg text-[#626873] max-w-xl mx-auto mb-10 font-normal leading-relaxed">
              Connect your tools. Compose your agents. Turn complex engineering tasks into deterministic workflows with human-in-the-loop verification.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 mb-10 max-w-md sm:max-w-none mx-auto">
              <Link to="/signup" className="w-full sm:w-auto inline-flex">
                <Button size="lg" withArrow className="w-full sm:w-48 sm:min-w-[190px] h-12 justify-center text-center shadow-lg shadow-[#6D4AFF]/25">
                  Start Building Free
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => setIsDesktopOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#D4D4CE] text-xs sm:text-sm font-semibold text-[#111318] hover:text-[#6D4AFF] transition-all shadow-xs cursor-pointer"
              >
                <Monitor className="w-4 h-4 text-[#6D4AFF]" />
                <span>Get Desktop App</span>
              </button>
            </div>

            {/* CLI Snippet */}
            <div className="inline-flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-[#E5E5E2] text-[11px] sm:text-xs font-mono text-[#626873] shadow-xs max-w-full overflow-x-auto">
              <Terminal className="w-3.5 h-3.5 text-[#6D4AFF] shrink-0" />
              <span className="text-[#111318] font-semibold truncate">{command}</span>
              <button
                onClick={handleCopy}
                className="p-1 hover:text-[#111318] transition-colors rounded hover:bg-black/[0.04] cursor-pointer ml-1"
                title="Copy command"
              >
                {copied ? (
                  <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-semibold">
                    <Check className="w-3.5 h-3.5" /> Copied
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop App Modal */}
      <DesktopAppModal
        isOpen={isDesktopOpen}
        onClose={() => setIsDesktopOpen(false)}
      />
    </section>
  );
};
