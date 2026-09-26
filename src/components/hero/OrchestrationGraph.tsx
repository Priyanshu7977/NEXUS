import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../brand/BrandLogo';
import { NexusLogo } from '../layout/Navbar';
import { Check, ArrowUpRight } from 'lucide-react';

interface NodeData {
  id: string;
  name: string;
  role: string;
  brand?: 'github' | 'vercel' | 'anthropic' | 'supabase' | 'openai' | 'gemini';
  status: 'Ready' | 'Executing' | 'Connected';
  x: number;
  y: number;
  link: string;
}

export const OrchestrationGraph: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes: NodeData[] = [
    {
      id: 'planner',
      name: 'Planner Agent',
      role: 'Goal decomposition & routing',
      brand: 'anthropic',
      status: 'Ready',
      x: 24,
      y: 20,
      link: '/explore?tab=agents',
    },
    {
      id: 'code',
      name: 'Code Agent',
      role: 'Implementation & PR generation',
      brand: 'github',
      status: 'Executing',
      x: 76,
      y: 20,
      link: '/explore?tab=agents',
    },
    {
      id: 'database',
      name: 'Data Layer',
      role: 'Schema & state persistence',
      brand: 'supabase',
      status: 'Connected',
      x: 24,
      y: 76,
      link: '/explore?tab=connectors',
    },
    {
      id: 'deploy',
      name: 'Deploy Gate',
      role: 'Ephemeral preview & verification',
      brand: 'vercel',
      status: 'Connected',
      x: 76,
      y: 76,
      link: '/explore?tab=connectors',
    },
  ];

  const centerX = 50;
  const centerY = 48;

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[16/10] min-h-[290px] xs:min-h-[320px] sm:min-h-[360px] lg:min-h-[340px] xl:min-h-[390px] max-h-[440px] rounded-2xl bg-white border border-[#E5E5E2] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden p-2.5 sm:p-5 select-none">
      {/* Background Dots Pattern */}
      <div className="absolute inset-0 bg-dots-light opacity-80 pointer-events-none" />

      {/* SVG System Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="activeLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6D4AFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {nodes.map((node) => {
          const isActive = hoveredNode === node.id || hoveredNode === 'core';
          return (
            <g key={node.id}>
              {/* Static Path */}
              <line
                x1={`${centerX}%`}
                y1={`${centerY}%`}
                x2={`${node.x}%`}
                y2={`${node.y}%`}
                stroke={isActive ? '#6D4AFF' : '#E5E5E2'}
                strokeWidth={isActive ? '2' : '1.2'}
                className="transition-colors duration-200"
              />
              {/* Animated flow dash */}
              <line
                x1={`${centerX}%`}
                y1={`${centerY}%`}
                x2={`${node.x}%`}
                y2={`${node.y}%`}
                stroke={isActive ? '#3B82F6' : '#6D4AFF'}
                strokeWidth="2"
                strokeDasharray="4 16"
                className="animate-flow-line"
                opacity={isActive ? 0.9 : 0.4}
              />
            </g>
          );
        })}
      </svg>

      {/* Center Dark Core Node */}
      <Link
        to="/explore"
        style={{ left: `${centerX}%`, top: `${centerY}%` }}
        onMouseEnter={() => setHoveredNode('core')}
        onMouseLeave={() => setHoveredNode(null)}
        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
        aria-label="Explore NEXUS Core Platform"
      >
        <div className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#111318] text-white border border-[#22262F] shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition-all duration-200 group-hover:border-[#6D4AFF]/60 group-hover:shadow-[0_8px_24px_rgba(109,74,255,0.25)]">
          <NexusLogo size={16} dark />
          <div className="flex flex-col text-left">
            <span className="text-[10px] sm:text-xs font-semibold tracking-tight text-white whitespace-nowrap">NEXUS Core</span>
            <span className="text-[8px] sm:text-[10px] text-[#8B919B] whitespace-nowrap">Orchestration Bus</span>
          </div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#6D4AFF] animate-pulse ml-0.5 sm:ml-1 shrink-0" />
        </div>
      </Link>

      {/* Satellite White Cards */}
      {nodes.map((node) => {
        const isHovered = hoveredNode === node.id;
        return (
          <Link
            key={node.id}
            to={node.link}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer block"
            aria-label={`Inspect ${node.name}`}
          >
            <div
              className={`flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2.5 rounded-xl bg-white border transition-all duration-200 shadow-sm w-[136px] xs:w-[155px] sm:w-48 md:w-52 lg:w-44 xl:w-52 2xl:w-56 text-left ${
                isHovered
                  ? 'border-[#6D4AFF] shadow-[0_6px_20px_rgba(109,74,255,0.12)] -translate-y-0.5'
                  : 'border-[#E5E5E2] hover:border-[#D4D4CE]'
              }`}
            >
              {node.brand && (
                <div className="w-6 h-6 sm:w-7.5 sm:h-7.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center shrink-0 text-[#111318]">
                  <BrandLogo brand={node.brand} size={14} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-[11px] sm:text-xs font-semibold text-[#111318] truncate">{node.name}</span>
                  <ArrowUpRight className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#6D4AFF] shrink-0 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#626873] leading-tight break-words line-clamp-1 xs:line-clamp-2">{node.role}</div>
              </div>
            </div>
          </Link>
        );
      })}

      {/* Subtle Status Footer */}
      <div className="absolute bottom-2.5 sm:bottom-3 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between text-[10px] sm:text-[11px] text-[#8B919B] z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 truncate">
          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="truncate">Deterministic execution flow</span>
        </div>
        <span className="shrink-0 text-right">Topology</span>
      </div>
    </div>
  );
};
