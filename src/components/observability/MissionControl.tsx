import React, { useState } from 'react';
import { Clock, Copy, Check } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface TraceItem {
  id: string;
  agent: string;
  action: string;
  status: 'COMPLETED' | 'RUNNING' | 'WAITING';
  duration: string;
  output: string;
}

export const MissionControl: React.FC = () => {
  const [filter, setFilter] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  const traces: TraceItem[] = [
    {
      id: 'step-01',
      agent: 'Planner Agent',
      action: 'Decomposed migration task into 3 execution sub-goals',
      status: 'COMPLETED',
      duration: '420ms',
      output: 'Generated DAG: profiles -> workspaces -> workspace_members'
    },
    {
      id: 'step-02',
      agent: 'Code Agent',
      action: 'Synthesized PostgreSQL schema and RLS policies',
      status: 'COMPLETED',
      duration: '1.4s',
      output: 'Wrote supabase/schema.sql (115 lines, 6 RLS rules)'
    },
    {
      id: 'step-03',
      agent: 'Code Agent',
      action: 'Generated TypeScript schema definitions in src/types',
      status: 'COMPLETED',
      duration: '680ms',
      output: 'Exported Database type interface matching schema'
    },
    {
      id: 'step-04',
      agent: 'Test Agent',
      action: 'Running typecheck and build validation suite',
      status: 'RUNNING',
      duration: '1.8s',
      output: 'Executing tsc -b && vite build (1684 modules)'
    },
    {
      id: 'step-05',
      agent: 'Security Agent',
      action: 'Scanning RLS policies for auth.uid() boundary leaks',
      status: 'WAITING',
      duration: '—',
      output: 'Queued for post-build verification'
    }
  ];

  const filteredTraces = filter === 'ALL'
    ? traces
    : traces.filter((t) => t.status === filter);

  const handleCopy = () => {
    const text = traces.map((t) => `[${t.id}] ${t.agent} (${t.duration}) - ${t.status}: ${t.action} -> ${t.output}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="observability" className="relative py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#F6F6F3]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111318] leading-[1.1] mb-4">
            Complete execution visibility.
          </h2>
          <p className="text-base sm:text-lg text-[#626873] leading-relaxed">
            Audit every agent action, prompt lifecycle, tool invocation, and decision path with structured trace telemetry.
          </p>
        </div>

        {/* Structured Observability Monitor Table Card */}
        <div className="rounded-2xl border border-[#E5E5E2] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden text-left">
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-[#EFEFEA] bg-[#FAFAF8] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-[#111318]">
                Execution Trace Telemetry
              </span>
              <span className="text-[11px] font-mono text-[#8B919B] bg-white px-2 py-0.5 rounded border border-[#E5E5E2]">
                EXAMPLE RUN: #wf-8492
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white border border-[#E5E5E2] p-0.5 rounded-lg text-xs">
                {['ALL', 'COMPLETED', 'RUNNING', 'WAITING'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      filter === f
                        ? 'bg-[#111318] text-white'
                        : 'text-[#626873] hover:text-[#111318]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] text-xs font-medium text-[#626873] hover:text-[#111318] transition-colors"
                title="Copy trace log"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Trace Rows Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EFEFEA] text-[11px] font-mono text-[#8B919B] uppercase tracking-wider bg-[#FAFAF8]/50">
                  <th className="py-3 px-6 font-semibold">Step / Agent</th>
                  <th className="py-3 px-6 font-semibold">Action & Context</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold">Duration</th>
                  <th className="py-3 px-6 font-semibold">Output Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFEA] text-xs">
                {filteredTraces.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="py-4 px-6 font-medium text-[#111318] whitespace-nowrap">
                      <div className="font-semibold text-xs text-[#111318]">{item.agent}</div>
                      <div className="text-[10px] font-mono text-[#8B919B]">{item.id}</div>
                    </td>
                    <td className="py-4 px-6 text-[#626873] max-w-xs">
                      {item.action}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <Badge status={item.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 font-mono text-[#8B919B] whitespace-nowrap">
                      {item.duration}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-[#111318] max-w-sm truncate">
                      <span className="bg-[#FAFAF8] px-2 py-1 rounded border border-[#E5E5E2] block truncate">
                        {item.output}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Note */}
          <div className="px-6 py-3 bg-[#FAFAF8] border-t border-[#EFEFEA] flex items-center justify-between text-xs text-[#8B919B]">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#6D4AFF]" />
              <span>Full trace capture with OpenTelemetry export support</span>
            </div>
            <span>Structured Observability</span>
          </div>
        </div>
      </div>
    </section>
  );
};
