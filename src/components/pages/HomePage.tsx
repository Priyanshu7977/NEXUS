import React from 'react';
import { Hero } from '../hero/Hero';
import { PlatformOverviewSection } from '../home/PlatformOverviewSection';
import { MultiAiShowcase } from '../collaboration/MultiAiShowcase';
import { EcosystemStrip } from '../ecosystem/EcosystemStrip';
import { FeatureGrid } from '../features/FeatureGrid';
import { ConnectorShowcase } from '../connectors/ConnectorShowcase';
import { AgentCollaboration } from '../collaboration/AgentCollaboration';
import { WorkflowPreview } from '../workflow/WorkflowPreview';
import { MissionControl } from '../observability/MissionControl';
import { FinalCTA } from '../cta/FinalCTA';

export const HomePage: React.FC = () => {
  return (
    <div className="relative text-[#111318] font-sans selection:bg-[#6D4AFF]/20 selection:text-[#111318] antialiased">
      {/* 1. Hero & Physical System Orchestration Map */}
      <Hero />

      {/* 2. End-to-End Application Overview (How to use NEXUS) */}
      <PlatformOverviewSection />

      {/* 3. Top AI APIs Working Together (Claude, OpenAI, DeepSeek, Gemini, Llama) */}
      <MultiAiShowcase />

      {/* 4. Bring the tools you already use - Ecosystem Strip */}
      <EcosystemStrip />

      {/* 3. One system. Every agent. - Left-Right Editorial Flow */}
      <FeatureGrid />

      {/* 4. Agent Collaboration - Visual Parallel Execution Timeline */}
      <AgentCollaboration />

      {/* 5. Strategic Dark: Visual Workflow Studio Preview */}
      <WorkflowPreview />

      {/* 6. Connector Ecosystem Directory */}
      <ConnectorShowcase />

      {/* 7. Structured Execution Observability */}
      <MissionControl />

      {/* 8. Strategic Dark Box: Final Call to Action */}
      <FinalCTA />
    </div>
  );
};
