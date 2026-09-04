import React from 'react';
import { AgentStatus } from '../../types';

export interface BadgeProps {
  status?: AgentStatus | 'PREVIEW' | 'ACTIVE' | 'DEVELOPER' | 'SANDBOX';
  children?: React.ReactNode;
  variant?: 'dot' | 'subtle';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  children,
  variant = 'dot',
  className = '',
  size = 'sm'
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'RUNNING':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
          dot: 'bg-emerald-500',
          pulse: true,
          label: 'RUNNING'
        };
      case 'COMPLETED':
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400',
          dot: 'bg-blue-500',
          pulse: false,
          label: 'COMPLETED'
        };
      case 'PAUSED':
      case 'WAITING':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400',
          dot: 'bg-amber-500',
          pulse: false,
          label: status
        };
      case 'PREVIEW':
      case 'DEVELOPER':
        return {
          bg: 'bg-[#6D4AFF]/10 border-[#6D4AFF]/20 text-[#6D4AFF]',
          dot: 'bg-[#6D4AFF]',
          pulse: false,
          label: status
        };
      case 'ACTIVE':
      default:
        return {
          bg: 'bg-black/[0.04] border-black/[0.08] text-[#626873]',
          dot: 'bg-[#626873]',
          pulse: false,
          label: status || 'ACTIVE'
        };
    }
  };

  const style = getStatusStyles();
  const labelText = children || style.label;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono uppercase tracking-wider font-medium select-none ${style.bg} ${sizeClasses} ${className}`}
    >
      {variant === 'dot' && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {style.pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${style.dot}`} />
        </span>
      )}
      <span>{labelText}</span>
    </span>
  );
};
