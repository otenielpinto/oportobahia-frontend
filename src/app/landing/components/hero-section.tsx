"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function HeroSection() {
  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/5551998664776?text=Olá!%20Gostaria%20de%20agendar%20uma%20demonstração%20do%20software%20de%20cálculo%20de%20direitos%20autorais.",
      "_blank",
      "noopener noreferrer"
    );
  };

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <header className="relative min-h-screen bg-[#121212] flex items-center justify-center overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#181818] via-[#121212] to-[#121212]" />
      
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1DB954]/20 rounded-full blur-[120px]" />
      
      {/* Access button */}
      <div className="absolute top-6 right-6 z-20">
        <Button
          variant="outline"
          className="border-[#B3B3B3]/40 text-[#B3B3B3] hover:bg-[#282828] hover:text-white transition-all"
          onClick={() => (window.location.href = "/sign-in")}
        >
          Acessar Sistema
        </Button>
      </div>

      {/* Hero content - split layout on desktop */}
      <div className="relative z-10 container mx-auto px-4 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Headline + CTA */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Bold headline with strong typography */}
            <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-8 tracking-tight">
              Calcule direitos autorais com{" "}
              <span className="text-[#1DB954]">precisão</span>{" "}
              e{" "}
              <span className="text-[#1DB954]">simplicidade</span>
            </h1>

            {/* Premium subheadline */}
            <p className="text-lg md:text-xl lg:text-2xl text-[#B3B3B3] max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed font-light">
              Software especializado que automatiza seus cálculos de direitos
              autorais de CDs e economiza horas do seu tempo.
            </p>

            {/* Pill CTA - Spotify style */}
            <Button
              size="pill"
              className="bg-[#1DB954] hover:bg-[#1ed760] text-[#121212] font-bold tracking-wide shadow-lg shadow-[#1DB954]/30 transition-all hover:shadow-xl hover:shadow-[#1DB954]/40 hover:scale-105"
              onClick={handleWhatsAppClick}
            >
              Agende uma Demo pelo WhatsApp
            </Button>
          </div>

          {/* Right: Hero image */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-[#1DB954]/10">
              <Image
                src="/images/landing/hero-primary.webp"
                alt="Profissional de música satisfeito usando o software de royalties"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 50vw"
                className="object-cover animate-fade-in"
                priority
                quality={90}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={handleScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-[#B3B3B3] hover:text-[#1DB954] transition-colors cursor-pointer"
        aria-label="Scroll down"
      >
        <ArrowDown className="w-8 h-8 animate-bounce" />
      </button>
    </header>
  );
}