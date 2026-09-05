import React, { useState, useMemo } from 'react';
import { NormalizedExecutionEvent, ExecutionEventSourceType } from '../../types/observability';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Bot,
  Wrench,
  Globe,
  Radio,
  Cable,
} from 'lucide-react';

interface ExecutionTimelineProps {
  events: NormalizedExecutionEvent[];
  onSelectEvent?: (event: NormalizedExecutionEvent) => void;
}

type FilterType = 'all' | ExecutionEventSourceType | 'error';

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({
  events,
  onSelectEvent,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'agent', label: 'Agent' },
    { id: 'tool', label: 'Tool' },
    { id: 'connector', label: 'Connector' },
    { id: 'approval', label: 'Approval' },
    { id: 'deployment', label: 'Deployment' },
    { id: 'error', label: 'Errors' },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Type filtering
      if (filter === 'error') {
        if (ev.status !== 'failed' && !ev.event_type.includes('FAILED')) return false;
      } else if (filter !== 'all') {
        if (ev.source_type !== filter) return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const msg = (ev.message || '').toLowerCase();
        const type = (ev.event_type || '').toLowerCase();
        const sourceId = (ev.source_id || '').toLowerCase();
        if (!msg.includes(q) && !type.includes(q) && !sourceId.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [events, filter, searchQuery]);

  const getSourceIcon = (sourceType: ExecutionEventSourceType) => {
    switch (sourceType) {
      case 'workflow':
        return Radio;
      case 'agent':
        return Bot;
      case 'tool':
        return Wrench;
      case 'connector':
        return Cable;
      case 'deployment':
        return Globe;
      case 'approval':
        return ShieldAlert;
      default:
        return Clock;
    }
  };

  return (
    <div className="flex flex-col gap-3 text-left">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filter === opt.id
                  ? 'bg-[#111318] text-white'
                  : 'bg-[#FAFAF8] text-[#626873] hover:bg-[#EFEFEA] hover:text-[#111318]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B919B]" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#FAFAF8] rounded-lg border border-[#E5E5E2] text-[#111318] placeholder-[#8B919B] outline-none focus:border-[#6D4AFF]"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="divide-y divide-[#EFEFEA] rounded-xl border border-[#E5E5E2] bg-white overflow-hidden shadow-xs">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8B919B]">
            No execution events match your active filters.
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const SourceIcon = getSourceIcon(ev.source_type);
            const isFailed = ev.status === 'failed' || ev.event_type.includes('FAILED');
            const isWaiting = ev.status === 'waiting' || ev.event_type.includes('WAITING');

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent && onSelectEvent(ev)}
                className={`p-3 sm:px-4 flex items-start gap-3 hover:bg-[#FAFAF8] transition-colors cursor-pointer ${
                  isFailed ? 'bg-red-50/20' : isWaiting ? 'bg-amber-50/20' : ''
                }`}
              >
                {/* Status Indicator */}
                <div className="mt-0.5 shrink-0">
                  {isFailed ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : isWaiting ? (
                    <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-[11px] font-mono text-[#8B919B]">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-[#FAFAF8] text-[#626873] border border-[#E5E5E2]">
                      <SourceIcon className="w-2.5 h-2.5" />
                      {ev.source_type}
                    </span>

                    {ev.source_id && (
                      <span className="text-[10px] font-mono text-[#8B919B]">
                        [{ev.source_id}]
                      </span>
                    )}

                    <span className="text-[10px] font-mono font-bold text-[#111318]">
                      {ev.event_type}
                    </span>
                  </div>

                  <p className="text-xs text-[#626873] leading-relaxed break-words">
                    {ev.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
