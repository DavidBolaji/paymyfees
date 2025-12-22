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
      "w-64 bg-white border-r border-gray-200 flex flex-col h-screen",
      className
    )}>
      {/* Logo */}
      <div className="p-6">
       <Image src={Logo} width={140} height={38} alt="Logo" />
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-6">
        {navigationGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            {group.title && (
              <h3 className="text-xs font-medium uppercase tracking-wider px-2" style={{ color: 'rgba(125, 125, 125, 1)' }}>
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item, itemIndex) => {
                const isActive = pathname === item.href;
                return (
                  <div key={itemIndex} className="relative group">
                    <Link
                      href={item.href || '#'}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
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
                          className="absolute -left-3 -top-4 w-3 h-4"
                          style={{
                            background: 'radial-gradient(circle at bottom right, transparent 12px, white 12px)'
                          }}
                        />
                        {/* Bottom curve */}
                        <div 
                          className="absolute -left-3 -bottom-4 w-3 h-4"
                          style={{
                            background: 'radial-gradient(circle at top right, transparent 12px, white 12px)'
                          }}
                        />
                        {/* Left indicator bar */}
                        <div 
                          className="absolute -left-3 top-0 bottom-0 w-1"
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
                          className="absolute -left-3 -top-4 w-3 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{
                            background: 'radial-gradient(circle at bottom right, transparent 12px, white 12px)'
                          }}
                        />
                        {/* Bottom curve */}
                        <div 
                          className="absolute -left-3 -bottom-4 w-3 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{
                            background: 'radial-gradient(circle at top right, transparent 12px, white 12px)'
                          }}
                        />
                        {/* Left indicator bar */}
                        <div 
                          className="absolute -left-3 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
      <div className="p-4 border-t border-gray-200 space-y-4">
        {/* Theme Switcher */}
        <div className="px-2">
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'rgba(125, 125, 125, 1)' }}>
            THEME
          </p>
          <div className="relative bg-gray-100 rounded-full p-1 flex items-center">
            <button
              onClick={() => toggleTheme(false)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
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
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
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
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-white transition-all duration-200"
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