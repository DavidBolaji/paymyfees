'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstantAction {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

interface InstantActionsProps {
  title: string;
  subtitle: string;
  actions: InstantAction[];
  onViewAll?: () => void;
  className?: string;
}

export function InstantActions({
  title,
  subtitle,
  actions,
  onViewAll,
  className
}: InstantActionsProps) {
  return (
    <div className={cn("bg-white h-full rounded-xl border border-gray-200 shadow-sm px-3 py-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="px-4 py-2 border-2 border-[#00296B] text-[#00296B] rounded-lg text-sm font-medium hover:bg-[#00296B] hover:text-white transition-colors"
          >
            View All
          </button>
        )}
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="w-full flex items-stretch gap-3 p-0 text-left hover:bg-gray-50 rounded-lg transition-colors group"
          >
            {/* Icon Container */}
            <div className="w-14 h-16 mt-2 bg-[#00296B] rounded-xl flex items-center justify-center flex-shrink-0">
              <action.icon className="w-6 h-6 text-white" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-semibold text-[1.125rem] text-gray-900 mb-[0.1875rem] group-hover:text-[#00296B] transition-colors">
                {action.title}
              </h3>
              <p className="text-[0.6875rem] text-gray-600 leading-relaxed font-medium">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}