import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getWorkspaceActivities, WorkspaceActivity } from '../../services/activityService';
import { EmptyState } from '../app/EmptyState';
import { 
  Activity, 
  Search, 
  CheckCircle2, 
  Network, 
  RefreshCw,
  XCircle,
  Radio,
  ChevronRight
} from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useAuth();

  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Agents' | 'Workflows' | 'Connectors'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState<WorkspaceActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadActivities = useCallback(async (showRefreshing = false) => {
    if (!currentWorkspace?.id) {
      setLoading(false);
      return;
    }
    if (showRefreshing) setIsRefreshing(true);
    try {
      const { activities: list } = await getWorkspaceActivities(currentWorkspace.id);
      setActivities(list);
    } catch (err) {
      console.error('[NEXUS ActivityPage] Error loading activities:', err);
    } finally {
      setLoading(false);
      if (showRefreshing) setIsRefreshing(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

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

  const filtered = activities.filter((r) => {
    const matchesFilter =
      selectedFilter === 'All' ||
      (selectedFilter === 'Agents' && r.type === 'agent') ||
      (selectedFilter === 'Workflows' && r.type === 'workflow') ||
      (selectedFilter === 'Connectors' && r.type === 'connector');
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111318] mb-1">
            Activity
          </h2>
          <p className="text-sm text-[#626873]">
            Audit trails, connector events, tool executions, and agent telemetry in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadActivities(true)}
          disabled={isRefreshing}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] text-xs font-medium text-[#111318] transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#626873] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8B919B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search execution traces and events..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs text-[#111318] placeholder:text-[#8B919B] outline-none shadow-sm transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(['All', 'Agents', 'Workflows', 'Connectors'] as const).map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#111318] text-white shadow-sm'
                    : 'bg-white text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] border border-[#E5E5E2]'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#8B919B]">
          Loading workspace activity logs...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity events logged yet."
          description="Connector synchronizations, tool executions, and agent events in this workspace will automatically be recorded and tracked here."
          actionLabel="Explore Connectors"
          onAction={() => navigate('/app/connectors')}
        />
      ) : (
        <div className="rounded-2xl bg-white border border-[#E5E5E2] overflow-hidden shadow-sm">
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
                {filtered.map((row) => {
                  const executionId = row.metadata?.executionId;
                  const isClickable = Boolean(executionId || row.type === 'agent');

                  return (
                    <tr
                      key={row.id}
                      onClick={() => {
                        if (executionId) {
                          navigate(`/app/activity/${executionId}`);
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
      )}
    </div>
  );
};
