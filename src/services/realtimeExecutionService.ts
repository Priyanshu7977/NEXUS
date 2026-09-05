import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { NormalizedExecutionEvent, LiveExecutionState } from '../types/observability';

// Browser-safe, zero-dependency in-memory event bus
class NexusEventEmitter {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  on(event: string, handler: (data: any) => void): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return this;
  }

  off(event: string, handler: (data: any) => void): this {
    this.listeners.get(event)?.delete(handler);
    return this;
  }

  emit(event: string, data?: any): boolean {
    const handlers = this.listeners.get(event);
    if (!handlers || handlers.size === 0) return false;
    for (const fn of Array.from(handlers)) {
      try {
        fn(data);
      } catch (err) {
        console.error(`[NexusEventEmitter] Error in listener for ${event}:`, err);
      }
    }
    return true;
  }
}

const memoryBus = new NexusEventEmitter();

export type RealtimeConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

const connectionListeners = new Set<(status: RealtimeConnectionStatus) => void>();
let currentConnectionStatus: RealtimeConnectionStatus = 'connected';

export function getRealtimeConnectionStatus(): RealtimeConnectionStatus {
  return currentConnectionStatus;
}

export function onRealtimeStatusChange(
  listener: (status: RealtimeConnectionStatus) => void
): () => void {
  connectionListeners.add(listener);
  listener(currentConnectionStatus);
  return () => {
    connectionListeners.delete(listener);
  };
}

function setConnectionStatus(status: RealtimeConnectionStatus) {
  if (currentConnectionStatus !== status) {
    currentConnectionStatus = status;
    for (const listener of connectionListeners) {
      try {
        listener(status);
      } catch (err) {
        console.error('[NEXUS Realtime] Error notifying connection listener:', err);
      }
    }
  }
}

// Browser network connectivity awareness
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setConnectionStatus('reconnecting');
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 600);
  });

  window.addEventListener('offline', () => {
    setConnectionStatus('disconnected');
  });
}

/**
 * Broadcasts an execution event to all local and remote subscribers.
 */
export function broadcastExecutionEvent(
  arg1: string | NormalizedExecutionEvent,
  arg2?: NormalizedExecutionEvent
): void {
  const event: NormalizedExecutionEvent =
    typeof arg1 === 'string' ? { ...(arg2 as NormalizedExecutionEvent), execution_id: arg1 } : arg1;

  if (!event || !event.execution_id) return;

  const channelKey = `exec_event_${event.execution_id}`;
  const wsKey = `ws_event_${event.workspace_id || 'default-workspace'}`;

  // 1. Emit to local EventEmitter
  memoryBus.emit(channelKey, event);
  memoryBus.emit(wsKey, event);
  memoryBus.emit('all_execution_events', event);

  // 2. Broadcast via browser BroadcastChannel across browser tabs
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel(`nexus_exec_${event.execution_id}`);
      bc.postMessage({ type: 'EVENT', payload: event });
      bc.close();

      const wsBc = new BroadcastChannel(`nexus_ws_${event.workspace_id || 'default-workspace'}`);
      wsBc.postMessage({ type: 'EVENT', payload: event });
      wsBc.close();
    } catch (e) {
      // Ignore BroadcastChannel errors in restricted contexts
    }
  }

  // 3. Supabase Realtime Broadcast (if configured)
  if (isSupabaseConfigured) {
    try {
      const channel = supabase.channel(`execution:${event.execution_id}`);
      channel.send({
        type: 'broadcast',
        event: 'execution_event',
        payload: event,
      });
    } catch (e) {
      // Fail safely
    }
  }
}

/**
 * Broadcasts updated live execution state.
 */
export function broadcastExecutionState(state: LiveExecutionState): void {
  const channelKey = `exec_state_${state.execution_id}`;
  const wsKey = `ws_state_${state.workspace_id}`;

  memoryBus.emit(channelKey, state);
  memoryBus.emit(wsKey, state);

  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel(`nexus_exec_${state.execution_id}`);
      bc.postMessage({ type: 'STATE', payload: state });
      bc.close();

      const wsBc = new BroadcastChannel(`nexus_ws_${state.workspace_id}`);
      wsBc.postMessage({ type: 'STATE', payload: state });
      wsBc.close();
    } catch (e) {}
  }
}

