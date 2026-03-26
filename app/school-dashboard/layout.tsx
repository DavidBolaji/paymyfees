'use client';

import { useState } from 'react';
import { SchoolSidebar } from '@/components/dashboard/school-sidebar';
import { Header } from '@/components/dashboard/header';
import Authenticated from '@/providers/authenticated';

export default function SchoolDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Authenticated>
      <div className="w-full bg-gray-50 flex justify-center">
        <div className="flex h-screen w-full max-w-[1512px]">
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
    </Authenticated>
  );
}
