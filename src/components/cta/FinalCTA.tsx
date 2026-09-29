import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Terminal, Copy, Check } from 'lucide-react';
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
        {/* Dark Elevated CTA Box for Strategic Visual Rhythm */}
        <div className="relative rounded-3xl bg-[#111318] text-white p-8 sm:p-12 lg:p-16 border border-[#22262F] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden text-center">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(109,74,255,0.15),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08] mb-6">
              Build the system<br />
              your agents deserve.
            </h2>

            <p className="text-base sm:text-lg text-[#9BA3AF] max-w-xl mx-auto mb-10 font-normal leading-relaxed">
              Connect your tools. Compose your agents. Turn complex engineering tasks into deterministic workflows.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 mb-10 max-w-md sm:max-w-none mx-auto">
              <Link to="/signup" className="w-full sm:w-auto inline-flex">
                <Button size="lg" withArrow className="w-full sm:w-48 sm:min-w-[190px] h-12 justify-center text-center">
                  Start Building Free
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => setIsDesktopOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs sm:text-sm font-semibold text-white transition-all shadow-sm cursor-pointer"
              >
                <span>Get Desktop App</span>
              </button>
            </div>

            {/* CLI Snippet */}
            <div className="inline-flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#181A21] border border-white/10 text-[11px] sm:text-xs font-mono text-[#9BA3AF] shadow-sm max-w-full overflow-x-auto">
              <Terminal className="w-3.5 h-3.5 text-[#6D4AFF] shrink-0" />
              <span className="text-white truncate">{command}</span>
              <button
                onClick={handleCopy}
                className="p-1 hover:text-white transition-colors rounded hover:bg-white/5 cursor-pointer ml-1"
                title="Copy command"
              >
                {copied ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
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
