"use client"

import { InstagramIcon, LinkedinIcon, TwitterIcon, TwitchIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative w-full lg:h-[535px] overflow-hidden">
      {/* Pattern Background */}
      <div
        className="
          bg-cover bg-center bg-no-repeat absolute inset-0 z-10
          lg:block hidden
        "
        style={{ backgroundImage: "url('/images/footer-grid.png')" }}
      ></div>

      {/* Mobile + Tablet Background */}
      <div
        className="
          bg-cover bg-center bg-no-repeat absolute inset-0 z-10
          lg:hidden block
        "
        style={{ backgroundImage: "url('/images/footer-mobile-grid.png')" }}
      ></div>

      {/* Gradient Overlay */}
      <div
        className="
        absolute inset-0 bg-[linear-gradient(160deg,_rgba(0,37,97,0.9)_40%,_rgba(0,37,97,0.9)_0%,_rgba(0,75,199,1)_100%)]
        z-0
      "
      ></div>

      {/* Main Content */}
      <div className="relative z-10 lg:px-[66px] px-6 lg:pt-[148px] py-10">
        <div className="lg:flex justify-between">
          
          {/* Left Column - Brand */}
          <div className="flex flex-col gap-[21px] lg:w-[303px]">
            <Link href="/" className="flex items-center gap-[7px]">
              <Image
                src="/images/logo/web_logo1.png"
                alt="PayMyFees"
                width={160}
                height={43}
              />
            </Link>

            {/* Title Mobile & Tablet */}
            <h2 className="text-white text-[2rem] font-extrabold lg:hidden block leading-[1.25em] tracking-[-0.03em]">
              The Future of Education Finance Starts Here
            </h2>

            {/* Description */}
            <p className="text-white text-[15px] font-medium leading-[2em] tracking-[-0.03em]">
              Smart financing for every student, teacher & school. Making education accessible through secure,
              transparent, and flexible financial solutions.
            </p>

            {/* Mobile + Tablet Explore + Contact */}
            <div className="lg:hidden flex justify-between">
              <div className="flex-col flex flex-[0.6]">
                <h3 className="text-white text-[20px] font-bold mb-2">Explore</h3>
                <Link href="/about" className="text-white text-[15px] leading-[2em] hover:opacity-80">
                  About Us
                </Link>
                <Link href="/features" className="text-white text-[15px] leading-[2em] hover:opacity-80">
                  Features
                </Link>
              </div>

              <div className="flex-col flex flex-[0.4]">
                <h3 className="text-white text-[20px] font-bold mb-2">Get In Touch</h3>
                <a href="mailto:support@paymyfees.com" className="text-white text-[15px] leading-[2em] hover:opacity-80">
                  support@paymyfees.com
                </a>
                <a href="tel:+447454703690" className="text-white text-[15px] leading-[2em] hover:opacity-80">
                  +44 7454 703690
                </a>
              </div>
            </div>

            {/* Desktop Social Icons */}
            <div className="lg:flex hidden gap-[40px] mt-4">
              <Link href="#" className="w-[32px] h-[32px] flex items-center justify-center hover:opacity-80">
                <InstagramIcon color="white" />
              </Link>
              <Link href="#" className="w-[35px] h-[32px] flex items-center justify-center hover:opacity-80">
                <TwitterIcon color="white" />
              </Link>
              <Link href="#" className="w-[32px] h-[32px] flex items-center justify-center hover:opacity-80">
                <LinkedinIcon color="white" />
              </Link>
              <Link href="#" className="w-[28px] h-[32px] flex items-center justify-center hover:opacity-80">
                <TwitchIcon color="white" />
              </Link>
            </div>

            {/* Desktop Copyright */}
            <p className="text-white text-[15px] font-medium leading-[2em] tracking-[-0.03em] mt-4 lg:block hidden">
              © {new Date().getFullYear()} PayMyFees. All rights reserved.
              <br />
              Building financial access for every learner.
            </p>
          </div>

          {/* Desktop Explore */}
          <div className="lg:flex hidden flex-col gap-[7px] w-[79px]">
            <h3 className="text-white text-[20px] font-bold mb-2">Explore</h3>
            <Link href="/about" className="text-white text-[15px] leading-[2em] hover:opacity-80">About Us</Link>
            <Link href="/features" className="text-white text-[15px] leading-[2em] hover:opacity-80">Features</Link>
          </div>

          {/* Desktop Contact */}
          <div className="lg:flex hidden flex-col gap-[7px] w-[178px]">
            <h3 className="text-white text-[20px] font-bold mb-2">Get In Touch</h3>
            <a href="mailto:support@paymyfees.com" className="text-white text-[15px] leading-[2em] hover:opacity-80">
              support@paymyfees.com
            </a>
            <a href="tel:+447454703690" className="text-white text-[15px] leading-[2em] hover:opacity-80">
              +44 7454 703690
            </a>
          </div>

          {/* Mobile + Tablet Social Icons */}
          <div className="lg:hidden flex items-center justify-center gap-4 mt-10">
            <Link href="#" className="w-[32px] h-[32px] flex items-center justify-center hover:opacity-80">
              <InstagramIcon color="white" />
            </Link>
            <Link href="#" className="w-[35px] h-[32px] flex items-center justify-center hover:opacity-80">
              <TwitterIcon color="white" />
            </Link>
            <Link href="#" className="w-[32px] h-[32px] flex items-center justify-center hover:opacity-80">
              <LinkedinIcon color="white" />
            </Link>
            <Link href="#" className="w-[28px] h-[32px] flex items-center justify-center hover:opacity-80">
              <TwitchIcon color="white" />
            </Link>
          </div>

          {/* Mobile + Tablet Copyright */}
          <p className="text-white text-[0.95rem] text-center font-medium leading-[2em] tracking-[-0.03em] mt-4 lg:hidden block">
            © {new Date().getFullYear()} PayMyFees. All rights reserved.
            <br />
            Building financial access for every learner.
          </p>

          {/* Desktop CTA */}
          <div className="lg:flex flex-col gap-[14px] w-[356px] hidden">
            <h2 className="text-white text-[48px] font-extrabold leading-[1.25em]">
              The Future of Education Finance Starts Here
            </h2>
            <button className="flex w-[12.5rem] relative z-30 items-center gap-[8px] px-[42px] py-[15px] bg-black rounded-[16px] shadow text-white text-[14px] font-bold hover:opacity-90">
              Join Waitlist
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8.5 12H15.5M15.5 12L12.5 9M15.5 12L12.5 15"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </footer>
  )
}
