import React from 'react';
import { 
  Cpu, 
  Bot, 
  ShieldCheck, 
  CheckCircle2, 
  Database, 
  Activity,
  LucideIcon
} from 'lucide-react';
import { OrchestrationNode } from '../../types';
import { Badge } from '../ui/Badge';
import { BrandLogo } from '../brand/BrandLogo';

const ICONS: Record<string, LucideIcon> = {
  Cpu,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Database,
  Activity
};

interface GraphNodeProps {
  node: OrchestrationNode;
  isActive: boolean;
  isHovered: boolean;
  isCore?: boolean;
  onHover: (id: string | null) => void;
}

export const GraphNode: React.FC<GraphNodeProps> = ({
  node,
  isActive,
  isHovered,
  isCore = false,
  onHover
}) => {
  const isBrandNode = node.id === 'github' || node.id === 'vercel';
  const IconComponent = ICONS[node.iconName] || Cpu;

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 select-none z-20 ${
        isHovered ? 'scale-105 z-30' : isActive ? 'scale-100 opacity-100' : 'opacity-80'
      }`}
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      {isCore ? (
        // Central NEXUS Orchestrator Core Node (visually dominant)
        <div className="relative group cursor-pointer">
          {/* Outer Orbital Pulse */}
          <div className="absolute -inset-7 rounded-full border border-[#7C5CFC]/20 animate-spin-slow pointer-events-none" />
          <div className="absolute -inset-10 rounded-full border border-dashed border-[#45D7FF]/15 animate-spin pointer-events-none" style={{ animationDuration: '40s' }} />
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#7C5CFC]/25 to-[#45D7FF]/20 blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />

          {/* Central Card */}
          <div className="relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-[#0D0F12]/95 border border-[#7C5CFC]/40 shadow-[0_0_35px_rgba(124,92,252,0.25)] backdrop-blur-xl min-w-[130px] sm:min-w-[155px]">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#45D7FF] p-[1px] flex items-center justify-center">
                <div className="w-full h-full bg-[#08090B] rounded-[11px] flex items-center justify-center">
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-[#7C5CFC] animate-pulse" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-sm font-bold tracking-wider text-[#F5F7FA]">
                  {node.label}
                </div>
                <div className="text-[9px] sm:text-[10px] font-mono tracking-widest text-[#7C5CFC] font-semibold">
                  {node.sublabel}
                </div>
              </div>
            </div>

            <div className="mt-1 flex items-center gap-1.5 pt-1.5 border-t border-white/[0.07] w-full justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-400 font-medium tracking-wider">
                ORCHESTRATOR
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Surrounding Satellite Nodes
        <div className="relative group cursor-pointer">
          <div
            className={`flex items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 ${
              isHovered
                ? 'bg-[#171A20] border-[#7C5CFC]/40 shadow-[0_0_20px_rgba(124,92,252,0.2)]'
                : 'bg-[#12151A]/85 border-white/[0.07] hover:border-white/15'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg border flex items-center justify-center ${
                isHovered
                  ? 'bg-[#7C5CFC]/20 border-[#7C5CFC]/30 text-[#9B82FD]'
                  : 'bg-white/5 border-white/[0.07] text-[#9BA3AF] group-hover:text-[#F5F7FA]'
              }`}
            >
              {isBrandNode ? (
                <BrandLogo brand={node.id} size={15} />
              ) : (
                <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </div>

            <div className="text-left">
              <div className="text-xs sm:text-sm font-medium text-[#F5F7FA] leading-tight">
                {node.label}
              </div>
              {node.sublabel && (
                <div className="text-[9px] sm:text-[10px] text-[#626A78] font-mono leading-tight">
                  {node.sublabel}
                </div>
              )}
            </div>

            <div className="hidden sm:block ml-1">
              <Badge status={node.status} size="sm" />
            </div>
          </div>

          {/* Interactive Hover Tooltip */}
          {isHovered && (
            <div className="absolute left-1/2 -bottom-2 translate-y-full -translate-x-1/2 w-48 sm:w-56 p-3 rounded-lg bg-[#08090B]/95 border border-[#7C5CFC]/30 shadow-2xl backdrop-blur-xl z-40 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] uppercase font-mono text-[#7C5CFC] font-semibold mb-1">
                {node.role}
              </div>
              <div className="text-xs text-[#F5F7FA] leading-relaxed">
                {node.description}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
