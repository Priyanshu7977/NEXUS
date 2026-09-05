import React, { useState, useEffect, useCallback } from 'react';
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
  User,
  Plus,
  Trash2,
  Copy,
  AlertTriangle,
  Clock,
  Shield,
  CheckCircle2,
  RefreshCw,
  Webhook,
  Send
} from 'lucide-react';
import { 
  getWorkspaceApiKeys, 
  createApiKey, 
  revokeApiKey 
} from '../../services/apiKeyService';
import { 
  getWorkspacePolicy, 
  updateWorkspacePolicy 
} from '../../services/policyService';
import { 
  getWorkspaceMembership, 
  getWorkspaceMembers, 
  inviteWorkspaceMember, 
  updateWorkspaceMemberRole, 
  removeWorkspaceMember,
  canManageMembers,
  canManagePolicies,
  canManageApiKeys
} from '../../services/authorizationService';
import { getWorkspaceAuditLogs } from '../../services/auditService';
import { 
  getWorkspaceWebhooks, 
  createDeveloperWebhook, 
  deleteDeveloperWebhook, 
  sendTestWebhookEvent 
} from '../../services/webhookDeliveryService';
import { 
  ApiKey, 
  ApiKeyScope, 
  WorkspacePolicy, 
  WorkspaceRole, 
  AuditLogEntry
} from '../../types/security';
import { 
  DeveloperWebhook, 
  WebhookEventType, 
  ALL_WEBHOOK_EVENTS 
} from '../../types/api';
import { WorkspaceMember } from '../../types/database';

const ALL_SCOPES: { id: ApiKeyScope; label: string; description: string; category: string }[] = [
  { id: '*', label: 'Full Access (*)', description: 'Full access to all workspace resources and APIs', category: 'Administrative' },
  { id: 'agents:read', label: 'agents:read', description: 'View agents and their configurations', category: 'Agents' },
  { id: 'agents:write', label: 'agents:write', description: 'Create and update workspace agents', category: 'Agents' },
  { id: 'agents:execute', label: 'agents:execute', description: 'Trigger autonomous agent executions', category: 'Agents' },
  { id: 'workflows:read', label: 'workflows:read', description: 'View workflows and execution DAGs', category: 'Workflows' },
  { id: 'workflows:write', label: 'workflows:write', description: 'Create, modify, and delete workflows', category: 'Workflows' },
  { id: 'workflows:execute', label: 'workflows:execute', description: 'Trigger agent and workflow executions', category: 'Workflows' },
  { id: 'executions:read', label: 'executions:read', description: 'Read execution telemetry, outputs, and event logs', category: 'Telemetry' },
  { id: 'connectors:read', label: 'connectors:read', description: 'View installed connectors and status', category: 'Connectors' },
  { id: 'connectors:write', label: 'connectors:write', description: 'Install, authorize, and configure connectors', category: 'Connectors' },
  { id: 'activity:read', label: 'activity:read', description: 'Read immutable workspace audit trail', category: 'Telemetry' },
  { id: 'audit:read', label: 'audit:read', description: 'Read compliance audit logs', category: 'Telemetry' },
  { id: 'webhooks:read', label: 'webhooks:read', description: 'View configured developer webhook delivery endpoints', category: 'Webhooks' },
  { id: 'webhooks:write', label: 'webhooks:write', description: 'Register, test, and delete developer webhooks', category: 'Webhooks' },
];

