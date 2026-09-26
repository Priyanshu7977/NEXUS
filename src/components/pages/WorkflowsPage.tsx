import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { EmptyState } from '../app/EmptyState';
import {
  Network,
  Plus,
  Search,
  GitCommit,
  Bot,
  CheckCircle2,
  Shield,
  ArrowUpRight,
  Play,
  Layers,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { getWorkflows } from '../../services/workflowService';
import { Workflow } from '../../types/workflow';
import { useAuth } from '../../context/AuthContext';
import { RunWorkflowModal } from '../workflows/RunWorkflowModal';
import { PublishResourceModal } from '../marketplace/PublishResourceModal';

export const WorkflowsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useAuth();
  const workspaceId = currentWorkspace?.id || 'default-workspace';

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Active' | 'Draft' | 'Paused'>('All');
  const [activeRunWorkflow, setActiveRunWorkflow] = useState<Workflow | null>(null);
  const [publishTarget, setPublishTarget] = useState<Workflow | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const fetchWorkflowList = async () => {
    setLoading(true);
    const { workflows: list } = await getWorkflows(workspaceId);
    setWorkflows(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkflowList();
  }, [workspaceId]);

  const filtered = workflows.filter((wf) => {
    const matchesFilter =
      selectedFilter === 'All' ||
      (selectedFilter === 'Active' && wf.status === 'active') ||
      (selectedFilter === 'Draft' && wf.status === 'draft') ||
      (selectedFilter === 'Paused' && wf.status === 'paused');
    const matchesSearch =
      wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wf.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111318] mb-1">
            Workflows
          </h2>
          <p className="text-sm text-[#626873]">
            Compose agents, tools, and human approval gates into deterministic execution DAGs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setPublishTarget(null);
              setIsPublishModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-[#E5E5E2] bg-white text-gray-700 hover:bg-[#FAFAF8] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#6D4AFF]" />
            <span>Publish Workflow</span>
          </button>

          <Button size="sm" onClick={() => navigate('/app/workflows/new')}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create workflow</span>
          </Button>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8B919B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflows..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs text-[#111318] placeholder:text-[#8B919B] outline-none shadow-sm transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(['All', 'Active', 'Draft', 'Paused'] as const).map((filter) => {
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

      {loading ? (
        <div className="py-20 text-center text-xs text-[#8B919B]">
          Loading workflows...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col gap-6">
          <EmptyState
            icon={Network}
            title="No workflows found."
            description="Build your first orchestration pipeline by connecting agents, tools, conditions and approval gates."
            actionLabel="Create workflow"
            onAction={() => navigate('/app/workflows/new')}
          />

          {/* Workflow Architecture Preview */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] text-center shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8B919B] mb-4 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6D4AFF]" /> Visual Multi-Agent Architecture
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-xs text-[#626873] py-2">
              <span className="px-3 py-1.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#111318] font-medium flex items-center gap-1.5 shadow-sm">
                <GitCommit className="w-3.5 h-3.5 text-emerald-600" /> Event Trigger
              </span>
              <span className="text-[#8B919B]">→</span>
              <span className="px-3 py-1.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#111318] font-medium flex items-center gap-1.5 shadow-sm">
                <Bot className="w-3.5 h-3.5 text-[#6D4AFF]" /> Auditor Agent
              </span>
              <span className="text-[#8B919B]">→</span>
              <span className="px-3 py-1.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#111318] font-medium flex items-center gap-1.5 shadow-sm">
                <Shield className="w-3.5 h-3.5 text-amber-600" /> Human Approval Gate
              </span>
              <span className="text-[#8B919B]">→</span>
              <span className="px-3 py-1.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#111318] font-medium flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Remediate & Output
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {filtered.map((wf) => (
            <div
              key={wf.id}
              onClick={() => navigate(`/app/workflows/${wf.id}`)}
              className="p-6 rounded-2xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all cursor-pointer h-full min-w-0 flex flex-col justify-between group"
            >
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-start justify-between mb-3.5 gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D4AFF] border border-purple-100 flex items-center justify-center shrink-0">
                    <Network className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-semibold">
                      {wf.status}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAFAF8] text-[#8B919B] border border-[#EFEFEA] flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5" />
                      {wf.nodes.length} Nodes
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#111318] mb-1.5 flex items-center justify-between gap-2 min-w-0">
                  <span className="truncate">{wf.name}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#8B919B] group-hover:text-[#111318] transition-colors shrink-0" />
                </h3>
                <p className="text-xs text-[#626873] leading-relaxed line-clamp-2 mb-4 break-words">
                  {wf.description || 'Configurable multi-agent pipeline.'}
                </p>
              </div>

              <div className="pt-4 mt-auto border-t border-[#EFEFEA] flex items-center justify-between text-xs gap-2">
                <span className="text-[#8B919B] font-mono text-[11px] truncate">
                  Trigger: {wf.trigger_type}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRunWorkflow(wf);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#FAFAF8] hover:bg-emerald-50 text-emerald-700 border border-[#E5E5E2] hover:border-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 text-emerald-600" />
                    <span>Run</span>
                  </button>
                  <span className="text-[#6D4AFF] hover:text-[#5B3CE8] font-medium flex items-center gap-1">
                    Open Studio →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded Run Modal */}
      {activeRunWorkflow && (
        <RunWorkflowModal
          isOpen={!!activeRunWorkflow}
          onClose={() => setActiveRunWorkflow(null)}
          workspaceId={workspaceId}
          workflow={activeRunWorkflow}
          onExecutionCompleted={() => {
            fetchWorkflowList();
          }}
        />
      )}

      {/* Embedded Publish Modal */}
      <PublishResourceModal
        isOpen={isPublishModalOpen}
        workspaceId={workspaceId}
        preselectedType="WORKFLOW"
        preselectedWorkflow={publishTarget || undefined}
        onClose={() => {
          setIsPublishModalOpen(false);
          setPublishTarget(null);
        }}
        onPublished={() => {
          fetchWorkflowList();
        }}
      />
    </div>
  );
};
