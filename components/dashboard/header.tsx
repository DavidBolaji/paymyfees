'use client';

import { Search, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Logo from "@/assets/images/logo/logo.png";
import { MenuIcon } from '@/assets/icons/MenuIcon';
import useAuthStore from '@/src/authStore';

interface HeaderProps {
  className?: string;
  onMenuToggle?: () => void;
}

export function Header({ className, onMenuToggle }: HeaderProps) {
  const { user } = useAuthStore();

  const getInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn(
      "bg-white border-b border-[#ececec] h-[60px] md:h-[80px] flex items-center justify-between px-4 md:px-6 relative z-[51]",
      className
    )}>
      {/* Mobile logo */}
      <div className="md:hidden flex-1">
        <Image src={Logo} width={140} height={35} alt="PayMyFees Logo" />
      </div>

      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        <MenuIcon size={24} color="#141B34" strokeWidth={2} />
      </button>

      {/* Right Section - Desktop only */}
      <div className="hidden md:flex gap-[16px] items-center ml-auto">
        {/* Search */}
        <div className="flex items-center justify-center">
          <div className="border border-[#a1a1a1] border-solid flex gap-[8px] items-center pl-[16px] pr-[60px] py-[8px] rounded-[8px] w-[240px] md:w-[380px]">
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
          <div className="size-[40px] rounded-full overflow-hidden bg-gradient-to-br from-[#00296B] to-[#003D82] flex items-center justify-center">
            {user?.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user.fullName || 'User'}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-bold">{getInitials()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