export const SettingsPage: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { user, currentWorkspace } = useAuth();

  const workspaceId = currentWorkspace?.id || 'ws_personal_dev_01';
  const userId = user?.id || 'current_user';

  // State
  const [savedGeneral, setSavedGeneral] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || 'Developer');
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || 'Personal Workspace');

  // Role & Membership
  const [currentRole, setCurrentRole] = useState<WorkspaceRole>('owner');
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Policy State
  const [policy, setPolicy] = useState<WorkspacePolicy | null>(null);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policySaved, setPolicySaved] = useState(false);

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<ApiKeyScope[]>(['workflows:execute', 'agents:read']);
  const [keyExpiryDays, setKeyExpiryDays] = useState<number>(90);
  const [createdKeySecret, setCreatedKeySecret] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyModalStep, setKeyModalStep] = useState<1 | 2 | 3>(1);
  const [keyEnv, setKeyEnv] = useState<'live' | 'test'>('live');

  // Webhooks State
  const [webhooks, setWebhooks] = useState<DeveloperWebhook[]>([]);
  const [loadingWebhooks, setLoadingWebhooks] = useState(false);
  const [showAddWebhookModal, setShowAddWebhookModal] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookDesc, setNewWebhookDesc] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<WebhookEventType[]>([
    'workflow.completed',
    'workflow.failed',
    'approval.requested',
  ]);
  const [createdWebhookSecret, setCreatedWebhookSecret] = useState<string | null>(null);
  const [copiedWebhookSecret, setCopiedWebhookSecret] = useState(false);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  // Security Events Feed
  const [securityEvents, setSecurityEvents] = useState<AuditLogEntry[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Invite Member Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('member');
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Active tab
  const activeTab = tab ? tab.toLowerCase() : 'general';

  const tabs = [
    { id: 'general', label: 'General', icon: Sliders, to: '/app/settings/general' },
    { id: 'workspace', label: 'Workspace', icon: Building2, to: '/app/settings/workspace' },
    { id: 'security', label: 'Security', icon: ShieldCheck, to: '/app/settings/security' },
    { id: 'permissions', label: 'Permissions', icon: Lock, to: '/app/settings/permissions' },
    { id: 'api', label: 'API Keys', icon: Key, to: '/app/settings/api' },
    { id: 'billing', label: 'Billing', icon: CreditCard, to: '/app/settings/billing' },
  ];

  // Load User Membership Role
  useEffect(() => {
    const loadRole = async () => {
      const membership = await getWorkspaceMembership(workspaceId, userId);
      if (membership) {
        setCurrentRole(membership.role as WorkspaceRole);
      }
    };
    loadRole();
  }, [workspaceId, userId]);

  // Load Data for Tab
  const loadTabContent = useCallback(async () => {
    if (activeTab === 'api') {
      setLoadingKeys(true);
      setLoadingWebhooks(true);
      try {
        const [{ keys }, { webhooks: whList }] = await Promise.all([
          getWorkspaceApiKeys(workspaceId),
          getWorkspaceWebhooks(workspaceId)
        ]);
        setApiKeys(keys);
        setWebhooks(whList);
      } finally {
        setLoadingKeys(false);
        setLoadingWebhooks(false);
      }
    } else if (activeTab === 'permissions') {
      const p = await getWorkspacePolicy(workspaceId);
      setPolicy(p);
    } else if (activeTab === 'workspace') {
      setLoadingMembers(true);
      try {
        const list = await getWorkspaceMembers(workspaceId);
        setMembers(list);
      } finally {
        setLoadingMembers(false);
      }
    } else if (activeTab === 'security') {
      setLoadingEvents(true);
      try {
        const { logs } = await getWorkspaceAuditLogs(workspaceId, { limit: 15 });
        setSecurityEvents(logs);
      } finally {
        setLoadingEvents(false);
      }
    }
  }, [activeTab, workspaceId]);

  useEffect(() => {
    loadTabContent();
  }, [loadTabContent]);

  // Handle General Save
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedGeneral(true);
    setTimeout(() => setSavedGeneral(false), 2000);
  };

  // Handle Policy Update
  const handleSavePolicy = async () => {
    if (!policy) return;
    setSavingPolicy(true);
    try {
      await updateWorkspacePolicy(workspaceId, policy, userId);
      setPolicySaved(true);
      setTimeout(() => setPolicySaved(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to update policy');
    } finally {
      setSavingPolicy(false);
    }
  };

  // Handle API Key Creation
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    let expiresAt: string | undefined = undefined;
    if (keyExpiryDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + keyExpiryDays);
      expiresAt = d.toISOString();
    }

    const res = await createApiKey({
      workspaceId,
      name: newKeyName.trim(),
      scopes: selectedScopes,
      expiresAt,
      createdBy: userId,
    });

    if (res.error) {
      alert(res.error);
      return;
    }

    if (res.rawKey) {
      setCreatedKeySecret(res.rawKey);
      setShowCreateKeyModal(false);
      setNewKeyName('');
      const { keys } = await getWorkspaceApiKeys(workspaceId);
      setApiKeys(keys);
    }
  };

  // Handle API Key Revocation
  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) return;
    try {
      await revokeApiKey(workspaceId, keyId, userId);
      const { keys } = await getWorkspaceApiKeys(workspaceId);
      setApiKeys(keys);
    } catch (err: any) {
      alert(err.message || 'Failed to revoke API key');
    }
  };

  // Handle Developer Webhook Creation
  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;

    try {
      const res = await createDeveloperWebhook(workspaceId, {
        url: newWebhookUrl.trim(),
        description: newWebhookDesc.trim(),
        events: newWebhookEvents,
      });

      if (res.error) {
        alert(res.error);
        return;
      }

      if (res.secret) {
        setCreatedWebhookSecret(res.secret);
        setShowAddWebhookModal(false);
        setNewWebhookUrl('');
        setNewWebhookDesc('');
        const { webhooks: whList } = await getWorkspaceWebhooks(workspaceId);
        setWebhooks(whList);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to register webhook');
    }
  };

  // Handle Developer Webhook Deletion
  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this developer webhook?')) return;
    try {
      await deleteDeveloperWebhook(workspaceId, webhookId);
      const { webhooks: whList } = await getWorkspaceWebhooks(workspaceId);
      setWebhooks(whList);
    } catch (err: any) {
      alert(err.message || 'Failed to delete webhook');
    }
  };

  // Handle Webhook Test Event Ping
  const handleTestWebhook = async (webhookId: string) => {
    setTestingWebhookId(webhookId);
    try {
      const res = await sendTestWebhookEvent(workspaceId, webhookId);
      if (res.success) {
        setTestResults((prev) => ({
          ...prev,
          [webhookId]: { success: true, message: `Ping delivered successfully (${res.status || 200} OK)` },
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          [webhookId]: { success: false, message: res.error || 'Delivery failed' },
        }));
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [webhookId]: { success: false, message: err.message || 'Test error' },
      }));
    } finally {
      setTestingWebhookId(null);
    }
  };

  const copyWebhookSecretHandler = () => {
    if (createdWebhookSecret) {
      navigator.clipboard.writeText(createdWebhookSecret);
      setCopiedWebhookSecret(true);
      setTimeout(() => setCopiedWebhookSecret(false), 2000);
    }
  };

  // Handle Member Invitation
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      setInviteError('Please enter a valid email address.');
      return;
    }

    try {
      await inviteWorkspaceMember({
        workspaceId,
        email: inviteEmail.trim(),
        role: inviteRole,
        invitedByUserId: userId,
      });
      setShowInviteModal(false);
      setInviteEmail('');
      const list = await getWorkspaceMembers(workspaceId);
      setMembers(list);
    } catch (err: any) {
      setInviteError(err.message || 'Failed to invite member');
    }
  };

  // Handle Member Role Change
  const handleRoleChange = async (memberId: string, newRole: WorkspaceRole) => {
    try {
      await updateWorkspaceMemberRole({
        workspaceId,
        memberId,
        newRole,
        updatedByUserId: userId,
      });
      const list = await getWorkspaceMembers(workspaceId);
      setMembers(list);
    } catch (err: any) {
      alert(err.message || 'Failed to update member role');
    }
  };

  // Handle Member Removal
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the workspace?')) return;
    try {
      await removeWorkspaceMember({
        workspaceId,
        memberId,
        removedByUserId: userId,
      });
      const list = await getWorkspaceMembers(workspaceId);
      setMembers(list);
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const copySecret = () => {
    if (createdKeySecret) {
      navigator.clipboard.writeText(createdKeySecret);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const isPolicyAdmin = canManagePolicies(currentRole);
  const isKeyAdmin = canManageApiKeys(currentRole);
  const isMemberAdmin = canManageMembers(currentRole);

  return (
    <div className="flex flex-col gap-8 text-left max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#111318]">
            Settings
          </h2>
          <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-purple-50 text-[#6D4AFF] border border-purple-200">
            Role: {currentRole.toUpperCase()}
          </span>
        </div>
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
            
            {/* GENERAL TAB */}
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
                  {savedGeneral && (
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

            {/* WORKSPACE TAB */}
            {activeTab === 'workspace' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-[#111318] mb-1">
                      Workspace Governance & Members
                    </h3>
                    <p className="text-xs text-[#626873]">
                      Centralized workspace administration, role assignments, and team boundaries.
                    </p>
                  </div>
                  {isMemberAdmin && (
                    <Button size="sm" onClick={() => setShowInviteModal(true)}>
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      <span>Invite Member</span>
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#EFEFEA]">
                  <div>
                    <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-sm text-[#111318] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                      Workspace ID
                    </label>
                    <input
                      type="text"
                      disabled
                      value={workspaceId}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#F4F4F0] border border-[#E5E5E2] text-xs font-mono text-[#8B919B] outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#111318] mb-3">
                    Workspace Members ({members.length})
                  </h4>
                  {loadingMembers ? (
                    <div className="py-8 text-center text-xs text-[#8B919B]">Loading members...</div>
                  ) : (
                    <div className="rounded-xl border border-[#E5E5E2] overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAFAF8] border-b border-[#E5E5E2] text-[11px] font-mono uppercase text-[#8B919B]">
                            <th className="py-2.5 px-4 font-semibold">User</th>
                            <th className="py-2.5 px-4 font-semibold">Status</th>
                            <th className="py-2.5 px-4 font-semibold">Role</th>
                            <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFEFEA]">
                          {members.map((m) => {
                            const isOwner = m.role === 'owner';
                            return (
                              <tr key={m.id} className="hover:bg-[#FAFAF8]/50">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-[#6D4AFF]/10 text-[#6D4AFF] flex items-center justify-center font-bold text-xs uppercase">
                                      {m.user_id.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-[#111318] font-mono text-[11px]">{m.user_id}</div>
                                      <div className="text-[10px] text-[#8B919B]">Joined {new Date(m.created_at).toLocaleDateString()}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${
                                    m.status === 'active' 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}>
                                    {m.status === 'active' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                    {m.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  {isMemberAdmin && !isOwner ? (
                                    <select
                                      value={m.role}
                                      onChange={(e) => handleRoleChange(m.id, e.target.value as WorkspaceRole)}
                                      className="h-8 px-2 rounded-lg bg-white border border-[#E5E5E2] text-xs font-semibold text-[#111318] outline-none"
                                    >
                                      <option value="admin">Admin</option>
                                      <option value="member">Member</option>
                                      <option value="viewer">Viewer</option>
                                    </select>
                                  ) : (
                                    <span className="font-mono text-[11px] uppercase font-bold text-[#6D4AFF]">
                                      {m.role}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {isMemberAdmin && !isOwner && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMember(m.id)}
                                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                      title="Remove member"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-[#111318] mb-1">
                    Platform Security & Invariants
                  </h3>
                  <p className="text-xs text-[#626873]">
                    Active cryptographic safeguards, sandboxing invariants, and security telemetry.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#6D4AFF]" />
                        <span className="text-xs font-bold text-[#111318]">Token Encryption Vault</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        AES-GCM-256
                      </span>
                    </div>
                    <p className="text-[11px] text-[#626873] leading-relaxed">
                      Connector credentials and keys are protected using hardware-backed WebCrypto keys with versioned ciphertext (<span className="font-mono text-[10px]">v1:iv:cipher</span>).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-[#111318]">SSRF Network Defense</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-[#626873] leading-relaxed">
                      Egress calls to MCP tools, A2A agents, and webhooks strictly block loopback, link-local metadata (169.254.169.254), and private RFC1918 CIDRs.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#6D4AFF]" />
                        <span className="text-xs font-bold text-[#111318]">Audit Immutability</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        APPEND-ONLY
                      </span>
                    </div>
                    <p className="text-[11px] text-[#626873] leading-relaxed">
                      Workspace audit events cannot be deleted or updated. Enforced via PostgreSQL database immutability triggers.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#6D4AFF]" />
                        <span className="text-xs font-bold text-[#111318]">Active Identity Session</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        VERIFIED
                      </span>
                    </div>
                    <p className="text-[11px] text-[#626873] leading-relaxed">
                      Signed JWT session bound to workspace <span className="font-mono text-[10px] text-[#111318]">{workspaceId}</span>. Role-based capability enforcement active.
                    </p>
                  </div>
                </div>

                {/* Security Audit Feed */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-[#111318]">
                      Recent Security Events Feed
                    </h4>
                    <button
                      type="button"
                      onClick={() => loadTabContent()}
                      className="text-[11px] text-[#6D4AFF] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                  </div>

                  {loadingEvents ? (
                    <div className="py-6 text-center text-xs text-[#8B919B]">Loading security events...</div>
                  ) : securityEvents.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#8B919B] text-center">
                      No security audit events recorded yet in this workspace.
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#E5E5E2] overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAFAF8] border-b border-[#E5E5E2] text-[11px] font-mono uppercase text-[#8B919B]">
                            <th className="py-2.5 px-4 font-semibold">Time</th>
                            <th className="py-2.5 px-4 font-semibold">Action</th>
                            <th className="py-2.5 px-4 font-semibold">Resource</th>
                            <th className="py-2.5 px-4 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFEFEA]">
                          {securityEvents.map((evt) => (
                            <tr key={evt.id} className="hover:bg-[#FAFAF8]/50">
                              <td className="py-2.5 px-4 font-mono text-[11px] text-[#8B919B] whitespace-nowrap">
                                {new Date(evt.created_at).toLocaleTimeString()}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-[11px] font-semibold text-[#111318]">
                                {evt.action}
                              </td>
                              <td className="py-2.5 px-4 text-[#626873]">
                                <span className="font-mono text-[10px] text-[#6D4AFF] bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 uppercase">
                                  {evt.resource_type}
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                <span className={`font-mono text-[10px] uppercase font-bold ${
                                  evt.status === 'success' ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                  {evt.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PERMISSIONS TAB */}
            {activeTab === 'permissions' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-[#111318] mb-1">
                    Workspace Governance & Execution Policies
                  </h3>
                  <p className="text-xs text-[#626873]">
                    Configure execution bounds, human-in-the-loop gates, and view the role capability matrix.
                  </p>
                </div>

                {!isPolicyAdmin && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      Viewing policy in read-only mode as <strong>{currentRole.toUpperCase()}</strong>. Only Workspace Admins or Owners can modify governance policies.
                    </span>
                  </div>
                )}

                {policy && (
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-[#111318]">Max Agent Steps</label>
                          <span className="font-mono text-xs font-bold text-[#6D4AFF]">{policy.max_agent_steps}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="50"
                          disabled={!isPolicyAdmin}
                          value={policy.max_agent_steps}
                          onChange={(e) => setPolicy({ ...policy, max_agent_steps: parseInt(e.target.value, 10) })}
                          className="w-full accent-[#6D4AFF] cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="text-[11px] text-[#8B919B]">Hard bound on autonomous model reasoning iterations</span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-[#111318]">Max Tool Calls Per Run</label>
                          <span className="font-mono text-xs font-bold text-[#6D4AFF]">{policy.max_tool_calls}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="50"
                          disabled={!isPolicyAdmin}
                          value={policy.max_tool_calls}
                          onChange={(e) => setPolicy({ ...policy, max_tool_calls: parseInt(e.target.value, 10) })}
                          className="w-full accent-[#6D4AFF] cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="text-[11px] text-[#8B919B]">Ceiling on tool dispatches per agent execution</span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-[#111318]">Max Workflow Runtime (sec)</label>
                          <span className="font-mono text-xs font-bold text-[#6D4AFF]">{policy.max_workflow_runtime_seconds}s</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="1800"
                          step="30"
                          disabled={!isPolicyAdmin}
                          value={policy.max_workflow_runtime_seconds}
                          onChange={(e) => setPolicy({ ...policy, max_workflow_runtime_seconds: parseInt(e.target.value, 10) })}
                          className="w-full accent-[#6D4AFF] cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="text-[11px] text-[#8B919B]">Execution timeout for end-to-end multi-agent DAGs</span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-[#111318]">Max Nodes Per Workflow</label>
                          <span className="font-mono text-xs font-bold text-[#6D4AFF]">{policy.max_nodes_per_workflow}</span>
                        </div>
                        <input
                          type="range"
                          min="3"
                          max="40"
                          disabled={!isPolicyAdmin}
                          value={policy.max_nodes_per_workflow}
                          onChange={(e) => setPolicy({ ...policy, max_nodes_per_workflow: parseInt(e.target.value, 10) })}
                          className="w-full accent-[#6D4AFF] cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="text-[11px] text-[#8B919B]">Workflow complexity ceiling in workspace</span>
                      </div>
                    </div>

                    {/* Policy Toggles */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                        <div>
                          <div className="text-xs font-bold text-[#111318]">Require Human Approval for Production Deployments</div>
                          <div className="text-[11px] text-[#626873]">Enforce human reviewer sign-off before executing production deployment actions.</div>
                        </div>
                        <button
                          type="button"
                          disabled={!isPolicyAdmin}
                          onClick={() => setPolicy({ ...policy, require_approval_for_deploy: !policy.require_approval_for_deploy })}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                            policy.require_approval_for_deploy
                              ? 'bg-purple-50 text-[#6D4AFF] border border-purple-200'
                              : 'bg-[#FAFAF8] text-[#8B919B] border border-[#E5E5E2]'
                          }`}
                        >
                          {policy.require_approval_for_deploy ? 'REQUIRED' : 'OPTIONAL'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                        <div>
                          <div className="text-xs font-bold text-[#111318]">Allow External A2A Autonomous Agents</div>
                          <div className="text-[11px] text-[#626873]">Permit workflows to invoke third-party A2A protocol agents.</div>
                        </div>
                        <button
                          type="button"
                          disabled={!isPolicyAdmin}
                          onClick={() => setPolicy({ ...policy, allow_external_agents: !policy.allow_external_agents })}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                            policy.allow_external_agents
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {policy.allow_external_agents ? 'ALLOWED' : 'BLOCKED'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                        <div>
                          <div className="text-xs font-bold text-[#111318]">Allow Model Context Protocol (MCP) Servers</div>
                          <div className="text-[11px] text-[#626873]">Enable tools sourced from connected external MCP servers.</div>
                        </div>
                        <button
                          type="button"
                          disabled={!isPolicyAdmin}
                          onClick={() => setPolicy({ ...policy, allow_mcp: !policy.allow_mcp })}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                            policy.allow_mcp
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {policy.allow_mcp ? 'ALLOWED' : 'BLOCKED'}
                        </button>
                      </div>
                    </div>

                    {isPolicyAdmin && (
                      <div className="pt-2 flex items-center justify-between">
                        {policySaved && (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-mono">
                            <Check className="w-3.5 h-3.5" /> Workspace policy saved successfully
                          </span>
                        )}
                        <Button
                          size="sm"
                          className="ml-auto"
                          disabled={savingPolicy}
                          onClick={handleSavePolicy}
                        >
                          {savingPolicy ? 'Saving...' : 'Save Policy Changes'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Role Permission Matrix Table */}
                <div className="pt-6 border-t border-[#EFEFEA]">
                  <h4 className="text-xs font-bold text-[#111318] mb-1">
                    Role-Based Access Control (RBAC) Matrix
                  </h4>
                  <p className="text-[11px] text-[#626873] mb-3">
                    Fixed privilege hierarchies governing workspace capabilities.
                  </p>

                  <div className="rounded-xl border border-[#E5E5E2] overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FAFAF8] border-b border-[#E5E5E2] text-[11px] font-mono uppercase text-[#8B919B]">
                          <th className="py-2.5 px-4 font-semibold">Capability Area</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Viewer</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Member</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Admin</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Owner</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFEFEA]">
                        {[
                          { name: 'View Workflows & Agents', v: true, m: true, a: true, o: true },
                          { name: 'Execute Agents & Workflows', v: false, m: true, a: true, o: true },
                          { name: 'Create / Modify Workflows & Agents', v: false, m: true, a: true, o: true },
                          { name: 'Connect Third-Party Services (GitHub, Vercel)', v: false, m: false, a: true, o: true },
                          { name: 'Manage API Keys & Programmatic Access', v: false, m: false, a: true, o: true },
                          { name: 'Configure Security & Governance Policies', v: false, m: false, a: true, o: true },
                          { name: 'Invite & Manage Team Members', v: false, m: false, a: true, o: true },
                          { name: 'Workspace Billing & Ownership Transfer', v: false, m: false, a: false, o: true },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#FAFAF8]/50">
                            <td className="py-2.5 px-4 font-medium text-[#111318]">{row.name}</td>
                            <td className="py-2.5 px-3 text-center">{row.v ? <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <span className="text-[#8B919B]">-</span>}</td>
                            <td className="py-2.5 px-3 text-center">{row.m ? <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <span className="text-[#8B919B]">-</span>}</td>
                            <td className="py-2.5 px-3 text-center">{row.a ? <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <span className="text-[#8B919B]">-</span>}</td>
                            <td className="py-2.5 px-3 text-center">{row.o ? <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <span className="text-[#8B919B]">-</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* API KEYS & DEVELOPER PLATFORM TAB */}
            {activeTab === 'api' && (
              <div className="flex flex-col gap-8">
                {/* Header & Quick Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-[#111318] mb-1">
                      Developer Platform, Keys & Webhooks
                    </h3>
                    <p className="text-xs text-[#626873]">
                      Cryptographically secure API keys, signed real-time webhooks, and programmatic SDK integration.
                    </p>
                  </div>
                  {isKeyAdmin && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setShowAddWebhookModal(true)}>
                        <Webhook className="w-3.5 h-3.5 mr-1.5 text-[#6D4AFF]" />
                        <span>Add Webhook</span>
                      </Button>
                      <Button size="sm" onClick={() => { setKeyModalStep(1); setShowCreateKeyModal(true); }}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        <span>Create API Key</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Developer Telemetry & Limits Card */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-2xs">
                    <span className="text-[10px] font-mono uppercase text-[#8B919B]">API Requests (Billing Cycle)</span>
                    <div className="text-xl font-bold text-[#111318] mt-1">1,482</div>
                    <span className="text-[10px] text-emerald-600 font-medium">&uarr; 12% vs last cycle</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-2xs">
                    <span className="text-[10px] font-mono uppercase text-[#8B919B]">Rate Limit Tier</span>
                    <div className="text-xl font-bold text-[#111318] mt-1">120 <span className="text-xs text-[#8B919B] font-normal">req/min</span></div>
                    <span className="text-[10px] text-[#626873]">Burst allowance: 180</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-2xs">
                    <span className="text-[10px] font-mono uppercase text-[#8B919B]">Active API Keys</span>
                    <div className="text-xl font-bold text-[#111318] mt-1">{apiKeys.filter(k => k.status === 'active').length}</div>
                    <span className="text-[10px] text-[#626873]">Max 20 live keys</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-2xs">
                    <span className="text-[10px] font-mono uppercase text-[#8B919B]">Active Webhooks</span>
                    <div className="text-xl font-bold text-[#111318] mt-1">{webhooks.filter(w => w.status === 'active').length}</div>
                    <span className="text-[10px] text-[#626873]">HMAC-SHA256 verified</span>
                  </div>
                </div>

                {!isKeyAdmin && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      Viewing API keys and webhooks in read-only mode as <strong>{currentRole.toUpperCase()}</strong>. Only Workspace Admins or Owners can provision keys or configure webhooks.
                    </span>
                  </div>
                )}

                {/* API KEYS SECTION */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#111318] flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#6D4AFF]" />
                      <span>Workspace API Keys</span>
                    </h4>
                    <span className="text-xs text-[#8B919B]">Prefix: <code className="font-mono text-xs">nxs_live_</code></span>
                  </div>

                  {loadingKeys ? (
                    <div className="py-10 text-center text-xs text-[#8B919B]">Loading API keys...</div>
                  ) : apiKeys.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] text-center flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E5E2] text-[#6D4AFF] flex items-center justify-center mb-3">
                        <Key className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-[#111318] mb-1">No API keys created yet</h4>
                      <p className="text-xs text-[#626873] max-w-sm mb-4">
                        Create a scoped API key to trigger workflows, run agents, and integrate with external CI/CD or CLI tools.
                      </p>
                      {isKeyAdmin && (
                        <Button size="sm" onClick={() => { setKeyModalStep(1); setShowCreateKeyModal(true); }}>
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Create API Key
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#E5E5E2] overflow-hidden bg-white shadow-2xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAFAF8] border-b border-[#E5E5E2] text-[11px] font-mono uppercase text-[#8B919B]">
                            <th className="py-2.5 px-4 font-semibold">Name</th>
                            <th className="py-2.5 px-4 font-semibold">Token Prefix</th>
                            <th className="py-2.5 px-4 font-semibold">Scopes</th>
                            <th className="py-2.5 px-4 font-semibold">Status</th>
                            <th className="py-2.5 px-4 font-semibold">Created</th>
                            <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFEFEA]">
                          {apiKeys.map((k) => (
                            <tr key={k.id} className="hover:bg-[#FAFAF8]/50">
                              <td className="py-3 px-4 font-semibold text-[#111318]">
                                {k.name}
                              </td>
                              <td className="py-3 px-4 font-mono text-[11px] text-[#6D4AFF]">
                                {k.key_prefix}...
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {k.scopes.slice(0, 2).map((s) => (
                                    <span key={s} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#FAFAF8] text-[#626873] border border-[#E5E5E2]">
                                      {s}
                                    </span>
                                  ))}
                                  {k.scopes.length > 2 && (
                                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#FAFAF8] text-[#8B919B]">
                                      +{k.scopes.length - 2}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                  k.status === 'active' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {k.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono text-[10px] text-[#8B919B]">
                                {new Date(k.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {isKeyAdmin && k.status === 'active' && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevokeKey(k.id)}
                                    className="text-red-500 hover:text-red-700 text-xs font-semibold hover:underline cursor-pointer"
                                  >
                                    Revoke
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* DEVELOPER WEBHOOKS SECTION */}
                <div className="space-y-3 pt-4 border-t border-[#EFEFEA]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-[#111318] flex items-center gap-2">
                        <Webhook className="w-4 h-4 text-emerald-600" />
                        <span>Developer Webhooks</span>
                      </h4>
                      <p className="text-xs text-[#626873] mt-0.5">
                        Deliver real-time JSON execution payloads signed with HMAC-SHA256 (<code className="font-mono text-[11px]">X-NEXUS-Signature</code>).
                      </p>
                    </div>
                    {isKeyAdmin && (
                      <Button size="sm" variant="secondary" onClick={() => setShowAddWebhookModal(true)}>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        <span>Add Endpoint</span>
                      </Button>
                    )}
                  </div>

                  {loadingWebhooks ? (
                    <div className="py-10 text-center text-xs text-[#8B919B]">Loading webhooks...</div>
                  ) : webhooks.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] text-center flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E5E2] text-emerald-600 flex items-center justify-center mb-3">
                        <Webhook className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-[#111318] mb-1">No webhooks registered</h4>
                      <p className="text-xs text-[#626873] max-w-sm mb-4">
                        Add an HTTPS URL to receive instant notifications when workflows complete, agents fail, or human approvals are requested.
                      </p>
                      {isKeyAdmin && (
                        <Button size="sm" variant="secondary" onClick={() => setShowAddWebhookModal(true)}>
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Register Webhook
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#E5E5E2] overflow-hidden bg-white shadow-2xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAFAF8] border-b border-[#E5E5E2] text-[11px] font-mono uppercase text-[#8B919B]">
                            <th className="py-2.5 px-4 font-semibold">Endpoint URL</th>
                            <th className="py-2.5 px-4 font-semibold">Events</th>
                            <th className="py-2.5 px-4 font-semibold">Status</th>
                            <th className="py-2.5 px-4 font-semibold">Created</th>
                            <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFEFEA]">
                          {webhooks.map((w) => {
                            const isTesting = testingWebhookId === w.id;
                            const result = testResults[w.id];
                            return (
                              <tr key={w.id} className="hover:bg-[#FAFAF8]/50">
                                <td className="py-3 px-4">
                                  <div className="font-mono text-[11px] text-[#111318] font-semibold truncate max-w-xs">
                                    {w.url}
                                  </div>
                                  {w.description && (
                                    <div className="text-[10px] text-[#8B919B] mt-0.5">{w.description}</div>
                                  )}
                                  {result && (
                                    <div className={`text-[10px] font-mono mt-1 ${result.success ? 'text-emerald-600 font-semibold' : 'text-red-600'}`}>
                                      {result.message}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-wrap gap-1 max-w-xs">
                                    {w.events.map((ev) => (
                                      <span key={ev} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-[#6D4AFF] border border-purple-200">
                                        {ev}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {w.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-[10px] text-[#8B919B]">
                                  {new Date(w.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      disabled={isTesting}
                                      onClick={() => handleTestWebhook(w.id)}
                                      className="px-2 py-1 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] hover:bg-white text-[11px] font-mono text-[#111318] hover:text-[#6D4AFF] flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <Send className={`w-3 h-3 ${isTesting ? 'animate-spin text-[#6D4AFF]' : ''}`} />
                                      <span>{isTesting ? 'Pinging...' : 'Send Test Ping'}</span>
                                    </button>
                                    {isKeyAdmin && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteWebhook(w.id)}
                                        className="text-red-500 hover:text-red-700 text-xs font-semibold p-1 cursor-pointer"
                                        title="Delete Webhook"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BILLING TAB */}
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
                      Unlimited connectors · Full AI runtime · Standard execution boundaries
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
                  <span>Billing is in preview. All workspace governance tools are enabled for development.</span>
                  <span className="font-mono text-[10px] text-[#8B919B]">DEV_PREVIEW</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* CREATE API KEY MULTI-STEP WIZARD MODAL */}
      {showCreateKeyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-[#E5E5E2] shadow-xl max-w-lg w-full p-6 text-left">
            {/* Step Indicators */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EFEFEA] mb-5">
              <div>
                <h3 className="text-base font-bold text-[#111318]">Create Secret API Key</h3>
                <span className="text-xs text-[#8B919B]">Step {keyModalStep} of 3</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-colors ${
                      keyModalStep === step
                        ? 'bg-[#6D4AFF] text-white'
                        : keyModalStep > step
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#FAFAF8] text-[#8B919B] border border-[#E5E5E2]'
                    }`}
                  >
                    {keyModalStep > step ? '✓' : step}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={keyModalStep === 3 ? handleCreateKey : (e) => { e.preventDefault(); setKeyModalStep((s) => (s + 1) as any); }}>
              {/* STEP 1: Name & Environment */}
              {keyModalStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111318] mb-1">Key Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CI/CD GitHub Action or Webhook Dispatcher"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] focus:bg-white text-xs text-[#111318] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111318] mb-1">Environment</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setKeyEnv('live')}
                        className={`p-3 rounded-xl text-left border cursor-pointer transition-all ${
                          keyEnv === 'live'
                            ? 'bg-purple-50/50 border-[#6D4AFF] text-[#111318]'
                            : 'bg-white border-[#E5E5E2] text-[#626873]'
                        }`}
                      >
                        <div className="font-mono text-xs font-bold text-[#6D4AFF]">Production (nxs_live_)</div>
                        <div className="text-[10px] text-[#8B919B] mt-0.5">Executes against production agents & tools</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setKeyEnv('test')}
                        className={`p-3 rounded-xl text-left border cursor-pointer transition-all ${
                          keyEnv === 'test'
                            ? 'bg-purple-50/50 border-[#6D4AFF] text-[#111318]'
                            : 'bg-white border-[#E5E5E2] text-[#626873]'
                        }`}
                      >
                        <div className="font-mono text-xs font-bold text-neutral-800">Development (nxs_test_)</div>
                        <div className="text-[10px] text-[#8B919B] mt-0.5">Sandboxed execution for local tests</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Granular Scopes */}
              {keyModalStep === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#111318]">Assign Capabilities & Scopes</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedScopes.length === ALL_SCOPES.length) {
                          setSelectedScopes([]);
                        } else {
                          setSelectedScopes(ALL_SCOPES.map(s => s.id));
                        }
                      }}
                      className="text-[11px] font-mono text-[#6D4AFF] hover:underline cursor-pointer"
                    >
                      {selectedScopes.length === ALL_SCOPES.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto rounded-xl border border-[#E5E5E2] p-2 space-y-3 bg-[#FAFAF8]/50">
                    {['Agents', 'Workflows', 'Telemetry', 'Webhooks', 'Connectors'].map((category) => {
                      const catScopes = ALL_SCOPES.filter(s => s.category === category);
                      if (catScopes.length === 0) return null;
                      return (
                        <div key={category} className="space-y-1">
                          <div className="text-[10px] font-mono uppercase text-[#8B919B] px-1 font-semibold">
                            {category}
                          </div>
                          <div className="space-y-1">
                            {catScopes.map((sc) => {
                              const isChecked = selectedScopes.includes(sc.id);
                              return (
                                <label key={sc.id} className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setSelectedScopes(selectedScopes.filter((s) => s !== sc.id));
                                      } else {
                                        setSelectedScopes([...selectedScopes, sc.id]);
                                      }
                                    }}
                                    className="mt-0.5 accent-[#6D4AFF]"
                                  />
                                  <div>
                                    <div className="text-xs font-mono font-semibold text-[#111318]">{sc.label}</div>
                                    <div className="text-[10px] text-[#8B919B]">{sc.description}</div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Expiration & Review */}
              {keyModalStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111318] mb-1">Key Expiration</label>
                    <select
                      value={keyExpiryDays}
                      onChange={(e) => setKeyExpiryDays(parseInt(e.target.value, 10))}
                      className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] outline-none"
                    >
                      <option value={30}>30 Days</option>
                      <option value={90}>90 Days (Recommended)</option>
                      <option value={365}>1 Year</option>
                      <option value={0}>No Expiration</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-2 text-xs">
                    <div className="flex justify-between text-[#626873]">
                      <span>Key Name:</span>
                      <strong className="text-[#111318]">{newKeyName}</strong>
                    </div>
                    <div className="flex justify-between text-[#626873]">
                      <span>Environment:</span>
                      <strong className="font-mono text-[#6D4AFF]">{keyEnv.toUpperCase()}</strong>
                    </div>
                    <div className="flex justify-between text-[#626873]">
                      <span>Selected Scopes:</span>
                      <span className="font-mono text-xs">{selectedScopes.length} scopes</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-[#EFEFEA] mt-5">
                {keyModalStep > 1 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setKeyModalStep((s) => (s - 1) as any)}
                  >
                    Back
                  </Button>
                ) : (
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateKeyModal(false)}>
                    Cancel
                  </Button>
                )}

                <Button type="submit" size="sm" disabled={!newKeyName.trim()}>
                  {keyModalStep === 3 ? 'Generate API Key' : 'Continue'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONE-TIME API KEY REVEAL DIALOG */}
      {createdKeySecret && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-[#E5E5E2] shadow-2xl max-w-lg w-full p-6 text-left">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#111318]">Save Your Secret API Key</h3>
            </div>
            
            <p className="text-xs text-[#626873] mb-4 leading-relaxed">
              Please copy your API key and store it securely now. For security purposes, <strong>it will never be displayed again</strong>. If you lose this secret, you will need to generate a new key.
            </p>

            <div className="p-3.5 rounded-xl bg-[#111318] text-white flex items-center justify-between font-mono text-xs mb-5">
              <span className="break-all select-all">{createdKeySecret}</span>
              <button
                type="button"
                onClick={copySecret}
                className="ml-3 shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Copy to clipboard"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <Button size="sm" onClick={() => setCreatedKeySecret(null)}>
                I have copied my key securely
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER DEVELOPER WEBHOOK MODAL */}
      {showAddWebhookModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-[#E5E5E2] shadow-xl max-w-md w-full p-6 text-left">
            <h3 className="text-base font-bold text-[#111318] mb-1">Add Webhook Endpoint</h3>
            <p className="text-xs text-[#626873] mb-4">
              Receive cryptographically signed HMAC-SHA256 HTTP POST notifications for real-time workspace events.
            </p>

            <form onSubmit={handleCreateWebhook} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#111318] mb-1">Endpoint URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourdomain.com/webhooks/nexus"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] focus:bg-white text-xs text-[#111318] font-mono outline-none"
                />
                <p className="text-[10px] text-[#8B919B] mt-1">Must use secure HTTPS (http allowed for local dev only).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Production CI/CD Slack notification service"
                  value={newWebhookDesc}
                  onChange={(e) => setNewWebhookDesc(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] mb-1.5">Subscribed Events</label>
                <div className="space-y-1 max-h-40 overflow-y-auto rounded-lg border border-[#E5E5E2] p-2 bg-[#FAFAF8]/50">
                  {ALL_WEBHOOK_EVENTS.map((ev) => {
                    const isChecked = newWebhookEvents.includes(ev.id);
                    return (
                      <label key={ev.id} className="flex items-start gap-2 p-1 rounded hover:bg-white cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setNewWebhookEvents(newWebhookEvents.filter((e) => e !== ev.id));
                            } else {
                              setNewWebhookEvents([...newWebhookEvents, ev.id]);
                            }
                          }}
                          className="mt-0.5 accent-[#6D4AFF]"
                        />
                        <div>
                          <span className="font-mono text-xs font-semibold text-[#111318]">{ev.id}</span>
                          <p className="text-[10px] text-[#8B919B]">{ev.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-50/60 border border-red-200/80 text-xs text-red-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  <strong>SSRF Defense:</strong> Internal loopback addresses (127.0.0.1), RFC1918 subnets, and cloud instance metadata endpoints (169.254.169.254) are rejected.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EFEFEA]">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddWebhookModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={!newWebhookUrl.trim() || newWebhookEvents.length === 0}>
                  Register Webhook
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONE-TIME WEBHOOK SECRET REVEAL DIALOG */}
      {createdWebhookSecret && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-[#E5E5E2] shadow-2xl max-w-lg w-full p-6 text-left">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#111318]">Webhook Signing Secret</h3>
            </div>

            <p className="text-xs text-[#626873] mb-4 leading-relaxed">
              Use this secret to verify the <code className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">X-NEXUS-Signature</code> HMAC header on incoming HTTP payloads. Store it securely in your server environment variables.
            </p>

            <div className="p-3.5 rounded-xl bg-[#111318] text-white flex items-center justify-between font-mono text-xs mb-5">
              <span className="break-all select-all">{createdWebhookSecret}</span>
              <button
                type="button"
                onClick={copyWebhookSecretHandler}
                className="ml-3 shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Copy secret"
              >
                {copiedWebhookSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <Button size="sm" onClick={() => setCreatedWebhookSecret(null)}>
                I have stored the secret
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* INVITE MEMBER MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-[#E5E5E2] shadow-xl max-w-md w-full p-6 text-left">
            <h3 className="text-base font-bold text-[#111318] mb-1">Invite Workspace Member</h3>
            <p className="text-xs text-[#626873] mb-4">
              Add a team member to collaborate within this workspace.
            </p>

            <form onSubmit={handleInviteMember} className="flex flex-col gap-4">
              {inviteError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  {inviteError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#111318] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] focus:bg-white text-xs text-[#111318] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] mb-1">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                  className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] outline-none"
                >
                  <option value="admin">Admin (Can manage settings, keys, and policies)</option>
                  <option value="member">Member (Can create, edit, and execute workflows)</option>
                  <option value="viewer">Viewer (Read-only observation access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EFEFEA]">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
