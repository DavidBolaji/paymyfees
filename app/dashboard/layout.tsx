'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import Authenticated from '@/providers/authenticated';
import useAuthStore from '@/src/authStore';

function SchoolRoleGuard({ children }: { children: React.ReactNode }) {
  const { user, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && user?.role === 'ADMIN') {
      router.replace('/admin/dashboard');
    } else if (hasHydrated && user?.role === 'SCHOOL') {
      router.replace('/school-dashboard');
    } else if (hasHydrated && user?.role === 'TEACHER') {
      router.replace('/teacher-dashboard');
    }
  }, [hasHydrated, user, router]);

  if (hasHydrated && (user?.role === 'SCHOOL' || user?.role === 'ADMIN' || user?.role === 'TEACHER')) {
    return null;
  }

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Authenticated>
      <SchoolRoleGuard>
        <div className="w-full bg-gray-50 flex justify-center">
          <div className="flex h-screen w-full">
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            
            <div className="flex-1 flex flex-col overflow-hidden w-full">
              <Header onMenuToggle={() => setSidebarOpen(true)} />
              
              <main className="flex-1 overflow-y-auto px-4 md:pl-[2.8125rem] md:pr-[2.3125rem] md:py-[2.3125rem]">
                {children}
              </main>
            </div>
          </div>
        </div>
      </SchoolRoleGuard>
    </Authenticated>
  );
}
