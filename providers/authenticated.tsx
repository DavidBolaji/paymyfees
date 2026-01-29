'use client';

import useAuthStore from '@/src/authStore';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';


export default function Authenticated({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/auth/login")
        }
    }, [])


    return <>{children}</>;
}
