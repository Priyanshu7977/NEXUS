import React from 'react';
import { Hero } from '../hero/Hero';
import { SimpleHowItWorks } from '../home/SimpleHowItWorks';
import { OnePromptAppStudio } from '../studio/OnePromptAppStudio';
import { MultiModelSwarm } from '../swarm/MultiModelSwarm';
import { EcosystemStrip } from '../ecosystem/EcosystemStrip';
import { WorkflowPreview } from '../workflow/WorkflowPreview';
import { ConnectorShowcase } from '../connectors/ConnectorShowcase';
import { FinalCTA } from '../cta/FinalCTA';

export const HomePage: React.FC = () => {
  return (
    <div className="relative text-[#111318] font-sans selection:bg-[#6D4AFF]/20 selection:text-[#111318] antialiased">
      {/* 1. Human-Crafted Hero with Realistic NexusAppWindow Product Workspace */}
      <Hero />

      {/* 2. Three Simple Steps: How NEXUS Works (No Jargon) */}
      <SimpleHowItWorks />

      {/* 3. Flagship Interactive Multi-AI Studio: One Prompt, Connect All, Live Directives */}
      <section id="studio" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <OnePromptAppStudio embedded onNavigateToFull={() => window.location.href = '/studio'} />
      </section>

      {/* 4. The Multi-Model Swarm Arena (Single Premier Interactive Debate Showcase) */}
      <MultiModelSwarm />

      {/* 4. Supported Developer Tools & Ecosystem Strip */}
      <EcosystemStrip />

      {/* 5. Visual Workflow Studio Canvas (DAG Pipelines & YAML Spec) */}
      <WorkflowPreview />

      {/* 6. Connector Integrations Directory */}
      <ConnectorShowcase />

      {/* 7. Clean, Human Call to Action */}
      <FinalCTA />
    </div>
  );
};
