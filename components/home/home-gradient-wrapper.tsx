import type { ReactNode } from "react";
import blurFeatureBg from "@/assets/home/assets/bg-blur-feature.jpg";
import gridFeatureBg from "@/assets/home/assets/bg-grid-feature.jpg";
import { cn } from "@/lib/utils";

type HomeGradientWrapperProps = {
  children: ReactNode;
  className?: string;
};

export function HomeGradientWrapper({ children, className }: HomeGradientWrapperProps) {
  return (
    <section className={cn("relative w-full overflow-hidden", className)}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${gridFeatureBg.src})`,
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
          backgroundSize: "1300px 1300px",
          opacity: 0.35,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${blurFeatureBg.src})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          opacity: 0.45,
        }}
      />
       <div
        aria-hidden
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: "linear-gradient(22.7deg, #191919 0%, #002561 68.94%)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      />
      
      <div className="relative z-10">{children}</div>
    </section>
  );
}
