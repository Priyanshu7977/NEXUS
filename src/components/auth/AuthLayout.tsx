import React from 'react';
import { Link } from 'react-router-dom';
import { NexusLogo } from '../layout/Navbar';
import { Cpu, ShieldCheck, Layers } from 'lucide-react';

export const AuthLayout: React.FC<{ children: React.ReactNode; quote?: string }> = ({
  children,
  quote = 'Connect every agent. Make them work together.'
}) => {
  return (
    <div className="min-h-screen w-full bg-[#F6F6F3] text-[#111318] flex flex-col justify-between selection:bg-[#6D4AFF]/20">
      {/* Top Header */}
      <header className="p-6 sm:p-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D4AFF] rounded-lg">
          <NexusLogo />
        </Link>
        <Link
          to="/"
          className="text-xs text-[#626873] hover:text-[#111318] transition-colors bg-white hover:bg-[#FAFAF8] px-3.5 py-1.5 rounded-lg border border-[#E5E5E2] shadow-sm"
        >
          ← Back to homepage
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Column: Editorial Narrative (Desktop) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center text-left">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111318] leading-[1.1] mb-6">
              {quote}
            </h1>

            <p className="text-base text-[#626873] leading-relaxed mb-8">
              NEXUS gives autonomous agents the context, tools, and permission boundaries they need to collaborate across your existing developer systems.
            </p>

            <div className="flex flex-col gap-3.5 pt-6 border-t border-[#E5E5E2]">
              <div className="flex items-center gap-3 text-xs text-[#626873]">
                <div className="p-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#6D4AFF]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span>Universal connector architecture</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#626873]">
                <div className="p-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#3B82F6]">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span>Sequential & parallel agent workflow DAGs</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#626873]">
                <div className="p-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#10B981]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Full execution visibility and audit traces</span>
              </div>
            </div>
          </div>

          {/* Right Column: Crisp White Auth Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md p-7 sm:p-9 rounded-2xl bg-white border border-[#E5E5E2] shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[#8B919B]">
        © 2026 NEXUS. Built for developers.
      </footer>
    </div>
  );
};
