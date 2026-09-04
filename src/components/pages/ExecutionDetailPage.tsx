import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getExecutionById } from '../../services/agentService';
import { getWorkflowExecutionById, getWorkflowById } from '../../services/workflowService';
import { getWorkspaceDeployments } from '../../services/vercelService';
import { DeploymentRecord } from '../../types/deployment';
import { AgentExecution, AgentExecutionEvent } from '../../types/agent';
import { BrandLogo } from '../brand/BrandLogo';
import { Button } from '../ui/Button';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Wrench, 
  Bot, 
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Globe
} from 'lucide-react';

export const ExecutionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useAuth();

  const [execution, setExecution] = useState<AgentExecution | null>(null);
  const [deployment, setDeployment] = useState<DeploymentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadExecution = async () => {
      if (!id || !currentWorkspace?.id) return;
      try {
        const { execution: found } = await getExecutionById(currentWorkspace.id, id);
        if (found) {
          setExecution(found);
          if (found?.events && found.events.length > 0) {
            setSelectedEventId(found.events[found.events.length - 1].id);
          }
        } else {
          // Check if this is a workflow execution
          const { execution: wfExec, events: wfEvents } = await getWorkflowExecutionById(id);
          if (wfExec) {
            const { workflow } = await getWorkflowById(currentWorkspace.id, wfExec.workflow_id);
            const adapted: AgentExecution = {
              id: wfExec.id,
              workspace_id: wfExec.workspace_id,
              agent_id: wfExec.workflow_id,
              status: (wfExec.status === 'waiting_for_approval' ? 'queued' : wfExec.status) as any,
              input: JSON.stringify(wfExec.trigger_data),
              output: wfExec.output_data ? JSON.stringify(wfExec.output_data.summary || wfExec.output_data, null, 2) : null,
              error: wfExec.error,
              started_at: wfExec.started_at,
              completed_at: wfExec.completed_at,
              steps_used: wfEvents.length,
              duration_ms: wfExec.duration_ms,
              model: 'Workflow Multi-Agent DAG',
              tokens_used: null,
              created_at: wfExec.created_at,
              agent: {
                id: wfExec.workflow_id,
                name: workflow?.name || 'Workflow Pipeline',
              },
              events: wfEvents.map((e) => ({
                id: e.id,
                execution_id: e.execution_id,
                event_type: e.event_type as any,
                tool_name: e.node_key,
                status: e.status as any,
                message: e.message,
                metadata: e.metadata,
                created_at: e.created_at,
              })),
            };
            setExecution(adapted);
            if (adapted.events && adapted.events.length > 0) {
              setSelectedEventId(adapted.events[adapted.events.length - 1].id);
            }

            // Look for attached Vercel deployment
            const { deployments } = await getWorkspaceDeployments(currentWorkspace.id);
            const matching = deployments.find((d) => d.workflow_execution_id === id);
            if (matching) {
              setDeployment(matching);
            } else if (wfExec.context_data?.node_deploy?.data?.url) {
              const deployData = wfExec.context_data.node_deploy.data;
              setDeployment({
                id: deployData.deployment_id || 'dep-1',
                workspace_id: currentWorkspace.id,
                workflow_execution_id: id,
                connector_connection_id: null,
                project_id: deployData.project || 'project',
                project_name: deployData.project || 'nexus-app',
                external_deployment_id: deployData.deployment_id || 'dep-1',
                status: deployData.status || 'READY',
                url: deployData.url,
                commit_sha: deployData.commit || wfExec.trigger_data?.commit_sha || null,
                branch: wfExec.trigger_data?.branch || 'main',
                target: deployData.target || 'production',
                metadata: {},
                created_at: wfExec.completed_at || new Date().toISOString(),
                updated_at: wfExec.completed_at || new Date().toISOString(),
              });
            }
          }
        }
      } catch (err) {
        console.error('[NEXUS ExecutionDetail] Error loading execution:', err);
      } finally {
        setLoading(false);
      }
    };

    loadExecution();
  }, [id, currentWorkspace?.id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#8B919B]">
        Loading execution trace details...
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-[#E5E5E2] text-center max-w-lg mx-auto mt-8 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#8B919B] flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#111318] mb-1">
          Execution trace not found
        </h3>
        <p className="text-xs text-[#626873] mb-6">
          The requested trace ID could not be found in this workspace.
        </p>
        <Button size="sm" onClick={() => navigate('/app/activity')}>
          Return to Activity
        </Button>
      </div>
    );
  }

  const events = execution.events || [];
  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[events.length - 1];

  const handleCopyOutput = () => {
    if (execution.output) {
      navigator.clipboard.writeText(execution.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getEventIcon = (ev: AgentExecutionEvent) => {
    switch (ev.event_type) {
      case 'TOOL_CALL':
      case 'TOOL_RESULT':
        return <Wrench className="w-3.5 h-3.5 text-amber-400" />;
      case 'MODEL_REQUEST':
      case 'MODEL_RESPONSE':
        return <Sparkles className="w-3.5 h-3.5 text-[#6D4AFF]" />;
      case 'AGENT_STARTED':
      case 'AGENT_COMPLETED':
        return <Bot className="w-3.5 h-3.5 text-emerald-400" />;
      case 'AGENT_FAILED':
      case 'LIMIT_REACHED':
        return <XCircle className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Bot className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-6xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/activity')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#626873] hover:text-[#111318] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Activity</span>
        </button>

        <div className="flex items-center gap-2">
          {execution.agent_id && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/app/agents/${execution.agent_id}`)}
            >
              View Agent Settings
            </Button>
          )}
        </div>
      </div>

      {/* Execution Status Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#111318] text-white border border-[#252836] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            <span className="text-xs font-mono text-[#8B919B]">
              Trace ID: <span className="text-white font-bold">{execution.id}</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border uppercase ${
                execution.status === 'completed'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : execution.status === 'limit_reached'
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  : 'text-red-400 bg-red-500/10 border-red-500/20'
              }`}
            >
              {execution.status === 'completed' ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              {execution.status}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
            {execution.agent?.name || 'Agent Execution'}
          </h1>
          <p className="text-xs text-[#8B919B]">
            Query: "{execution.input}"
          </p>
        </div>

        <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-[#252836] text-xs font-mono">
          <div>
            <div className="text-[10px] text-[#8B919B] uppercase">Latency</div>
            <div className="text-sm font-bold text-emerald-400">
              {(execution.duration_ms / 1000).toFixed(2)}s
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#8B919B] uppercase">Steps</div>
            <div className="text-sm font-bold text-white">
              {execution.steps_used} steps
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#8B919B] uppercase">Model</div>
            <div className="text-sm font-bold text-white uppercase">
              {execution.model || 'Gemini'}
            </div>
          </div>
        </div>
      </div>

      {/* Live Vercel Deployment Card if present */}
      {deployment && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111318] via-[#161924] to-[#1C1F2E] text-white border border-[#252836] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-black border border-[#252836] flex items-center justify-center shrink-0 shadow-sm">
              <BrandLogo brand="vercel" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-base font-bold text-white">
                  Vercel Production Deployment
                </h3>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase border ${
                    deployment.status === 'READY'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : deployment.status === 'ERROR'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      deployment.status === 'READY'
                        ? 'bg-emerald-400 animate-pulse'
                        : deployment.status === 'ERROR'
                        ? 'bg-red-400'
                        : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  {deployment.status}
                </span>
              </div>
              <p className="text-xs text-[#8B919B]">
                Project: <span className="text-white font-semibold">{deployment.project_name}</span> · Commit <span className="font-mono text-[#6D4AFF]">{deployment.commit_sha?.slice(0, 7) || 'HEAD'}</span> · Branch <span className="font-mono text-[#E5E5E2]">{deployment.branch || 'main'}</span>
              </p>
            </div>
          </div>

          {deployment.url && (
            <a
              href={deployment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white text-[#111318] hover:bg-[#F2F2EE] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-[#111318]" />
              <span>Open Live App</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#111318]" />
            </a>
          )}
        </div>
      )}

      {/* Main Execution Waterfall Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Stage Waterfall List */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8B919B] mb-1">
            Execution Waterfall ({events.length} Events)
          </div>

          <div className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto pr-1">
            {events.map((ev, idx) => {
              const isSelected = selectedEventId === ev.id;
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#1C202E] border-[#6D4AFF] ring-1 ring-[#6D4AFF]/30 shadow-md text-white'
                      : 'bg-white border-[#E5E5E2] hover:bg-[#FAFAF8] text-[#111318]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-[#8B919B]">
                      0{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {getEventIcon(ev)}
                      <div>
                        <div className="text-xs font-bold font-mono">
                          {ev.event_type}
                        </div>
                        <div className="text-[11px] text-[#8B919B] truncate max-w-[190px]">
                          {ev.message}
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#8B919B]">
                    {new Date(ev.created_at).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Stage Telemetry & Output Console */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8B919B] mb-1">
            Event Details & Response Artifact
          </div>

          {selectedEvent && (
            <div className="p-6 rounded-2xl bg-[#111318] text-white border border-[#252836] shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#252836]">
                <div className="flex items-center gap-2">
                  {getEventIcon(selectedEvent)}
                  <div>
                    <h3 className="text-base font-bold text-white font-mono">
                      {selectedEvent.event_type}
                    </h3>
                    <p className="text-xs text-[#8B919B]">
                      Timestamp: {new Date(selectedEvent.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                    selectedEvent.status === 'completed'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}
                >
                  {selectedEvent.status}
                </span>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8B919B] mb-1.5">
                  Event Message
                </div>
                <p className="text-xs text-[#C5C8D4] leading-relaxed bg-[#161922] p-3 rounded-xl border border-[#252836]">
                  {selectedEvent.message}
                </p>
              </div>

              {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8B919B] mb-1.5">
                    Event Metadata
                  </div>
                  <pre className="p-3 rounded-xl bg-[#0D0F14] border border-[#252836] text-xs font-mono text-emerald-400 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Final Output Preview Box */}
          <div className="p-6 rounded-2xl bg-[#111318] text-white border border-[#252836] shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252836]">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6D4AFF]" />
                <span>Final Output Response</span>
              </div>

              {execution.output && (
                <button
                  type="button"
                  onClick={handleCopyOutput}
                  className="inline-flex items-center gap-1 text-xs text-[#8B919B] hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {execution.error ? (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-300 font-mono">
                {execution.error}
              </div>
            ) : (
              <pre className="p-4 rounded-xl bg-[#0D0F14] border border-[#252836] text-xs font-sans text-[#E5E5E2] whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-80 overflow-y-auto">
                {execution.output || 'No output produced.'}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
