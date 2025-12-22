'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: string;
  title: string;
  status: 'completed' | 'active' | 'upcoming';
}

interface ProgressTrackerProps {
  title: string;
  subtitle: string;
  steps: ProgressStep[];
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function ProgressTracker({
  title,
  subtitle,
  steps,
  actionLabel = "Check Full Timeline",
  onAction,
  className
}: ProgressTrackerProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm px-3 py-4", className)}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>

      <div className="space-y-2 mb-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3">
            {/* Step Indicator */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-[25px] h-[25px] rounded-full flex items-center justify-center",
                step.status === 'completed' && "bg-[#00296B]",
                step.status !== 'completed' && "border-2 border-[#7D7D7D] bg-white"
              )}>
                {step.status === 'completed' ? (
                  <Check className="w-3 h-3 text-white" />
                ) : null}
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-px h-7 mt-2.5",
                  step.status === 'completed' ? "bg-[#00296B]" : "bg-gray-200"
                )} />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 pt-0.5">
              <p className={cn(
                "text-sm font-medium",
                step.status === 'completed' && "text-gray-900",
                step.status !== 'completed' && "text-gray-500"
              )}>
                {step.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="w-full bg-[#00296B] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[#002561] transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}