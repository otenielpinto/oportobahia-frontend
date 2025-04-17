"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { startOfMonth, format, parse } from "date-fns";
import {
  iniciarApuracao,
  consultarApuracoesPorPeriodo,
} from "@/actions/actApurarRoyalties";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DireitosAutoraisPage() {
  const [dataInicial, setDataInicial] = useState<string>(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [dataFinal, setDataFinal] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [resultado, setResultado] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processado, setProcessado] = useState(false);
  const [apuracoesAnteriores, setApuracoesAnteriores] = useState<any>(null);
  const [consultando, setConsultando] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const resetarApuracao = () => {
    setProcessado(false);
    setResultado(null);
    setError(null);
  };

  const consultarApuracoes = async () => {
    setConsultando(true);
    try {
      // Converter strings de data para objetos Date
      const fromDate = parse(dataInicial, "yyyy-MM-dd", new Date());
      const toDate = parse(dataFinal, "yyyy-MM-dd", new Date());

      // Consultar apurações no período
      const result = await consultarApuracoesPorPeriodo({
        fromDate,
        toDate,
      });

      setApuracoesAnteriores(result);
    } catch (err) {
      console.error("Erro ao consultar apurações:", err);
    } finally {
      setConsultando(false);
    }
  };

  // Função para abrir o diálogo de confirmação
  const confirmarProcessamento = () => {
    setIsDialogOpen(true);
  };

  // Função para processar a apuração após confirmação
  const handlePesquisar = async () => {
    setIsLoading(true);
    setError(null);
    setIsDialogOpen(false);

    try {
      // Converter strings de data para objetos Date
      const fromDate = parse(dataInicial, "yyyy-MM-dd", new Date());
      const toDate = parse(dataFinal, "yyyy-MM-dd", new Date());

      // Ajustar horas para garantir que o dia inteiro seja considerado
      fromDate.setUTCHours(3, 0, 0, 0);
      toDate.setUTCHours(23, 59, 59, 999);

      // Chamar a função de apuração de royalties
      const result = await iniciarApuracao({
        fromDate,
        toDate,
      });

      // Armazenar o resultado
      setResultado(result);
      setProcessado(true);
      console.log("Resultado da apuração:", result);
    } catch (err) {
      console.error("Erro ao processar apuração de royalties:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Apuração de Direitos Autorais</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm">Data Inicial</label>
          <Input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="rounded-md border"
            aria-label="Selecionar data inicial"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Data Final</label>
          <Input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="rounded-md border"
            aria-label="Selecionar data final"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={confirmarProcessamento}
          disabled={isLoading || processado}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Processar Apuração
        </Button>
        {processado && (
          <Button variant="outline" onClick={resetarApuracao}>
            Nova Apuração
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={consultarApuracoes}
          disabled={consultando}
        >
          {consultando ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Consultar Apurações
        </Button>
      </div>

      {/* Diálogo de confirmação */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              Confirmar Processamento
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-3">
                <p className="font-medium text-amber-800 mb-1">
                  Período selecionado:
                </p>
                <p className="text-amber-700">
                  De:{" "}
                  <span className="font-semibold">
                    {format(
                      parse(dataInicial, "yyyy-MM-dd", new Date()),
                      "dd/MM/yyyy"
                    )}
                  </span>
                </p>
                <p className="text-amber-700">
                  Até:{" "}
                  <span className="font-semibold">
                    {format(
                      parse(dataFinal, "yyyy-MM-dd", new Date()),
                      "dd/MM/yyyy"
                    )}
                  </span>
                </p>
              </div>
              <p className="mb-2">
                O relatório será processado através de uma fila e poderá demorar
                até 15 minutos para ser concluído.
              </p>
              <p className="mb-2">
                Durante este período, o sistema estará processando os dados e
                calculando os royalties para cada item.
              </p>
              <p>Deseja continuar com o processamento?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePesquisar}>
              Sim, processar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Erro:</h2>
          <p>{error}</p>
        </div>
      ) : resultado ? (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Resultado da Apuração:</h2>

          <div className="bg-gray-100 p-4 rounded">
            <p>
              <strong>Código Identificador:</strong> {resultado.id}
            </p>
            <p>
              <strong>Total de Itens:</strong> {resultado.total_itens}
            </p>
            <p>
              <strong>Data Inicial:</strong>{" "}
              {format(new Date(resultado.data_inicial), "dd/MM/yyyy")}
            </p>
            <p>
              <strong>Data Final:</strong>{" "}
              {format(new Date(resultado.data_final), "dd/MM/yyyy")}
            </p>
          </div>

          <div className="mt-4">
            <pre className="text-xs p-4 bg-gray-100 rounded overflow-auto max-h-60">
              {JSON.stringify(resultado, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}

      {apuracoesAnteriores && !isLoading && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Apurações Anteriores:</h2>

          {apuracoesAnteriores.total === 0 ? (
            <p className="text-gray-500">
              Nenhuma apuração encontrada no período selecionado.
            </p>
          ) : (
            <div className="bg-gray-100 p-4 rounded">
              <p className="mb-2">
                <strong>Total de apurações:</strong> {apuracoesAnteriores.total}
              </p>

              <div className="space-y-4 mt-4">
                {apuracoesAnteriores.apuracoes.map(
                  (apuracao: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded shadow-sm">
                      <p>
                        <strong>Código:</strong> {apuracao.id}
                      </p>
                      <p>
                        <strong>Período:</strong>{" "}
                        {format(new Date(apuracao.data_inicial), "dd/MM/yyyy")}{" "}
                        a {format(new Date(apuracao.data_final), "dd/MM/yyyy")}
                      </p>
                      <p>
                        <strong>Data da apuração:</strong>{" "}
                        {format(
                          new Date(apuracao.data_apuracao),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </p>
                      <p>
                        <strong>Status:</strong> {apuracao?.status}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
