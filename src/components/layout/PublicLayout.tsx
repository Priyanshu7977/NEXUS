import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const PAGE_TITLES: Record<string, string> = {
  '/': 'NEXUS · Connect every agent. Make them work together.',
  '/explore': 'Explore Ecosystem · NEXUS Agents & Connectors',
  '/pricing': 'Pricing & Plans · NEXUS Orchestration',
  '/developers': 'Developers · NEXUS Agent SDK & Architecture',
  '/docs': 'Documentation · NEXUS Platform Docs',
  '/security': 'Security & Control · NEXUS Granular Permissions',
  '/open-source': 'Open Source Core · NEXUS',
  '/changelog': 'Changelog · NEXUS Built in Public',
  '/about': 'About NEXUS · The AI Agent Orchestration Layer',
};

export const PublicLayout: React.FC = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Set document title
  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] || 'NEXUS · The AI Agent Orchestration Layer';
    document.title = title;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#111318] flex flex-col antialiased selection:bg-[#6D4AFF]/20 selection:text-[#111318]">
      <Navbar />
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
