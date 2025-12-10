"use client";

import Image from "next/image";
import { Header } from "../layout/header";
import HeroImage from "@/assets/images/hero-2.png";
import Vector from "@/assets/images/vector.png";
import SmartEducationBadge from "@/assets/images/smart_education_badge.png";
import { useRef, useState, useEffect } from "react";

export function HeroSection() {
  const imageRef = useRef<HTMLDivElement>(null);
  const [heroHeight, setHeroHeight] = useState<number | null>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    // Check if we're on a large screen
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    const updateHeight = () => {
      if (imageRef.current && window.innerWidth >= 1024) {
        const height = imageRef.current.offsetHeight;
        setHeroHeight(height - 260);
      }
    };

    // Initial checks
    checkScreenSize();
    updateHeight();

    // Combined resize handler for better performance
    const handleResize = () => {
      checkScreenSize();
      updateHeight();
    };

    window.addEventListener("resize", handleResize);

    // Use a timeout to ensure the image is loaded
    const timer = setTimeout(updateHeight, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {/* Header */}
      <div className="fixed z-[99999] w-full top-0">
        <Header />
      </div>

      <section
        className="relative w-full h-auto overflow-hidden bg-[linear-gradient(160deg,_white_0%,_white_10%,_rgba(176,189,209,0.5)_100%)] z-0"
        style={{
          height: isLargeScreen && heroHeight !== null ? `${heroHeight}px` : 'auto'
        }}
      >
        {/* Main Content */}
        <div className="relative z-10 lg:flex lg:mt-40 max-w-7xl mx-auto">

          {/* LEFT CONTENT */}
          <div className="w-full flex-1 pt-[7.49rem]">

            {/* Badge */}
            <div className="relative flex justify-center items-center w-full">
              {/* Desktop Badge */}
              <Image
                src={SmartEducationBadge}
                alt="Smart education badge"
                width={279}
                height={41}
                priority
                className="lg:block hidden"
              />

              {/* Mobile + Tablet Badge */}
              <Image
                src={SmartEducationBadge}
                alt="Smart education badge"
                width={211}
                height={35}
                priority
                className="lg:hidden block"
              />
            </div>

            {/* Desktop Heading */}
            <h1 className="font-black text-[2.8375rem] lg:block hidden pl-[6.75rem] leading-tight tracking-[0.017em] text-nowrap">
              Smart <span className="text-[#002561]">Financing</span> for Every <br />
              <span className="text-[#002561]">Student, Teacher & School.</span>
            </h1>

            {/* Mobile + Tablet Heading */}
            <h1 className="font-black text-[1.6255rem] text-center lg:hidden block px-[1.5rem] leading-tight tracking-[0.017em]">
              Smart <span className="text-[#002561]">Financing</span> for Every <br />
              <span className="text-[#002561]">Student, Teacher & School.</span>
            </h1>

            {/* Desktop Subtext */}
            <p className="text-[#7C7C7C] mt-[1.4125rem] lg:pl-[6.85rem] text-[1rem] lg:block hidden font-medium leading-snug">
              We&apos;re redefining access to learning helping every student, every teacher and <br />
              institution achieve their goals through smart, inclusive financial solutions.
            </p>

            {/* Mobile + Tablet Subtext */}
            <p className="text-[#7C7C7C] lg:hidden block mt-[1.4125rem] text-center px-[1.5rem] text-[1rem] font-medium leading-snug max-w-96 mx-auto">
              We&apos;re redefining access to learning helping every student, every teacher and
              institution achieve their goals through smart, inclusive financial solutions.
            </p>

            {/* Buttons */}
            <div className="lg:pl-[1.85rem] text-center px-6 mt-[2.75rem] space-x-[1.3125rem] flex justify-center">
              <button
                onClick={() => {
                  document.getElementById("more")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className="py-[0.5375rem] lg:px-[4.59rem] px-[1.19rem] rounded-lg border-[3px] text-nowrap border-[#002561] text-[#002561] bg-white font-bold hover:bg-[#002561] hover:text-white transition-colors duration-300">
                Learn More
              </button>

              <button
                onClick={() => {
                  document.getElementById("early")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className="py-[0.5375rem] lg:px-[4.59rem] px-[1.19rem] rounded-lg border-[3px] text-nowrap border-[#002561] text-white bg-[#002561] font-bold hover:bg-white hover:text-[#002561] transition-colors duration-300">
                Join Waitlist
              </button>
            </div>

            {/* Desktop Vector */}
            <Image
              src={Vector}
              width={386}
              height={313}
              alt="vector image"
              priority
              className="opacity-70 absolute top-56 lg:block hidden scale-75 -translate-x-20"
            />
          </div>

          {/* RIGHT (DESKTOP ONLY) */}
          <div
            ref={imageRef}
            className="w-[46rem] h-[68.93rem] relative z-10 lg:block hidden"
          >
            <Image
              src={HeroImage}
              fill
              alt="Hero image"
              priority
              className="object-contain scale-[1.29] shrink-0 -translate-x-[6.05rem] -translate-y-[12.63rem]"
            />
          </div>

          {/* MOBILE + TABLET IMAGE */}
          <div className="w-full flex items-center justify-center relative z-10 lg:hidden">
            <Image
              src={"/images/hero-mobile.png"}
              width={500}
              height={400}
              alt="Hero image"
              priority
              className="object-contain"
            />
          </div>

        </div>
      </section>
    </>
  );
}