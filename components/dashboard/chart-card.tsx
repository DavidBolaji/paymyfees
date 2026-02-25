'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartData {
  month: string;
  value: number;
}

interface ChartCardProps {
  title: string;
  subtitle: string;
  data: ChartData[];
  selectedYear?: string;
  years?: string[];
  onYearChange?: (year: string) => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  data,
  selectedYear = "2025",
  years = ["2023", "2024", "2025"],
  onYearChange,
  searchPlaceholder = "Search",
  onSearch,
  className
}: ChartCardProps) {
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleYearSelect = (year: string) => {
    onYearChange?.(year);
    setIsYearDropdownOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const isEmpty = data.length === 0 || data.every(d => d.value === 0);

  const defaultMonths = ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const emptyData = defaultMonths.map(month => ({ month, value: 0 }));
  
  const chartData = data.length > 0 ? data : emptyData;

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", className)}>
      {/* Header */}
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900 mb-1">{title}</h2>
            <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="block w-full sm:w-auto pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Year Selector */}
            <div className="relative">
              <button
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#002561] text-white rounded-lg text-sm font-medium hover:bg-[#00296B] transition-colors min-w-[72px] sm:min-w-[80px] justify-center"
              >
                {selectedYear}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isYearDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[80px]">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      className={cn(
                        "w-full px-4 py-2 text-sm text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors",
                        year === selectedYear && "bg-blue-50 text-[#002561] font-medium"
                      )}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 sm:px-6 pb-4 sm:pb-6">
        <div className="h-56 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                dy={10}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickFormatter={(value) => value.toLocaleString()}
                domain={[0, 'auto']}
                allowDataOverflow={false}
                width={45}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#002561" 
                strokeWidth={2}
                dot={false}
                activeDot={isEmpty ? false : { r: 6, stroke: '#002561', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
