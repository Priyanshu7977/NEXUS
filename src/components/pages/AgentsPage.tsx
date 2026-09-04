import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { EmptyState } from '../app/EmptyState';
import { Bot, Plus, Search, ArrowUpRight, UploadCloud } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { Agent } from '../../types/agent';
import { getWorkspaceAgents } from '../../services/agentService';
import { PublishResourceModal } from '../marketplace/PublishResourceModal';

export const AgentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useAuth();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Active' | 'Draft' | 'Paused'>('All');
  const [publishTarget, setPublishTarget] = useState<Agent | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const loadAgents = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setLoading(false);
      return;
    }
    try {
      const { agents: list } = await getWorkspaceAgents(currentWorkspace.id);
      setAgents(list);
    } catch (err) {
      console.error('[NEXUS AgentsPage] Error loading workspace agents:', err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const filteredAgents = agents.filter((ag) => {
    const matchesFilter =
      selectedFilter === 'All' ||
      (selectedFilter === 'Active' && ag.status === 'active') ||
      (selectedFilter === 'Draft' && ag.status === 'draft') ||
      (selectedFilter === 'Paused' && ag.status === 'paused');
    const matchesSearch =
      ag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ag.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ag.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111318] mb-1">
            Agents
          </h2>
          <p className="text-sm text-[#626873]">
            Configure autonomous reasoning workers, capability guardrails, and execution limits.
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
            <span>Publish Agent</span>
          </button>

          <Button size="sm" onClick={() => navigate('/app/agents/new')}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create agent</span>
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8B919B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents by name or role..."
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

      {/* Main List or Empty State */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#8B919B]">
          Loading workspace agents...
        </div>
      ) : filteredAgents.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="Create your first agent."
          description="Give an agent a purpose, the tools it needs and clear boundaries for what it can do."
          actionLabel="Create agent"
          onAction={() => navigate('/app/agents/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((ag) => (
            <div
              key={ag.id}
              onClick={() => navigate(`/app/agents/${ag.id}`)}
              className="p-5 rounded-2xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D4AFF] border border-purple-100 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        ag.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ag.status === 'paused'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-[#FAFAF8] text-[#8B919B] border border-[#E5E5E2]'
                      }`}
                    >
                      {ag.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#111318] mb-1 flex items-center justify-between">
                  <span>{ag.name}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#8B919B] group-hover:text-[#111318] transition-colors" />
                </h3>
                <p className="text-xs text-[#6D4AFF] font-medium mb-2">
                  {ag.role || 'Specialized Agent'}
                </p>
                <p className="text-xs text-[#626873] line-clamp-2 leading-relaxed mb-4">
                  {ag.description || ag.instructions}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EFEFEA] flex items-center justify-between text-xs text-[#8B919B]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono">Model:</span>
                  <span className="font-medium text-[#111318] uppercase text-[10px] bg-[#FAFAF8] px-2 py-0.5 rounded border border-[#E5E5E2] flex items-center gap-1">
                    <BrandLogo brand={ag.model_provider} size={12} />
                    <span>{ag.model_provider}</span>
                  </span>
                </div>
                <span className="text-[11px] text-[#626873]">
                  {(ag.tools || []).length} {(ag.tools || []).length === 1 ? 'tool' : 'tools'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentWorkspace && (
        <PublishResourceModal
          isOpen={isPublishModalOpen}
          workspaceId={currentWorkspace.id}
          preselectedType="AGENT"
          preselectedAgent={publishTarget || undefined}
          onClose={() => {
            setIsPublishModalOpen(false);
            setPublishTarget(null);
          }}
          onPublished={() => {
            loadAgents();
          }}
        />
      )}
    </div>
  );
};

