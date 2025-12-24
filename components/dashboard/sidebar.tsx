'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  GraduationCap, 
  CreditCard, 
  BarChart3, 
  HelpCircle, 
  Sun, 
  Moon, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from "@/assets/images/logo/logo.png";
import Image from 'next/image';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' }
    ]
  },
  {
    title: 'SCHOOL & FINANCING',
    items: [
      { icon: GraduationCap, label: 'School Verification', href: '/dashboard/school-verification' },
      { icon: CreditCard, label: 'Wallet', href: '/dashboard/wallet' }
    ]
  },
  {
    title: 'ANALYTICS & INSIGHTS',
    items: [
      { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' }
    ]
  },
  {
    title: 'SUPPORT',
    items: [
      { icon: HelpCircle, label: 'Help Center', href: '/dashboard/help' }
    ]
  }
];

export function Sidebar({ className }: SidebarProps) {
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  const toggleTheme = (dark: boolean) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={cn(
      "flex flex-col bg-white border-gray-200 border-r w-64 h-screen",
      className
    )}>
      {/* Logo */}
      <div className="p-6">
       <Image src={Logo} width={140} height={38} alt="Logo" />
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-6 px-4 py-6">
        {navigationGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            {group.title && (
              <h3 className="px-2 font-medium text-xs uppercase tracking-wider" style={{ color: 'rgba(125, 125, 125, 1)' }}>
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item, itemIndex) => {
                const isActive = item.href === '/dashboard' 
                  ? pathname === '/dashboard' || 
                    pathname.startsWith('/dashboard/loans') || 
                    pathname.startsWith('/dashboard/timeline') || 
                    pathname.startsWith('/dashboard/transactions') ||
                    pathname.startsWith('/dashboard/apply-loan') ||
                    pathname.startsWith('/dashboard/view-payment-plan')
                  : pathname === item.href;
                return (
                  <div key={itemIndex} className="group relative">
                    <Link
                      href={item.href || '#'}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-lg w-full font-medium text-sm transition-all duration-200",
                        isActive
                          ? "text-white"
                          : "text-gray-600 hover:text-white"
                      )}
                      style={isActive ? {
                        background: 'linear-gradient(180deg, #002561 0%, #00296B 57.69%, #000000 100%)',
                        borderTopLeftRadius: '0px',
                        borderBottomLeftRadius: '0px'
                      } : {}}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'linear-gradient(180deg, #002561 0%, #00296B 57.69%, #000000 100%)';
                          e.currentTarget.style.borderTopLeftRadius = '0px';
                          e.currentTarget.style.borderBottomLeftRadius = '0px';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = '';
                          e.currentTarget.style.borderTopLeftRadius = '';
                          e.currentTarget.style.borderBottomLeftRadius = '';
                        }
                      }}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </Link>
                    
                    {/* Left curved indicator - Active */}
                    {isActive && (
                      <>
                        {/* Top curve */}
                        <div 
                          className="-top-4 -left-3 absolute w-3 h-4"
                          style={{
                            background: 'radial-gradient(circle at bottom right, transparent 12px, white 12px)'
                          }}
                        />
                        {/* Bottom curve */}
                        <div 
                          className="-bottom-4 -left-3 absolute w-3 h-4"
                          style={{
                            background: 'radial-gradient(circle at top right, transparent 12px, white 12px)'
                          }}
                        />
                        {/* Left indicator bar */}
                        <div 
                          className="top-0 bottom-0 -left-3 absolute w-1"
                          style={{
                            background: 'linear-gradient(180deg, #002561 0%, #00296B 57.69%, #000000 100%)'
                          }}
                        />
                      </>
                    )}
                    
                    {/* Left curved indicator - Hover (only show when not active) */}
                    {!isActive && (
                      <>
                        {/* Top curve */}
                        <div 
                          className="-top-4 -left-3 absolute opacity-0 group-hover:opacity-100 w-3 h-4 transition-opacity duration-200"
                          style={{
                            background: 'radial-gradient(circle at bottom right, transparent 12px, white 12px)'
                          }}
                        />
                        {/* Bottom curve */}
                        <div 
                          className="-bottom-4 -left-3 absolute opacity-0 group-hover:opacity-100 w-3 h-4 transition-opacity duration-200"
                          style={{
                            background: 'radial-gradient(circle at top right, transparent 12px, white 12px)'
                          }}
                        />
                        {/* Left indicator bar */}
                        <div 
                          className="top-0 bottom-0 -left-3 absolute opacity-0 group-hover:opacity-100 w-1 transition-opacity duration-200"
                          style={{
                            background: 'linear-gradient(180deg, #002561 0%, #00296B 57.69%, #000000 100%)'
                          }}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Theme Switcher & Logout */}
      <div className="space-y-4 p-4 border-gray-200 border-t">
        {/* Theme Switcher */}
        <div className="px-2">
          <p className="mb-3 font-medium text-xs uppercase tracking-wider" style={{ color: 'rgba(125, 125, 125, 1)' }}>
            THEME
          </p>
          <div className="relative flex items-center bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => toggleTheme(false)}
              className={cn(
                "flex flex-1 justify-center items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200",
                !isDark 
                  ? "text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              )}
              style={!isDark ? {
                background: 'linear-gradient(180deg, #002561 0%, #00296B 57.69%, #000000 100%)'
              } : {}}
            >
              <Sun className="w-4 h-4" />
              Light
            </button>
            <button
              onClick={() => toggleTheme(true)}
              className={cn(
                "flex flex-1 justify-center items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200",
                isDark 
                  ? "text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              )}
              style={isDark ? {
                background: 'linear-gradient(180deg, #002561 0%, #00296B 57.69%, #000000 100%)'
              } : {}}
            >
              <Moon className="w-4 h-4" />
              Dark
            </button>
          </div>
        </div>
        
        {/* Logout Button */}
        <button 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full font-medium text-gray-600 hover:text-white text-sm transition-all duration-200"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(180deg, #002561 0%, #00296B 57.69%, #000000 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '';
          }}
        >
          <LogOut className="w-5 h-5" />
          <span className="flex-1 text-left">Log Out</span>
        </button>
      </div>
    </div>
  );
}