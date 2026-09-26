import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CONNECTORS_DATA } from '../../data/mockData';
import { BrandLogo } from '../brand/BrandLogo';
import { ArrowUpRight } from 'lucide-react';

export const ConnectorShowcase: React.FC = () => {
  const categories = ['All', 'Development', 'AI', 'Data', 'CMS', 'Communication', 'Analytics'] as const;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredConnectors = selectedCategory === 'All'
    ? CONNECTORS_DATA
    : CONNECTORS_DATA.filter((c) => c.category === selectedCategory);

  return (
    <section id="connectors" className="relative py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#F6F6F3]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111318] leading-[1.1] mb-4">
            Your stack, connected.
          </h2>
          <p className="text-base sm:text-lg text-[#626873] leading-relaxed">
            Integrate the tools, models, databases and communication channels you already rely on into unified agent workflows.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[#111318] text-white shadow-sm'
                    : 'bg-white text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] border border-[#E5E5E2]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Connector Cards Grid with Real Brand Logos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
          {filteredConnectors.map((item) => (
            <Link
              key={item.id}
              to={`/explore?tab=connectors&q=${encodeURIComponent(item.name)}`}
              className="h-full p-5 rounded-xl bg-white border border-[#E5E5E2] hover:border-[#6D4AFF]/50 hover:shadow-[0_4px_16px_rgba(109,74,255,0.08)] transition-all duration-200 flex flex-col justify-between group min-w-0 block text-left"
              aria-label={`Explore ${item.name} Connector`}
            >
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center group-hover:border-[#6D4AFF]/30 group-hover:bg-purple-50/30 transition-colors duration-150 shrink-0">
                    <BrandLogo brand={item.id} size={22} />
                  </div>
                  <span className="text-[11px] font-mono text-[#8B919B] bg-[#FAFAF8] px-2 py-0.5 rounded border border-[#EFEFEA] shrink-0">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#111318] mb-1.5 flex items-center justify-between gap-2 min-w-0">
                  <span className="truncate group-hover:text-[#6D4AFF] transition-colors">{item.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#6D4AFF] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </h3>

                <p className="text-xs text-[#626873] leading-relaxed mb-4 break-words flex-1">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EFEFEA] flex flex-wrap gap-1.5 mt-auto">
                {item.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-[10px] text-[#626873] bg-[#FAFAF8] px-2 py-0.5 rounded border border-[#E5E5E2] break-words"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* Custom Connector Protocol Banner */}
        <Link
          to="/developers"
          className="mt-8 p-4 rounded-xl bg-white border border-[#E5E5E2] hover:border-[#6D4AFF]/40 hover:shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left transition-all duration-150 group block"
        >
          <div className="text-xs text-[#626873]">
            Building a proprietary internal service or model? Connect it with our open protocol.
          </div>
          <span className="text-xs font-mono font-medium text-[#6D4AFF] bg-[#6D4AFF]/10 px-3 py-1 rounded-md border border-[#6D4AFF]/20 group-hover:bg-[#6D4AFF] group-hover:text-white transition-colors inline-flex items-center gap-1">
            NEXUS Connector Protocol <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </section>
  );
};
