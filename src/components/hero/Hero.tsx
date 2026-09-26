import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { OrchestrationGraph } from './OrchestrationGraph';

export const Hero: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#F6F6F3]">
      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 bg-grid-light opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 flex flex-col text-left">
            <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-bold tracking-tight text-[#111318] leading-[1.06] mb-6">
              Connect every agent.<br />
              Make them <span className="text-[#6D4AFF]">work together.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#626873] max-w-xl font-normal leading-relaxed mb-8">
              NEXUS connects AI agents, tools and digital services into workflows that can plan, execute and adapt.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-6">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" withArrow className="w-full sm:w-48 sm:min-w-[190px] justify-center text-center">
                  Start Building
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-48 sm:min-w-[190px] justify-center text-center"
              >
                Explore NEXUS
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8B919B]">
              <span>Open source core</span>
              <span>·</span>
              <span>Built for developers</span>
            </div>
          </div>

          {/* Right Column: Physical System Orchestration Map */}
          <div className="lg:col-span-6 w-full">
            <OrchestrationGraph />
          </div>
        </div>
      </div>
    </section>
  );
};
