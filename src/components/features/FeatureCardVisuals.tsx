import React from 'react';
import { Cable, Network, Eye } from 'lucide-react';

export const ConnectVisual: React.FC = () => {
  return (
    <div className="relative w-full h-44 rounded-lg bg-[#08090B]/80 border border-white/[0.06] p-4 flex flex-col justify-between overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="flex items-center justify-between z-10">
        <span className="text-[10px] font-mono text-[#7C5CFC] font-semibold flex items-center gap-1.5">
          <Cable className="w-3.5 h-3.5" />
          <span>CONNECTOR LAYER</span>
        </span>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          CONNECTED
        </span>
      </div>

      {/* Protocol Slots Visual */}
      <div className="grid grid-cols-3 gap-2 my-auto z-10">
        {[
          { name: 'Model Server', status: 'ACTIVE', color: 'text-[#45D7FF]', bg: 'bg-[#45D7FF]/10' },
          { name: 'REST API', status: 'READY', color: 'text-[#7C5CFC]', bg: 'bg-[#7C5CFC]/10' },
          { name: 'Event Stream', status: 'SYNCED', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
        ].map((slot) => (
          <div key={slot.name} className="p-2 rounded-md bg-[#12151A] border border-white/[0.06] text-center">
            <div className="text-[10px] font-medium text-[#F5F7FA] truncate">{slot.name}</div>
            <div className={`text-[9px] font-mono mt-1 ${slot.color} ${slot.bg} px-1.5 py-0.5 rounded`}>
              {slot.status}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#626A78] z-10 pt-2 border-t border-white/[0.05]">
        <span>Unified Protocol</span>
        <span>Secure Ingress</span>
      </div>
    </div>
  );
};

export const OrchestrateVisual: React.FC = () => {
  return (
    <div className="relative w-full h-44 rounded-lg bg-[#08090B]/80 border border-white/[0.06] p-4 flex flex-col justify-between overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="flex items-center justify-between z-10">
        <span className="text-[10px] font-mono text-[#45D7FF] font-semibold flex items-center gap-1.5">
          <Network className="w-3.5 h-3.5" />
          <span>WORKFLOW PIPELINE</span>
        </span>
        <span className="text-[10px] font-mono text-[#9B82FD] bg-[#7C5CFC]/10 px-2 py-0.5 rounded border border-[#7C5CFC]/20">
          PARALLEL
        </span>
      </div>

      {/* Mini Flow Tree */}
      <div className="flex items-center justify-between my-auto px-2 z-10">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-lg bg-[#12151A] border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">
            P
          </div>
          <span className="text-[9px] font-mono text-[#9BA3AF] mt-1">Planner</span>
        </div>

        <div className="h-[1px] w-6 bg-gradient-to-r from-emerald-500/50 to-[#7C5CFC]" />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#171A20] border border-[#7C5CFC]/30 text-[9px] font-mono text-[#9B82FD]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC] animate-pulse" />
            <span>Code Agent</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#171A20] border border-[#45D7FF]/30 text-[9px] font-mono text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Research</span>
          </div>
        </div>

        <div className="h-[1px] w-6 bg-gradient-to-r from-[#7C5CFC] to-cyan-500/50" />

        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-lg bg-[#12151A] border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">
            T
          </div>
          <span className="text-[9px] font-mono text-[#9BA3AF] mt-1">Testing</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#626A78] z-10 pt-2 border-t border-white/[0.05]">
        <span>Multi-Agent Dispatch</span>
        <span>Automatic Recovery</span>
      </div>
    </div>
  );
};

export const ObserveVisual: React.FC = () => {
  return (
    <div className="relative w-full h-44 rounded-lg bg-[#08090B]/80 border border-white/[0.06] p-4 flex flex-col justify-between overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="flex items-center justify-between z-10">
        <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          <span>EXECUTION TRACE</span>
        </span>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          LIVE FEED
        </span>
      </div>

      {/* Mini Telemetry Waterfall Bars */}
      <div className="flex flex-col gap-2 my-auto z-10">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#9BA3AF] truncate w-24">planner.plan</span>
          <div className="flex-1 mx-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full w-[45%]" />
          </div>
          <span className="text-[#626A78] text-[9px]">done</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#9BA3AF] truncate w-24">code.generate</span>
          <div className="flex-1 mx-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-[#7C5CFC] rounded-full w-[80%]" />
          </div>
          <span className="text-[#626A78] text-[9px]">running</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#9BA3AF] truncate w-24">security.check</span>
          <div className="flex-1 mx-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-[#45D7FF] rounded-full w-[30%]" />
          </div>
          <span className="text-[#626A78] text-[9px]">queued</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#626A78] z-10 pt-2 border-t border-white/[0.05]">
        <span>Step-by-Step Traces</span>
        <span>Decision Context</span>
      </div>
    </div>
  );
};
