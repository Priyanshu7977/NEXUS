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
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';

export const NexusLogo: React.FC<{ className?: string; size?: number; dark?: boolean }> = ({
  className = '',
  size = 26,
  dark = false
}) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-200 group-hover:scale-105"
      >
        {/* Hexagonal Outer Frame with Node Vertices */}
        <polygon
          points="16,3 28,10 28,22 16,29 4,22 4,10"
          stroke={dark ? "rgba(255, 255, 255, 0.2)" : "#111318"}
          strokeWidth="1.5"
          fill={dark ? "#15171C" : "#FFFFFF"}
        />
        {/* Tri-Node Inner Mesh Interconnect */}
        <line x1="16" y1="3" x2="16" y2="16" stroke="#6D4AFF" strokeWidth="1.5" />
        <line x1="28" y1="22" x2="16" y2="16" stroke={dark ? "#45D7FF" : "#3B82F6"} strokeWidth="1.5" />
        <line x1="4" y1="22" x2="16" y2="16" stroke="#6D4AFF" strokeWidth="1.5" />
        
        {/* Center Core Node */}
        <circle cx="16" cy="16" r="3" fill="#6D4AFF" />
        <circle cx="16" cy="16" r="1.2" fill="#FFFFFF" />

        {/* Outer Vertices */}
        <circle cx="16" cy="3" r="1.5" fill={dark ? "#45D7FF" : "#3B82F6"} />
        <circle cx="28" cy="22" r="1.5" fill="#6D4AFF" />
        <circle cx="4" cy="22" r="1.5" fill={dark ? "#45D7FF" : "#3B82F6"} />
      </svg>
    </div>
    <div className="flex flex-col">
      <span className={`font-bold tracking-tight text-base font-sans ${dark ? 'text-white' : 'text-[#111318]'}`}>
        NEXUS
      </span>
    </div>
  </div>
);

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
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

  const productItems = [
    {
      title: 'Agents',
      description: 'Specialized autonomous AI agents for code, research, and analysis.',
      to: '/explore?tab=agents',
      icon: Bot,
      color: 'text-[#6D4AFF]',
      bg: 'bg-purple-50'
    },
    {
      title: 'Connectors',
      description: 'Unified integrations for developer tools, models, and databases.',
      to: '/explore?tab=connectors',
      icon: Cable,
      color: 'text-[#3B82F6]',
      bg: 'bg-blue-50'
    },
    {
      title: 'Workflows',
      description: 'Visual DAG pipelines with parallel stages and human verification gates.',
      to: '/#workflow',
      icon: Network,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Observability',
      description: 'Full execution telemetry, step latency metrics, and audit logs.',
      to: '/#observability',
      icon: Activity,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'Security',
      description: 'Granular permissions, credential isolation, and auditability.',
      to: '/security',
      icon: ShieldCheck,
      color: 'text-[#111318]',
      bg: 'bg-neutral-100'
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
          scrolled ? 'py-2.5' : 'py-3.5'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className={`flex items-center justify-between mx-auto transition-all duration-300 rounded-xl border px-4 sm:px-5 ${
              scrolled
                ? 'bg-white/90 border-[#E5E5E2] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md py-2.5 max-w-5xl'
                : 'bg-white/75 border-[#E5E5E2]/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] backdrop-blur-sm py-2.5 max-w-6xl'
            }`}
          >
            {/* Brand Logo */}
            <Link to="/" className="group flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D4AFF] rounded-lg">
              <NexusLogo />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
              {/* Product Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                  className={`px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors rounded-lg flex items-center gap-1 cursor-pointer ${
                    productDropdownOpen || location.pathname === '/security'
                      ? 'text-[#111318] bg-black/[0.04]'
                      : 'text-[#626873] hover:text-[#111318] hover:bg-black/[0.03]'
                  }`}
                >
                  <span>Product</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${productDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {productDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-[#E5E5E2] rounded-2xl p-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in-95 duration-150">
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
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#FAFAF8] transition-colors group text-left"
                          >
                            <div className={`w-8 h-8 rounded-lg ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#111318] group-hover:text-[#6D4AFF] transition-colors flex items-center gap-1">
                                <span>{item.title}</span>
                                <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#6D4AFF]" />
                              </div>
                              <p className="text-[11px] text-[#626873] leading-snug line-clamp-1">
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

              {/* Standard Links */}
              <Link
                to="/explore"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors rounded-lg cursor-pointer ${
                  isActive('/explore')
                    ? 'text-[#111318] bg-black/[0.04] font-semibold'
                    : 'text-[#626873] hover:text-[#111318] hover:bg-black/[0.03]'
                }`}
              >
                Explore
              </Link>

              <Link
                to="/developers"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors rounded-lg cursor-pointer ${
                  isActive('/developers')
                    ? 'text-[#111318] bg-black/[0.04] font-semibold'
                    : 'text-[#626873] hover:text-[#111318] hover:bg-black/[0.03]'
                }`}
              >
                Developers
              </Link>

              <Link
                to="/docs"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors rounded-lg cursor-pointer ${
                  isActive('/docs')
                    ? 'text-[#111318] bg-black/[0.04] font-semibold'
                    : 'text-[#626873] hover:text-[#111318] hover:bg-black/[0.03]'
                }`}
              >
                Docs
              </Link>

              <Link
                to="/pricing"
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors rounded-lg cursor-pointer ${
                  isActive('/pricing')
                    ? 'text-[#111318] bg-black/[0.04] font-semibold'
                    : 'text-[#626873] hover:text-[#111318] hover:bg-black/[0.03]'
                }`}
              >
                Pricing
              </Link>
            </div>

            {/* Right CTAs */}
            <div className="hidden md:flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs lg:text-sm font-medium text-[#626873] hover:text-[#111318] transition-colors rounded-lg hover:bg-black/[0.03] cursor-pointer"
              >
                Log in
              </Link>
              <Link to="/signup">
                <Button size="sm" withArrow>
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
        <div className="fixed inset-0 z-40 md:hidden bg-[#F6F6F3]/98 backdrop-blur-2xl pt-24 px-6 flex flex-col justify-between pb-8 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <div className="text-xs uppercase tracking-wider text-[#8B919B] font-mono mb-2 px-3">
              Public Navigation
            </div>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-[#111318] font-medium border-b border-[#E5E5E2] hover:bg-black/[0.02] rounded-lg text-left w-full"
            >
              <span>Home</span>
              <ChevronRight className="w-4 h-4 text-[#8B919B]" />
            </Link>

            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-[#111318] font-medium border-b border-[#E5E5E2] hover:bg-black/[0.02] rounded-lg text-left w-full"
            >
              <span>Explore Ecosystem</span>
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
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-[#111318] font-medium border-b border-[#E5E5E2] hover:bg-black/[0.02] rounded-lg text-left w-full"
            >
              <span>Documentation</span>
              <ChevronRight className="w-4 h-4 text-[#8B919B]" />
            </Link>

            <Link
              to="/security"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-[#111318] font-medium border-b border-[#E5E5E2] hover:bg-black/[0.02] rounded-lg text-left w-full"
            >
              <span>Security Architecture</span>
              <ChevronRight className="w-4 h-4 text-[#8B919B]" />
            </Link>

            <Link
              to="/open-source"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-[#111318] font-medium border-b border-[#E5E5E2] hover:bg-black/[0.02] rounded-lg text-left w-full"
            >
              <span>Open Source Core</span>
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

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-[#111318] font-medium border-b border-[#E5E5E2] hover:bg-black/[0.02] rounded-lg text-left w-full"
            >
              <span>About NEXUS</span>
              <ChevronRight className="w-4 h-4 text-[#8B919B]" />
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 pt-6 border-t border-[#E5E5E2]">
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
    </>
  );
};
