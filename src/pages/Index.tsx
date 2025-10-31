import { ParticleBackground } from "@/components/ParticleBackground";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { GamesSection } from "@/components/landing/GamesSection";
import { FeaturedGameSection } from "@/components/landing/FeaturedGameSection";
import { PartyEnergySection } from "@/components/landing/PartyEnergySection";
import { FooterSection } from "@/components/landing/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      
      <HeroSection />
      <HowItWorksSection />
      <GamesSection />
      <FeaturedGameSection />
      <PartyEnergySection />
      <FooterSection />
    </div>
  );
};

export default Index;
