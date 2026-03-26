"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type AnimateInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function AnimateIn({ children, delay = 0, className }: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.style.animationDelay = `${delay}ms`;
          el.classList.add("in-view");
          observer.disconnect();
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={cn("animate-in-view", className)}>
      {children}
    </div>
  );
}
