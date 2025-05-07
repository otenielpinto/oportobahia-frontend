"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth, format, parse, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  consultarApuracoesPorPeriodo,
  excluirApuracao,
  fecharApuracao,
  processarApuracaoFechada,
} from "@/actions/actApurarRoyalties";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  Calendar,
  FileText,
  Trash2,
  CheckCircle,
  LockIcon,
  UnlockIcon,
} from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Interface para tipagem dos dados de apuração
interface Apuracao {
  id: string;
  data_inicial: string | Date;
  data_final: string | Date;
  data_apuracao: string | Date;
  status: string;
  data_fechamento?: string | Date;
}

export default function ConsultaApuracoesPage() {
  // Estado para armazenar as datas de filtro
  const [dataInicial, setDataInicial] = useState<string>(
    format(startOfYear(new Date()), "yyyy-MM-dd")
  );
  const [dataFinal, setDataFinal] = useState<string>(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );

  // Estados para controlar a interface
  const [consultaRealizada, setConsultaRealizada] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [fechando, setFechando] = useState(false);
  const [apuracaoExcluida, setApuracaoExcluida] = useState<any>(null);
  const [apuracaoFechada, setApuracaoFechada] = useState<any>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isAlertFecharOpen, setIsAlertFecharOpen] = useState(false);
  const [apuracaoParaExcluir, setApuracaoParaExcluir] = useState<string>("");
  const [apuracaoParaFechar, setApuracaoParaFechar] = useState<string>("");

  // Configuração da query com React Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["apuracoes", dataInicial, dataFinal],
    queryFn: async () => {
      // Converter strings de data para objetos Date
      const fromDate = parse(dataInicial, "yyyy-MM-dd", new Date());
      const toDate = parse(dataFinal, "yyyy-MM-dd", new Date());

      // Chamar a função de consulta
      return await consultarApuracoesPorPeriodo({
        fromDate,
        toDate,
      });
    },
    enabled: false, // Não executar automaticamente ao montar o componente
  });

  // Função para realizar a consulta
  const handleConsultar = () => {
    setConsultaRealizada(true);
    refetch();
  };

  // Função para limpar os resultados e iniciar uma nova consulta
  const handleNovaConsulta = () => {
    setConsultaRealizada(false);
    setApuracaoExcluida(null);
    setApuracaoFechada(null);
  };

  // Função para abrir o diálogo de confirmação de exclusão
  const confirmarExclusao = (id: string) => {
    setApuracaoParaExcluir(id);
    setIsAlertOpen(true);
  };

  // Função para abrir o diálogo de confirmação de fechamento
  const confirmarFechamento = (id: string) => {
    setApuracaoParaFechar(id);
    setIsAlertFecharOpen(true);
  };

  // Função para fechar uma apuração
  const handleFecharApuracao = async () => {
    if (!apuracaoParaFechar) return;

    setFechando(true);
    try {
      // Primeiro, fechar a apuração
      const resultadoFechamento = await fecharApuracao({
        id: apuracaoParaFechar,
      });

      // Verificar se o fechamento foi bem-sucedido
      if (resultadoFechamento && resultadoFechamento.sucesso) {
        try {
          // Processar a apuração fechada
          const resultadoProcessamento = await processarApuracaoFechada({
            id: apuracaoParaFechar,
          });

          // Atualizar a mensagem com informações sobre o processamento
          setApuracaoFechada({
            ...resultadoFechamento,
            mensagem: `${resultadoFechamento.mensagem} ${resultadoProcessamento.mensagem}`,
            processado: true,
          });
        } catch (errProcessamento) {
          console.error(
            "Erro ao processar apuração fechada:",
            errProcessamento
          );
          // Ainda consideramos o fechamento bem-sucedido, mas informamos sobre o erro no processamento
          setApuracaoFechada({
            ...resultadoFechamento,
            mensagem: `${
              resultadoFechamento.mensagem
            } Porém houve um erro ao processar: ${
              errProcessamento instanceof Error
                ? errProcessamento.message
                : "Erro desconhecido"
            }`,
            processado: false,
          });
        }
      } else {
        // Se o fechamento não foi bem-sucedido, apenas exibir o resultado do fechamento
        setApuracaoFechada(resultadoFechamento);
      }

      setApuracaoExcluida(null); // Limpar mensagem de exclusão se houver
      refetch(); // Atualizar a lista após o fechamento
    } catch (err) {
      console.error("Erro ao fechar apuração:", err);
      alert(err instanceof Error ? err.message : "Erro ao fechar apuração");
    } finally {
      setFechando(false);
      setIsAlertFecharOpen(false);
    }
  };

  // Função para excluir uma apuração
  const handleExcluirApuracao = async () => {
    if (!apuracaoParaExcluir) return;

    setExcluindo(true);
    try {
      const resultado = await excluirApuracao({
        id: apuracaoParaExcluir,
      });
      setApuracaoExcluida(resultado);
      refetch(); // Atualizar a lista após a exclusão
    } catch (err) {
      console.error("Erro ao excluir apuração:", err);
      alert(err instanceof Error ? err.message : "Erro ao excluir apuração");
    } finally {
      setExcluindo(false);
      setIsAlertOpen(false);
    }
  };

  // Função para formatar a data
  const formatarData = (data: string | Date) => {
    return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
  };

  // Função para formatar a data e hora
  const formatarDataHora = (data: string | Date) => {
    return format(new Date(data), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Consulta de Apurações</h1>
        <p className="text-muted-foreground">
          Consulte as apurações de royalties realizadas em um período
          específico.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Consulta</CardTitle>
          <CardDescription>
            Selecione o período para consultar as apurações realizadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  className="flex-1"
                  disabled={isLoading || consultaRealizada}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                  className="flex-1"
                  disabled={isLoading || consultaRealizada}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!consultaRealizada ? (
            <Button
              onClick={handleConsultar}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Consultar Apurações
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleNovaConsulta}
              className="w-full md:w-auto"
            >
              Nova Consulta
            </Button>
          )}
        </CardFooter>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erro na consulta</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {error instanceof Error
                ? error.message
                : "Erro desconhecido ao consultar apurações"}
            </p>
          </CardContent>
        </Card>
      )}

      {apuracaoExcluida && (
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <CheckCircle className="mr-2 h-5 w-5" />
              Apuração Excluída
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">{apuracaoExcluida.mensagem}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Código: {apuracaoExcluida.id}
            </p>
          </CardContent>
        </Card>
      )}

      {apuracaoFechada && (
        <Card className="border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <LockIcon className="mr-2 h-5 w-5" />
              Apuração Fechada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">{apuracaoFechada.mensagem}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Código: {apuracaoFechada.id}
            </p>
            {apuracaoFechada.processado === true && (
              <p className="text-sm text-green-700 mt-2 flex items-center">
                <CheckCircle className="mr-1 h-4 w-4" />
                Processamento de royalties por editora concluído com sucesso.
              </p>
            )}
            {apuracaoFechada.processado === false && (
              <p className="text-sm text-amber-700 mt-2 flex items-center">
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Houve um problema no processamento. Verifique os logs do
                sistema.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {data && !isLoading && consultaRealizada && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Resultados da Consulta
            </CardTitle>
            <CardDescription>
              {data.total === 0
                ? "Nenhuma apuração encontrada no período selecionado."
                : `Foram encontradas ${
                    data.total
                  } apurações no período de ${formatarData(
                    dataInicial
                  )} a ${formatarData(dataFinal)}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.total > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">
                        Código Identificador
                      </TableHead>
                      <TableHead>Período da Apuração</TableHead>
                      <TableHead>Data de Processamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.apuracoes.map((apuracao: Apuracao, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">
                          {apuracao.id}
                        </TableCell>
                        <TableCell>
                          {formatarData(apuracao.data_inicial)} a{" "}
                          {formatarData(apuracao.data_final)}
                        </TableCell>
                        <TableCell>
                          {formatarDataHora(apuracao.data_apuracao)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              apuracao.status === "fechado"
                                ? "secondary"
                                : apuracao.status === "aguardando"
                                ? "outline"
                                : "default"
                            }
                            className={
                              apuracao.status === "fechado"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : apuracao.status === "aguardando"
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                : "bg-green-100 text-green-800 hover:bg-green-100"
                            }
                          >
                            {apuracao.status === "fechado" ? (
                              <>
                                <LockIcon className="mr-1 h-3 w-3" />
                                Fechado
                              </>
                            ) : apuracao.status === "aguardando" ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Aguardando
                              </>
                            ) : (
                              <>
                                <UnlockIcon className="mr-1 h-3 w-3" />
                                Aberto
                              </>
                            )}
                          </Badge>
                          {apuracao.data_fechamento && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Fechado em:{" "}
                              {formatarDataHora(apuracao.data_fechamento)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/relatorio/consulta-apuracoes/${apuracao.id}`}
                            >
                              <Button variant="outline" size="sm">
                                Visualizar Detalhes
                              </Button>
                            </Link>
                            <Link
                              href={`/relatorio/apuracao-por-produto-editora?id=${apuracao.id}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                              >
                                Por Produto/Editora
                              </Button>
                            </Link>

                            {(apuracao.status === "aberto" ||
                              apuracao.status === "aguardando") && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    confirmarFechamento(apuracao.id)
                                  }
                                  disabled={fechando}
                                  title="Fechar apuração"
                                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                                >
                                  {fechando ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <LockIcon className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Fechar</span>
                                </Button>

                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => confirmarExclusao(apuracao.id)}
                                  disabled={excluindo}
                                  title="Excluir apuração"
                                >
                                  {excluindo ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Excluir</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex items-center text-sm text-muted-foreground">
              <Badge variant="outline" className="mr-2">
                {data.total}
              </Badge>
              apurações encontradas
            </div>
          </CardFooter>
        </Card>
      )}
      {/* Dialog de confirmação para excluir apuração */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Apuração</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-2">
                Tem certeza que deseja excluir esta apuração? Esta ação não pode
                ser desfeita.
              </p>
              <p className="text-sm text-muted-foreground">
                Nota: Apenas apurações com status &ldquo;aguardando&rdquo; ou
                &ldquo;aberto&rdquo; podem ser excluídas. Apurações com status
                &ldquo;fechado&rdquo; não podem ser excluídas.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluirApuracao}
              disabled={excluindo}
            >
              {excluindo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação para fechar apuração */}
      <AlertDialog open={isAlertFecharOpen} onOpenChange={setIsAlertFecharOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fechar Apuração</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-2">
                Tem certeza que deseja fechar esta apuração?
              </p>
              <p className="font-medium text-amber-600 mb-2">
                Atenção: Após fechada, a apuração não poderá ser excluída.
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                O fechamento da apuração indica que os dados foram verificados e
                estão prontos para uso em relatórios oficiais.
              </p>
              <p className="text-sm font-medium text-blue-600">
                Após o fechamento, a apuração será automaticamente processada
                para cálculo de royalties por editora.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFecharApuracao}
              disabled={fechando}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {fechando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fechando...
                </>
              ) : (
                "Fechar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
