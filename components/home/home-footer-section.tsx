import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeGradientWrapper } from "./home-gradient-wrapper";

const navColumns = [
  {
    heading: "Explore",
    links: [
      // { label: "About Us", href: "/#about" },
      { label: "Careers", href: "/careers" },
      { label: "Features", href: "/#features" },
      // { label: "Blog", href: "/blog" },
    ],
  },
  {
    heading: "Products",
    links: [
      { label: "Flex", href: "/#products" },
      { label: "Boost", href: "/#products" },
      { label: "Grow", href: "/#products" },
      { label: "Hope Fund", href: "/#products" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "FAQs", href: "/#faqs" },
      { label: "Contact Us", href: "/contact" },
      { label: "+234 803 585 1047", href: "tel:+2348035851047" },
      { label: "support@paymyfees.co", href: "mailto:support@paymyfees.co" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Responsible Lending Policy", href: "/lending-policy" },
    ],
  },
];

/* ── Social icons (not in lucide) ── */
function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function HomeFooterSection() {
  return (
    <HomeGradientWrapper>
      <footer id="contact" className="px-6 pb-10 pt-[4rem] md:px-10 xl:px-[3.375rem]" style={{ fontFamily: "Manrope, sans-serif" }}>
        <div className="mx-auto max-w-[1512px]">
          {/* Main grid */}
          <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-6">

            {/* ── Brand column ── */}
            <div className="flex flex-col gap-5 lg:w-[17.5rem]">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/images/logo/web_logo1.png"
                  alt="PayMyFees"
                  width={148}
                  height={36}
                  className="object-contain"
                />
              </Link>

              {/* Description */}
              <p className="text-[0.9375rem] font-medium leading-[1.75] tracking-[0] text-white/70">
                Smart financing for every student, teacher &amp; school.
                Making education accessible through secure, transparent,
                and flexible financial solutions.
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-[1.125rem] pt-1">
                {[
                  // { href: "#", icon: <InstagramIcon size={18} color="white" strokeWidth={1.75} />, label: "Instagram" },
                  { href: "https://x.com/paymyfeesglobal?s=21", icon: <XIcon />, label: "X / Twitter" },
                  { href: "https://www.facebook.com/share/1HNRYXghzC/?mibextid=wwXIfr", icon: <FacebookIcon />, label: "Facebook" },
                  { href: "https://www.tiktok.com/@paymyfeesglobal?_r=1&_t=ZS-96gGDx9JllV", icon: <TikTokIcon />, label: "TikTok" },
                ].map(({ href, icon, label }) => (
                  <Link
                    key={label}
                    href={href}
                    aria-label={label}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex h-[3rem] w-[3rem] items-center justify-center rounded-full border border-white/30 transition-colors hover:border-white/60"
                  >
                    {icon}
                  </Link>
                ))}
              </div>

              {/* Copyright – desktop */}
              <p className="hidden text-[0.8125rem] font-medium leading-[1.75] tracking-[0] text-white/50 lg:block">
                © {new Date().getFullYear()} PayMyFees. All rights reserved.
                <br />
                Building financial access for every learner.
              </p>
            </div>

            {/* ── Nav columns ── */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:flex lg:flex-1 lg:justify-between lg:gap-4">
              {navColumns.map((col) => (
                <div key={col.heading} className="flex flex-col gap-[0.625rem]">
                  <h3 className="mb-1 text-[1rem] font-bold leading-[1.2] tracking-[0] text-white">
                    {col.heading}
                  </h3>
                  {col.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-[0.9375rem] font-medium leading-[1.75] tracking-[0] text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            {/* ── Right CTA ── */}
            <div className="flex flex-col gap-5 lg:w-[18rem] lg:shrink-0">
              <h2 className="text-[1.375rem] font-extrabold leading-[1.2] tracking-[0] text-white md:text-[2rem] lg:text-[2.125rem]">
                The Future of Education Finance Starts Here
              </h2>
              <div>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-[0.625rem] rounded-[0.75rem] px-[1.375rem] py-[0.875rem] text-[0.9375rem] font-semibold leading-[1.2] tracking-[0] text-white transition-opacity hover:opacity-90"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  Get Started
                  <span className="flex h-[1.75rem] w-[1.75rem] items-center justify-center rounded-full border border-white/40">
                    <ArrowRight size={13} strokeWidth={2.2} />
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright – mobile */}
          <p className="mt-8 text-left text-[0.8125rem] font-medium leading-[1.75] tracking-[0] text-white/50 lg:hidden">
            © {new Date().getFullYear()} PayMyFees. All rights reserved.
            <br />
            Building financial access for every learner.
          </p>
        </div>
      </footer>
    </HomeGradientWrapper>
  );
}
