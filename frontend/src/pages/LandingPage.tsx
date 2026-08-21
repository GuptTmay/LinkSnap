import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { CtaCard } from "@/components/landing/CtaCard";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background text-foreground">
      <Navbar />
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center gap-8 md:gap-12">
        <Hero />
        <CtaCard />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
