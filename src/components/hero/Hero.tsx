import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { OrchestrationGraph } from './OrchestrationGraph';
import { DesktopAppModal } from '../desktop/DesktopAppModal';
import { Sparkles, Monitor } from 'lucide-react';

export const Hero: React.FC = () => {
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);

  return (
    <section className="relative pt-20 pb-12 sm:pt-24 sm:pb-16 lg:py-10 xl:py-14 lg:min-h-[calc(100vh-4.5rem)] lg:flex lg:flex-col lg:justify-center overflow-hidden bg-[#F6F6F3]">
      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 bg-grid-light opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 flex flex-col text-left">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-semibold text-[#6D4AFF] mb-4 sm:mb-6 w-fit shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#6D4AFF]" />
              <span>Unified Multi-AI Platform • Web &amp; Desktop</span>
            </div>

            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-[40px] xl:text-[50px] 2xl:text-[58px] font-bold tracking-tight text-[#111318] leading-[1.1] mb-4 sm:mb-6">
              Every top AI working together.<br />
              <span className="text-[#6D4AFF]">On one unified platform.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#626873] max-w-xl font-normal leading-relaxed mb-6 sm:mb-8">
              Orchestrate Claude 3.7, GPT-4o, Gemini 2.5, DeepSeek R1, and Llama 3.3 in parallel. Bring your own API keys (BYOK) or use intelligent zero-latency routing on Web and Desktop.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-6">
              <Link to="/signup" className="w-full sm:w-auto inline-flex">
                <Button size="lg" withArrow className="w-full sm:w-48 sm:min-w-[190px] h-12 justify-center text-center">
                  Start Building
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => setIsDesktopModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 h-12 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] hover:border-[#D4D4CE] text-xs sm:text-sm font-semibold text-[#111318] transition-all shadow-2xs cursor-pointer"
              >
                <Monitor className="w-4 h-4 text-[#6D4AFF]" />
                <span>Get Desktop App</span>
              </button>
            </div>

            {/* Supported Top AI APIs Badge Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#8B919B] pt-2 border-t border-[#E5E5E2]">
              <span className="text-[#111318] font-semibold font-sans">Supported APIs:</span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#E5E5E2] text-[#111318] shadow-2xs">Claude 3.7</span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#E5E5E2] text-[#111318] shadow-2xs">GPT-4o</span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#E5E5E2] text-[#111318] shadow-2xs">Gemini 2.5</span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#E5E5E2] text-[#111318] shadow-2xs">DeepSeek R1</span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#E5E5E2] text-[#111318] shadow-2xs">Llama 3.3</span>
            </div>
          </div>

          {/* Right Column: Physical System Orchestration Map */}
          <div className="lg:col-span-6 w-full">
            <OrchestrationGraph />
          </div>
        </div>
      </div>

      {/* Desktop App Installation Modal */}
      <DesktopAppModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />
    </section>
  );
};

export default Hero;
