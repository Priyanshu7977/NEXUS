import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { NexusLogo } from '../layout/Navbar';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Bot, 
  Cable, 
  Network, 
  Activity, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut,
  X,
  Sparkles
} from 'lucide-react';

interface AppSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', to: '/app', icon: LayoutDashboard, exact: true },
    { label: 'Agents', to: '/app/agents', icon: Bot },
    { label: 'Connectors', to: '/app/connectors', icon: Cable },
    { label: 'Workflows', to: '/app/workflows', icon: Network },
    { label: 'Discovery', to: '/app/explore', icon: Sparkles },
    { label: 'Activity', to: '/app/activity', icon: Activity },
    { label: 'Usage', to: '/app/usage', icon: CreditCard },
  ];

  const bottomItems = [
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ];

  const content = (
    <aside className="w-64 h-full flex flex-col justify-between bg-white border-r border-[#E5E5E2] p-4 select-none text-left">
      {/* Top Header & Workspace Switcher */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1 pt-1">
          <Link to="/app" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D4AFF] rounded-lg">
            <NexusLogo size={24} />
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#626873] hover:text-[#111318] rounded-lg hover:bg-black/[0.04]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <WorkspaceSwitcher />

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 mt-2">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#8B919B]">
            Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#6D4AFF]/10 text-[#6D4AFF] font-semibold'
                      : 'text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#6D4AFF]' : 'text-[#8B919B]'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Settings, Help & User Profile */}
      <div className="flex flex-col gap-2 pt-4 border-t border-[#EFEFEA]">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#6D4AFF]/10 text-[#6D4AFF] font-semibold'
                    : 'text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8]'
                }`
              }
            >
              <Icon className="w-4 h-4 text-[#8B919B]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] transition-all"
        >
          <HelpCircle className="w-4 h-4 text-[#8B919B]" />
          <span>Documentation</span>
        </a>

        {/* User Card */}
        <div className="mt-2 pt-2 border-t border-[#EFEFEA] flex items-center justify-between p-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 text-[#6D4AFF] flex items-center justify-center font-bold text-[11px] shrink-0 uppercase overflow-hidden">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                (user?.name || 'D').charAt(0)
              )}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-[#111318] truncate">
                {user?.name || 'Developer'}
              </div>
              <div className="text-[10px] text-[#8B919B] truncate font-mono">
                {user?.email || 'developer@nexus.dev'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-[#8B919B] hover:text-red-600 hover:bg-black/[0.04] rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen shrink-0 sticky top-0">
        {content}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-10 h-full">{content}</div>
        </div>
      )}
    </>
  );
};
