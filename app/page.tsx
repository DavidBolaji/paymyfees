import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header"
import { CTASection } from "@/components/sections/cta";
import { EarlyAccessSection } from "@/components/sections/early-access";
import { FeaturesSection } from "@/components/sections/features";
import { HeroSection } from "@/components/sections/hero";

export default function Home() {
  return (
    <div className="">
      
        <HeroSection />
        <EarlyAccessSection />
        <FeaturesSection />
        <CTASection />
      
      <Footer />
    </div>
  );
}
