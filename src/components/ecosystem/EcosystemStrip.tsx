import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../brand/BrandLogo';

interface BrandItem {
  id: string;
  name: string;
  category: string;
}

export const EcosystemStrip: React.FC = () => {
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);

  const brands: BrandItem[] = [
    { id: 'github', name: 'GitHub', category: 'DevOps & Repos' },
    { id: 'vercel', name: 'Vercel', category: 'Deployment' },
    { id: 'openai', name: 'OpenAI', category: 'LLM Engine' },
    { id: 'gemini', name: 'Google Gemini', category: 'Multimodal AI' },
    { id: 'anthropic', name: 'Anthropic Claude', category: 'Reasoning AI' },
    { id: 'supabase', name: 'Supabase', category: 'PostgreSQL & Auth' },
    { id: 'mongodb', name: 'MongoDB', category: 'Document Database' },
    { id: 'postgresql', name: 'PostgreSQL', category: 'Relational DB' },
    { id: 'slack', name: 'Slack', category: 'Team Dispatch' },
    { id: 'notion', name: 'Notion', category: 'Knowledge Base' },
    { id: 'shopify', name: 'Shopify', category: 'E-commerce API' },
    { id: 'docker', name: 'Docker', category: 'Container Sandbox' },
  ];

  return (
    <section className="relative py-14 sm:py-18 border-y border-[#E5E5E2] bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B919B]">
            Bring the tools you already use
          </h2>
        </div>

        {/* Clean Logo Wall */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4 max-w-5xl mx-auto items-stretch">
          {brands.map((b) => {
            const isHovered = hoveredBrand === b.id;
            return (
              <Link
                key={b.id}
                to={`/explore?tab=connectors&q=${encodeURIComponent(b.name)}`}
                onMouseEnter={() => setHoveredBrand(b.id)}
                onMouseLeave={() => setHoveredBrand(null)}
                aria-label={`Explore ${b.name} Connector`}
                className={`h-full min-h-[80px] sm:min-h-[96px] p-2 sm:p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer min-w-0 block ${
                  isHovered
                    ? 'bg-white border-[#6D4AFF]/40 shadow-[0_4px_16px_rgba(109,74,255,0.08)] -translate-y-0.5'
                    : 'bg-white border-[#E5E5E2] hover:border-[#D4D4CE]'
                }`}
              >
                <div className="h-7 sm:h-8 flex items-center justify-center mb-1.5 sm:mb-2 shrink-0 text-[#111318]">
                  <BrandLogo brand={b.id} size={22} />
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-[#111318] tracking-tight truncate w-full px-0.5">
                  {b.name}
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#626873] truncate w-full mt-0.5 px-0.5 font-medium">
                  {b.category}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-[#626873]">
          Integrate custom REST, gRPC, and Python agents through universal protocols.
          <Link to="/developers" className="text-[#6D4AFF] hover:underline font-semibold ml-1.5 inline-flex items-center gap-0.5">
            Explore Developer SDKs →
          </Link>
        </div>
      </div>
    </section>
  );
};
