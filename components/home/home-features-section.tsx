import Image from "next/image";
import type { CSSProperties } from "react";
import featCard1 from "@/assets/home/assets/feat-card-1.jpg";
import featCard2 from "@/assets/home/assets/feat-card-2.png";
import featCard3 from "@/assets/home/assets/feat-card-3.png";
import featCard4 from "@/assets/home/assets/feat-card-4.jpg";
import { HomeGradientWrapper } from "./home-gradient-wrapper";

const featureItems = [
  {
    title: "Flexible Tuition Payments",
    description: "Spread school fee into predictable monthly installments instead of paying everything at once.",
    image: featCard1,
    hasGradientBorder: true,
    wrapperClassName:
      "mt-5 w-[18.75rem] md:mt-0 md:absolute md:left-1/2 md:top-[7.875rem] md:h-[30.75rem] md:w-[23.375rem] md:-translate-x-1/2",
    wrapperStyle: {
      background: "linear-gradient(93.25deg, #1622A7 9.04%, #60CAFF 55.08%, #000000 100.66%)",
      padding: "0.375rem",
      borderRadius: "0.625rem",
      boxShadow: "0px 4px 4px 0px #00000040",
    } as CSSProperties,
    imageClassName: "h-full w-full object-cover",
    imageStyle: {
      borderRadius: "0.375rem",
    } as CSSProperties,
  },
  {
    title: "No More School Fee Wahala",
    description: "Get verified funding for tuition with minimal stress.",
    image: featCard2,
    hasGradientBorder: false,
    imageClassName:
      "mt-5 h-auto w-[18rem] md:mt-0 md:absolute md:left-1/2 md:top-[7.4375rem] md:h-[16.6875rem] md:w-[22.1875rem] md:-translate-x-1/2",
    imageStyle: {
      borderRadius: "0.625rem",
    } as CSSProperties,
  },
  {
    title: "Fast Loan Approvals",
    description: "Instant eligibility checks and faster approvals for education financing.",
    image: featCard3,
    hasGradientBorder: true,
    wrapperClassName:
      "mt-5 w-[17rem] md:mt-0 md:absolute md:left-1/2 md:top-[7.1875rem] md:h-[16.5625rem] md:w-[19.5625rem] md:-translate-x-1/2",
    wrapperStyle: {
      background: "linear-gradient(180deg, #00296B 0%, #1767D1 39.42%, #191919 100%)",
      padding: "1px",
      borderRadius: "0.625rem",
      boxShadow: "4px 4px 4px 0px #00000033",
    } as CSSProperties,
    imageClassName: "h-full w-full object-cover",
    imageStyle: {
      borderRadius: "0.5625rem",
    } as CSSProperties,
  },
  {
    title: "Flexible Repayment",
    description: "Choose repayment plans that fit your income and academic calendar.",
    image: featCard4,
    hasGradientBorder: true,
    wrapperClassName:
      "mt-5 w-[18.75rem] md:mt-0 md:absolute md:left-1/2 md:top-[8.4375rem] md:h-[30.8125rem] md:w-[23.4375rem] md:-translate-x-1/2",
    wrapperStyle: {
      background: "linear-gradient(93.25deg, #1622A7 9.04%, #60CAFF 55.08%, #000000 100.66%)",
      padding: "0.375rem",
      borderRadius: "0.625rem",
      boxShadow: "0px 4px 4px 0px #00000040",
    } as CSSProperties,
    imageClassName: "h-full w-full object-cover",
    imageStyle: {
      borderRadius: "0.375rem",
    } as CSSProperties,
  },
];

export function HomeFeaturesSection() {
  return (
    <HomeGradientWrapper>
      <section id="how-it-works" className="px-6 pb-14 pt-[7.5625rem] md:px-10 md:pb-20 xl:px-[11.25rem]">
        <div className="mx-auto max-w-[1512px]">
          <div className="mx-auto max-w-[56.25rem] text-center [font-family:Manrope]">
            <h2 className="text-[1.5rem] font-extrabold leading-[105%] tracking-[0] text-white md:text-[2.125rem]">
              Education financing pressure affects everyone
            </h2>
            <p className="mt-4 text-[0.9375rem] font-medium leading-[120%] tracking-[0] text-white max-w-[795px] mx-auto text-center mb-12 md:text-[1.0625rem]">
              The education system operates on term-based payments, but families earn a monthly income.
              When these timelines don&apos;t align, paying school fees can become stressful; even for financially responsible parents.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 max-w-6xl mx-auto">
            {featureItems.map((item) => (
              <article
                key={item.title}
                className="relative mx-auto flex h-auto min-h-[22rem] w-full max-w-[35.375rem] flex-col items-center overflow-hidden rounded-[1rem] border border-[#D9D9D9] bg-[#ECECEC] px-5 pt-6 pb-5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] md:h-[25rem] md:pb-0"
              >
                <h3 className="max-w-[27.8125rem] text-center text-[1.125rem] font-semibold leading-[120%] tracking-[0] text-[#191919] [font-family:Manrope] md:text-[1.375rem]">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-[27.8125rem] text-center text-[0.9375rem] font-medium leading-[120%] tracking-[0] text-[#5F5F5F] [font-family:Manrope] md:text-[1.125rem]">
                  {item.description}
                </p>
                {item.hasGradientBorder ? (
                  <div className={item.wrapperClassName} style={item.wrapperStyle}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      className={item.imageClassName}
                      style={item.imageStyle}
                    />
                  </div>
                ) : (
                  <Image
                    src={item.image}
                    alt={item.title}
                    className={item.imageClassName}
                    style={item.imageStyle}
                  />
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </HomeGradientWrapper>
  );
}
