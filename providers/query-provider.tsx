'use client';

import useAuthStore from '@/src/authStore';
import { ReactNode } from 'react';


export default function AuthGate({ children }: { children: ReactNode }) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return null;
  }

  return <>{children}</>;
}
