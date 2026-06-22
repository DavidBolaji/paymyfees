'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useAuthStore from '@/src/authStore';
import { Spinner } from '@/components/ui/spinner';

export default function GoogleCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      if (status === 'loading') return;

      // No session — something went wrong
      if (!session?.user?.id) {
        setError('Authentication failed. Please try again.');
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }

      const profileComplete = (session.user as any).profileComplete === true;

      if (!profileComplete) {
        // Phase 2 required — redirect to complete-profile
        router.push('/auth/google/complete-profile');
      } else {
        // Profile already complete (existing email user) — exchange session for custom JWT
        try {
          const response = await fetch('/api/auth/google/exchange-session', {
            method: 'GET',
          });

          if (!response.ok) {
            throw new Error('Failed to exchange session');
          }

          const data = await response.json();

          if (data.success) {
            // Store custom JWT in Zustand
            login(data.data.user, data.data.token, data.data.refreshToken);

            // Redirect based on role
            const role = data.data.user.role;
            if (role === 'ADMIN') {
              window.location.href = '/admin';
            } else if (role === 'SCHOOL_ADMIN') {
              window.location.href = '/school-admin';
            } else if (role === 'SCHOOL') {
              window.location.href = '/school-dashboard';
            } else if (role === 'TEACHER_ADMIN') {
              window.location.href = '/teacher-admin';
            } else {
              window.location.href = '/dashboard';
            }
          } else {
            throw new Error(data.error || 'Failed to exchange session');
          }
        } catch (err) {
          console.error('Session exchange error:', err);
          setError('Failed to complete sign-in. Please try again.');
          setTimeout(() => router.push('/auth/login'), 2000);
        }
      }
    };

    handleCallback();
  }, [session, status, router, login]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-600 text-center">{error}</div>
        <p className="text-sm text-gray-500">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Spinner />
      <p className="text-sm text-gray-500 mt-4">Completing sign-in...</p>
    </div>
  );
}
