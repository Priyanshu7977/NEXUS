import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { 
  Sliders, 
  Building2, 
  ShieldCheck, 
  Key, 
  CreditCard, 
  Lock,
  Check,
  ExternalLink,
  Info,
  User,
  Users
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { user, currentWorkspace } = useAuth();

  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || 'Developer');
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || 'Personal Workspace');
  const [sandboxEnabled, setSandboxEnabled] = useState(true);
  const [humanGateRequired, setHumanGateRequired] = useState(true);

  // Normalize active tab
  const activeTab = tab ? tab.toLowerCase() : 'general';

  const tabs = [
    { id: 'general', label: 'General', icon: Sliders, to: '/app/settings/general' },
    { id: 'workspace', label: 'Workspace', icon: Building2, to: '/app/settings/workspace' },
    { id: 'security', label: 'Security', icon: ShieldCheck, to: '/app/settings/security' },
    { id: 'permissions', label: 'Permissions', icon: Lock, to: '/app/settings/permissions' },
    { id: 'api', label: 'API Keys', icon: Key, to: '/app/settings/api' },
    { id: 'billing', label: 'Billing', icon: CreditCard, to: '/app/settings/billing' },
  ];

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 text-left max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#111318] mb-1">
          Settings
        </h2>
        <p className="text-sm text-[#626873]">
          Manage your account preferences, workspace environment, and security policies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Settings Tabs Navigation */}
        <div className="lg:col-span-3 flex flex-col gap-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => navigate(t.to)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#111318] border border-[#E5E5E2] font-bold shadow-sm'
                    : 'text-[#626873] hover:text-[#111318] hover:bg-black/[0.03] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#6D4AFF]' : 'text-[#8B919B]'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Form Content */}
        <div className="lg:col-span-9">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
            {/* GENERAL SETTINGS */}
            {activeTab === 'general' && (
              <form onSubmit={handleSaveGeneral} className="flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-[#111318] mb-1">
                    General Preferences
                  </h3>
                  <p className="text-xs text-[#626873]">
                    Update your account details and display name across your workspace.
                  </p>
                </div>

                {/* Avatar Section */}
                <div className="flex items-center gap-4 pb-6 border-b border-[#EFEFEA]">
                  <div className="w-14 h-14 rounded-full bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 text-[#6D4AFF] flex items-center justify-center font-bold text-lg uppercase overflow-hidden">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      displayName.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#111318] mb-1">Profile Photo</div>
                    <div className="text-[11px] text-[#8B919B]">
                      Synced automatically from your authenticated session.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] focus:bg-white text-sm text-[#111318] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || 'developer@nexus.dev'}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#F4F4F0] border border-[#E5E5E2] text-sm text-[#8B919B] outline-none cursor-not-allowed"
                    />
                    <span className="text-[10px] text-[#8B919B] mt-1 block">
                      Authentication-controlled address.
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EFEFEA] flex items-center justify-between">
                  {saved && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-mono">
                      <Check className="w-3.5 h-3.5" /> Preferences saved
                    </span>
                  )}
                  <Button type="submit" size="sm" className="ml-auto">
                    Save Changes
                  </Button>
                </div>
              </form>
            )}

            {/* WORKSPACE SETTINGS */}
            {activeTab === 'workspace' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-[#111318] mb-1">
                    Workspace Settings
                  </h3>
                  <p className="text-xs text-[#626873]">
                    Configure organization metadata and workspace resource boundaries.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] focus:bg-white text-sm text-[#111318] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                      Workspace ID
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentWorkspace?.id || 'ws_personal_dev_01'}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#F4F4F0] border border-[#E5E5E2] text-xs font-mono text-[#8B919B] outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                    Owner
                  </label>
                  <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#6D4AFF]" />
                      <span className="font-semibold text-[#111318]">{user?.name || 'Developer'}</span>
                      <span className="text-[#8B919B]">({user?.email || 'developer@nexus.dev'})</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Primary Owner
                    </span>
                  </div>
                </div>

                {/* Team Collaboration Notice */}
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-start gap-3">
                  <Users className="w-4 h-4 text-[#8B919B] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#111318] mb-0.5">
                      Team Members & Roles
                    </div>
                    <p className="text-[11px] text-[#626873]">
                      Team invitations, RBAC roles (Admin, Member, Auditor), and granular workspace sharing will be enabled in upcoming multi-tenant releases.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EFEFEA] flex justify-end">
                  <Button size="sm">Save Workspace</Button>
                </div>
              </div>
            )}

            {/* SECURITY SETTINGS */}
            {activeTab === 'security' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-[#111318] mb-1">
                    Security & Guardrails
                  </h3>
                  <p className="text-xs text-[#626873]">
                    Authentication providers, session monitoring, and execution sandboxing.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                    <div>
                      <div className="text-xs font-bold text-[#111318]">Authentication Provider</div>
                      <div className="text-[11px] text-[#626873]">Supabase Auth with JWT session verification.</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      SECURE
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                    <div>
                      <div className="text-xs font-bold text-[#111318]">Active Web Sessions</div>
                      <div className="text-[11px] text-[#626873]">1 active browser session in current workspace.</div>
                    </div>
                    <span className="text-[10px] font-mono text-[#626873] bg-white px-2 py-0.5 rounded border border-[#E5E5E2]">
                      CURRENT
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                    <div>
                      <div className="text-xs font-bold text-[#111318]">Strict Sandbox Enforcement</div>
                      <div className="text-[11px] text-[#626873]">Isolate untrusted code agent executions in ephemeral sandboxes.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSandboxEnabled(!sandboxEnabled)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        sandboxEnabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#FAFAF8] text-[#8B919B] border border-[#E5E5E2]'
                      }`}
                    >
                      {sandboxEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#626873] flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#8B919B] shrink-0 mt-0.5" />
                  <span>
                    Security controls will become available as more NEXUS functionality is enabled.
                  </span>
                </div>
              </div>
            )}

            {/* PERMISSIONS SETTINGS */}
            {activeTab === 'permissions' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-[#111318] mb-1">
                    Permissions & Access Control
                  </h3>
                  <p className="text-xs text-[#626873]">
                    Default access boundaries and approval policies for agents and tools.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                    <label className="block text-xs font-bold text-[#111318] mb-1">
                      Default Agent Permission Level
                    </label>
                    <p className="text-[11px] text-[#626873] mb-3">
                      Controls the initial permission set assigned to newly created agents.
                    </p>
                    <select className="w-full h-9 px-3 rounded-lg bg-white border border-[#E5E5E2] text-xs text-[#111318] outline-none">
                      <option value="restricted">Restricted (Read-Only context)</option>
                      <option value="standard">Standard (Read & Propose changes)</option>
                      <option value="full">Full (Autonomous mutation)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                    <div>
                      <div className="text-xs font-bold text-[#111318]">Human Approval on External Writes</div>
                      <div className="text-[11px] text-[#626873]">
                        Require workspace member sign-off before committing to GitHub or databases.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHumanGateRequired(!humanGateRequired)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        humanGateRequired
                          ? 'bg-purple-50 text-[#6D4AFF] border border-purple-200'
                          : 'bg-[#FAFAF8] text-[#8B919B] border border-[#E5E5E2]'
                      }`}
                    >
                      {humanGateRequired ? 'REQUIRED' : 'OPTIONAL'}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EFEFEA] flex justify-end">
                  <Button size="sm">Save Permission Policies</Button>
                </div>
              </div>
            )}

            {/* API SETTINGS */}
            {activeTab === 'api' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-[#111318] mb-1">
                    API Access & Developer Platform
                  </h3>
                  <p className="text-xs text-[#626873]">
                    Invoke NEXUS agent orchestrations programmatically from SDKs, CLI, and webhooks.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E5E2] text-[#6D4AFF] flex items-center justify-center mb-3 shadow-xs">
                    <Key className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#111318] mb-1">
                    API access is coming soon.
                  </h4>
                  <p className="text-xs text-[#626873] max-w-md mb-5 leading-relaxed">
                    Personal access tokens and programmatically scoped API keys will be provisioned once the developer runtime is released.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/developers')}
                  >
                    <span>Learn about the developer platform</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-[#8B919B]" />
                  </Button>
                </div>
              </div>
            )}

            {/* BILLING SETTINGS */}
            {activeTab === 'billing' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-[#111318] mb-1">
                    Subscription & Billing
                  </h3>
                  <p className="text-xs text-[#626873]">
                    Workspace compute tier, credit allowances, and plan details.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold text-[#111318]">Free Tier</span>
                      <span className="text-xs font-mono text-[#6D4AFF] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        ₹0 / month
                      </span>
                    </div>
                    <div className="text-xs text-[#626873]">
                      3 connected services · 3 agents · 2 workflows · 1,000 monthly credits
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/pricing')}
                  >
                    <span>View pricing</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1 text-[#8B919B]" />
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] text-xs text-[#626873] flex items-center justify-between">
                  <span>Billing is not available yet. All accounts currently have complimentary access.</span>
                  <span className="font-mono text-[10px] text-[#8B919B]">DEV_PREVIEW</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
