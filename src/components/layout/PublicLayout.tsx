import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AgentCommandOrb } from '../agent/AgentCommandOrb';
import { DesktopAppModal } from '../desktop/DesktopAppModal';

const PAGE_TITLES: Record<string, string> = {
  '/': 'NEXUS · Universal Multi-AI Platform | Supabase, Claude & GPT-4o',
  '/studio': 'NEXUS Studio · Universal Multi-AI Application Workspace',
  '/explore': 'Explore Ecosystem · NEXUS Agents & Connectors',
  '/pricing': 'Pricing & Plans · NEXUS Orchestration',
  '/developers': 'Developers · NEXUS Agent SDK & Architecture',
  '/docs': 'Documentation · NEXUS Platform Docs',
  '/security': 'Security & Control · NEXUS Granular Permissions',
  '/open-source': 'Open Source Core · NEXUS',
  '/changelog': 'Changelog · NEXUS Built in Public',
  '/about': 'About NEXUS · The AI Agent Orchestration Layer',
  '/swarm': 'NEXUS Swarm Arena · Multi-Model Consensus (GPT-4o, Claude, Gemini, DeepSeek)',
};

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [desktopModalOpen, setDesktopModalOpen] = useState(false);

  // Scroll to targeted anchor or top on route/hash change
  useEffect(() => {
    if (location.hash === '#download') {
      setDesktopModalOpen(true);
      return;
    }

    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const scrollToTarget = () => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      if (!scrollToTarget()) {
        const timeout = setTimeout(scrollToTarget, 100);
        return () => clearTimeout(timeout);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  // Global listener for desktop download modal
  useEffect(() => {
    const handleOpenDesktop = () => setDesktopModalOpen(true);
    window.addEventListener('open-desktop-modal', handleOpenDesktop);
    return () => window.removeEventListener('open-desktop-modal', handleOpenDesktop);
  }, []);

  // Set document title
  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] || 'NEXUS · Universal Multi-AI Platform';
    document.title = title;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#111318] flex flex-col antialiased selection:bg-[#6D4AFF]/20 selection:text-[#111318]">
      <Navbar />
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      {/* Global AI Agent Command Orb & Co-Pilot */}
      <AgentCommandOrb />
      {/* Global Desktop Download Modal */}
      <DesktopAppModal
        isOpen={desktopModalOpen}
        onClose={() => setDesktopModalOpen(false)}
      />
    </div>
  );
};
