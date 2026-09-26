import React from 'react';

interface PageHeaderProps {
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: string;
  highlightedTitle?: string;
  description: string;
  className?: string;
  align?: 'center' | 'left';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  badgeIcon,
  title,
  highlightedTitle,
  description,
  className = '',
  align = 'center',
}) => {
  const isCenter = align === 'center';

  return (
    <div className={`pt-20 pb-8 sm:pt-24 sm:pb-10 lg:pt-24 lg:pb-12 max-w-4xl ${isCenter ? 'mx-auto text-center' : 'text-left'} ${className}`}>
      {badge && (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E5E2] text-xs font-mono text-[#626873] shadow-sm mb-4 ${isCenter ? 'mx-auto' : ''}`}>
          {badgeIcon && <span className="text-[#6D4AFF]">{badgeIcon}</span>}
          <span>{badge}</span>
        </div>
      )}

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111318] leading-[1.15] mb-4">
        {title}
        {highlightedTitle && (
          <span className="text-[#6D4AFF] block sm:inline sm:ml-2">
            {highlightedTitle}
          </span>
        )}
      </h1>

      <p className="text-base sm:text-lg text-[#626873] leading-relaxed max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  );
};
