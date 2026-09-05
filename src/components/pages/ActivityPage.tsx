import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getWorkspaceActivities, WorkspaceActivity } from '../../services/activityService';
import { getWorkspaceAuditLogs } from '../../services/auditService';
import { AuditLogEntry } from '../../types/security';
import { EmptyState } from '../app/EmptyState';
import { 
  Activity, 
  Search, 
  CheckCircle2, 
  Network, 
  RefreshCw,
  XCircle,
  Radio,
  ChevronRight,
  ShieldCheck,
  Eye,
  X
} from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useAuth();

  const workspaceId = currentWorkspace?.id || 'ws_personal_dev_01';

  // Active View Mode: 'operational' | 'audit'
  const [viewMode, setViewMode] = useState<'operational' | 'audit'>('operational');

  // Operational State
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Agents' | 'Workflows' | 'Connectors' | 'Approvals' | 'Deployments'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState<WorkspaceActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Security Audit State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [selectedAuditAction, setSelectedAuditAction] = useState<string>('All');
  const [inspectAuditEntry, setInspectAuditEntry] = useState<AuditLogEntry | null>(null);

  const loadData = useCallback(async (showRefreshing = false) => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    if (showRefreshing) setIsRefreshing(true);
    try {
      if (viewMode === 'operational') {
        const { activities: list } = await getWorkspaceActivities(workspaceId);
        setActivities(list);
      } else {
        const { logs } = await getWorkspaceAuditLogs(workspaceId);
        setAuditLogs(logs);
      }
    } catch (err) {
      console.error('[NEXUS ActivityPage] Error loading data:', err);
    } finally {
      setLoading(false);
      if (showRefreshing) setIsRefreshing(false);
    }
  }, [workspaceId, viewMode]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const formatRelativeTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return `${Math.max(1, diffSecs)}s ago`;
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return isoString;
    }
  };

  const filteredActivities = activities.filter((r) => {
    const matchesFilter =
      selectedFilter === 'All' ||
      (selectedFilter === 'Agents' && r.type === 'agent') ||
      (selectedFilter === 'Workflows' && r.type === 'workflow') ||
      (selectedFilter === 'Connectors' && r.type === 'connector') ||
      (selectedFilter === 'Approvals' && (r.action?.toLowerCase().includes('approval') || r.details?.toLowerCase().includes('approval'))) ||
      (selectedFilter === 'Deployments' && (r.action?.toLowerCase().includes('deploy') || r.details?.toLowerCase().includes('deploy')));
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredAuditLogs = auditLogs.filter((l) => {
    const matchesAction = selectedAuditAction === 'All' || l.action === selectedAuditAction;
    const matchesSearch =
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.resource_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.resource_id && l.resource_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.user_id && l.user_id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111318] mb-1">
            Activity & Governance Audit
          </h2>
          <p className="text-sm text-[#626873]">
            Real-time telemetry, connector events, and immutable security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-white border border-[#E5E5E2] shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('operational')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'operational'
                  ? 'bg-[#111318] text-white shadow-xs'
                  : 'text-[#626873] hover:text-[#111318]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Operational</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'audit'
                  ? 'bg-[#111318] text-white shadow-xs'
                  : 'text-[#626873] hover:text-[#111318]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Security & Audit Logs</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] text-xs font-medium text-[#111318] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#626873] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8B919B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              viewMode === 'operational'
                ? 'Search execution traces and events...'
                : 'Search audit actions, resources, users...'
            }
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs text-[#111318] placeholder:text-[#8B919B] outline-none shadow-xs transition-colors"
          />
        </div>

        {/* Filter buttons */}
        {viewMode === 'operational' ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['All', 'Agents', 'Workflows', 'Connectors', 'Approvals', 'Deployments'] as const).map((filter) => {
              const isSelected = selectedFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#111318] text-white shadow-xs'
                      : 'bg-white text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] border border-[#E5E5E2]'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              'All',
              'agent.execute',
              'workflow.run',
              'approval.approve',
              'approval.reject',
              'key.create',
              'policy.update',
            ].map((action) => {
              const isSelected = selectedAuditAction === action;
              return (
                <button
                  key={action}
                  onClick={() => setSelectedAuditAction(action)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#111318] text-white shadow-xs'
                      : 'bg-white text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] border border-[#E5E5E2]'
                  }`}
                >
                  {action}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#8B919B]">
          Loading {viewMode === 'operational' ? 'workspace activity logs' : 'immutable security audit trail'}...
        </div>
      ) : viewMode === 'operational' ? (
        /* OPERATIONAL VIEW */
        filteredActivities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity events logged yet."
            description="Connector synchronizations, tool executions, and agent events in this workspace will automatically be recorded and tracked here."
            actionLabel="Explore Connectors"
            onAction={() => navigate('/app/connectors')}
          />
        ) : (
          <div className="rounded-2xl bg-white border border-[#E5E5E2] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E5E2] bg-[#FAFAF8] text-[11px] font-mono uppercase tracking-wider text-[#8B919B]">
                    <th className="py-3 px-4 font-semibold">Time</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Event / Execution</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Latency</th>
                    <th className="py-3 px-4 font-semibold">Details</th>
                    <th className="py-3 px-4 text-right">Channel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEFEA] text-xs">
                  {filteredActivities.map((row) => {
                    const executionId = row.metadata?.executionId || row.metadata?.execution_id;
                    const agentId = row.metadata?.agentId || row.metadata?.agent_id || (row.type === 'agent' ? row.metadata?.resourceId : undefined);
                    const workflowId = row.metadata?.workflowId || row.metadata?.workflow_id || (row.type === 'workflow' ? row.metadata?.resourceId : undefined);
                    const isClickable = Boolean(
                      executionId ||
                      (row.type === 'agent' && agentId) ||
                      (row.type === 'workflow' && workflowId) ||
                      row.type === 'connector'
                    );

                    return (
                      <tr
                        key={row.id}
                        onClick={() => {
                          if (executionId) {
                            navigate(`/app/activity/${executionId}`);
                          } else if (row.type === 'agent' && agentId) {
                            navigate(`/app/agents/${agentId}`);
                          } else if (row.type === 'workflow' && workflowId) {
                            navigate(`/app/workflows/${workflowId}`);
                          } else if (row.type === 'connector') {
                            navigate('/app/connectors');
                          }
                        }}
                        className={`transition-colors group ${
                          isClickable ? 'hover:bg-[#FAFAF8] cursor-pointer' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono text-[#8B919B] whitespace-nowrap">
                          <span title={new Date(row.created_at).toLocaleString()}>
                            {formatRelativeTime(row.created_at)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#6D4AFF] bg-purple-50 px-2 py-0.5 rounded border border-purple-200 uppercase font-semibold">
                            <Network className="w-3 h-3" />
                            {row.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#111318]">
                          {row.name}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {row.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              completed
                            </span>
                          ) : row.status === 'failed' ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              <XCircle className="w-3 h-3" />
                              failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              <Radio className="w-3 h-3 animate-pulse" />
                              running
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#626873]">
                          {row.duration || '0.1s'}
                        </td>
                        <td className="py-3.5 px-4 text-[#626873] max-w-xs truncate">
                          {row.details}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-[11px] text-[#8B919B]">
                          {executionId ? (
                            <span className="text-[#6D4AFF] group-hover:underline inline-flex items-center gap-0.5 font-medium">
                              Trace <ChevronRight className="w-3 h-3" />
                            </span>
                          ) : (
                            <span>{row.action}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* AUDIT TRAIL VIEW */
        filteredAuditLogs.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No security audit events recorded yet."
            description="All workspace actions, API key creations, role modifications, workflow runs, and human approval decisions are automatically recorded in an immutable ledger."
            actionLabel="View Workflows"
            onAction={() => navigate('/app/workflows')}
          />
        ) : (
          <div className="rounded-2xl bg-white border border-[#E5E5E2] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E5E2] bg-[#FAFAF8] text-[11px] font-mono uppercase tracking-wider text-[#8B919B]">
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Actor / User</th>
                    <th className="py-3 px-4 font-semibold">Action</th>
                    <th className="py-3 px-4 font-semibold">Resource</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">IP Address</th>
                    <th className="py-3 px-4 text-right font-semibold">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEFEA] text-xs">
                  {filteredAuditLogs.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-[#FAFAF8]/60 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[#8B919B] whitespace-nowrap">
                        <span title={new Date(entry.created_at).toLocaleString()}>
                          {formatRelativeTime(entry.created_at)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#111318] whitespace-nowrap">
                        {entry.user_id || 'system'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-semibold text-[#6D4AFF] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {entry.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[#111318] font-medium mr-1.5">{entry.resource_type}</span>
                        {entry.resource_id && (
                          <span className="font-mono text-[10px] text-[#8B919B]">
                            ({entry.resource_id.slice(0, 10)}...)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          entry.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#8B919B]">
                        {entry.ip_address || 'edge-internal'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectAuditEntry(entry)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6D4AFF] hover:underline cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* INSPECT AUDIT ENTRY MODAL */}
      {inspectAuditEntry && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-[#E5E5E2] shadow-2xl max-w-lg w-full p-6 text-left flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEFEA] mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#6D4AFF]" />
                <h3 className="text-base font-bold text-[#111318]">Audit Event Trace</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectAuditEntry(null)}
                className="p-1 rounded-lg hover:bg-[#FAFAF8] text-[#8B919B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                <div>
                  <span className="text-[#8B919B] block text-[10px] uppercase font-mono">Action</span>
                  <span className="font-mono font-bold text-[#6D4AFF]">{inspectAuditEntry.action}</span>
                </div>
                <div>
                  <span className="text-[#8B919B] block text-[10px] uppercase font-mono">Status</span>
                  <span className={`font-mono font-bold uppercase ${inspectAuditEntry.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {inspectAuditEntry.status}
                  </span>
                </div>
                <div>
                  <span className="text-[#8B919B] block text-[10px] uppercase font-mono">Actor / User</span>
                  <span className="font-mono text-[#111318]">{inspectAuditEntry.user_id || 'system'}</span>
                </div>
                <div>
                  <span className="text-[#8B919B] block text-[10px] uppercase font-mono">Resource</span>
                  <span className="font-mono text-[#111318]">{inspectAuditEntry.resource_type} ({inspectAuditEntry.resource_id || 'N/A'})</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#8B919B] block text-[10px] uppercase font-mono">Timestamp</span>
                  <span className="font-mono text-[#111318]">{new Date(inspectAuditEntry.created_at).toISOString()}</span>
                </div>
              </div>

              <div>
                <span className="text-[#8B919B] block text-[10px] uppercase font-mono mb-1.5">
                  Sanitized Event Metadata (Redacted)
                </span>
                <pre className="p-3 rounded-xl bg-[#111318] text-white font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(inspectAuditEntry.metadata, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EFEFEA] flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setInspectAuditEntry(null)}
                className="px-4 py-2 rounded-xl bg-[#FAFAF8] hover:bg-[#EFEFEA] text-xs font-semibold text-[#111318] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
