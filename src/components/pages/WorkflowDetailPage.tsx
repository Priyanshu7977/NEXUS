import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import {
  Network,
  ArrowLeft,
  Play,
  Activity,
  AlertCircle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  Layers,
} from 'lucide-react';
import { Workflow, WorkflowExecution } from '../../types/workflow';
import { getWorkflowById, getWorkflowExecutions, updateWorkflow } from '../../services/workflowService';
import { useAuth } from '../../context/AuthContext';
import { RunWorkflowModal } from '../workflows/RunWorkflowModal';
import { ApprovalActionModal } from '../workflows/ApprovalActionModal';
import { LiveExecutionModal } from '../observability/LiveExecutionModal';

export const WorkflowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useAuth();
  const workspaceId = currentWorkspace?.id || 'default-workspace';

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Canvas' | 'Runs' | 'Settings'>('Canvas');
  const [showRunModal, setShowRunModal] = useState(false);
  const [selectedApprovalExec, setSelectedApprovalExec] = useState<WorkflowExecution | null>(null);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);

  // Settings form
  const [settingsName, setSettingsName] = useState('');
  const [settingsDesc, setSettingsDesc] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const loadWorkflowData = async () => {
    if (!id) return;
    setLoading(true);
    const [wfRes, execsRes] = await Promise.all([
      getWorkflowById(workspaceId, id),
      getWorkflowExecutions(workspaceId, id),
    ]);

    if (wfRes.workflow) {
      setWorkflow(wfRes.workflow);
      setSettingsName(wfRes.workflow.name);
      setSettingsDesc(wfRes.workflow.description || '');
    }
    setExecutions(execsRes.executions || []);
    setLoading(false);
  };

  useEffect(() => {
    loadWorkflowData();
  }, [id, workspaceId]);

  const handleSaveSettings = async () => {
    if (!workflow) return;
    setSettingsSaving(true);
    await updateWorkflow(workspaceId, workflow.id, {
      name: settingsName,
      description: settingsDesc,
    });
    setWorkflow((prev) => prev ? { ...prev, name: settingsName, description: settingsDesc } : null);
    setSettingsSaving(false);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#8B919B]">
        Loading workflow...
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-[#E5E5E2] text-center max-w-lg mx-auto mt-8 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#8B919B] flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#111318] mb-1">
          Workflow not found
        </h3>
        <p className="text-xs text-[#626873] mb-6">
          The requested workflow does not exist in this workspace.
        </p>
        <Button size="sm" onClick={() => navigate('/app/workflows')}>
          Return to Workflows
        </Button>
      </div>
    );
  }

  const tabs = ['Canvas', 'Runs', 'Settings'] as const;

  return (
    <div className="flex flex-col gap-8 text-left max-w-5xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/workflows')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#626873] hover:text-[#111318] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workflows</span>
        </button>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/app/workflows/new?id=${workflow.id}`)}>
            <Sliders className="w-3.5 h-3.5 mr-1.5" />
            Edit in Studio
          </Button>
          <Button size="sm" onClick={() => setShowRunModal(true)}>
            <Play className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
            Run Execution
          </Button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#6D4AFF] border border-purple-100 flex items-center justify-center shrink-0">
            <Network className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1 className="text-2xl font-bold text-[#111318]">
                {workflow.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {workflow.status}
              </span>
            </div>
            <p className="text-xs text-[#626873] max-w-2xl leading-relaxed">
              {workflow.description || 'Deterministic multi-agent pipeline.'}
            </p>
          </div>
        </div>

        <div className="text-xs text-[#8B919B] font-mono shrink-0 text-right">
          <div>{workflow.nodes.length} Nodes Configured</div>
          <div>{workflow.edges.length} Connection Gates</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#E5E5E2] pb-px">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                isSelected
                  ? 'border-[#6D4AFF] text-[#6D4AFF] font-bold'
                  : 'border-transparent text-[#626873] hover:text-[#111318]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Canvas / DAG Topology View */}
      {activeTab === 'Canvas' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white text-[#111318] border border-[#E5E5E2] shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EFEFEA]">
            <div>
              <h3 className="text-sm font-bold text-[#111318] mb-0.5 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#6D4AFF]" />
                <span>DAG Pipeline Topology</span>
              </h3>
              <p className="text-xs text-[#626873]">
                Ordered execution sequence and multi-agent data handoffs.
              </p>
            </div>

            <Button size="sm" onClick={() => navigate(`/app/workflows/new?id=${workflow.id}`)}>
              Open Full Studio
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-stretch">
            {workflow.nodes.map((node, i) => (
              <div
                key={node.node_key || i}
                className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] hover:border-[#D4D4CE] transition-all flex flex-col justify-between text-left h-full min-w-0 shadow-2xs"
              >
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-[9px] font-mono text-[#626873] uppercase px-2 py-0.5 rounded-full bg-white border border-[#E5E5E2] font-semibold shrink-0">
                      Step {i + 1} · {node.node_type}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold shrink-0">
                      Configured
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#111318] mb-1 truncate">
                    {node.name}
                  </h4>
                  <p className="text-[11px] font-mono text-[#626873] truncate">
                    {node.node_key}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Execution Runs History */}
      {activeTab === 'Runs' && (
        <div className="flex flex-col gap-4">
          {executions.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E5E5E2] text-center flex flex-col items-center justify-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#8B919B] flex items-center justify-center mb-3.5">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#111318] mb-1">
                No runs recorded yet.
              </h4>
              <p className="text-xs text-[#626873] max-w-sm mb-6 leading-relaxed">
                Execution history, latency metrics, and agent decisions for this workflow will appear here once triggered.
              </p>
              <Button size="sm" onClick={() => setShowRunModal(true)}>
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Start First Run
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden bg-white border border-[#E5E5E2] rounded-2xl shadow-sm">
              <div className="px-6 py-4 border-b border-[#EFEFEA] bg-[#FAFAF8] flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B919B]">
                  Execution History ({executions.length})
                </h3>
                <Button size="sm" onClick={() => setShowRunModal(true)}>
                  <Play className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Run Now
                </Button>
              </div>

              <div className="divide-y divide-[#EFEFEA]">
                {executions.map((exec) => {
                  const isApprovalWaiting = exec.status === 'waiting_for_approval';
                  return (
                    <div
                      key={exec.id}
                      onClick={() => setSelectedExecutionId(exec.id)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center shrink-0 mt-0.5">
                          {exec.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isApprovalWaiting ? (
                            <ShieldAlert className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-blue-600" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-[#111318]">
                              {exec.id.substring(0, 8)}...
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                                exec.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isApprovalWaiting
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}
                            >
                              {exec.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <div className="text-xs text-[#626873] line-clamp-1">
                            {exec.output_data?.summary || exec.error || 'Execution processed.'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right text-[11px] font-mono text-[#8B919B]">
                          <div>{(exec.duration_ms / 1000).toFixed(1)}s</div>
                          <div>{new Date(exec.started_at).toLocaleTimeString()}</div>
                        </div>

                        {isApprovalWaiting && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedApprovalExec(exec)}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                          >
                            Approve Gate
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Settings */}
      {activeTab === 'Settings' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-[#111318] mb-1">
              Workflow Settings
            </h3>
            <p className="text-xs text-[#626873]">
              Pipeline identifiers, execution metadata, and triggers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                Workflow Name
              </label>
              <input
                type="text"
                value={settingsName}
                onChange={(e) => setSettingsName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] outline-none focus:border-[#6D4AFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={settingsDesc}
                onChange={(e) => setSettingsDesc(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] outline-none focus:border-[#6D4AFF]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#EFEFEA]">
            <Button size="sm" onClick={handleSaveSettings} disabled={settingsSaving}>
              {settingsSuccess ? 'Saved!' : 'Save Settings'}
            </Button>
          </div>
        </div>
      )}

      {/* Embedded Run Modal */}
      {showRunModal && (
        <RunWorkflowModal
          isOpen={showRunModal}
          onClose={() => setShowRunModal(false)}
          workspaceId={workspaceId}
          workflow={workflow}
          onExecutionCompleted={() => {
            loadWorkflowData();
          }}
        />
      )}

      {/* Embedded Approval Action Modal */}
      {selectedApprovalExec && (
        <ApprovalActionModal
          isOpen={!!selectedApprovalExec}
          onClose={() => setSelectedApprovalExec(null)}
          workspaceId={workspaceId}
          execution={selectedApprovalExec}
          onDecisionCompleted={() => {
            setSelectedApprovalExec(null);
            loadWorkflowData();
          }}
        />
      )}

      {/* Embedded Live Execution Modal */}
      {selectedExecutionId && (
        <LiveExecutionModal
          isOpen={Boolean(selectedExecutionId)}
          workspaceId={workspaceId}
          executionId={selectedExecutionId}
          onClose={() => {
            setSelectedExecutionId(null);
            loadWorkflowData();
          }}
          onNavigateToFullPage={(id) => {
            setSelectedExecutionId(null);
            navigate(`/app/activity/${id}`);
          }}
        />
      )}
    </div>
  );
};
