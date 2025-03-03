"use client";

import {
  CalendarPlus,
  PieChart,
  DollarSign,
  LineChart,
  Users,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      {/* Header */}
      <header className="relative container mx-auto px-4 py-20">
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
            onClick={() => (window.location.href = "/sign-in")}
          >
            Acessar Sistema
          </Button>
        </div>
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
            Calcule direitos autorais com precisão e simplicidade
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12">
            Software especializado que automatiza seus cálculos de direitos
            autorais de CDs e economiza horas do seu tempo
          </p>
          {/* <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-6"
          >
            Comece Gratuitamente
          </Button> */}
        </div>
      </header>

      {/* Demo Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Veja como é fácil calcular direitos autorais
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Interface intuitiva que permite calcular direitos autorais em
                poucos cliques. Importe seus dados, defina as regras e obtenha
                relatórios detalhados instantaneamente.
              </p>
              <Button
                variant="outline"
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white border-0"
                onClick={() =>
                  window.open(
                    "https://wa.me/5551998664776?text=Olá!%20Gostaria%20de%20agendar%20uma%20demonstração%20do%20software%20de%20cálculo%20de%20direitos%20autorais.",
                    "_blank",
                    "noopener noreferrer"
                  )
                }
              >
                Agende uma Demo pelo WhatsApp
              </Button>
            </div>
            <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=2070"
                alt="CD and DVD Collection"
                width={2070}
                height={400}
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Benefícios que Transformam seu Negócio
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <PieChart className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Precisão Garantida</h3>
              <p className="text-gray-600">
                Elimine erros de cálculo e tenha 100% de precisão nos seus
                relatórios de direitos autorais
              </p>
            </Card>
            <Card className="p-6">
              <CalendarPlus className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Economia de Tempo</h3>
              <p className="text-gray-600">
                Reduza em até 90% o tempo gasto com cálculos manuais e geração
                de relatórios
              </p>
            </Card>
            <Card className="p-6">
              <LineChart className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                Relatórios Detalhados
              </h3>
              <p className="text-gray-600">
                Visualize dados importantes com gráficos e relatórios
                personalizados
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que Escolher Nossa Solução?
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50">
                  <th className="p-4 text-left">Recursos</th>
                  <th className="p-4 text-center">Método Manual</th>
                  <th className="p-4 text-center">Nosso Software</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">Tempo de Cálculo</td>
                  <td className="p-4 text-center">Horas ou Dias</td>
                  <td className="p-4 text-center text-green-500">Minutos</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Precisão</td>
                  <td className="p-4 text-center">Sujeito a Erros</td>
                  <td className="p-4 text-center text-green-500">
                    100% Preciso
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Relatórios Automatizados</td>
                  <td className="p-4 text-center">Não</td>
                  <td className="p-4 text-center text-green-500">Sim</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            O que Nossos Clientes Dizem
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <p className="text-gray-600 mb-4">
                &quot;Reduzimos nosso tempo de processamento de direitos
                autorais de dias para horas. Uma ferramenta indispensável!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold">João Silva</p>
                  <p className="text-sm text-gray-500">Diretor Financeiro</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 mb-4">
                &quot;A precisão e facilidade de uso do software superaram todas
                as nossas expectativas.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold">Maria Santos</p>
                  <p className="text-sm text-gray-500">Gerente de Copyright</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Dúvidas Frequentes
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  Como começar a usar o software?
                </h3>
                <p className="text-gray-600">
                  Basta se cadastrar em nossa plataforma, importar seus dados e
                  começar a usar. Oferecemos suporte completo durante todo o
                  processo.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  O software é seguro?
                </h3>
                <p className="text-gray-600">
                  Sim, utilizamos criptografia de ponta a ponta e seguimos todos
                  os protocolos de segurança necessários para proteger seus
                  dados.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  Posso exportar os relatórios?
                </h3>
                <p className="text-gray-600">
                  Sim, todos os relatórios podem ser exportados em diversos
                  formatos, incluindo PDF e Excel.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  Como é feito o cálculo dos direitos autorais?
                </h3>
                <p className="text-gray-600">
                  Nosso sistema calcula automaticamente os direitos autorais com
                  base nas vendas físicas de CDs e DVDs, aplicando as
                  porcentagens acordadas em contrato para cada artista e
                  editora. Consideramos diferentes tipos de mídia, territórios
                  de distribuição e acordos específicos.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  Como é feito o repasse dos valores?
                </h3>
                <p className="text-gray-600">
                  O processo é transparente: a empresa de mídia registra as
                  vendas, nosso sistema calcula os valores, gera relatórios para
                  a editora, que então efetua o repasse aos artistas conforme os
                  contratos estabelecidos.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  Quais relatórios são disponibilizados?
                </h3>
                <p className="text-gray-600">
                  Fornecemos relatórios detalhados de vendas por produto,
                  território, período, além de demonstrativos de cálculos e
                  repasses para editoras e artistas, tudo em tempo real.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  Como integrar com meu sistema atual?
                </h3>
                <p className="text-gray-600">
                  Oferecemos APIs e ferramentas de importação para integrar
                  facilmente com seus sistemas de gestão de estoque e vendas,
                  garantindo sincronização automática dos dados.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Comece a Otimizar seus Cálculos Hoje
          </h2>
          <p className="text-xl mb-8">
            Junte-se a centenas de empresas que já transformaram sua gestão de
            direitos autorais
          </p>
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-6"
          >
            Vamos conversar ?
          </Button>
          <div className="mt-8 flex justify-center space-x-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              <span>Seja nosso cliente</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              <span>Garantia de 30 dias</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