/**
 * Subscribes to real-time events and state updates for a specific execution.
 * Handles deduplication, reconnection recovery, and clean unsubscription.
 */
export function subscribeToExecution(
  executionId: string,
  callbacksOrOnEvent:
    | ((event: NormalizedExecutionEvent) => void)
    | {
        onEvent?: (event: NormalizedExecutionEvent) => void;
        onStateChange?: (state: LiveExecutionState) => void;
      }
): () => void {
  if (!executionId) return () => {};

  const callbacks =
    typeof callbacksOrOnEvent === 'function'
      ? { onEvent: callbacksOrOnEvent }
      : callbacksOrOnEvent;

  const seenEventIds = new Set<string>();

  const handleEvent = (event: NormalizedExecutionEvent) => {
    if (!event || !event.id) return;
    if (seenEventIds.has(event.id)) return; // Deduplication
    seenEventIds.add(event.id);
    if (callbacks.onEvent) {
      callbacks.onEvent(event);
    }
  };

  const handleState = (state: LiveExecutionState) => {
    if (!state) return;
    if (callbacks.onStateChange) {
      callbacks.onStateChange(state);
    }
  };

  // 1. Local Memory Bus
  const eventChannelKey = `exec_event_${executionId}`;
  const stateChannelKey = `exec_state_${executionId}`;
  memoryBus.on(eventChannelKey, handleEvent);
  memoryBus.on(stateChannelKey, handleState);

  // 2. Browser BroadcastChannel
  let broadcastChannel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel(`nexus_exec_${executionId}`);
      broadcastChannel.onmessage = (msg) => {
        if (msg.data?.type === 'EVENT') {
          handleEvent(msg.data.payload);
        } else if (msg.data?.type === 'STATE') {
          handleState(msg.data.payload);
        }
      };
    } catch (e) {}
  }

  // 3. Supabase Realtime
  let supabaseChannel: any = null;
  if (isSupabaseConfigured) {
    try {
      supabaseChannel = supabase
        .channel(`execution:${executionId}`)
        .on('broadcast', { event: 'execution_event' }, ({ payload }) => {
          handleEvent(payload);
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'workflow_execution_events',
            filter: `execution_id=eq.${executionId}`,
          },
          (payload: any) => {
            if (payload.new) {
              handleEvent({
                id: payload.new.id,
                execution_id: payload.new.execution_id,
                workspace_id: payload.new.workspace_id || 'default-workspace',
                source_type: 'workflow',
                source_id: payload.new.node_key,
                event_type: payload.new.event_type,
                status: payload.new.status || 'completed',
                message: payload.new.message || '',
                timestamp: payload.new.created_at,
                metadata: payload.new.metadata || {},
              });
            }
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected');
          } else if (status === 'CHANNEL_ERROR') {
            setConnectionStatus('reconnecting');
          }
        });
    } catch (e) {}
  }

  // Return clean unsubscriber
  return () => {
    memoryBus.off(eventChannelKey, handleEvent);
    memoryBus.off(stateChannelKey, handleState);

    if (broadcastChannel) {
      try {
        broadcastChannel.close();
      } catch (e) {}
    }

    if (supabaseChannel) {
      try {
        supabase.removeChannel(supabaseChannel);
      } catch (e) {}
    }
  };
}

/**
 * Subscribes to workspace-level active executions and approval state changes.
 */
export function subscribeToWorkspaceExecutions(
  workspaceId: string,
  onUpdate: () => void
): () => void {
  if (!workspaceId) return () => {};

  const wsKey = `ws_event_${workspaceId}`;
  const handleUpdate = () => {
    onUpdate();
  };

  memoryBus.on(wsKey, handleUpdate);

  let broadcastChannel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel(`nexus_ws_${workspaceId}`);
      broadcastChannel.onmessage = () => {
        handleUpdate();
      };
    } catch (e) {}
  }

  return () => {
    memoryBus.off(wsKey, handleUpdate);
    if (broadcastChannel) {
      try {
        broadcastChannel.close();
      } catch (e) {}
    }
  };
}
