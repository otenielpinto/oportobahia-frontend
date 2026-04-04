"use client";

import { Check, X } from "lucide-react";

const comparisonData = [
  {
    feature: "Velocidade de cálculo",
    manual: "Horas ou dias",
    software: "Minutos",
    softwareBetter: true,
  },
  {
    feature: "Precisão dos resultados",
    manual: "Risco de erros",
    software: "100% preciso",
    softwareBetter: true,
  },
  {
    feature: "Atualização de regulamentações",
    manual: "Manual e demorada",
    software: "Automática",
    softwareBetter: true,
  },
  {
    feature: "Exportação de relatórios",
    manual: "Formato limitado",
    software: "PDF completo",
    softwareBetter: true,
  },
  {
    feature: "Custo operacional",
    manual: "Alto (tempo manual)",
    software: "Reduzido drasticamente",
    softwareBetter: true,
  },
  {
    feature: "Rastreabilidade",
    manual: "Difícil",
    software: "Total",
    softwareBetter: true,
  },
];

export function ComparisonSection() {
  return (
    <section className="py-20 md:py-32 bg-[#121212]">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Manual vs Software
          </h2>
          <p className="text-lg md:text-xl text-[#B3B3B3] font-light">
            Veja a diferença na prática
          </p>
        </div>

        {/* Comparison table */}
        <div className="max-w-4xl mx-auto overflow-hidden rounded-lg border border-[#B3B3B3]/20">
          {/* Table header */}
          <div className="grid grid-cols-3 bg-[#181818] p-4 border-b border-[#B3B3B3]/20">
            <div className="text-left">
              <span className="text-[#B3B3B3] text-sm font-medium">Aspecto</span>
            </div>
            <div className="text-center">
              <span className="text-[#B3B3B3] text-sm font-medium">Manual</span>
            </div>
            <div className="text-center">
              <span className="text-[#1DB954] text-sm font-semibold">Software</span>
            </div>
          </div>

          {/* Table rows */}
          {comparisonData.map((row, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 p-4 border-b border-[#B3B3B3]/10 last:border-0 ${
                index % 2 === 0 ? "bg-[#181818]" : "bg-[#282828]"
              }`}
            >
              {/* Feature name */}
              <div className="text-left">
                <span className="text-white text-sm font-medium">
                  {row.feature}
                </span>
              </div>

              {/* Manual value */}
              <div className="text-center flex items-center justify-center gap-2">
                <X className="w-4 h-4 text-[#B3B3B3]/60" strokeWidth={2} />
                <span className="text-[#B3B3B3] text-sm">{row.manual}</span>
              </div>

              {/* Software value */}
              <div className="text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-[#1DB954]" strokeWidth={2} />
                <span className="text-[#1DB954] text-sm font-medium">
                  {row.software}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-[#B3B3B3] text-sm italic">
            * Resultados baseados em clientes que migraram de processos manuais
          </p>
        </div>
      </div>
    </section>
  );
}