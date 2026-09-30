import React from 'react';
import { Hero } from '../hero/Hero';
import { SimpleHowItWorks } from '../home/SimpleHowItWorks';
import { MultiModelSwarm } from '../swarm/MultiModelSwarm';
import { EcosystemStrip } from '../ecosystem/EcosystemStrip';
import { LiveAgentPlayground } from '../home/LiveAgentPlayground';
import { WorkflowPreview } from '../workflow/WorkflowPreview';
import { ConnectorShowcase } from '../connectors/ConnectorShowcase';
import { MissionControl } from '../observability/MissionControl';
import { FinalCTA } from '../cta/FinalCTA';

export const HomePage: React.FC = () => {
  return (
    <div className="relative text-[#111318] font-sans selection:bg-[#6D4AFF]/20 selection:text-[#111318] antialiased">
      {/* 1. Claude / ChatGPT Style Hero with Live AI Studio Omnibox */}
      <Hero />

      {/* 2. How It Works in 3 Simple Steps (Crystal clear, zero jargon) */}
      <SimpleHowItWorks />

      {/* 3. Multi-Model Swarm Arena (GPT-4o + Claude + Gemini + DeepSeek Consensus) */}
      <MultiModelSwarm />

      {/* 4. Supported Developer Tools & Ecosystem Strip */}
      <EcosystemStrip />

      {/* 5. Live Interactive Agent Studio (Token streaming, code synthesis, app preview) */}
      <LiveAgentPlayground />

      {/* 6. Visual Workflow Studio Canvas (Interactive Simulation, YAML Spec, Terminal) */}
      <WorkflowPreview />

      {/* 7. Connectors Directory */}
      <ConnectorShowcase />

      {/* 8. Observability & Mission Control */}
      <MissionControl />

      {/* 9. Final Call to Action */}
      <FinalCTA />
    </div>
  );
};
