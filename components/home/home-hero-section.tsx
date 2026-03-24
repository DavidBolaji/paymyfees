import Image from "next/image";
import heroSectionImage from "@/assets/images/hero-img.jpg";

export function HomeHeroSection() {
  return (
    <section id="home" className="relative h-auto min-h-[600px] pb-10 md:h-[1039px] md:pb-0 md:pt-[143px] w-full overflow-hidden bg-[#F4F4F4]">
      <div className="mx-auto flex h-full w-full max-w-[1512px] flex-col items-center px-6 pt-[116px] md:pt-[58px] md:px-[60px] xl:px-[173.5px]">
        <div className="flex max-w-[670px] flex-col items-center text-center [font-family:Manrope]">
          <h1 className="text-[26px] font-extrabold leading-[105%] tracking-[0] text-[#191919] md:text-[36px] xl:text-[49px]">
            School Should Never
            <br />
            Pause Because of Payment
          </h1>

          <p className="mt-[12px] max-w-[640px] text-[13px] font-medium leading-[120%] tracking-[0] text-[#7C7C7C] md:text-[15px] xl:text-[17px]">
            Structured tuition support designed for families, teachers, and schools.
            <br />
            Verified, transparent, direct to school payments.
          </p>

          <div className="mt-[26px] flex w-full flex-wrap items-center justify-center gap-[10px]">
            <a
              href="#how-it-works"
              className="flex h-[47px] w-full max-w-[16.125rem] items-center justify-center rounded-[8px] border border-[#002561] bg-transparent px-[39px] py-[15px] text-[14px] font-semibold leading-[120%] tracking-[0] text-[#002561]"
            >
              Learn More
            </a>
            <a
              href="#cta"
              className="flex h-[47px] w-full max-w-[16.125rem] items-center justify-center rounded-[8px] bg-[#002561] px-[39px] py-[15px] text-[14px] font-semibold leading-[120%] tracking-[0] text-white"
            >
              Get Started
            </a>
          </div>
        </div>

        <div className="relative mt-[41px] aspect-[1165/700] w-full max-w-[1165px] rounded-[10px] p-[15px]"
          style={{
            background: "linear-gradient(158.83deg, #00296B 2.14%, #262A9C 10.06%, #000000 101.63%)",
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[10px] bg-white">
            <Image
              src={heroSectionImage}
              alt="PayMyFees dashboard preview"
              fill
              priority
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[190px] bg-gradient-to-b from-[rgba(244,244,244,0)] via-[rgba(244,244,244,0.7)] to-[#F4F4F4]"
      />
    </section>
  );
}
