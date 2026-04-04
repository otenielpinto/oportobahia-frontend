"use client";

import { Button } from "@/components/ui/button";
import { Users, ShieldCheck } from "lucide-react";

export function CTASection() {
  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/5551998664776?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20software%20de%20cálculo%20de%20direitos%20autorais.",
      "_blank",
      "noopener noreferrer"
    );
  };

  return (
    <section className="py-20 md:py-32 bg-[#121212] relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1DB954]/20 via-[#121212] to-[#121212]" />

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#1DB954]/10 rounded-full blur-[100px]" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Strong headline */}
          <h2 className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            Comece a Otimizar seus Cálculos Hoje
          </h2>

          {/* Premium subheadline */}
          <p className="text-lg md:text-xl text-[#B3B3B3] mb-10 leading-relaxed font-light">
            Junte-se a centenas de empresas que já transformaram sua gestão de
            direitos autorais
          </p>

          {/* Pill CTA */}
          <Button
            size="pill"
            className="bg-[#1DB954] hover:bg-[#1ed760] text-[#121212] font-bold tracking-wide shadow-lg shadow-[#1DB954]/30 transition-all hover:shadow-xl hover:shadow-[#1DB954]/40 hover:scale-105 mb-12"
            onClick={handleWhatsAppClick}
          >
            Vamos Conversar
          </Button>

          {/* Trust indicators */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-[#B3B3B3]">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm">Centenas de clientes satisfeitos</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1DB954]" strokeWidth={1.5} />
              <span className="text-sm">Garantia de 30 dias</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}