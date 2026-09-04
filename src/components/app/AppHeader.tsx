import React, { useState } from 'react';
import { Menu, Search, Bell, HelpCircle, ExternalLink, Shield } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { AppBreadcrumbs } from './AppBreadcrumbs';
import { Link } from 'react-router-dom';

interface AppHeaderProps {
  onOpenMobileSidebar?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenMobileSidebar }) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-[#E5E5E2] bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Dynamic Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-[#626873] hover:text-[#111318] hover:bg-black/[0.04] shrink-0"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0 overflow-hidden">
          <AppBreadcrumbs />
        </div>
      </div>

      {/* Right: Search, Help, Notifications, Status Badge */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative hidden md:flex items-center">
          <Search className="w-3.5 h-3.5 text-[#8B919B] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search workspace (⌘K)..."
            className="h-9 w-48 lg:w-72 pl-9 pr-8 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] placeholder:text-[#8B919B] focus:border-[#6D4AFF] focus:bg-white focus:outline-none transition-colors"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 rounded bg-white border border-[#E5E5E2] text-[9px] font-mono text-[#8B919B]">
            ⌘K
          </kbd>
        </div>

        {/* Help Menu Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setHelpOpen(!helpOpen);
              setNotificationsOpen(false);
            }}
            aria-label="Help and resources"
            className="p-2 rounded-xl text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] border border-transparent hover:border-[#E5E5E2] transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {helpOpen && (
            <div className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-white border border-[#E5E5E2] shadow-[0_12px_32px_rgba(0,0,0,0.08)] z-50 text-left animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[#8B919B]">
                Help & Resources
              </div>
              <Link
                to="/docs"
                onClick={() => setHelpOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#111318] hover:bg-[#FAFAF8] transition-colors"
              >
                <span>Documentation & Guides</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#8B919B]" />
              </Link>
              <Link
                to="/developers"
                onClick={() => setHelpOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#111318] hover:bg-[#FAFAF8] transition-colors"
              >
                <span>SDKs & API Reference</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#8B919B]" />
              </Link>
              <Link
                to="/security"
                onClick={() => setHelpOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#111318] hover:bg-[#FAFAF8] transition-colors"
              >
                <span>Security & Permissions</span>
                <Shield className="w-3.5 h-3.5 text-[#8B919B]" />
              </Link>
            </div>
          )}
        </div>

        {/* Notifications Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setHelpOpen(false);
            }}
            aria-label="Notifications"
            className="p-2 rounded-xl text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] border border-transparent hover:border-[#E5E5E2] transition-all cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6D4AFF]" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 p-3 rounded-2xl bg-white border border-[#E5E5E2] shadow-[0_12px_32px_rgba(0,0,0,0.08)] z-50 text-left animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EFEFEA]">
                <span className="text-xs font-bold text-[#111318]">Notifications</span>
                <span className="text-[10px] font-mono text-[#8B919B]">1 new</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs">
                <div className="font-semibold text-[#111318] mb-0.5">Workspace Initialized</div>
                <p className="text-[11px] text-[#626873] leading-relaxed">
                  Welcome to NEXUS! Connect your services and build your first agent workflow.
                </p>
                <div className="text-[9px] font-mono text-[#8B919B] mt-2">Just now</div>
              </div>
            </div>
          )}
        </div>

        {/* Orchestrator Live Ready State */}
        <div className="hidden sm:flex items-center gap-2">
          <Badge status="RUNNING" size="sm">
            ORCHESTRATOR READY
          </Badge>
        </div>
      </div>
    </header>
  );
};
