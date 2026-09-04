import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  withArrow?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  withArrow = false,
  children,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-9 px-3.5 text-xs font-medium gap-1.5 rounded-lg',
    md: 'h-10.5 px-5 text-sm font-medium gap-2 rounded-lg',
    lg: 'h-12 px-6.5 text-base font-medium gap-2.5 rounded-xl',
  };

  const variantClasses = {
    primary:
      'group bg-[#6D4AFF] hover:bg-[#5B3CE8] text-white shadow-[0_2px_8px_rgba(109,74,255,0.25)] hover:shadow-[0_4px_14px_rgba(109,74,255,0.35)] active:scale-[0.99] transition-all',
    secondary:
      'group bg-white hover:bg-[#FAFAF8] text-[#111318] border border-[#E5E5E2] hover:border-[#D4D4CE] shadow-[0_1px_2px_rgba(0,0,0,0.04)] active:scale-[0.99] transition-all',
    dark:
      'group bg-[#15171C] hover:bg-[#1C1F26] text-[#F5F7FA] border border-white/10 hover:border-white/20 active:scale-[0.99] transition-all',
    ghost:
      'text-[#626873] hover:text-[#111318] hover:bg-black/[0.04] active:scale-[0.99] transition-all',
    outline:
      'bg-transparent border border-[#E5E5E2] hover:border-[#D4D4CE] text-[#111318] hover:bg-black/[0.02] active:scale-[0.99] transition-all',
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-sans tracking-tight transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#6D4AFF] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <span className="flex items-center">{children}</span>
      {withArrow && (
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </button>
  );
};
