import { DownloadSection } from "@/components/DownloadSection";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Nav } from "@/components/Nav";
import { Targets } from "@/components/Targets";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Features />
        <HowItWorks />
        <Targets />
        <DownloadSection />
      </main>
      <Footer />
    </>
  );
}
