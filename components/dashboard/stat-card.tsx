'use client';

import { ArrowUpRight } from 'lucide-react';
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
        "p-6 shadow-sm relative overflow-hidden h-[141px]",
        className
      )}
      style={{
        borderRadius: '1.25rem', // 20px
        background: isActive 
          ? 'linear-gradient(117.13deg, #002561 15.52%, #06409D 47.53%, #033876 75.66%, #000000 119.76%)'
          : '#E6EAF0'
      }}
    >
      {/* Arrow Icon */}
      <div className="absolute top-4 right-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          isActive ? "bg-white/20" : "bg-white"
        )}>
          <ArrowUpRight className={cn(
            "w-5 h-5",
            isActive ? "text-white" : "text-gray-600"
          )} />
        </div>
      </div>

      {/* Content */}
      <div className="pr-14">
        {/* Title */}
        <h3 className={cn(
          "text-base font-medium mb-4 text-nowrap",
          isActive ? "text-white" : "text-gray-700"
        )}>
          {title}
        </h3>

        {/* Value */}
        <div className={cn(
          "text-3xl font-bold mb-[1.125rem]",
          isActive ? "text-white" : "text-gray-900"
        )}>
          {value} 
          {subtitle && (
            <span className={cn(
              "text-xs ml-2",
              isActive ? "text-white/80" : "text-gray-600"
            )}>
              {subtitle}
            </span>
          )}
        </div>
        
        {/* Footer */}
        {footer && (
          <p className={cn(
            "text-[0.6875rem] absolute font-semibold left-6 right-6 text-nowrap",
            isActive ? "text-white/80" : "text-gray-600"
          )}>
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}