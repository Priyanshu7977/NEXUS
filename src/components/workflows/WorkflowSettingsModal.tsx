import React, { useState } from 'react';
import {
  X,
  Settings2,
  Sliders,
  GitBranch,
  Clock,
  Shield,
  Bell,
  CheckCircle2,
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface WorkflowSettingsData {
  name: string;
  slug: string;
  description: string;
  triggerBranch: string;
  executionTimeoutMinutes: number;
  maxConcurrency: number;
  failureStrategy: 'fail_fast' | 'continue_on_error' | 'auto_retry';
  slackChannel: string;
  approvalQuorum: 'single' | 'dual';
  sandboxIsolation: 'docker' | 'gvisor';
  enableTracing: boolean;
  autoCancelRedundantRuns: boolean;
}

export const DEFAULT_WORKFLOW_SETTINGS: WorkflowSettingsData = {
  name: 'ci-orchestration',
  slug: 'ci-orchestration-dag',
  description: 'Deterministic multi-agent execution pipeline with verification gates and edge deployment.',
  triggerBranch: 'main',
  executionTimeoutMinutes: 15,
  maxConcurrency: 3,
  failureStrategy: 'fail_fast',
  slackChannel: '#nexus-ci-deployments',
  approvalQuorum: 'single',
  sandboxIsolation: 'docker',
  enableTracing: true,
  autoCancelRedundantRuns: true,
};

interface WorkflowSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: Partial<WorkflowSettingsData>;
  onSave?: (savedSettings: WorkflowSettingsData) => void;
}

