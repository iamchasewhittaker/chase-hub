import { Hero } from "@/components/Hero";
import { SocialProof } from "@/components/SocialProof";
import { FeedSection } from "@/components/FeedSection";
import { PortfolioSection } from "@/components/PortfolioSection";

export default function Home() {
  return (
    <>
      <Hero />
      <SocialProof />
      <FeedSection />
      <PortfolioSection />
    </>
  );
}
