'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, CreditCard, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FundingChartSkeleton } from './funding-chart-skeleton';
import useWalletStore, { ChartData } from '@/src/stores/walletStore';

interface FundingChartProps {
  data: ChartData[];
  isLoading: boolean;
  className?: string;
}

export function FundingChart({ data, isLoading, className }: FundingChartProps) {
  const [period, setPeriod] = useState('6 months');
  const [source, ] = useState('All Sources');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; type: 'funding' | 'repayment' } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Get the fetchChartData function from the wallet store
  const fetchChartData = useWalletStore(state => state.fetchChartData);
  
  // Ref for dropdown to handle click outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle period change
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    setIsDropdownOpen(false);
    
    // Map UI period to API period format
    const periodMap: Record<string, string> = {
      '3 months': '3months',
      '6 months': '6months',
      '1 year': '12months',
    };
    
    // Fetch new chart data
    fetchChartData(periodMap[newPeriod] || '6months');
  };
  
  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  if (isLoading) {
    return <FundingChartSkeleton className={className} />;
  }
  
  // Check if data is empty or all values are zero
  const isEmpty = data.length === 0 || data.every(item => item.fundings === 0 && item.repayments === 0);
  
  // Calculate totals
  const totalFundings = data.reduce((sum, item) => sum + item.fundings, 0);
  const totalRepayments = data.reduce((sum, item) => sum + item.repayments, 0);
  
  // Find max value for chart scaling
  const maxValue = isEmpty ? 200000 : Math.max(
    ...data.map(item => Math.max(item.fundings, item.repayments)),
    1
  );
  
  // Calculate chart point positions
  const getYPosition = (value: number, chartHeight: number = 200) => {
    if (isEmpty || value === 0) return chartHeight; // Place at bottom for empty state or zero values
    return chartHeight - (value / maxValue) * chartHeight;
  };
  
  // Generate months for empty state
  const emptyMonths = ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July'];
  const displayData = isEmpty ? emptyMonths.map(month => ({ month, fundings: 0, repayments: 0 })) : data;
  
  // Generate line path
  const generatePath = (dataPoints: number[], chartWidth: number, chartHeight: number) => {
    const leftMargin = 0;
    const rightMargin = 0;
    const effectiveWidth = chartWidth - leftMargin - rightMargin;
    const segmentWidth = effectiveWidth / (dataPoints.length - 1 || 1);
    
    return dataPoints.map((value, index) => {
      const x = leftMargin + (index * segmentWidth);
      const y = getYPosition(value, chartHeight);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };
  
  return (
    <div className={cn("rounded-xl border border-gray-200 p-6 bg-white", className)}>
      {/* Header with filters */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Funding vs Repayment Chart</h2>
        <div className="flex gap-2">
          {/* Period selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>Last {period}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <ul className="py-1">
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handlePeriodChange('3 months')}
                    >
                      Last 3 months
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handlePeriodChange('6 months')}
                    >
                      Last 6 months
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handlePeriodChange('1 year')}
                    >
                      Last 1 year
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Source selector */}
          <div className="relative">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              <span>{source}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary boxes */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Funding</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">₦{totalFundings.toLocaleString()}</div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Send className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-sm text-gray-600">Repayment</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">₦{totalRepayments.toLocaleString()}</div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-[340px] relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-12 w-16 flex flex-col justify-between text-xs text-gray-500">
          <div className="text-right pr-2">₦{maxValue.toLocaleString()}</div>
          <div className="text-right pr-2">₦{Math.round(maxValue * 0.75).toLocaleString()}</div>
          <div className="text-right pr-2">₦{Math.round(maxValue * 0.5).toLocaleString()}</div>
          <div className="text-right pr-2">₦{Math.round(maxValue * 0.25).toLocaleString()}</div>
          <div className="text-right pr-2">₦0</div>
        </div>
        
        {/* Chart area */}
        <div className="absolute left-16 right-0 top-0 bottom-12">
          {/* Chart grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-b border-gray-200 border-dotted w-full"></div>
            ))}
          </div>
          
          {/* Chart lines and points */}
          <div className="absolute inset-0">
            <svg width="100%" height="100%" className="overflow-visible">
              {/* Define clip path to prevent overflow */}
              <defs>
                <clipPath id="chart-clip">
                  <rect x="0" y="0" width="100%" height="100%" />
                </clipPath>
              </defs>
              
              <g clipPath="url(#chart-clip)">
                {/* Fundings line */}
                {totalFundings > 0 ? (
                  <path
                    d={generatePath(
                      displayData.map(d => d.fundings),
                      1000, // Will be scaled by viewBox
                      200
                    )}
                    fill="none"
                    stroke="#00296B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d={`M 0 200 L ${1000} 200`}
                    fill="none"
                    stroke="#00296B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="5,5"
                  />
                )}
                
                {/* Repayments line */}
                {totalRepayments > 0 ? (
                  <path
                    d={generatePath(
                      displayData.map(d => d.repayments),
                      1000,
                      200
                    )}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d={`M 0 200 L ${1000} 200`}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="5,5"
                  />
                )}
                
                {/* Data points - only show when not empty */}
                {!isEmpty && displayData.map((item, index) => {
                  const leftMargin = 0;
                  const segmentWidth = 1000 / (displayData.length - 1 || 1);
                  const x = leftMargin + (index * segmentWidth);
                  
                  return (
                    <g key={index}>
                      {/* Funding point - only show if value is not zero */}
                      {item.fundings > 0 && (
                        <circle
                          cx={x}
                          cy={getYPosition(item.fundings, 200)}
                          r="4"
                          fill="#00296B"
                          className="cursor-pointer hover:r-6 transition-all"
                          onMouseEnter={() => setHoveredPoint({ index, type: 'funding' })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      )}
                      
                      {/* Repayment point - only show if value is not zero */}
                      {item.repayments > 0 && (
                        <circle
                          cx={x}
                          cy={getYPosition(item.repayments, 200)}
                          r="4"
                          fill="#F59E0B"
                          className="cursor-pointer hover:r-6 transition-all"
                          onMouseEnter={() => setHoveredPoint({ index, type: 'repayment' })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
              
              {/* Set viewBox to scale properly */}
              <svg viewBox="0 0 1000 200" preserveAspectRatio="none" width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                {/* This ensures proper scaling */}
              </svg>
            </svg>
            
            {/* Tooltip */}
            {hoveredPoint !== null && !isEmpty && (
              <div
                className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs pointer-events-none z-10"
                style={{
                  left: `${(hoveredPoint.index / (displayData.length - 1 || 1)) * 100}%`,
                  top: `${(getYPosition(
                    hoveredPoint.type === 'funding' 
                    //@ts-ignore
                    ? displayData[hoveredPoint.index].fundings 
                    //@ts-ignore
                      : displayData[hoveredPoint.index].repayments,
                    200
                  ) / 200) * 100}%`,
                  transform: 'translate(-50%, -120%)'
                }}
              >
                <div className="font-medium mb-1">
                  {hoveredPoint.type === 'funding' ? 'Funding' : 'Repayment'}
                </div>
                <div className="text-gray-300 mb-1">
                  {/* @ts-ignore */}
                  Wed, {displayData[hoveredPoint.index].month}
                </div>
                <div className="font-bold text-amber-400">
                  ₦{(hoveredPoint.type === 'funding' 
                  //@ts-ignore
                    ? displayData[hoveredPoint.index].fundings 
                    //@ts-ignore
                    : displayData[hoveredPoint.index].repayments
                  ).toLocaleString()}
                </div>
                {/* Tooltip arrow */}
                <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute left-16 right-0 bottom-0 flex justify-between text-xs text-gray-500 px-1">
          {displayData.map((item, index) => (
            <div key={index} className="text-center" style={{ width: '40px' }}>
              {item.month}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-amber-500 rounded-sm"></div>
          <span className="text-sm text-gray-600">Repayments</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-blue-900 rounded-sm"></div>
          <span className="text-sm text-gray-600">Fundings</span>
        </div>
      </div>
    </div>
  );
}