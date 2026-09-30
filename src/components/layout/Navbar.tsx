import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Bot, 
  Cable, 
  Network, 
  Activity, 
  ShieldCheck, 
  Monitor,
  Layers,
  Flame,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { DesktopAppModal } from '../desktop/DesktopAppModal';

export const NexusLogo: React.FC<{ className?: string; size?: number; dark?: boolean }> = ({
  className = '',
  size = 26,
  dark = false
}) => (
  <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
    <div className="relative flex items-center justify-center shrink-0">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        className="shrink-0"
      >
        {/* Hexagonal Outer Frame with Node Vertices */}
        <polygon
          points="16,3 28,10 28,22 16,29 4,22 4,10"
          stroke={dark ? "rgba(255, 255, 255, 0.4)" : "#111318"}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill={dark ? "#15171C" : "#FFFFFF"}
        />
        {/* Tri-Node Inner Mesh Interconnect */}
        <line x1="16" y1="3" x2="16" y2="16" stroke="#6D4AFF" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="28" y1="22" x2="16" y2="16" stroke={dark ? "#45D7FF" : "#2563EB"} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="4" y1="22" x2="16" y2="16" stroke="#6D4AFF" strokeWidth="1.8" strokeLinecap="round" />
        
        {/* Center Core Node */}
        <circle cx="16" cy="16" r="3" fill="#6D4AFF" />
        <circle cx="16" cy="16" r="1.2" fill="#FFFFFF" />

        {/* Outer Vertices */}
        <circle cx="16" cy="3" r="1.6" fill={dark ? "#45D7FF" : "#2563EB"} />
        <circle cx="28" cy="22" r="1.6" fill="#6D4AFF" />
        <circle cx="4" cy="22" r="1.6" fill={dark ? "#45D7FF" : "#2563EB"} />
      </svg>
    </div>
    <div className="flex flex-col shrink-0">
      <span className={`font-bold tracking-tight text-base font-sans whitespace-nowrap select-none ${dark ? 'text-white' : 'text-[#111318]'}`}>
        NEXUS
      </span>
    </div>
  </div>
);

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [desktopModalOpen, setDesktopModalOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProductDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const productItems = [
    {
      title: 'One-Prompt Multi-AI Studio',
      description: 'Connect Supabase for DB, Claude for UI/UX, and GPT-4o for backend with 1 prompt.',
      to: '/studio',
      icon: Sparkles,
      color: 'text-[#6D4AFF]',
      bg: 'bg-purple-50',
      badge: 'NEW'
    },
    {
      title: 'Swarm Consensus Arena',
      description: 'Run GPT-4o, Claude 3.5, Gemini & DeepSeek in parallel arbitration.',
      to: '/swarm',
      icon: Flame,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      badge: 'POPULAR'
    },
    {
      title: 'Prompt-to-Workflow Compiler',
      description: 'Generate runnable visual DAG orchestration from natural language.',
      to: '/#workflow',
      icon: Sparkles,
      color: 'text-[#6D4AFF]',
      bg: 'bg-purple-50'
    },
    {
      title: 'Autonomous Agents',
      description: 'Specialized frontier AI workers for architecture, red teaming, and code.',
      to: '/explore?tab=agents',
      icon: Bot,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      title: 'Visual Workflow Studio',
      description: 'DAG pipelines with parallel execution and human approval gates.',
      to: '/#workflow',
      icon: Network,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Connectors & MCP Tools',
      description: 'Standardized Model Context Protocol servers and live integrations.',
      to: '/explore?tab=connectors',
      icon: Cable,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Observability & Telemetry',
      description: 'Full execution traces, per-node latency, and step audit logs.',
      to: '/#observability',
      icon: Activity,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    },
    {
      title: 'Security Architecture',
      description: 'Zero-trust sandboxing, BYOK encryption, and prompt injection defense.',
      to: '/security',
      icon: ShieldCheck,
      color: 'text-[#111318]',
      bg: 'bg-neutral-100'
    },
    {
      title: 'How NEXUS Works',
      description: 'End-to-end architectural guide: APIs, Swarm consensus, and execution.',
      to: '/#how-it-works',
      icon: Layers,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ${
          scrolled ? 'py-2 sm:py-2.5' : 'py-3 sm:py-3.5'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav
            className={`flex items-center justify-between mx-auto transition-all duration-300 rounded-2xl border px-3.5 sm:px-5 py-2.5 ${
              scrolled
                ? 'bg-white/95 border-[#E5E5E2] shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md'
                : 'bg-white/80 border-[#E5E5E2]/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm'
            }`}
          >
            {/* Brand Logo */}
            <Link 
              to="/" 
              className="group flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D4AFF] rounded-lg mr-2 lg:mr-4"
            >
              <NexusLogo />
            </Link>

            {/* Streamlined Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {/* Product Dropdown */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                  className={`px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors rounded-lg flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                    productDropdownOpen || location.pathname === '/security'
                      ? 'text-[#111318] bg-black/[0.05]'
                      : 'text-[#626873] hover:text-[#111318] hover:bg-black/[0.03]'
                  }`}
                >
                  <span className="whitespace-nowrap">Product</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${productDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {productDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-88 bg-white border border-[#E5E5E2] rounded-2xl p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-150 z-50">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#8B919B] px-2.5 py-1 mb-1">
                      Platform Capabilities
                    </div>
                    <div className="space-y-1">
                      {productItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.title}
                            to={item.to}
                            onClick={() => setProductDropdownOpen(false)}
                            className="flex items-start gap-3 p-2 rounded-xl hover:bg-[#FAFAF8] transition-colors group text-left"
                          >
                            <div className={`w-7 h-7 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-[#111318] group-hover:text-[#6D4AFF] transition-colors flex items-center justify-between gap-1">
                                <span className="truncate">{item.title}</span>
                                {item.badge && (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 shrink-0">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#626873] leading-snug line-clamp-1 mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* One-Prompt Studio Highlight */}
              <Link
                to="/studio"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  isActive('/studio')
                    ? 'text-[#6D4AFF] bg-[#6D4AFF]/10 font-semibold'
                    : 'text-[#626873] hover:text-[#6D4AFF] hover:bg-black/[0.03]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#6D4AFF] shrink-0" />
                <span className="whitespace-nowrap">AI Studio</span>
              </Link>

              {/* Swarm Arena Highlight */}
              <Link
                to="/swarm"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  isActive('/swarm')
                    ? 'text-[#6D4AFF] bg-[#6D4AFF]/10 font-semibold'
                    : 'text-[#626873] hover:text-[#6D4AFF] hover:bg-black/[0.03]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="whitespace-nowrap">Swarm</span>
              </Link>

              {/* Explore */}
              <Link
                to="/explore"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors rounded-lg cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive('/explore')
                    ? 'text-[#111318] bg-black/[0.05] font-semibold'
                    : 'text-[#626873] hover:text-[#111318] hover:bg-black/[0.03]'
                }`}
              >
                <span className="whitespace-nowrap">Explore</span>
              </Link>

              {/* Docs */}
              <Link
                to="/docs"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors rounded-lg cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive('/docs')
                    ? 'text-[#111318] bg-black/[0.05] font-semibold'
                    : 'text-[#626873] hover:text-[#111318] hover:bg-black/[0.03]'
                }`}
              >
                <span className="whitespace-nowrap">Docs</span>
              </Link>

              {/* Pricing */}
              <Link
                to="/pricing"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors rounded-lg cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive('/pricing')
                    ? 'text-[#111318] bg-black/[0.05] font-semibold'
                    : 'text-[#626873] hover:text-[#111318] hover:bg-black/[0.03]'
                }`}
              >
                <span className="whitespace-nowrap">Pricing</span>
              </Link>
            </div>

            {/* Right CTAs */}
            <div className="hidden md:flex items-center gap-2 lg:gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setDesktopModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium text-[#111318] hover:text-[#6D4AFF] bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] rounded-lg transition-colors shadow-2xs hover:bg-[#FAFAF8] cursor-pointer shrink-0 whitespace-nowrap"
                title="Download or install NEXUS Desktop App"
              >
                <Monitor className="w-3.5 h-3.5 text-[#6D4AFF] shrink-0" />
                <span className="hidden lg:inline whitespace-nowrap">Desktop App</span>
                <span className="lg:hidden whitespace-nowrap">Desktop</span>
              </button>

              <Link
                to="/login"
                className="px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium text-[#626873] hover:text-[#111318] transition-colors rounded-lg hover:bg-black/[0.03] cursor-pointer shrink-0 whitespace-nowrap"
              >
                <span className="whitespace-nowrap">Log in</span>
              </Link>

              <Link to="/signup" className="shrink-0 whitespace-nowrap">
                <Button size="sm" withArrow className="whitespace-nowrap text-xs lg:text-sm">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#626873] hover:text-[#111318] rounded-lg hover:bg-black/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D4AFF]"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 h-[100dvh] z-40 md:hidden bg-[#F6F6F3]/98 backdrop-blur-2xl pt-20 px-5 flex flex-col justify-between pb-[max(1.5rem,env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-1">
            <div className="text-xs uppercase tracking-wider text-[#8B919B] font-mono mb-2 px-3">
              Platform Navigation
            </div>

            <Link
              to="/swarm"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-3 min-h-[44px] text-sm text-[#6D4AFF] font-semibold border-b border-[#E5E5E2] hover:bg-purple-50/50 rounded-lg text-left w-full"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Swarm Arena</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 font-bold">
                  NEW
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8B919B]" />
            </Link>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 min-h-[44px] text-sm text-[#111318] font-medium border-b border-[#E5E5E2] hover:bg-black/[0.02] rounded-lg text-left w-full"
            >
              <span>Home & Architecture</span>
              <ChevronRight className="w-4 h-4 text-[#8B919B]" />
            </Link>

            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-[#111318] font-medium border-b border-[#E5E5E2] hover:bg-black/[0.02] rounded-lg text-left w-full"
            >
              <span>Explore Marketplace</span>
              <ChevronRight className="w-4 h-4 text-[#8B919B]" />
            </Link>

            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-[#111318] font-medium border-b border-[#E5E5E2] hover:bg-black/[0.02] rounded-lg text-left w-full"
            >
              <span>Documentation & API</span>
              <ChevronRight className="w-4 h-4 text-[#8B919B]" />
            </Link>

            <Link
              to="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-[#111318] font-medium border-b border-[#E5E5E2] hover:bg-black/[0.02] rounded-lg text-left w-full"
            >
              <span>Pricing & Plans</span>
              <ChevronRight className="w-4 h-4 text-[#8B919B]" />
            </Link>

            <Link
              to="/developers"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-[#111318] font-medium border-b border-[#E5E5E2] hover:bg-black/[0.02] rounded-lg text-left w-full"
            >
              <span>Developers & SDK</span>
              <ChevronRight className="w-4 h-4 text-[#8B919B]" />
            </Link>

            <Link
              to="/security"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-[#111318] font-medium border-b border-[#E5E5E2] hover:bg-black/[0.02] rounded-lg text-left w-full"
            >
              <span>Security & Sandboxing</span>
              <ChevronRight className="w-4 h-4 text-[#8B919B]" />
            </Link>

            <Link
              to="/changelog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-[#111318] font-medium border-b border-[#E5E5E2] hover:bg-black/[0.02] rounded-lg text-left w-full"
            >
              <span>Changelog</span>
              <ChevronRight className="w-4 h-4 text-[#8B919B]" />
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 pt-6 border-t border-[#E5E5E2]">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setDesktopModalOpen(true);
              }}
              className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-[#111318] hover:bg-black/[0.04] rounded-lg border border-[#E5E5E2] bg-white cursor-pointer"
            >
              <Monitor className="w-4 h-4 text-[#6D4AFF]" />
              <span>Get Desktop App (Windows / Mac / Linux)</span>
            </button>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-sm font-medium text-[#111318] hover:bg-black/[0.04] rounded-lg border border-[#E5E5E2]"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button size="lg" className="w-full" withArrow>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Desktop App Modal */}
      <DesktopAppModal
        isOpen={desktopModalOpen}
        onClose={() => setDesktopModalOpen(false)}
      />
    </>
  );
};
