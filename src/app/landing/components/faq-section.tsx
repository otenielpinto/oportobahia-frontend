"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "O software é adequado para pequenas empresas?",
    answer:
      "Sim! Nossa solução é escalável e funciona perfeitamente para empresas de todos os portes. Se você trabalha com poucos CDs ou com grandes volumes, o software adapta-se às suas necessidades.",
  },
  {
    question: "Quanto tempo leva para implementar o software?",
    answer:
      "A implementação é rápida. Normalmente, em menos de uma semana você já estará utilizando o software completamente. Oferecemos treinamento e suporte durante todo o processo.",
  },
  {
    question: "O software funciona para outros tipos de direitos autorais?",
    answer:
      "Atualmente, nossa especialidade é direitos autorais de CDs. Estamos expandindo para outros formatos musicais em breve. Consulte-nos para saber mais sobre futuras funcionalidades.",
  },
  {
    question: "Há garantia de funcionamento?",
    answer:
      "Oferecemos garantia de 30 dias. Se o software não atender suas expectativas, você pode solicitar o cancelamento sem complicações.",
  },
  {
    question: "Como funciona o suporte técnico?",
    answer:
      "Nosso suporte está disponível via WhatsApp e email. Respondemos em até 24 horas para questões técnicas. Para problemas urgentes, temos atendimento prioritário.",
  },
  {
    question: "Preciso de conhecimento técnico para usar?",
    answer:
      "Não. O software foi desenvolvido para ser intuitivo. Qualquer pessoa familiarizada com processos básicos de computador pode utilizar sem dificuldades.",
  },
  {
    question: "Onde são armazenados os dados?",
    answer:
      "Os dados são armazenados em servidores seguros no Brasil, seguindo todas as normas da LGPD. Sua informação é protegida e confidencial.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 md:py-32 bg-[#181818]">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-lg md:text-xl text-[#B3B3B3] font-light">
            Tire suas dúvidas sobre nosso software
          </p>
        </div>

        {/* FAQ accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-[#282828] rounded-lg border border-[#B3B3B3]/20"
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border-0 px-4"
                >
                  <AccordionTrigger
                    className="text-white hover:text-[#1DB954] transition-colors py-4 font-medium text-left"
                  >
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#B3B3B3] pb-4 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}