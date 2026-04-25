'use client';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProgressStep } from '@/data/types';

interface ProgressTrackerProps {
  title: string;
  subtitle?: string;
  steps: ProgressStep[];
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  showAction?: boolean;
  variant?: 'mini' | 'max'; // New prop for variation
}

export function ProgressTracker({
  title,
  subtitle,
  steps,
  actionLabel = "Check Full Timeline",
  onAction,
  className,
  showAction = true,
  variant = 'mini'
}: ProgressTrackerProps) {
  const isEmpty = !steps || steps.length === 0;

  // Empty state — matches the design: title, subtitle, button only
  if (isEmpty) {
    return (
      <div className={cn("bg-white shadow-sm px-3 py-4 border border-gray-200 rounded-xl h-full flex flex-col", className)}>
        <div className="mb-6">
          <h2 className="mb-1 font-semibold text-gray-900 text-lg">{title}</h2>
          <p className="text-gray-600 text-sm">See full timeline of your loan and repayment</p>
        </div>
        <div className="flex-1" />
        {showAction && onAction && (
          <button
            onClick={onAction}
            className="flex justify-center items-center gap-2 bg-[#00296B] hover:bg-[#002561] px-4 py-2.5 rounded-lg w-full font-medium text-white transition-colors"
          >
            <Check className="w-4 h-4" />
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  // Ensure minimum of 5 steps by adding dummy steps if needed
  const MIN_STEPS = 5;
  let displaySteps = variant === 'mini' ? steps.slice(0, 5) : steps;

  if (displaySteps.length < MIN_STEPS) {
    const dummySteps: ProgressStep[] = Array.from(
      { length: MIN_STEPS - displaySteps.length },
      (_, index) => ({
        id: `dummy-${index}`,
        title: 'Upcoming Step',
        status: 'upcoming' as const
      })
    );
    displaySteps = [...displaySteps, ...dummySteps];
  }

  const hasMoreSteps = variant === 'max' && steps.length > 9;

  return (
    <div className={cn("bg-white shadow-sm px-3 py-4 border border-gray-200 rounded-xl h-full flex flex-col", className)}>
      <div className="mb-6">
        <h2 className="mb-1 font-semibold text-gray-900 text-lg">{title}</h2>
        {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
      </div>

      <div className={cn(
        "mb-4 flex-1",
        hasMoreSteps && "overflow-y-auto scrollbar-hide max-h-[500px]"
      )}>
        <div className="space-y-2">
          {displaySteps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex justify-center items-center rounded-full w-[25px] h-[25px] flex-shrink-0",
                  step.status === 'completed' && "bg-[#00296B]",
                  step.status !== 'completed' && "border-2 border-[#7D7D7D] bg-white"
                )}>
                  {step.status === 'completed' ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : null}
                </div>

                {index < displaySteps.length - 1 && (
                  <div className={cn(
                    "mt-2.5 w-px h-7",
                    step.status === 'completed' ? "bg-[#00296B]" : "bg-gray-200"
                  )} />
                )}
              </div>
              <div className="flex-1 pt-0.5">
                <p className={cn(
                  "font-medium text-sm",
                  step.status === 'completed' && "text-gray-900",
                  step.status !== 'completed' && "text-gray-500"
                )}>
                  {step.title}
                </p>
                {step.subtitle && (
                  <p className="mt-1 text-gray-500 text-xs">{step.subtitle}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAction && onAction && (
        <button
          onClick={onAction}
          className="flex justify-center items-center gap-2 bg-[#00296B] hover:bg-[#002561] px-4 py-2.5 rounded-lg w-full font-medium text-white transition-colors"
        >
          <Check className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}