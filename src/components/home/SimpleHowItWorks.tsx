import React from 'react';
import { MessageSquare, Users, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { Link } from 'react-router-dom';

export const SimpleHowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Enter One Simple Prompt',
      subtitle: 'No complex setup or engineering jargon',
      description:
        'Just describe what you want to build in plain English — a web app, a backend API, a database migration, or a bug fix. NEXUS automatically analyzes your request and assigns the right AI models to the job.',
      badge: 'Step 1 · The Prompt',
      icon: MessageSquare,
      accentColor: 'text-[#6D4AFF]',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      preview: (
        <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-2xs space-y-2.5 text-left font-mono text-xs">
          <div className="flex items-center gap-2 text-[#8B919B] text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#6D4AFF]" />
            <span>Your Natural Language Prompt</span>
          </div>
          <div className="p-3 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] text-[#111318] font-sans font-medium text-xs leading-relaxed">
            &quot;Build a full-stack Next.js app with Supabase authentication, user workspaces, and automated security checks.&quot;
          </div>
          <div className="flex items-center gap-2 text-[10px] text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Parsed by NEXUS Orchestrator in 18ms</span>
          </div>
        </div>
      ),
    },
    {
      number: '02',
      title: 'Top AIs Work as Your Team',
      subtitle: 'Claude, GPT-4o & DeepSeek collaborate',
      description:
        'Instead of using one model that makes mistakes, NEXUS runs the best models together. Claude designs the structure, GPT-4o synthesizes type-safe code, and DeepSeek verifies security to prevent bugs.',
      badge: 'Step 2 · Multi-AI Collaboration',
      icon: Users,
      accentColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      preview: (
        <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-2xs space-y-2 text-left text-xs font-mono">
          <div className="flex items-center justify-between text-[#8B919B] text-[11px] pb-1.5 border-b border-[#EFEFEA]">
            <span>Active Team Collaboration</span>
            <span className="text-emerald-700 font-bold">3 Models in Sync</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrandLogo brand="anthropic" size={14} />
              <span className="text-[#111318] font-medium font-sans">Claude 3.7: Architect</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">Planned</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrandLogo brand="openai" size={14} />
              <span className="text-[#111318] font-medium font-sans">GPT-4o: Code Generator</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">Generated</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrandLogo brand="deepseek" size={14} />
              <span className="text-[#111318] font-medium font-sans">DeepSeek-R1: Security</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">Verified</span>
          </div>
        </div>
      ),
    },
    {
      number: '03',
      title: 'Preview, Copy & 1-Click Deploy',
      subtitle: 'Instant working code with zero lock-in',
      description:
        'Test your newly created application right inside the browser. Copy the clean TypeScript code, download project files, or deploy straight to Vercel and your cloud infrastructure in seconds.',
      badge: 'Step 3 · Instant Results',
      icon: Rocket,
      accentColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      preview: (
        <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-2xs space-y-2.5 text-left text-xs">
          <div className="flex items-center justify-between text-[#8B919B] font-mono text-[11px] pb-1.5 border-b border-[#EFEFEA]">
            <span>Deployment Ready</span>
            <span className="text-emerald-700 font-bold">HTTP 200 OK</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-emerald-950 font-sans">0 Errors · Tests Passed</span>
            </div>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800 font-bold">
              VERIFIED
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Link
              to="/signup"
              className="flex-1 text-center py-2 px-3 rounded-lg bg-[#6D4AFF] hover:bg-[#5E3CE6] text-white font-semibold text-xs transition-colors"
            >
              Start Free Trial →
            </Link>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#F6F6F3] border-t border-[#E5E5E2] text-left">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mb-12 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-mono font-semibold text-[#6D4AFF] mb-3">
            <span>HOW NEXUS WORKS</span>
            <span>•</span>
            <span>THREE SIMPLE STEPS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111318] leading-[1.1] mb-4">
            How anyone can build with NEXUS.
          </h2>
          <p className="text-base sm:text-lg text-[#626873] leading-relaxed">
            You don&apos;t need to be a prompt engineer or manage complex cloud pipelines. Just ask for what you need, and NEXUS coordinates the world&apos;s best AI models to deliver production-ready software.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.number}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between hover:border-[#D4D4CE] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-[#8B919B] tracking-wider">
                      STEP {st.number}
                    </span>
                    <div className={`w-8 h-8 rounded-xl ${st.bgColor} ${st.borderColor} border flex items-center justify-center ${st.accentColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#111318] mb-1 leading-snug">
                    {st.title}
                  </h3>
                  <p className="text-xs font-medium text-[#6D4AFF] mb-3">
                    {st.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-[#626873] leading-relaxed mb-6">
                    {st.description}
                  </p>
                </div>

                <div>
                  <div className="pt-2 border-t border-[#EFEFEA]">{st.preview}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassurance Banner */}
        <div className="mt-8 p-4 rounded-2xl bg-white border border-[#E5E5E2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#626873]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-[#111318]">Works with free accounts, standard API keys (BYOK), or native desktop apps.</span>
          </div>
          <Link
            to="/explore"
            className="text-[#6D4AFF] hover:text-[#5E3CE6] font-semibold inline-flex items-center gap-1 transition-colors"
          >
            <span>Explore 20+ Pre-Configured Templates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
