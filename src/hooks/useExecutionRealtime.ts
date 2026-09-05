import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LiveExecutionState,
  NormalizedExecutionEvent,
} from '../types/observability';
import {
  getExecutionLiveState,
} from '../services/observabilityService';
import {
  subscribeToExecution,
  onRealtimeStatusChange,
  RealtimeConnectionStatus,
} from '../services/realtimeExecutionService';
import { cancelWorkflowExecution } from '../runtime/workflowEngine';

export interface UseExecutionRealtimeResult {
  execution: LiveExecutionState | null;
  events: NormalizedExecutionEvent[];
  isLoading: boolean;
  isReconnecting: boolean;
  elapsedMs: number;
  connectionStatus: RealtimeConnectionStatus;
  refresh: () => Promise<void>;
  cancelExecution: () => Promise<boolean>;
}

export function useExecutionRealtime(
  workspaceId: string,
  executionId?: string | null
): UseExecutionRealtimeResult {
  const [execution, setExecution] = useState<LiveExecutionState | null>(null);
  const [events, setEvents] = useState<NormalizedExecutionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>('connected');
  const [elapsedMs, setElapsedMs] = useState(0);

  const seenEventIds = useRef(new Set<string>());

  const loadState = useCallback(async () => {
    if (!workspaceId || !executionId) {
      setExecution(null);
      setEvents([]);
      setIsLoading(false);
      return;
    }

    try {
      const live = await getExecutionLiveState(workspaceId, executionId);
      if (live) {
        setExecution(live);
        setEvents(live.events || []);
        seenEventIds.current = new Set((live.events || []).map((e) => e.id));
        setElapsedMs(live.duration_ms || 0);
      }
    } catch (err) {
      console.error('[NEXUS useExecutionRealtime] Failed to load execution state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, executionId]);

  // Initial load
  useEffect(() => {
    loadState();
  }, [loadState]);

  // Real-time events subscription
  useEffect(() => {
    if (!executionId) return;

    const unsub = subscribeToExecution(executionId, {
      onEvent: (ev) => {
        if (!seenEventIds.current.has(ev.id)) {
          seenEventIds.current.add(ev.id);
          setEvents((prev) => {
            const next = [...prev, ev];
            next.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            return next;
          });

          // Re-hydrate full state to keep DAG node statuses perfectly in sync
          getExecutionLiveState(workspaceId, executionId).then((updated) => {
            if (updated) setExecution(updated);
          });
        }
      },
      onStateChange: (updatedState) => {
        setExecution(updatedState);
        if (updatedState.events) {
          setEvents(updatedState.events);
          seenEventIds.current = new Set(updatedState.events.map((e) => e.id));
        }
      },
    });

    return () => {
      unsub();
    };
  }, [executionId, workspaceId]);

  // Connection status listener
  useEffect(() => {
    const unsubStatus = onRealtimeStatusChange((status) => {
      setConnectionStatus(status);
      if (status === 'connected') {
        // Recover state upon reconnect
        loadState();
      }
    });

    return () => {
      unsubStatus();
    };
  }, [loadState]);

  // Live timer ticker for active execution
  useEffect(() => {
    if (!execution || execution.status !== 'running') {
      return;
    }

    const startTs = new Date(execution.started_at).getTime();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTs);
    }, 100);

    return () => clearInterval(interval);
  }, [execution?.status, execution?.started_at]);

  const handleCancel = useCallback(async (): Promise<boolean> => {
    if (!executionId) return false;
    try {
      const res = await cancelWorkflowExecution(workspaceId, executionId);
      if (res) {
        await loadState();
        return true;
      }
      return false;
    } catch (e) {
      console.error('[NEXUS useExecutionRealtime] Cancel failed:', e);
      return false;
    }
  }, [workspaceId, executionId, loadState]);

  return {
    execution,
    events,
    isLoading,
    isReconnecting: connectionStatus === 'reconnecting',
    elapsedMs,
    connectionStatus,
    refresh: loadState,
    cancelExecution: handleCancel,
  };
}
