import React from 'react';
import { Hero } from '../hero/Hero';
import { LiveAgentPlayground } from '../home/LiveAgentPlayground';
import { MultiModelSwarm } from '../swarm/MultiModelSwarm';
import { EcosystemStrip } from '../ecosystem/EcosystemStrip';
import { PlatformOverviewSection } from '../home/PlatformOverviewSection';
import { WorkflowPreview } from '../workflow/WorkflowPreview';
import { ConnectorShowcase } from '../connectors/ConnectorShowcase';
import { MissionControl } from '../observability/MissionControl';
import { FinalCTA } from '../cta/FinalCTA';

export const HomePage: React.FC = () => {
  return (
    <div className="relative text-[#111318] font-sans selection:bg-[#6D4AFF]/20 selection:text-[#111318] antialiased">
      {/* 1. Hero & Physical System Orchestration Map */}
      <Hero />

      {/* 2. Flagship Interactive AI Agent Studio (Live token streaming, code generation, UI preview) */}
      <LiveAgentPlayground />

      {/* 3. Industry First: Multi-Model Swarm Arena (GPT-4o + Claude 3.5 + Gemini + DeepSeek Consensus) */}
      <MultiModelSwarm />

      {/* 4. Connected Developer Stack - Ecosystem Strip */}
      <EcosystemStrip />

      {/* 5. End-to-End Application Overview (BYOK Vault, MCP Mesh, DAG Engine, Human Approval) */}
      <PlatformOverviewSection />

      {/* 6. Visual Workflow Studio Canvas (Interactive Simulation, YAML Spec, Terminal Logs) */}
      <WorkflowPreview />

      {/* 7. Connector Ecosystem Directory */}
      <ConnectorShowcase />

      {/* 8. Structured Execution Observability */}
      <MissionControl />

      {/* 9. Final Call to Action */}
      <FinalCTA />
    </div>
  );
};
