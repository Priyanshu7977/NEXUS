import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { 
  CreditCard, 
  Cpu, 
  Activity, 
  Cable, 
  Clock, 
  Info, 
  ArrowUpRight
} from 'lucide-react';

export const UsagePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 text-left max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111318] mb-1">
            Usage & Metrics
          </h2>
          <p className="text-sm text-[#626873]">
            Understand how your workspace uses compute, credits, and connected tools.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => navigate('/pricing')}>
          <span>View Pricing & Plans</span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      {/* Plan Summary Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-[10px] font-mono font-semibold text-[#6D4AFF] uppercase tracking-wider mb-3 border border-purple-200">
            CURRENT WORKSPACE PLAN
          </div>
          <h3 className="text-xl font-bold text-[#111318] mb-1">
            Free Developer Tier (₹0 / month)
          </h3>
          <p className="text-xs text-[#626873]">
            Includes 1,000 monthly credits, 3 connected services, 3 custom agents, and 2 active workflows.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-mono text-[#8B919B]">Credits Available</div>
            <div className="text-xl font-bold text-[#111318]">1,000 / 1,000</div>
          </div>
        </div>
      </div>

      {/* 4 Usage Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credits */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B919B] uppercase">Credits</span>
              <CreditCard className="w-4 h-4 text-[#6D4AFF]" />
            </div>
            <div className="text-2xl font-bold text-[#111318] mb-1">
              0
            </div>
            <span className="text-[11px] text-[#626873]">
              0 / 1,000 credits used
            </span>
          </div>
          <div className="w-full bg-[#FAFAF8] h-1.5 rounded-full mt-4 overflow-hidden border border-[#E5E5E2]">
            <div className="bg-[#6D4AFF] h-full rounded-full" style={{ width: '0%' }} />
          </div>
        </div>

        {/* Executions */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B919B] uppercase">Executions</span>
              <Activity className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div className="text-2xl font-bold text-[#111318] mb-1">
              0
            </div>
            <span className="text-[11px] text-[#626873]">
              0 runs this billing cycle
            </span>
          </div>
          <div className="pt-3 border-t border-[#EFEFEA] text-[10px] font-mono text-[#8B919B]">
            Limit: 50 runs / day
          </div>
        </div>

        {/* AI Model Tokens */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B919B] uppercase">AI Tokens</span>
              <Cpu className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-[#111318] mb-1">
              0 tokens
            </div>
            <span className="text-[11px] text-[#626873]">
              No model calls recorded
            </span>
          </div>
          <div className="pt-3 border-t border-[#EFEFEA] text-[10px] font-mono text-[#8B919B]">
            All major providers
          </div>
        </div>

        {/* Connected Services */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B919B] uppercase">Services</span>
              <Cable className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-[#111318] mb-1">
              1 / 3
            </div>
            <span className="text-[11px] text-[#626873]">
              GitHub active
            </span>
          </div>
          <div className="pt-3 border-t border-[#EFEFEA] text-[10px] font-mono text-[#8B919B]">
            2 slots remaining
          </div>
        </div>
      </div>

      {/* Conceptual Credit Explainer */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-[#6D4AFF]" />
          <h3 className="text-base font-bold text-[#111318]">
            How NEXUS Credits Work
          </h3>
        </div>
        <p className="text-xs text-[#626873] leading-relaxed mb-6 max-w-2xl">
          Credits are used for AI model calls, tool usage and workflow execution. Compute draw is calculated based on model token count, tool latency, and external API calls.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
            <div className="font-bold text-[#111318] mb-1">AI Reasoning</div>
            <p className="text-[11px] text-[#626873]">
              1 credit per 1,000 input/output tokens processed by specialized agents.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
            <div className="font-bold text-[#111318] mb-1">Tool Invocations</div>
            <p className="text-[11px] text-[#626873]">
              0.5 credits per external API query, GitHub repo diff, or database read.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
            <div className="font-bold text-[#111318] mb-1">Execution Gates</div>
            <p className="text-[11px] text-[#626873]">
              Human-in-the-loop approvals and static security checks are always free.
            </p>
          </div>
        </div>
      </div>

      {/* Usage History Honest Empty State */}
      <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E5E5E2] text-center flex flex-col items-center justify-center shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#8B919B] flex items-center justify-center mb-3">
          <Clock className="w-5 h-5" />
        </div>
        <h4 className="text-base font-bold text-[#111318] mb-1">
          No usage recorded
        </h4>
        <p className="text-xs text-[#626873] max-w-sm mb-6 leading-relaxed">
          Usage data for compute, LLM token allocations, and tool calls will appear here once workflows are triggered.
        </p>
        <Button size="sm" onClick={() => navigate('/app/workflows/new')}>
          Create a workflow
        </Button>
      </div>
    </div>
  );
};