export const WorkflowSettingsModal: React.FC<WorkflowSettingsModalProps> = ({
  isOpen,
  onClose,
  settings: initialSettings,
  onSave,
}) => {
  const [formData, setFormData] = useState<WorkflowSettingsData>({
    ...DEFAULT_WORKFLOW_SETTINGS,
    ...initialSettings,
  });

  const [activeTab, setActiveTab] = useState<'general' | 'execution' | 'triggers' | 'security'>('general');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  if (!isOpen) return null;

  const handleCopyWebhookSecret = () => {
    navigator.clipboard.writeText('whsec_nexus_live_89f023ac9e1147');
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleReset = () => {
    setFormData(DEFAULT_WORKFLOW_SETTINGS);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#161922] border border-white/10 rounded-2xl shadow-2xl text-left overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#181A21]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 text-[#6D4AFF]">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Workflow Configuration</h3>
              <p className="text-xs text-[#9BA3AF]">Manage execution limits, triggers, notification dispatch, and security isolation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9BA3AF] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-white/[0.08] bg-[#14161E] px-6 gap-2 pt-2">
          {[
            { id: 'general', label: 'General', icon: Sliders },
            { id: 'execution', label: 'Execution & Concurrency', icon: Clock },
            { id: 'triggers', label: 'Triggers & Git', icon: GitBranch },
            { id: 'security', label: 'Gates & Security', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#6D4AFF] text-white font-semibold'
                    : 'border-transparent text-[#9BA3AF] hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1B1E28] border border-white/10 rounded-lg text-sm text-white placeholder-[#626A78] focus:outline-none focus:border-[#6D4AFF]"
                  placeholder="e.g. ci-orchestration"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Workflow Slug / Identifier
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1B1E28] border border-white/10 rounded-lg text-xs font-mono text-[#9BA3AF] placeholder-[#626A78] focus:outline-none focus:border-[#6D4AFF]"
                  placeholder="ci-orchestration-dag"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1B1E28] border border-white/10 rounded-lg text-xs text-white placeholder-[#626A78] focus:outline-none focus:border-[#6D4AFF] resize-none"
                  placeholder="Describe pipeline intent, requirements, and downstream consumers..."
                />
              </div>

              <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-xs font-semibold text-white">OpenTelemetry Distributed Tracing</div>
                  <div className="text-[11px] text-[#9BA3AF]">Export trace spans to Honeycomb, Datadog, or Jaeger</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableTracing}
                  onChange={(e) => setFormData({ ...formData, enableTracing: e.target.checked })}
                  className="w-4 h-4 rounded text-[#6D4AFF] accent-[#6D4AFF] cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'execution' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Execution Timeout
                  </label>
                  <select
                    value={formData.executionTimeoutMinutes}
                    onChange={(e) => setFormData({ ...formData, executionTimeoutMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#1B1E28] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#6D4AFF]"
                  >
                    <option value={5}>5 minutes (Fast CI)</option>
                    <option value={15}>15 minutes (Standard DAG)</option>
                    <option value={30}>30 minutes (Extensive Tests)</option>
                    <option value={60}>60 minutes (Deep Verification)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Max Concurrent Runs
                  </label>
                  <select
                    value={formData.maxConcurrency}
                    onChange={(e) => setFormData({ ...formData, maxConcurrency: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#1B1E28] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#6D4AFF]"
                  >
                    <option value={1}>1 Run (Serial execution)</option>
                    <option value={3}>3 Runs (Parallel allowed)</option>
                    <option value={5}>5 Runs (High throughput)</option>
                    <option value={10}>10 Runs (Enterprise burst)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Node Failure Strategy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'fail_fast', label: 'Fail Fast', desc: 'Terminate entire DAG on first failure' },
                    { id: 'continue_on_error', label: 'Continue', desc: 'Execute independent parallel branches' },
                    { id: 'auto_retry', label: 'Auto-Retry', desc: 'Retry failed step up to 3 times' },
                  ].map((strat) => (
                    <div
                      key={strat.id}
                      onClick={() => setFormData({ ...formData, failureStrategy: strat.id as any })}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        formData.failureStrategy === strat.id
                          ? 'bg-[#6D4AFF]/15 border-[#6D4AFF] text-white'
                          : 'bg-[#1B1E28] border-white/10 text-[#9BA3AF] hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-semibold text-white mb-1">{strat.label}</div>
                      <div className="text-[10px] leading-tight text-[#9BA3AF]">{strat.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-xs font-semibold text-white">Auto-cancel Redundant Queued Runs</div>
                  <div className="text-[11px] text-[#9BA3AF]">Cancel older pending executions when a new commit pushes to the same branch</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoCancelRedundantRuns}
                  onChange={(e) => setFormData({ ...formData, autoCancelRedundantRuns: e.target.checked })}
                  className="w-4 h-4 rounded text-[#6D4AFF] accent-[#6D4AFF] cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'triggers' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Default Target Git Branch
                </label>
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-[#9BA3AF]" />
                  <input
                    type="text"
                    value={formData.triggerBranch}
                    onChange={(e) => setFormData({ ...formData, triggerBranch: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#1B1E28] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#6D4AFF]"
                    placeholder="main"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Inbound Webhook Secret Token
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="password"
                      readOnly
                      value="whsec_nexus_live_89f023ac9e1147"
                      className="w-full px-3 py-2 bg-[#1B1E28] border border-white/10 rounded-lg text-xs font-mono text-[#9BA3AF] select-all"
                    />
                  </div>
                  <button
                    onClick={handleCopyWebhookSecret}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToken ? 'Copied' : 'Copy Secret'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#9BA3AF] mt-1">Used to verify HMAC-SHA256 signatures on incoming GitHub, GitLab, and Linear webhooks.</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-400" /> Slack Gate Dispatch Channel
                </label>
                <input
                  type="text"
                  value={formData.slackChannel}
                  onChange={(e) => setFormData({ ...formData, slackChannel: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1B1E28] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#6D4AFF]"
                  placeholder="#nexus-ci-deployments"
                />
                <p className="text-[11px] text-[#9BA3AF] mt-1">Human approval requests and critical build alerts will be dispatched directly to this channel.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Human Approval Gate Quorum
                </label>
                <select
                  value={formData.approvalQuorum}
                  onChange={(e) => setFormData({ ...formData, approvalQuorum: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#1B1E28] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#6D4AFF]"
                >
                  <option value="single">Single Sign-off (1 approved admin)</option>
                  <option value="dual">Dual Quorum (2 independent reviewers required)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Ephemeral Sandbox Runtime Isolation
                </label>
                <select
                  value={formData.sandboxIsolation}
                  onChange={(e) => setFormData({ ...formData, sandboxIsolation: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#1B1E28] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#6D4AFF]"
                >
                  <option value="docker">Docker Container Sandbox (Standard isolation)</option>
                  <option value="gvisor">gVisor MicroVM Sandbox (Zero-trust hardened kernel)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#181A21]">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#9BA3AF] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9BA3AF] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button
              size="sm"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold cursor-pointer shadow-lg"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
