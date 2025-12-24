'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStep {
  id: string;
  title: string;
  status: 'completed' | 'upcoming';
  date?: string;
}

interface DeadlineGuidelineProps {
  title: string;
  steps: TimelineStep[];
  className?: string;
}

export function DeadlineGuideline({
  title,
  steps,
  className
}: DeadlineGuidelineProps) {
  return (
    <div className={cn("bg-white p-6 rounded-xl", className)}>
      <h2 className="mb-6 font-semibold text-[#5F5F5F] text-[1.125rem]">
        {title}
      </h2>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            {/* Step Indicator */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex justify-center items-center rounded-full w-[30px] h-[30px]",
                step.status === 'completed' 
                  ? "bg-[#00296B]" 
                  : "border-2 border-[#D1D1D1] bg-white"
              )}>
                {step.status === 'completed' ? (
                  <Check className="w-4 h-4 text-white" />
                ) : null}
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="bg-[#E5E5E5] mt-2 w-px h-8" />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 pt-1">
              <p className={cn(
                "font-medium text-[1rem]",
                step.status === 'completed' 
                  ? "text-[#292D32]" 
                  : "text-[#7C7C7C]"
              )}>
                {step.title}
              </p>
              {step.date && (
                <p className="mt-1 text-[#7C7C7C] text-[0.875rem]">
                  {step.date}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}