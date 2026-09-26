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
    <section className="relative pt-20 pb-12 sm:pt-24 sm:pb-16 lg:py-8 xl:py-12 lg:min-h-[calc(100vh-4.5rem)] lg:flex lg:flex-col lg:justify-center overflow-hidden bg-[#F6F6F3]">
      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 bg-grid-light opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 flex flex-col text-left">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-[44px] xl:text-[54px] 2xl:text-[66px] font-bold tracking-tight text-[#111318] leading-[1.08] mb-4 sm:mb-6">
              Connect every agent.<br />
              Make them <span className="text-[#6D4AFF]">work together.</span>
            </h1>

            <p className="text-base sm:text-lg xl:text-xl text-[#626873] max-w-xl font-normal leading-relaxed mb-6 sm:mb-8">
              NEXUS connects AI agents, tools and digital services into workflows that can plan, execute and adapt.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-6">
              <Link to="/signup" className="w-full sm:w-auto inline-flex">
                <Button size="lg" withArrow className="w-full sm:w-52 sm:min-w-[200px] h-12 justify-center text-center">
                  Start Building
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-52 sm:min-w-[200px] h-12 justify-center text-center"
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
