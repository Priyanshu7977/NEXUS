import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'subtle';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'light',
  hoverable = false,
  ...props
}) => {
  const variantStyles = {
    light: 'bg-white border-[#E5E5E2] text-[#111318] shadow-[0_1px_3px_rgba(0,0,0,0.03)]',
    dark: 'bg-[#15171C] border-white/10 text-[#F5F7FA] shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
    subtle: 'bg-[#FAFAF8] border-[#EFEFEA] text-[#111318]',
  };

  const hoverStyles = hoverable
    ? variant === 'dark'
      ? 'hover:border-white/20 transition-all duration-200'
      : 'hover:border-[#D4D4CE] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all duration-200'
    : '';

  return (
    <div
      className={`relative rounded-xl border ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
