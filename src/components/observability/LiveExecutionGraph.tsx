import React from 'react';
import { LiveNodeState } from '../../types/observability';
import {
  CheckCircle2,
  Loader2,
  ShieldAlert,
  XCircle,
  Circle,
  CircleSlash,
  Ban,
  Bot,
  Wrench,
  Globe,
  Radio,
  Clock,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

interface LiveExecutionGraphProps {
  nodes: Record<string, LiveNodeState>;
  nodeOrder: string[];
  selectedNodeKey?: string | null;
  onSelectNode: (nodeKey: string) => void;
}

export const LiveExecutionGraph: React.FC<LiveExecutionGraphProps> = ({
  nodes,
  nodeOrder,
  selectedNodeKey,
  onSelectNode,
}) => {
  const getNodeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'TRIGGER':
        return Radio;
      case 'AGENT':
        return Bot;
      case 'TOOL':
        return Wrench;
      case 'APPROVAL':
        return ShieldAlert;
      case 'DEPLOY':
      case 'DEPLOYMENT':
        return Globe;
      default:
        return Clock;
    }
  };

  const getStatusConfig = (status: LiveNodeState['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          iconClass: 'text-emerald-600',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          borderClass: 'border-emerald-300 hover:border-emerald-400 bg-emerald-50/20',
          label: 'Completed',
        };
      case 'running':
        return {
          icon: Loader2,
          iconClass: 'text-[#6D4AFF] animate-spin',
          badgeClass: 'bg-purple-50 text-[#6D4AFF] border-purple-200 animate-pulse',
          borderClass: 'border-[#6D4AFF] ring-2 ring-[#6D4AFF]/20 bg-purple-50/20',
          label: 'Running',
        };
      case 'waiting':
        return {
          icon: ShieldAlert,
          iconClass: 'text-amber-600 animate-pulse',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
          borderClass: 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/30',
          label: 'Action Required',
        };
      case 'failed':
        return {
          icon: XCircle,
          iconClass: 'text-red-600',
          badgeClass: 'bg-red-50 text-red-700 border-red-200',
          borderClass: 'border-red-400 ring-2 ring-red-400/20 bg-red-50/20',
          label: 'Failed',
        };
      case 'skipped':
        return {
          icon: CircleSlash,
          iconClass: 'text-gray-400',
          badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
          borderClass: 'border-gray-200 opacity-60 bg-gray-50',
          label: 'Skipped',
        };
      case 'cancelled':
        return {
          icon: Ban,
          iconClass: 'text-red-500',
          badgeClass: 'bg-red-50 text-red-600 border-red-200',
          borderClass: 'border-red-200 bg-red-50/20',
          label: 'Cancelled',
        };
      default:
        return {
          icon: Circle,
          iconClass: 'text-gray-400',
          badgeClass: 'bg-[#FAFAF8] text-gray-500 border-gray-200',
          borderClass: 'border-[#E5E5E2] bg-white hover:border-[#D4D4CE]',
          label: 'Pending',
        };
    }
  };

  const keys = nodeOrder.length > 0 ? nodeOrder : Object.keys(nodes);

  if (keys.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[#8B919B] bg-[#FAFAF8] rounded-xl border border-[#E5E5E2]">
        No execution graph nodes defined.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Horizontal DAG Pipeline */}
      <div className="hidden md:flex items-center gap-3 overflow-x-auto pb-4 pt-2 px-1">
        {keys.map((nodeKey, idx) => {
          const node = nodes[nodeKey] || {
            node_key: nodeKey,
            name: nodeKey,
            type: 'UNKNOWN',
            status: 'pending',
          };
          const Icon = getNodeIcon(node.type);
          const statusCfg = getStatusConfig(node.status);
          const StatusIcon = statusCfg.icon;
          const isSelected = selectedNodeKey === nodeKey;

          return (
            <React.Fragment key={nodeKey}>
              <div
                onClick={() => onSelectNode(nodeKey)}
                className={`flex-shrink-0 w-64 p-4 rounded-xl border transition-all cursor-pointer select-none text-left ${
                  statusCfg.borderClass
                } ${
                  isSelected ? 'ring-2 ring-[#6D4AFF] shadow-md -translate-y-0.5' : 'shadow-sm'
                }`}
              >
                {/* Top header: Type and Status */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8B919B]">
                    <Icon className="w-3.5 h-3.5 text-[#626873]" />
                    <span>{node.type}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${statusCfg.badgeClass}`}
                  >
                    <StatusIcon className={`w-3 h-3 ${statusCfg.iconClass}`} />
                    <span>{statusCfg.label}</span>
                  </span>
                </div>

                {/* Node Name */}
                <h4 className="text-xs font-bold text-[#111318] truncate mb-2" title={node.name}>
                  {node.name}
                </h4>

                {/* Duration & Metadata */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8B919B] pt-2 border-t border-[#EFEFEA]">
                  <span>{node.duration_ms ? `${(node.duration_ms / 1000).toFixed(2)}s` : '—'}</span>
                  <span className="text-[10px] text-[#6D4AFF] hover:underline font-sans font-medium">
                    Inspect →
                  </span>
                </div>
              </div>

              {/* Connecting Arrow */}
              {idx < keys.length - 1 && (
                <div className="flex-shrink-0 text-[#8B919B]">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Vertical Stacked DAG View */}
      <div className="flex flex-col gap-2 md:hidden">
        {keys.map((nodeKey, idx) => {
          const node = nodes[nodeKey] || {
            node_key: nodeKey,
            name: nodeKey,
            type: 'UNKNOWN',
            status: 'pending',
          };
          const Icon = getNodeIcon(node.type);
          const statusCfg = getStatusConfig(node.status);
          const StatusIcon = statusCfg.icon;
          const isSelected = selectedNodeKey === nodeKey;

          return (
            <React.Fragment key={nodeKey}>
              <div
                onClick={() => onSelectNode(nodeKey)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                  statusCfg.borderClass
                } ${isSelected ? 'ring-2 ring-[#6D4AFF]' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#E5E5E2] flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[#626873]" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-[#111318] truncate">{node.name}</div>
                      <div className="text-[10px] font-mono text-[#8B919B] uppercase">
                        {node.type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${statusCfg.badgeClass}`}
                    >
                      <StatusIcon className={`w-3 h-3 ${statusCfg.iconClass}`} />
                      <span>{statusCfg.label}</span>
                    </span>
                  </div>
                </div>
              </div>

              {idx < keys.length - 1 && (
                <div className="flex justify-center text-[#8B919B] my-0.5">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
