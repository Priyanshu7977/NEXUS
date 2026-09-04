import React from 'react';
import { Link } from 'react-router-dom';
import { NexusLogo } from './Navbar';

export const Footer: React.FC = () => {
  const footerColumns = [
    {
      title: 'Product',
      links: [
        { label: 'Overview', to: '/' },
        { label: 'Explore Ecosystem', to: '/explore' },
        { label: 'Pricing & Plans', to: '/pricing' },
        { label: 'Agents', to: '/explore?tab=agents' },
        { label: 'Connectors', to: '/explore?tab=connectors' },
        { label: 'Workflows', to: '/#workflow' },
      ]
    },
    {
      title: 'Developers',
      links: [
        { label: 'Developers Overview', to: '/developers' },
        { label: 'Documentation', to: '/docs' },
        { label: 'Agent SDK', to: '/developers' },
        { label: 'Connector SDK', to: '/developers' },
        { label: 'Open Source Core', to: '/open-source' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About NEXUS', to: '/about' },
        { label: 'Security & Control', to: '/security' },
        { label: 'Changelog', to: '/changelog' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', to: '#' },
        { label: 'Terms of Service', to: '#' },
        { label: 'Responsible Disclosure', to: '/security' },
      ]
    }
  ];

  return (
    <footer className="border-t border-[#E5E5E2] bg-[#FAFAF8] pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-[#E5E5E2]">
          {/* Brand Col (2 cols) */}
          <div className="col-span-2 flex flex-col justify-between">
            <div>
              <NexusLogo size={24} className="mb-4" />
              <p className="text-xs sm:text-sm text-[#626873] leading-relaxed max-w-sm mb-4">
                The open orchestration layer for autonomous AI agents. Connect tools, compose workflows, and execute with full visibility.
              </p>
            </div>

            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[11px] text-[#626873] max-w-fit shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Orchestration Platform · Developer Preview</span>
            </div>
          </div>

          {/* Links Columns (4 cols) */}
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#111318]">
                {col.title}
              </span>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to.startsWith('#') ? (
                      <span className="text-xs sm:text-sm text-[#8B919B] cursor-default">
                        {link.label}
                      </span>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-xs sm:text-sm text-[#626873] hover:text-[#111318] transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B919B]">
          <div>
            © 2026 NEXUS. Built for developers.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/open-source" className="hover:text-[#111318] transition-colors">
              Open Source Core
            </Link>
            <span>·</span>
            <Link to="/changelog" className="hover:text-[#111318] transition-colors">
              Changelog
            </Link>
            <span>·</span>
            <Link to="/security" className="hover:text-[#111318] transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
