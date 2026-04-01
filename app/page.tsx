// import { Footer } from "@/components/layout/footer";
// import { CTASection } from "@/components/sections/cta";
// import { EarlyAccessSection } from "@/components/sections/early-access";
// import { FeaturesSection } from "@/components/sections/features";
// import { HeroSection } from "@/components/sections/hero";

// export default function Home() {
//   return (
//     <div className="">
      
//         <HeroSection />
//         <EarlyAccessSection />
//         <FeaturesSection />
//         <CTASection />
      
//       <Footer />
//     </div>
//   );
// }
import { MaxScreenContainer } from "@/components/layout/max-screen-container";
import { HomeHeader } from "@/components/home/home-header";
import { HomeHeroSection } from "@/components/home/home-hero-section";
import { HomeMetricsSection } from "@/components/home/home-metrics-section";
import { HomeFeaturesSection } from "@/components/home/home-features-section";
import { HomeProductsSection } from "@/components/home/home-products-section";
import { HomeFaqSection } from "@/components/home/home-faq-section";
import { HomeRealStoriesSection } from "@/components/home/home-real-stories-section";
import { HomeCtaSection } from "@/components/home/home-cta-section";
import { HomeFooterSection } from "@/components/home/home-footer-section";
import { AnimateIn } from "@/components/home/animate-in";

export default function HomePage() {
  return (
    <>
      <HomeHeader />
      <AnimateIn>
        <HomeHeroSection />
      </AnimateIn>
      <AnimateIn>
        <HomeMetricsSection />
      </AnimateIn>
      <AnimateIn>
        <HomeFeaturesSection />
      </AnimateIn>
      <AnimateIn>
        <HomeProductsSection />
      </AnimateIn>
      <AnimateIn>
        <HomeFaqSection />
      </AnimateIn>
      <AnimateIn>
        <HomeRealStoriesSection />
      </AnimateIn>
      <AnimateIn>
        <HomeCtaSection />
      </AnimateIn>
      <AnimateIn>
        <HomeFooterSection />
      </AnimateIn>
    </>
  );
}