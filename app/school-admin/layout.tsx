'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import Authenticated from '@/providers/authenticated';
import useAuthStore from '@/src/authStore';

function SchoolAdminGuard({ children }: { children: React.ReactNode }) {
  const { user, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && user && user.role !== 'SCHOOL_ADMIN') {
      router.replace('/dashboard');
    }
  }, [hasHydrated, user, router]);

  if (hasHydrated && user && user.role !== 'SCHOOL_ADMIN') {
    return null;
  }

  return <>{children}</>;
}

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Authenticated>
      <SchoolAdminGuard>
        <div className="flex h-screen bg-gray-50">
          <Sidebar
            isSchoolAdmin={true}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="flex-1 flex flex-col overflow-hidden w-full">
            <Header onMenuToggle={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </SchoolAdminGuard>
    </Authenticated>
  );
}
