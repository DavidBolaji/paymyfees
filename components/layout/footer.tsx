"use client"

import { InstagramIcon, LinkedinIcon, TwitterIcon, TwitchIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer id="contact" className="relative w-full lg:h-[535px] overflow-hidden">
      {/* Pattern Background */}
      <div
        className="hidden lg:block z-10 absolute inset-0 bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: "url('/images/footer-grid.png')" }}
      ></div>

      {/* Mobile + Tablet Background */}
      <div
        className="lg:hidden block z-10 absolute inset-0 bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: "url('/images/footer-mobile-grid.png')" }}
      ></div>

      {/* Gradient Overlay */}
      <div
        className="z-0 absolute inset-0 bg-[linear-gradient(160deg,_rgba(0,37,97,0.9)_40%,_rgba(0,37,97,0.9)_0%,_rgba(0,75,199,1)_100%)]"
      ></div>

      {/* Main Content */}
      <div className="z-10 relative px-6 lg:px-[66px] py-10 lg:pt-[148px]">
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
            <h2 className="lg:hidden block font-extrabold text-[2rem] text-white leading-[1.25em] tracking-[-0.03em]">
              The Future of Education Finance Starts Here
            </h2>

            {/* Description */}
            <p className="font-medium text-[15px] text-white leading-[2em] tracking-[-0.03em]">
              Smart financing for every student, teacher & school. Making education accessible through secure,
              transparent, and flexible financial solutions.
            </p>

            {/* Mobile + Tablet Explore + Contact */}
            <div className="lg:hidden flex justify-between">
              <div className="flex flex-col flex-[0.6]">
                <h3 className="mb-2 font-bold text-[20px] text-white">Explore</h3>
                <Link href="/about" className="hover:opacity-80 text-[15px] text-white leading-[2em]">
                  About Us
                </Link>
                <Link href="/features" className="hover:opacity-80 text-[15px] text-white leading-[2em]">
                  Features
                </Link>
              </div>

              <div className="flex flex-col flex-[0.4]">
                <h3 className="mb-2 font-bold text-[20px] text-white">Get In Touch</h3>
                <a href="mailto:support@paymyfees.com" className="hover:opacity-80 text-[15px] text-white leading-[2em]">
                  support@paymyfees.co
                </a>
                <a href="tel:+2348035851047" className="hover:opacity-80 text-[15px] text-white leading-[2em]">
                  +234 803 585 1047
                </a>
                <a href="tel:+447448290042" className="hover:opacity-80 text-[15px] text-white leading-[2em]">
                  +44 7448 290042
                </a>
              </div>
            </div>

            {/* Desktop Social Icons */}
            <div className="hidden lg:flex gap-[40px] mt-4">
              <Link href="#" className="flex justify-center items-center hover:opacity-80 w-[32px] h-[32px]">
                <InstagramIcon color="white" />
              </Link>
              <Link href="#" className="flex justify-center items-center hover:opacity-80 w-[35px] h-[32px]">
                <TwitterIcon color="white" />
              </Link>
              <Link href="#" className="flex justify-center items-center hover:opacity-80 w-[32px] h-[32px]">
                <LinkedinIcon color="white" />
              </Link>
              <Link href="#" className="flex justify-center items-center hover:opacity-80 w-[28px] h-[32px]">
                <TwitchIcon color="white" />
              </Link>
            </div>

            {/* Desktop Copyright */}
            <p className="hidden lg:block mt-4 font-medium text-[15px] text-white leading-[2em] tracking-[-0.03em]">
              © {new Date().getFullYear()} PayMyFees. All rights reserved.
              <br />
              Building financial access for every learner.
            </p>
          </div>

          {/* Desktop Explore */}
          <div className="hidden lg:flex flex-col gap-[7px] w-[79px]">
            <h3 className="mb-2 font-bold text-[20px] text-white">Explore</h3>
            <Link href="/about" className="hover:opacity-80 text-[15px] text-white leading-[2em]">About Us</Link>
            <Link href="/features" className="hover:opacity-80 text-[15px] text-white leading-[2em]">Features</Link>
          </div>

          {/* Desktop Contact */}
          <div className="hidden lg:flex flex-col gap-[7px] w-[178px]">
            <h3 className="mb-2 font-bold text-[20px] text-white">Get In Touch</h3>
            <a href="mailto:support@paymyfees.co" className="hover:opacity-80 text-[15px] text-white leading-[2em]">
              support@paymyfees.co
            </a>
            <a href="tel:+2348035851047" className="hover:opacity-80 text-[15px] text-white leading-[2em]">
              +234 803 585 1047
            </a>
            <a href="tel:+447448290042" className="hover:opacity-80 text-[15px] text-white leading-[2em]">
              +44 7448 290042
            </a>
          </div>

          {/* Mobile + Tablet Social Icons */}
          <div className="lg:hidden flex justify-center items-center gap-4 mt-10">
            <Link href="#" className="flex justify-center items-center hover:opacity-80 w-[32px] h-[32px]">
              <InstagramIcon color="white" />
            </Link>
            <Link href="#" className="flex justify-center items-center hover:opacity-80 w-[35px] h-[32px]">
              <TwitterIcon color="white" />
            </Link>
            <Link href="#" className="flex justify-center items-center hover:opacity-80 w-[32px] h-[32px]">
              <LinkedinIcon color="white" />
            </Link>
            <Link href="#" className="flex justify-center items-center hover:opacity-80 w-[28px] h-[32px]">
              <TwitchIcon color="white" />
            </Link>
          </div>

          {/* Mobile + Tablet Copyright */}
          <p className="lg:hidden block mt-4 font-medium text-[0.95rem] text-white text-center leading-[2em] tracking-[-0.03em]">
            © {new Date().getFullYear()} PayMyFees. All rights reserved.
            <br />
            Building financial access for every learner.
          </p>

          {/* Desktop CTA */}
          <div className="hidden lg:flex flex-col gap-[14px] w-[356px]">
            <h2 className="font-extrabold text-[48px] text-white leading-[1.25em]">
              The Future of Education Finance Starts Here
            </h2>
            <button
              onClick={() => {
                document.getElementById("early")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="z-30 relative flex items-center gap-[8px] bg-black hover:opacity-90 shadow px-[42px] py-[15px] rounded-[16px] w-[12.5rem] font-bold text-[14px] text-white">
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
