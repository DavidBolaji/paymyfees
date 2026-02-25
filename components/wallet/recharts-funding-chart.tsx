'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, CreditCard, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FundingChartSkeleton } from './funding-chart-skeleton';
import useWalletStore, { ChartData } from '@/src/stores/walletStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface FundingChartProps {
  data: ChartData[];
  isLoading: boolean;
  className?: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataType = payload[0].dataKey === 'fundings' ? 'Funding' : 'Repayment';
    const color = payload[0].dataKey === 'fundings' ? '#00296B' : '#F59E0B';
    
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
        <div className="font-medium mb-1">{dataType}</div>
        <div className="text-gray-300 mb-1">Wed, {label}</div>
        <div className="font-bold" style={{ color }}>
          ₦{payload[0].value?.toLocaleString()}
        </div>
      </div>
    );
  }

  return null;
};

export function RechartsFundingChart({ data, isLoading, className }: FundingChartProps) {
  const [period, setPeriod] = useState('6 months');
  const [source,] = useState('All Sources');
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
  
  // If data is empty, create empty chart data
  const emptyMonths = ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July'];
  const displayData = isEmpty ? emptyMonths.map(month => ({ month, fundings: 0, repayments: 0 })) : data;
  
  // Format numbers for display
  const formatCurrency = (value: number) => `₦${value.toLocaleString()}`;
  
  return (
    <div className={cn("rounded-xl border border-gray-200 p-4 sm:p-6 bg-white", className)}>
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Funding vs Repayment Chart</h2>
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <span className="text-xs sm:text-sm text-gray-600">Funding</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 truncate">₦{totalFundings.toLocaleString()}</div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Send className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </div>
            <span className="text-xs sm:text-sm text-gray-600">Repayment</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 truncate">₦{totalRepayments.toLocaleString()}</div>
        </div>
      </div>
      
      {/* Recharts Chart */}
      <div className="h-[240px] sm:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={displayData}
            margin={{ top: 10, right: 5, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              dy={10}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickFormatter={formatCurrency}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            {totalFundings > 0 ? (
              <Line
                type="linear"
                dataKey="fundings"
                stroke="#00296B"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#00296B" }}
                activeDot={{ r: 6 }}
                name="Fundings"
                connectNulls={true}
              />
            ) : (
              <Line
                dataKey={() => 0}
                stroke="#00296B"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={false}
                name="Fundings"
              />
            )}
            {totalRepayments > 0 ? (
              <Line
                type="linear"
                dataKey="repayments"
                stroke="#F59E0B"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#F59E0B" }}
                activeDot={{ r: 6 }}
                name="Repayments"
                connectNulls={true}
              />
            ) : (
              <Line
                dataKey={() => 0}
                stroke="#F59E0B"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={false}
                name="Repayments"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
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