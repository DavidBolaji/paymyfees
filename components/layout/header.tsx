"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/images/logo/logo.png";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
      className={`fixed top-0 left-0 w-full h-[7.31rem]
        px-[1.5rem] lg:px-[6.5rem] py-[2.31rem]
        transition-all duration-300 z-[99999]
        ${scrolled ? "backdrop-blur-md bg-white/40 shadow-sm" : "bg-transparent"}
      `}
    >
      <nav className="flex items-center justify-between w-full max-w-7xl mx-auto">
        
        {/* Logo */}
        <div>
          <Image src={Logo} width={160} height={45} alt="Logo" />
        </div>

        {/* Desktop Nav (only lg and above) */}
        <ul className="hidden lg:inline-flex space-x-[1.3125rem]">
          <li>
            <Link className="font-semibold text-[#292929] text-[1.125rem]" href="">
              How it works
            </Link>
          </li>
          <li>
            <Link className="font-semibold text-[#292929] text-[1.125rem]" href="">
              For Students
            </Link>
          </li>
          <li>
            <Link className="font-semibold text-[#292929] text-[1.125rem]" href="">
              For Schools
            </Link>
          </li>
          <li>
            <Link className="font-semibold text-[#292929] text-[1.125rem]" href="">
              Contact Us
            </Link>
          </li>
        </ul>

        {/* Desktop Button */}
        <button className="hidden lg:block px-[0.9rem] py-2 text-[1.125rem] bg-[#001d4c] text-nowrap text-white rounded-lg w-[8rem] font-medium">
          Join Waitlist
        </button>

        {/* Mobile + Tablet Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2"
        >
          {isOpen ? <X size={26} /> : <Image src={"/images/menu.png"} priority width={24} height={24} alt="menu" />}
        </button>
      </nav>

      {/* Mobile + Tablet Menu */}
      {isOpen && (
        <div className="lg:hidden mt-5 bg-white/90 backdrop-blur-xl rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-5 duration-300 shadow-lg">
          <Link
            href=""
            className="block text-[1.125rem] font-semibold text-[#292929]"
            onClick={() => setIsOpen(false)}
          >
            How it works
          </Link>

          <Link
            href=""
            className="block text-[1.125rem] font-semibold text-[#292929]"
            onClick={() => setIsOpen(false)}
          >
            For Students
          </Link>

          <Link
            href=""
            className="block text-[1.125rem] font-semibold text-[#292929]"
            onClick={() => setIsOpen(false)}
          >
            For Schools
          </Link>

          <Link
            href=""
            className="block text-[1.125rem] font-semibold text-[#292929]"
            onClick={() => setIsOpen(false)}
          >
            Contact Us
          </Link>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-3 text-[1.125rem] bg-[#001d4c] text-white rounded-lg font-medium"
          >
            Join Waitlist
          </button>
        </div>
      )}
    </header>
  );
}
