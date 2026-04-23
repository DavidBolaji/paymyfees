"use client";
import { ArrowRight } from "lucide-react";
import { HomeGradientWrapper } from "./home-gradient-wrapper";
import { useRouter } from "next/navigation";

export function HomeCtaSection() {
  return (
    <section id="cta" className="bg-white px-6 py-[4.375rem] md:px-10 xl:px-[11.25rem]">
      <div className="mx-auto max-w-[1512px]">
        <HomeGradientWrapper className="rounded-[1.5rem]">
          <div className="px-6 py-[4.5rem] text-center md:px-16 md:py-[5.5rem]">
          <h2
            className="mx-auto max-w-[640px] text-[1.5rem] font-extrabold leading-[1.1] tracking-[0] text-white md:text-[2.125rem] xl:text-[3rem]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Flexible Tuition Solutions for Every Education Need
          </h2>

          <p
            className="mx-auto mt-5 max-w-[780px] text-[0.9375rem] font-medium leading-[1.55] tracking-[0] text-[#B8C8E0] md:text-[1.0625rem]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Whether you&apos;re a parent managing school fees, a school improving payment
            collections, or a student needing financial support. PayMyFees has a solution designed
            for you.
          </p>

          <div className="mt-10 flex justify-center">
            <button
              className="flex items-center justify-center w-64 gap-[0.625rem] rounded-[0.75rem] px-[1.375rem] py-[0.75rem] text-[0.9375rem] bg-[#8A9DBB] font-bold leading-[1.2] tracking-[0] text-[#00173B] transition-opacity hover:opacity-90"
              style={{
                fontFamily: "Manrope, sans-serif",
                border: "1px solid rgba(255,255,255,0.18)",
                // backdropFilter: "blur(6px)",
              }}
              onClick={() => {
                const router = useRouter()
                router.push("/auth/register");
              }}
            >
              Get Started
              <span className="flex items-center justify-center rounded-full w-6 h-6 border border-[#00173B]">
                <ArrowRight size={13} strokeWidth={2.2} />
              </span>
            </button>
          </div>
          </div>
        </HomeGradientWrapper>
      </div>
    </section>
  );
}
