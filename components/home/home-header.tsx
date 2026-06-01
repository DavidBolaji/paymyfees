"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import WebLogo from "@/assets/images/logo/web_logo2.png";

const navItems = [
  { label: "Home", href: "/#home" },
  { label: "Products", href: "/#products" },
  // { label: "About Us", href: "/#about" },
  { label: "Contact", href: "/contact" },
];

export function HomeHeader() {

    const [scrolled, setScrolled] = useState(false);
    // const [isOpen, setIsOpen] = useState(false);
  
    useEffect(() => {
      const onScroll = () => {
        if (window.scrollY > 10) setScrolled(true);
        else setScrolled(false);
      };
  
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }, []);

  return (
   <header
      className={`fixed top-0 left-0 w-full h-[96px] lg:h-[80px]
        px-[1.5rem] lg:px-[6.5rem]
        transition-all duration-300 z-[99999]
        ${scrolled ? "backdrop-blur-lg bg-white shadow-md border border-white/30" : "bg-transparent"}
      `}
    >
      <div className="mx-auto hidden h-full max-w-[1512px] items-center px-[100px] lg:flex">
        <div className="flex items-center justify-between w-full">
          <a href="#home" aria-label="PayMyFees Home" className="w-[183px] h-[43px]">
            <Image src={WebLogo} alt="PayMyFees"  className="object-cover" />
          </a>
          

          <nav
            aria-label="Primary"
            className="flex items-center gap-[21px] h-[54px] rounded-[25px] bg-[linear-gradient(109.59deg,_#00296B_-22.83%,_#063193_44.69%,_#000000_91.17%)] px-[34px] py-[11px] [font-family:Manrope]"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-semibold text-[18px] leading-[120%] whitespace-nowrap tracking-[0] text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-[26px] [font-family:Manrope]">
            <a href="/auth/login" className="font-semibold text-[18px] whitespace-nowrap leading-[120%] tracking-[0] text-[#002561]">
              Log In
            </a>

            <a
              href="/auth/register"
              className="rounded-[24px] bg-[#002561] whitespace-nowrap px-[30px] py-[11px] font-semibold text-[18px] leading-[120%] tracking-[0] text-white"
            >
              Apply Now
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-full max-w-[1512px] items-center justify-between px-4 lg:hidden">
        <a href="#home" aria-label="PayMyFees Home" className="block">
          <Image src={WebLogo} alt="PayMyFees" width={110} height={26} priority className="h-auto w-[110px]" />
        </a>
        <a
          href="/auth/register"
          className="rounded-[16px] bg-[#002561] px-4 py-2 font-semibold text-[14px] leading-[120%] text-white"
        >
          Apply Now
        </a>
      </div>
    </header>
  );
}
