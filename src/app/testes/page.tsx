"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TestesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Testes de Funcionalidades</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Testes de Infraestrutura</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Conexão MongoDB</CardTitle>
              <CardDescription>
                Verifica se a conexão com o MongoDB está funcionando
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Este teste verifica se a conexão com o MongoDB está configurada
                corretamente e lista as coleções disponíveis.
              </p>
              <Link
                href="/test-mongo"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Acessar Teste
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Testes de Funcionalidades
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Teste Básico de Notas Fiscais</CardTitle>
              <CardDescription>
                Teste simples da função getNotasFiscaisPorPeriodo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Este teste executa a função getNotasFiscaisPorPeriodo com
                parâmetros básicos para verificar se está funcionando
                corretamente.
              </p>
              <Link
                href="/test-nota-fiscal"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Acessar Teste
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teste Avançado de Notas Fiscais</CardTitle>
              <CardDescription>
                Teste com parâmetros personalizáveis para
                getNotasFiscaisPorPeriodo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Este teste permite personalizar os parâmetros de data, página e
                limite para testar a função getNotasFiscaisPorPeriodo em
                diferentes cenários.
              </p>
              <Link
                href="/test-nota-fiscal-avancado"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Acessar Teste
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teste de Apuração de Royalties</CardTitle>
              <CardDescription>
                Teste da função de apuração de royalties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Este teste executa a função de apuração de royalties, que
                internamente utiliza a função getNotasFiscaisPorPeriodo para
                obter os dados necessários.
              </p>
              <Link
                href="/test-apuracao-royalties"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Acessar Teste
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
