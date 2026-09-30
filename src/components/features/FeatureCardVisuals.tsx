import React from 'react';
import { Cable, Network, Eye } from 'lucide-react';

export const ConnectVisual: React.FC = () => {
  return (
    <div className="relative w-full h-44 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] p-4 flex flex-col justify-between overflow-hidden shadow-2xs">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5E5E2_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

      <div className="flex items-center justify-between z-10">
        <span className="text-[10px] font-mono text-[#6D4AFF] font-bold flex items-center gap-1.5">
          <Cable className="w-3.5 h-3.5" />
          <span>CONNECTOR LAYER</span>
        </span>
        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
          CONNECTED
        </span>
      </div>

      {/* Protocol Slots Visual */}
      <div className="grid grid-cols-3 gap-2 my-auto z-10">
        {[
          { name: 'Model Server', status: 'ACTIVE', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { name: 'REST API', status: 'READY', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
          { name: 'Event Stream', status: 'SYNCED', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' }
        ].map((slot) => (
          <div key={slot.name} className="p-2 rounded-lg bg-white border border-[#E5E5E2] text-center shadow-2xs">
            <div className="text-[10px] font-semibold text-[#111318] truncate">{slot.name}</div>
            <div className={`text-[9px] font-mono mt-1 ${slot.color} ${slot.bg} px-1.5 py-0.5 rounded border font-medium`}>
              {slot.status}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#626873] z-10 pt-2 border-t border-[#EFEFEA]">
        <span>Unified Protocol</span>
        <span>Secure Ingress</span>
      </div>
    </div>
  );
};

export const OrchestrateVisual: React.FC = () => {
  return (
    <div className="relative w-full h-44 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] p-4 flex flex-col justify-between overflow-hidden shadow-2xs">
      <div className="absolute inset-0 bg-[radial-gradient(#E5E5E2_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

      <div className="flex items-center justify-between z-10">
        <span className="text-[10px] font-mono text-[#2563EB] font-bold flex items-center gap-1.5">
          <Network className="w-3.5 h-3.5" />
          <span>WORKFLOW PIPELINE</span>
        </span>
        <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 font-semibold">
          PARALLEL
        </span>
      </div>

      {/* Mini Flow Tree */}
      <div className="flex items-center justify-between my-auto px-2 z-10">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-xs font-mono font-bold shadow-2xs">
            P
          </div>
          <span className="text-[9px] font-mono text-[#626873] font-medium mt-1">Planner</span>
        </div>

        <div className="h-[1px] w-6 bg-gradient-to-r from-emerald-400 to-[#6D4AFF]" />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-[9px] font-mono text-[#6D4AFF] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6D4AFF] animate-pulse" />
            <span>Code Agent</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[9px] font-mono text-blue-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>Research</span>
          </div>
        </div>

        <div className="h-[1px] w-6 bg-gradient-to-r from-[#6D4AFF] to-blue-400" />

        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-mono font-bold shadow-2xs">
            T
          </div>
          <span className="text-[9px] font-mono text-[#626873] font-medium mt-1">Testing</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#626873] z-10 pt-2 border-t border-[#EFEFEA]">
        <span>Multi-Agent Dispatch</span>
        <span>Automatic Recovery</span>
      </div>
    </div>
  );
};

export const ObserveVisual: React.FC = () => {
  return (
    <div className="relative w-full h-44 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] p-4 flex flex-col justify-between overflow-hidden shadow-2xs">
      <div className="absolute inset-0 bg-[radial-gradient(#E5E5E2_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

      <div className="flex items-center justify-between z-10">
        <span className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          <span>EXECUTION TRACE</span>
        </span>
        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-semibold">
          LIVE FEED
        </span>
      </div>

      {/* Mini Telemetry Waterfall Bars */}
      <div className="flex flex-col gap-2 my-auto z-10">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#626873] font-medium truncate w-24">planner.plan</span>
          <div className="flex-1 mx-2 h-1.5 rounded-full bg-[#E5E5E2] overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-full" />
          </div>
          <span className="text-emerald-700 font-semibold text-[9px]">done · 240ms</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#626873] font-medium truncate w-24">code.generate</span>
          <div className="flex-1 mx-2 h-1.5 rounded-full bg-[#E5E5E2] overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-full" />
          </div>
          <span className="text-emerald-700 font-semibold text-[9px]">done · 610ms</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#626873] font-medium truncate w-24">security.check</span>
          <div className="flex-1 mx-2 h-1.5 rounded-full bg-[#E5E5E2] overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full w-full" />
          </div>
          <span className="text-purple-700 font-semibold text-[9px]">verified · 180ms</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#626873] z-10 pt-2 border-t border-[#EFEFEA]">
        <span>Step-by-Step Traces</span>
        <span>Decision Context</span>
      </div>
    </div>
  );
};
