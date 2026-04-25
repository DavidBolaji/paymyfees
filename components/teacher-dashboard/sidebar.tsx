'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  BarChart3,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/assets/images/logo/logo.png';
import Image from 'next/image';
import useAuthStore from '@/src/authStore';
import { api } from '@/src/lib/api';
import { UserCircleIcon } from '@/assets/icons/UserCircleIcon';

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationGroups = [
  {
    title: 'Overview',
    items: [{ icon: LayoutDashboard, label: 'Dashboard', href: '/teacher-dashboard' }],
  },
  {
    title: 'FINANCING',
    items: [
      { icon: GraduationCap, label: 'Apply for Loan', href: '/teacher-dashboard/apply-loan' },
      { icon: CreditCard, label: 'Wallet', href: '/teacher-dashboard/wallet' },
    ],
  },
  {
    title: 'ANALYTICS & INSIGHTS',
    items: [{ icon: BarChart3, label: 'Analytics', href: '/teacher-dashboard/analytics' }],
  },
  {
    title: 'SUPPORT',
    items: [{ icon: HelpCircle, label: 'Help Center', href: '/teacher-dashboard/help' }],
  },
  {
    items: [{ icon: UserCircleIcon, label: 'Profile', href: '/teacher-dashboard/profile' }],
  },
];

export function Sidebar({ className, isOpen = false, onClose }: SidebarProps) {
  const { logout } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    if (onClose) onClose();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      logout();
      localStorage.clear();
      sessionStorage.clear();
      api.post('/api/auth/logout').catch(() => {});
      window.location.replace('/auth/login');
    } catch {
      window.location.replace('/auth/login');
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-100">
          <Link href="/teacher-dashboard">
            <Image src={Logo} alt="PayMyFees" width={120} height={32} />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navigationGroups.map((group, gi) => (
            <div key={gi} className="mb-4">
              {group.title && (
                <p className="text-[0.65rem] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = item.href
                  ? item.href === '/teacher-dashboard'
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                  : false;
                return (
                  <Link
                    key={item.label}
                    href={item.href ?? '#'}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5',
                      isActive
                        ? 'bg-[#00296B] text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
