'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface TimelineChartProps {
  completedPercentage: number;
  pendingPercentage: number;
  className?: string;
}

export function TimelineChart({ 
  completedPercentage, 
  pendingPercentage,
  className 
}: TimelineChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('Last Month');

  const data = [
    { name: 'Completed Repayment', value: completedPercentage, color: '#D4A017' },
    { name: 'Pending Repayment', value: pendingPercentage, color: '#002855' },
  ];

  // Custom label component to show percentage in the chart
  const renderCustomLabel = (entry: any) => {
    return `${entry.value}%`;
  };

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-200 p-4 sm:p-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-base sm:text-xl font-semibold text-[#191919]">Timeline Charts</h3>
        
        {/* Period Selector */}
        <div className="relative">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 font-medium cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Last Week">Last Week</option>
            <option value="Last Month">Last Month</option>
            <option value="Last 3 Months">Last 3 Months</option>
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="Last Year">Last Year</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-[280px] sm:max-w-[320px] h-[240px] sm:h-[320px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="85%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={0}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="none"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 mt-6 w-full max-w-[280px]">
          {/* Completed Repayment */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-[#D4A017] flex-shrink-0" />
            <span className="text-sm text-gray-700 font-medium">Completed Repayment</span>
          </div>

          {/* Pending Repayment */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-[#002855] flex-shrink-0" />
            <span className="text-sm text-gray-700 font-medium">Pending Repayment</span>
          </div>
        </div>
      </div>
    </div>
  );
}