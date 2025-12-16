"use client";

import Image from "next/image";

import Logo from "@/assets/images/logo/logo.png";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

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
        <div className="lg:block hidden">
          <Image src={Logo} width={160} height={45} alt="Logo" />
        </div>
        {/* Logo Mobile */}
        <div className="lg:hidden block">
          <Image src={Logo} width={140} height={35} alt="Logo" />
        </div>

        {/* Desktop Nav (only lg and above) */}
        <ul className="hidden lg:inline-flex space-x-[1.3125rem]">
          <li>
            <button
              onClick={() => {
                document.getElementById("works")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="font-semibold text-[#292929] text-[1.125rem]">
              How it works
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                document.getElementById("early")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="font-semibold text-[#292929] text-[1.125rem]">
              For Students
            </button>
          </li>
          <li
            onClick={() => {
              document.getElementById("early")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            <button className="font-semibold text-[#292929] text-[1.125rem]">
              For Schools
            </button>
          </li>
          <li>
            <button className="font-semibold text-[#292929] text-[1.125rem] cursor-pointer"
              onClick={() => {
                document.getElementById("contact")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              Contact Us
            </button>
          </li>
        </ul>

        {/* Desktop Button */}
        <button
          onClick={() => {
            document.getElementById("early")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
          className="hidden cursor-pointer lg:block px-[0.9rem] py-2 text-[1.125rem] bg-[#001d4c] text-nowrap text-white rounded-lg w-[8rem] font-medium">
          Join Waitlist
        </button>

        {/* Mobile + Tablet Hamburger */}
        <button
          onClick={() => {
            setIsOpen(!isOpen)
            document.getElementById("early")?.scrollIntoView({
              behavior: "smooth",
            });
          }
          }
          className="lg:hidden p-2"
        >
          {isOpen ? <X size={26} /> : <Image src={"/images/menu.png"} priority width={24} height={24} alt="menu" />}
        </button>
      </nav>

      {/* Mobile + Tablet Menu */}
      {
        isOpen && (
          <div className="lg:hidden mt-5 bg-white/90 backdrop-blur-xl rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-5 duration-300 shadow-lg">
            <button

              className="block text-[1.125rem] cursor-pointer font-semibold text-[#292929]"
              onClick={() => {
                setIsOpen(false)
                document.getElementById("works")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              How it works
            </button>

            <button

              className="block text-[1.125rem] cursor-pointer font-semibold text-[#292929]"
              onClick={() => {
                setIsOpen(false)

                document.getElementById("early")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              For Students
            </button>

            <button

              className="block text-[1.125rem] cursor-pointer font-semibold text-[#292929]"
              onClick={() => {
                setIsOpen(false)
                document.getElementById("early")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              For Schools
            </button>

            <button

              className="block text-[1.125rem] cursor-pointer font-semibold text-[#292929]"
              onClick={() => {
                setIsOpen(false)

                document.getElementById("contact")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              Contact Us
            </button>

            <button
              onClick={() => {
                setIsOpen(false)

                document.getElementById("early")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="w-full px-4 py-3 text-[1.125rem] bg-[#001d4c] text-white rounded-lg font-medium"
            >
              Join Waitlist
            </button>
          </div>
        )
      }
    </header >
  );
}
