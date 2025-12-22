'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface NavigationProviderProps {
  children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let completeTimeout: NodeJS.Timeout;

    const handleRouteChangeStart = () => {
      setIsLoading(true);
      setProgress(10);
      
      // Simulate realistic loading progress
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          // Slower progress as it gets higher
          const increment = prev < 30 ? 15 : prev < 60 ? 10 : 5;
          return Math.min(prev + increment + Math.random() * 5, 85);
        });
      }, 150);
    };

    const handleRouteChangeComplete = () => {
      setProgress(100);
      completeTimeout = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    };

    // Trigger loading on route change
    handleRouteChangeStart();
    
    // Complete after a brief delay to show the loading state
    const timer = setTimeout(handleRouteChangeComplete, 400);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [pathname, searchParams]);

  return (
    <>
      {/* Navigation Progress Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-[#002561] via-[#00296B] to-[#F4B400] transition-all duration-300 ease-out shadow-lg"
            style={{
              width: `${progress}%`,
              boxShadow: '0 0 8px rgba(0, 37, 97, 0.4), 0 0 4px rgba(244, 180, 0, 0.3)',
            }}
          />
        </div>
      )}
      {children}
    </>
  );
}