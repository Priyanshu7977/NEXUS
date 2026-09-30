import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, ShieldCheck, Cpu, Code2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { NexusAppWindow } from './NexusAppWindow';
import { DesktopAppModal } from '../desktop/DesktopAppModal';

export const Hero: React.FC = () => {
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);

  return (
    <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-18 lg:pt-32 lg:pb-24 overflow-hidden bg-gradient-to-b from-[#F6F6F3] via-white to-[#FAFAF8] text-[#111318]">
      <div className="max-w-7xl mx-auto w-full relative z-10 px-4 sm:px-6 lg:px-8 text-center">
        {/* Human, Humble Product Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E2] text-xs font-semibold text-[#111318] mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>NEXUS v3.2 · Native Multi-AI Workspace for Web &amp; Desktop</span>
        </div>

        {/* Confident, Human Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111318] leading-[1.08] mb-5 max-w-4xl mx-auto">
          Stop switching AI tabs.<br />
          <span className="text-[#6D4AFF]">Every frontier model in one codebase.</span>
        </h1>

        {/* Clear, Honest Human Subhead */}
        <p className="text-base sm:text-lg lg:text-xl text-[#626873] max-w-2xl mx-auto leading-relaxed mb-8">
          Claude 3.7 for system architecture. GPT-4o for fast implementation. DeepSeek-R1 for security verification. NEXUS lets top models collaborate directly on your local files with zero context switching.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
          <Link to="/signup">
            <Button size="lg" withArrow className="h-12 px-7 text-sm font-semibold shadow-md shadow-[#6D4AFF]/20">
              Start Building Free
            </Button>
          </Link>

          <button
            type="button"
            onClick={() => setIsDesktopModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] hover:border-[#D4D4CE] text-sm font-semibold text-[#111318] transition-all shadow-xs cursor-pointer"
          >
            <Monitor className="w-4 h-4 text-[#6D4AFF]" />
            <span>Download Desktop App</span>
          </button>
        </div>

        {/* Human-Crafted Hero Workspace Stage */}
        <div className="mb-12">
          <NexusAppWindow />
        </div>

        {/* Key Product Principles (Human-Crafted) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
          <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#111318] font-bold text-sm">
              <Cpu className="w-4 h-4 text-[#6D4AFF]" />
              <span>Multi-Model Consensus</span>
            </div>
            <p className="text-xs text-[#626873] leading-relaxed">
              Models cross-audit diffs before you commit. Claude proposes architecture, GPT writes code, and DeepSeek verifies security proofs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#111318] font-bold text-sm">
              <Code2 className="w-4 h-4 text-blue-600" />
              <span>Real Git &amp; Local Files</span>
            </div>
            <p className="text-xs text-[#626873] leading-relaxed">
              Not a closed chat box. NEXUS reads your local project tree, runs tests in your terminal, and produces reviewable git diffs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#111318] font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Private &amp; BYOK by Default</span>
            </div>
            <p className="text-xs text-[#626873] leading-relaxed">
              Your API keys remain encrypted on your local device. We never mark up inference costs or store your proprietary code.
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
