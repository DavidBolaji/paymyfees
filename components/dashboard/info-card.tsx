'use client';

import { cn } from '@/lib/utils';

interface InfoItem {
  label: string;
  value: string | React.ReactNode;
}

interface InfoCardProps {
  title: string;
  items: InfoItem[];
  className?: string;
  topContent?: React.ReactNode; // 👈 NEW (for progress bar)
  children?: React.ReactNode;
}

export function InfoCard({
  title,
  items,
  className,
  topContent,
  children,
}: InfoCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col bg-white px-4 pt-6 pb-6 rounded-xl h-full',
        className
      )}
    >
      {/* Title */}
      <h2 className="mb-4 font-semibold text-[#5F5F5F] text-[1.125rem] leading-[1.2]">
        {title}
      </h2>

      {/* Top content (e.g. progress bar) */}
      {topContent && <div className="mb-6">{topContent}</div>}

      {/* Main content */}
      <div className="flex-1 space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="font-medium text-[#7C7C7C] text-[1rem]">
              {item.label}:
            </span>
            <span className="font-medium text-[#7D7D7D] text-[1rem]">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom content */}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
