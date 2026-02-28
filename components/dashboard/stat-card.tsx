'use client';

import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  footer?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  trend?: 'up' | 'down';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  footer,
  variant = 'default', 
  className 
}: StatCardProps) {
  const isActive = variant === 'primary';

  return (
    <div 
      className={cn(
        "py-4 px-[15px] sm:py-5 sm:px-5 md:py-4 md:px-4 shadow-sm rounded-[20px] relative overflow-hidden h-[102px] sm:h-[120px] md:h-[128px] flex flex-col gap-[9px] sm:gap-2.5 md:gap-2.5",
        className
      )}
      style={{
        // 20px
        background: isActive 
          ? 'linear-gradient(117.13deg, #002561 15.52%, #06409D 47.53%, #033876 75.66%, #000000 119.76%)'
          : '#E6EAF0'
      }}
    >
      {/* Arrow Icon */}
      {/* <div className="absolute top-4 right-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          isActive ? "bg-white/20" : "bg-white"
        )}>
          <ArrowUpRight className={cn(
            "w-5 h-5",
            isActive ? "text-white" : "text-gray-600"
          )} />
        </div>
      </div> */}

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Title */}
        <h3 className={cn(
          "text-[11px] sm:text-[12px] md:text-sm font-semibold leading-[120%] text-nowrap mb-[9px] sm:mb-2 md:mb-2",
          isActive ? "text-white" : "text-gray-700"
        )}>
          {title}
        </h3>

        {/* Value */}
        <div className={cn(
          "text-[22px] sm:text-2xl md:text-3xl font-semibold leading-[120%]",
          isActive ? "text-white" : "text-gray-900"
        )}>
          {value} 
          {subtitle && (
            <span className={cn(
              "text-[10px] sm:text-xs ml-1 sm:ml-2",
              isActive ? "text-white/80" : "text-gray-600"
            )}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
        
        {/* Footer */}
        {footer && (
          <p className={cn(
            "text-[9px] sm:text-[10px] md:text-[0.6875rem] font-semibold leading-[120%] text-nowrap",
            isActive ? "text-white/80" : "text-gray-600"
          )}>
            {footer}
          </p>
        )}
    </div>
  );
}