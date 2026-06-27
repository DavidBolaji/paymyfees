import { Mail, Phone, MapPin } from "lucide-react";
import { HomeHeader } from "@/components/home/home-header";
import { HomeFooterSection } from "@/components/home/home-footer-section";
import { HomeGradientWrapper } from "@/components/home/home-gradient-wrapper";
import { MaxScreenContainer } from "@/components/layout/max-screen-container";

/* ── Social icons ── */
function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const contactCards = [
  {
    label: "Phone",
    value: "+234 803 585 1047",
    sub: "Mon – Fri, 9am – 5pm WAT",
    href: "tel:+2348035851047",
    icon: Phone,
  },
  {
    label: "Email",
    value: "support@paymyfees.co",
    sub: "We reply within 24 hours",
    href: "mailto:support@paymyfees.co",
    icon: Mail,
  },
  {
    label: "Location",
    value: "Nigeria",
    sub: "Serving students nationwide",
    href: null,
    icon: MapPin,
  },
];

const socialLinks = [
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@paymyfeesglobal?_r=1&_t=ZS-96gGDx9JllV",
    icon: TikTokIcon,
    handle: "@paymyfeesglobal",
    color: "#010101",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1HNRYXghzC/?mibextid=wwXIfr",
    icon: FacebookIcon,
    handle: "PayMyFees",
    color: "#1877F2",
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/paymyfeesglobal?s=21",
    icon: XIcon,
    handle: "@paymyfeesglobal",
    color: "#000000",
  },
];

export default function ContactPage() {
  return (
    <>
      <HomeHeader />

      {/* ── Hero ── */}
      <HomeGradientWrapper>
        <MaxScreenContainer className="max-w-[1512px]">
          <div
            className="px-6 pb-[5rem] pt-[140px] text-center md:pb-[6rem] md:pt-[165px]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            <p className="mb-3 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-[#B8C8E0]">
              Contact Us
            </p>
            <h1 className="mx-auto max-w-[560px] text-[2rem] font-extrabold leading-[1.1] tracking-[-0.01em] text-white md:text-[2.75rem] xl:text-[3.25rem]">
              We&apos;d love to hear from you
            </h1>
            <p className="mx-auto mt-4 max-w-[480px] text-[0.9375rem] font-medium leading-[1.65] text-white/60 md:text-[1.0625rem]">
              Have a question, partnership enquiry, or need support? Our team is always happy to help.
            </p>

            {/* quick chips */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:+2348035851047"
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[0.8125rem] font-semibold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Phone size={14} strokeWidth={2} />
                +234 803 585 1047
              </a>
              <a
                href="mailto:support@paymyfees.co"
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[0.8125rem] font-semibold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Mail size={14} strokeWidth={2} />
                support@paymyfees.co
              </a>
            </div>
          </div>
        </MaxScreenContainer>
      </HomeGradientWrapper>

      {/* ── Contact cards ── */}
      <section
        className="bg-[#F4F4F4] px-6 py-[4.5rem] md:px-10 xl:px-[11.25rem]"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        <MaxScreenContainer className="max-w-[1512px]">
          <div className="mx-auto max-w-[1100px]">

            {/* Top label */}
            <div className="mb-10 text-center">
              <h2 className="text-[1.5rem] font-extrabold text-[#191919] md:text-[1.875rem]">
                Get in touch
              </h2>
              <p className="mt-2 text-[0.9375rem] font-medium text-[#7C7C7C]">
                Choose the channel that works best for you.
              </p>
            </div>

            {/* 3-col contact cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {contactCards.map(({ label, value, sub, href, icon: Icon }) => {
                const inner = (
                  <>
                    <span
                      className="mb-4 flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-[0.875rem] text-[#002561]"
                      style={{ background: "rgba(0, 37, 97, 0.08)" }}
                    >
                      <Icon size={22} strokeWidth={1.75} />
                    </span>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#9A9A9A]">{label}</p>
                    <p className="mt-1.5 text-[1.0625rem] font-extrabold text-[#191919] group-hover:text-[#002561] transition-colors">
                      {value}
                    </p>
                    <p className="mt-1 text-[0.8125rem] font-medium text-[#9A9A9A]">{sub}</p>
                  </>
                );

                const cardClass =
                  "group flex flex-col rounded-[1.125rem] border border-[#E2E2E2] bg-white p-6 shadow-sm transition-all duration-200 hover:border-[#002561] hover:shadow-md";

                return href ? (
                  <a key={label} href={href} className={cardClass}>
                    {inner}
                  </a>
                ) : (
                  <div key={label} className={cardClass}>
                    {inner}
                  </div>
                );
              })}
            </div>

            {/* Social links card */}
            <div className="mt-5 rounded-[1.125rem] border border-[#E2E2E2] bg-white p-6 shadow-sm md:p-8">
              <p className="mb-6 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#9A9A9A]">
                Follow us on social media
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {socialLinks.map(({ label, href, icon: Icon, handle, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-[0.875rem] border border-[#F0F0F0] p-4 transition-all duration-200 hover:border-[#E2E2E2] hover:shadow-sm"
                  >
                    <span
                      className="flex h-[2.75rem] w-[2.75rem] shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: color }}
                    >
                      <Icon size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.875rem] font-bold text-[#191919]">{label}</p>
                      <p className="mt-0.5 truncate text-[0.75rem] font-medium text-[#9A9A9A]">{handle}</p>
                    </div>
                    <svg
                      className="ml-auto h-4 w-4 shrink-0 text-[#D0D0D0] transition-colors group-hover:text-[#002561]"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </MaxScreenContainer>
      </section>

      <HomeFooterSection />
    </>
  );
}
