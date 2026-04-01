'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SchoolSidebar } from '@/components/dashboard/school-sidebar';
import { Header } from '@/components/dashboard/header';
import Authenticated from '@/providers/authenticated';
import useAuthStore from '@/src/authStore';

function SchoolOnlyGuard({ children }: { children: React.ReactNode }) {
  const { user, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && user?.role === 'ADMIN') {
      router.replace('/admin/dashboard');
    }
  }, [hasHydrated, user, router]);

  if (hasHydrated && user?.role === 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}

export default function SchoolDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Authenticated>
      <SchoolOnlyGuard>
        <div className="w-full bg-gray-50 flex justify-center">
          <div className="flex h-screen w-full">
            <SchoolSidebar
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
      </SchoolOnlyGuard>
    </Authenticated>
  );
}
