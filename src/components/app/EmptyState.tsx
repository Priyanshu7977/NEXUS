import React from 'react';
import { Button } from '../ui/Button';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white border border-[#E5E5E2] shadow-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#6D4AFF] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[#6D4AFF]" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[#111318] mb-1.5 tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-[#626873] max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {actionLabel && onAction && (
            <Button size="md" onClick={onAction} withArrow>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" size="md" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
