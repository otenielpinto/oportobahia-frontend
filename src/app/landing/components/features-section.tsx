"use client";

import { Calculator, Clock, Shield, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  thumbnail: string;
  thumbnailAlt: string;
}

const features: Feature[] = [
  {
    icon: Calculator,
    title: "Cálculos Automatizados",
    description:
      "Automatize seus cálculos de direitos autorais com precisão. Elimine erros manuais e garanta resultados consistentes.",
    thumbnail: "/images/landing/feature-dashboards.webp",
    thumbnailAlt: "Executivo visualizando dashboard de analytics",
  },
  {
    icon: Clock,
    title: "Economia de Tempo",
    description:
      "Reduza horas de trabalho manual para minutos. O software processa seus dados instantaneamente.",
    thumbnail: "/images/landing/feature-reports.webp",
    thumbnailAlt: "Profissional revisando relatório em tablet",
  },
  {
    icon: Shield,
    title: "Conformidade Garantida",
    description:
      "Mantenha-se em conformidade com as regulamentações. O software é atualizado regularmente.",
    thumbnail: "/images/landing/feature-erp.webp",
    thumbnailAlt: "Gerente de operações com sistemas integrados",
  },
  {
    icon: TrendingUp,
    title: "Relatórios Detalhados",
    description:
      "Visualize seus dados com relatórios claros e detalhados. Exporte para PDF com facilidade.",
    thumbnail: "/images/landing/feature-royalties.webp",
    thumbnailAlt: "Artista celebrando ganhos de royalties",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-[#181818]">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Por que escolher nosso software?
          </h2>
          <p className="text-lg md:text-xl text-[#B3B3B3] font-light">
            Soluções modernas para desafios antigos
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-[#282828] rounded-lg border border-[#B3B3B3]/10 hover:border-[#1DB954]/30 transition-all duration-300"
            >
              {/* Thumbnail - Debug version with explicit dimensions */}
              <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-[#121212]">
                <img
                  src={feature.thumbnail}
                  alt={feature.thumbnailAlt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  width={400}
                  height={300}
                />
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-[#181818] flex items-center justify-center mb-4 group-hover:bg-[#1DB954]/10 transition-colors">
                <feature.icon
                  className="w-6 h-6 text-[#1DB954]"
                  strokeWidth={1.5}
                />
              </div>

              {/* Title */}
              <h3 className="font-sans text-lg font-semibold text-white mb-2 tracking-tight">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#B3B3B3] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}