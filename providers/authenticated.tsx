'use client';

import useAuthStore from '@/src/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';


export default function Authenticated({ children }: { children: ReactNode }) {
    const { isAuthenticated, hasHydrated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Wait for hydration before doing anything
        if (!hasHydrated) {
            return;
        }

        if (!isAuthenticated) {
            // Prevent redirect loops
            if (!pathname.startsWith('/auth')) {
                router.replace("/auth/login");
            }
        } else {
            setShouldRender(true);
        }
    }, [isAuthenticated, hasHydrated, pathname, router]);

    // Don't render anything until hydrated and authenticated
    if (!hasHydrated || !isAuthenticated || !shouldRender) {
        return null;
    }

    return <>{children}</>;
}
