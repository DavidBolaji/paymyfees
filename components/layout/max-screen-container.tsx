import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MaxScreenContainerProps = {
  children: ReactNode;
  className?: string;
};

export function MaxScreenContainer({ children, className }: MaxScreenContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] overflow-x-hidden", className)}>
      {children}
    </div>
  );
}
