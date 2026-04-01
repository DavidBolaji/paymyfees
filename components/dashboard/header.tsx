'use client';

import { Search, Bell, ChevronRight, CreditCard, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Logo from "@/assets/images/logo/logo.png";
import { MenuIcon } from '@/assets/icons/MenuIcon';
import useAuthStore from '@/src/authStore';
import useDashboardStore from '@/src/stores/dashboardStore';
import { useRef, useState, useEffect } from 'react';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { NotificationsPanel } from '@/components/dashboard/notifications-panel';

interface HeaderProps {
  className?: string;
  onMenuToggle?: () => void;
}

export function Header({ className, onMenuToggle }: HeaderProps) {
  const { user } = useAuthStore();
  const { stats, selectedLoanId, setSelectedLoanId } = useDashboardStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const getInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const allLoans = stats?.allLoans ?? [];
  const activeLoan = allLoans.find(l => l.id === selectedLoanId) ?? allLoans[0] ?? null;

  // Sync selectedLoanId to the first loan if not yet set or stale
  useEffect(() => {
    if (allLoans.length > 0 && (!selectedLoanId || !allLoans.find(l => l.id === selectedLoanId))) {
      setSelectedLoanId(allLoans[0]!.id);
    }
  }, [allLoans, selectedLoanId, setSelectedLoanId]);

  // Fetch unread notification count on mount so the badge shows without opening the panel
  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then((d: any) => {
        if (d.success && Array.isArray(d.data)) {
          setUnreadCount(d.data.filter((n: any) => !n.isRead).length);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className={cn(
      "bg-white border-b border-[#ececec] h-[60px] md:h-[80px] flex items-center justify-between px-4 md:px-6 relative z-[51]",
      className
    )}>
      {/* Mobile logo */}
      <div className="md:hidden flex-1">
        <Image src={Logo} width={140} height={35} alt="PayMyFees Logo" />
      </div>

      {/* Notifications + Loan Dropdown — visible on both mobile and desktop */}
      <div className="flex gap-[7px] items-center md:ml-auto">
        {/* Search — desktop only */}
        <div className="hidden md:flex items-center justify-center mr-2">
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

        {/* Notifications */}
        <div className="size-[40px] relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="size-[40px] flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6 text-[#7d7d7d]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#00296B] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationsPanel
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            onUnreadCountChange={setUnreadCount}
          />
        </div>

        {/* User Avatar + Loan Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="size-[40px] rounded-full overflow-hidden bg-gradient-to-br from-[#00296B] to-[#003D82] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00296B] focus:ring-offset-2"
          >
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
          </button>

            {/* Loan Notification Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-[52px] w-[340px] bg-white rounded-2xl shadow-2xl border border-[#F2F2F2] z-[200] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2F2F2]">
                  <div>
                    <p className="text-[0.875rem] font-bold text-[#191919]">My Loan Applications</p>
                    <p className="text-[0.7rem] text-[#7C7C7C] mt-0.5">{allLoans.length} loan{allLoans.length !== 1 ? 's' : ''} found</p>
                  </div>
                  <button onClick={() => setDropdownOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-[#7C7C7C]" />
                  </button>
                </div>

                {/* Loan List */}
                <div className="max-h-[360px] overflow-y-auto">
                  {allLoans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                      <CreditCard className="w-10 h-10 text-[#d1d1d1] mb-3" />
                      <p className="text-[0.8rem] font-semibold text-[#292929]">No loans yet</p>
                      <p className="text-[0.72rem] text-[#7C7C7C] mt-1">Your loan applications will appear here.</p>
                    </div>
                  ) : (
                    allLoans.map((loan) => {
                      const isActive = (selectedLoanId ?? activeLoan?.id) === loan.id;
                      return (
                        <button
                          key={loan.id}
                          onClick={() => { setSelectedLoanId(loan.id); setDropdownOpen(false); }}
                          className={cn(
                            "w-full flex items-center gap-3 px-5 py-4 border-b border-[#F8F8F8] transition-colors hover:bg-[#F8FAFF] text-left",
                            isActive && "bg-[#EEF3FF]"
                          )}
                        >
                          {/* Icon */}
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                            isActive ? "bg-[#00296B]" : "bg-[#F2F2F2]"
                          )}>
                            <CreditCard className={cn("w-4 h-4", isActive ? "text-white" : "text-[#7C7C7C]")} />
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.78rem] font-semibold text-[#191919] truncate">{loan.schoolName}</p>
                            <p className="text-[0.68rem] text-[#7C7C7C] mt-0.5">
                              {loan.loanNumber} · ₦{Number(loan.loanAmount).toLocaleString()}
                            </p>
                            <p className="text-[0.65rem] text-[#7C7C7C] mt-0.5">
                              {new Date(loan.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          {/* Status + active indicator */}
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <StatusBadge status={loan.status} />
                            {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#00296B]" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {allLoans.length > 0 && (
                  <div className="px-5 py-3 bg-[#F8F8F8] border-t border-[#F2F2F2]">
                    <p className="text-[0.68rem] text-[#7C7C7C] text-center">
                      {activeLoan ? <>Viewing: <span className="font-semibold text-[#00296B]">{activeLoan.loanNumber}</span></> : 'Select a loan to view its dashboard'}
                    </p>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        <MenuIcon size={24} color="#141B34" strokeWidth={2} />
      </button>
    </div>
  );
}
