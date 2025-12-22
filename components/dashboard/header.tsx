'use client';

import { Search, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <div className={cn(
      "bg-white border-b border-[#ececec] h-[80px] flex items-center justify-end px-6",
      className
    )}>
      {/* Right Section */}
      <div className="flex gap-[16px] items-center">
        {/* Search */}
        <div className="flex items-center justify-center">
          <div className="border border-[#a1a1a1] border-solid flex gap-[8px] items-center pl-[16px] pr-[60px] py-[8px] rounded-[8px] w-[380px]">
            <div className="size-[24px]">
              <Search className="w-6 h-6 text-[#7d7d7d]" />
            </div>
            <input
              type="text"
              placeholder="Search anything..."
              className="font-['Manrope:Medium',sans-serif] font-medium leading-[1.2] text-[14px] text-[#7d7d7d] bg-transparent border-none outline-none placeholder:text-[#7d7d7d] flex-1"
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex gap-[7px] items-center">
          {/* Notifications */}
          <div className="size-[40px] relative">
            <Bell className="w-6 h-6 text-[#7d7d7d] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-[#00296B] rounded-full"></div>
          </div>

          {/* User Avatar */}
          <div className="size-[40px] bg-[#7d7d7d] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
        </div>
      </div>
    </div>
  );
}