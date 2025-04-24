"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  consultarRoyalties,
  registrarPagamentoRoyalties,
} from "@/actions/actApurarRoyalties";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  Download,
  FileText,
  SortAsc,
  SortDesc,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interface para os dados retornados pela função consultarRoyalties
// Usamos tipagem dinâmica (any) para evitar problemas com a estrutura dos dados
// que pode variar dependendo da fonte

export default function RoyaltiesEmAbertoPage() {
  // Estados para filtros e ordenação
  const [filtroEditora, setFiltroEditora] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [filtroReferente, setFiltroReferente] = useState("");
  const [situacao, setSituacao] = useState<string>("Aberto");
  const [ordenacao, setOrdenacao] = useState<string>("dt_vencto");
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<"asc" | "desc">(
    "asc"
  );

  // Estados para o modal de pagamento
  const [isDialogPagamentoOpen, setIsDialogPagamentoOpen] = useState(false);
  const [royaltyParaPagar, setRoyaltyParaPagar] = useState<any>(null);
  const [valorPagamento, setValorPagamento] = useState("");
  const [observacaoPagamento, setObservacaoPagamento] = useState("");
  const [dataPagamento, setDataPagamento] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [resultadoPagamento, setResultadoPagamento] = useState<any>(null);

  // Consulta para obter os dados de royalties com base na situação selecionada
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["royalties-em-aberto", situacao],
    queryFn: async () => {
      return await consultarRoyalties({ situacao });
    },
    enabled: !!situacao, // Só executa a consulta quando a situação estiver definida
  });

  // Não precisamos dos dados da empresa para esta interface

  // Função para formatar valores monetários
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  // Função para formatar datas
  const formatarData = (data: Date | null) => {
    if (!data) return "-";
    return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
  };

  // Função para filtrar os itens
  const filtrarItens = () => {
    if (!data || !data.registros) return [];

    return data.registros.filter((item: any) => {
      const matchEditora = filtroEditora
        ? (item.editora || "")
            .toLowerCase()
            .includes(filtroEditora.toLowerCase())
        : true;
      const matchDocumento = filtroDocumento
        ? (item.documento || "")
            .toLowerCase()
            .includes(filtroDocumento.toLowerCase())
        : true;
      const matchReferente = filtroReferente
        ? (item.referente || "")
            .toLowerCase()
            .includes(filtroReferente.toLowerCase())
        : true;
      return matchEditora && matchDocumento && matchReferente;
    });
  };

  // Função para ordenar os itens
  const ordenarItens = (itens: any[]) => {
    return [...itens].sort((a, b) => {
      let valorA: any = a[ordenacao];
      let valorB: any = b[ordenacao];

      // Para datas, converter para timestamp
      if (valorA instanceof Date && valorB instanceof Date) {
        valorA = valorA.getTime();
        valorB = valorB.getTime();
      }
      // Para strings, usar localeCompare
      else if (typeof valorA === "string" && typeof valorB === "string") {
        return direcaoOrdenacao === "asc"
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      // Para números, usar subtração
      return direcaoOrdenacao === "asc" ? valorA - valorB : valorB - valorA;
    });
  };

  // Calcular totais
  const calcularTotais = () => {
    if (!data || !data.registros)
      return { totalItens: 0, totalValor: 0, totalVencidos: 0 };

    const itens = filtrarItens();
    const totalItens = itens.length;
    const totalValor = itens.reduce(
      (acc: number, item: any) => acc + (item.valor || 0),
      0
    );
    const totalVencidos = itens.filter((item: any) => item.vencido).length;

    return { totalItens, totalValor, totalVencidos };
  };

  const { totalItens, totalValor, totalVencidos } = calcularTotais();

  // Função para exportar os dados para CSV
  const exportarCSV = () => {
    if (!data || !data.registros || data.registros.length === 0) return;

    const itens = filtrarItens();
    const cabecalho = [
      "Editora",
      "Documento",
      "Referente",
      "Data Movimento",
      "Data Vencimento",
      "Valor",
      "Situação",
      "Histórico",
      "Observação",
    ].join(";");

    const linhas = itens.map((item: any) => {
      return [
        item.editora || "",
        item.documento || "",
        item.referente || "",
        formatarData(item.dt_movto),
        formatarData(item.dt_vencto),
        (item.valor || 0).toFixed(2).replace(".", ","),
        item.situacao || "",
        item.historico || "",
        item.observacao || "",
      ].join(";");
    });

    const conteudoCSV = [cabecalho, ...linhas].join("\n");
    const blob = new Blob([conteudoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `royalties-${situacao.toLowerCase()}-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Alternar direção de ordenação
  const alternarOrdenacao = (campo: string) => {
    if (ordenacao === campo) {
      setDirecaoOrdenacao(direcaoOrdenacao === "asc" ? "desc" : "asc");
    } else {
      setOrdenacao(campo);
      setDirecaoOrdenacao("asc");
    }
  };

  // Abrir o modal de pagamento
  const abrirModalPagamento = (item: any) => {
    // Verificar se a situação permite pagamento
    if (item.situacao === "Pago") {
      alert("Royalties com situação 'Pago' não podem receber pagamentos.");
      return;
    }

    setRoyaltyParaPagar(item);
    setValorPagamento(item.valor.toString());
    setObservacaoPagamento("");
    setDataPagamento(format(new Date(), "yyyy-MM-dd"));
    setResultadoPagamento(null);
    setIsDialogPagamentoOpen(true);
  };

  // Processar o pagamento
  const processarPagamento = async () => {
    if (!royaltyParaPagar) return;

    // Verificação adicional para garantir que a situação permite pagamento
    if (royaltyParaPagar.situacao === "Pago") {
      setResultadoPagamento({
        sucesso: false,
        mensagem: "Royalties com situação 'Pago' não podem receber pagamentos.",
      });
      return;
    }

    try {
      setProcessandoPagamento(true);

      // Converter o valor para número
      const valorNumerico = parseFloat(valorPagamento);
      if (isNaN(valorNumerico)) {
        throw new Error("O valor do pagamento deve ser um número válido.");
      }

      // Converter a data para objeto Date
      const dataObj = new Date(dataPagamento);

      // Chamar a função de pagamento
      const resultado = await registrarPagamentoRoyalties({
        id: royaltyParaPagar.id,
        pago: valorNumerico,
        dt_pagto: dataObj,
        observacao: observacaoPagamento,
      });

      setResultadoPagamento(resultado);

      // Atualizar a lista após o pagamento bem-sucedido
      if (resultado.sucesso) {
        setTimeout(() => {
          refetch();
          setIsDialogPagamentoOpen(false);
        }, 2000);
      }
    } catch (error) {
      setResultadoPagamento({
        sucesso: false,
        mensagem:
          error instanceof Error
            ? error.message
            : "Erro ao processar pagamento",
      });
    } finally {
      setProcessandoPagamento(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Royalties
              </CardTitle>
              <CardDescription>
                Consulta de royalties por situação
              </CardDescription>
            </div>
            {data && data.registros && !isLoading && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportarCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar para CSV
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando dados de royalties...</span>
            </div>
          ) : null}

          {isError && (
            <div className="bg-red-50 p-4 rounded-md border border-red-200">
              <p className="text-red-800">
                {error instanceof Error
                  ? error.message
                  : "Erro ao carregar os dados de royalties"}
              </p>
            </div>
          )}

          {/* Removemos a verificação de erro da empresa, pois não estamos mais carregando esses dados */}

          {data && data.registros && !isLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="text-sm text-blue-600 font-medium">
                    Total de Royalties{" "}
                    {situacao === "Todos" ? "" : `(${situacao})`}
                  </div>
                  <div className="text-2xl font-bold">{totalItens}</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-md">
                  <div className="text-sm text-amber-600 font-medium">
                    Royalties Vencidos
                  </div>
                  <div className="text-2xl font-bold">{totalVencidos}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-md">
                  <div className="text-sm text-purple-600 font-medium">
                    Valor Total a Pagar
                  </div>
                  <div className="text-2xl font-bold">
                    {formatarMoeda(totalValor)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Situação</label>
                  <Select
                    value={situacao}
                    onValueChange={(valor) => {
                      setSituacao(valor);
                      // Refetch é chamado automaticamente quando a queryKey muda
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a situação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aberto">Aberto</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                      <SelectItem value="Todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Editora</label>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={filtroEditora}
                      onChange={(e) => setFiltroEditora(e.target.value)}
                      placeholder="Filtrar por editora"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Documento</label>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={filtroDocumento}
                      onChange={(e) => setFiltroDocumento(e.target.value)}
                      placeholder="Filtrar por documento"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Referente</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={filtroReferente}
                      onChange={(e) => setFiltroReferente(e.target.value)}
                      placeholder="Filtrar por referência (ex: 1T2023)"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Ordenar por</label>
                  <Select
                    value={ordenacao}
                    onValueChange={(valor) => setOrdenacao(valor)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um campo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editora">Editora</SelectItem>
                      <SelectItem value="documento">Documento</SelectItem>
                      <SelectItem value="referente">Referente</SelectItem>
                      <SelectItem value="dt_movto">Data Movimento</SelectItem>
                      <SelectItem value="dt_vencto">Data Vencimento</SelectItem>
                      <SelectItem value="valor">Valor</SelectItem>
                      <SelectItem value="diasAteVencimento">
                        Dias até Vencimento
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setDirecaoOrdenacao(
                        direcaoOrdenacao === "asc" ? "desc" : "asc"
                      )
                    }
                  >
                    {direcaoOrdenacao === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => alternarOrdenacao("editora")}
                      >
                        Editora
                        {ordenacao === "editora" && (
                          <span className="ml-1">
                            {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => alternarOrdenacao("documento")}
                      >
                        Documento
                        {ordenacao === "documento" && (
                          <span className="ml-1">
                            {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => alternarOrdenacao("referente")}
                      >
                        Referente
                        {ordenacao === "referente" && (
                          <span className="ml-1">
                            {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => alternarOrdenacao("dt_movto")}
                      >
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          Data Movimento
                          {ordenacao === "dt_movto" && (
                            <span className="ml-1">
                              {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => alternarOrdenacao("dt_vencto")}
                      >
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          Data Vencimento
                          {ordenacao === "dt_vencto" && (
                            <span className="ml-1">
                              {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => alternarOrdenacao("diasAteVencimento")}
                      >
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          Dias até Vencimento
                          {ordenacao === "diasAteVencimento" && (
                            <span className="ml-1">
                              {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => alternarOrdenacao("valor")}
                      >
                        <div className="flex items-center">
                          <DollarSign className="mr-1 h-4 w-4" />
                          Valor
                          {ordenacao === "valor" && (
                            <span className="ml-1">
                              {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordenarItens(filtrarItens()).map(
                      (item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.editora}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {item.documento}
                          </TableCell>
                          <TableCell>{item.referente || "-"}</TableCell>
                          <TableCell>{formatarData(item.dt_movto)}</TableCell>
                          <TableCell>{formatarData(item.dt_vencto)}</TableCell>
                          <TableCell>
                            {item.diasAteVencimento !== null ? (
                              <Badge
                                variant={
                                  item.vencido
                                    ? "destructive"
                                    : item.diasAteVencimento <= 5
                                    ? "outline"
                                    : "secondary"
                                }
                                className={
                                  item.vencido
                                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                                    : item.diasAteVencimento <= 5
                                    ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                    : "bg-green-100 text-green-800 hover:bg-green-100"
                                }
                              >
                                {item.vencido ? (
                                  <>
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    Vencido há{" "}
                                    {Math.abs(item.diasAteVencimento)} dias
                                  </>
                                ) : (
                                  <>
                                    <Clock className="mr-1 h-3 w-3" />
                                    {item.diasAteVencimento} dias
                                  </>
                                )}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>{formatarMoeda(item.valor)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                            >
                              {item.situacao}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Link
                                href={`/relatorio/apuracao-por-produto-editora?id=${
                                  item.id_grupo || ""
                                }&editora=${encodeURIComponent(
                                  item.editora || ""
                                )}`}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-xs"
                                  title="Ver detalhes da apuração por produto e editora"
                                >
                                  Detalhes
                                </Button>
                              </Link>
                              {item.situacao !== "Pago" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                  title="Registrar pagamento"
                                  onClick={() => abrirModalPagamento(item)}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Pagar
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-xs bg-gray-50 text-gray-400 cursor-not-allowed"
                                  title="Pagamento não disponível para esta situação"
                                  disabled
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Pago
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
        {data && data.registros && !isLoading && (
          <CardFooter className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Exibindo {filtrarItens().length} de {data.registros.length}{" "}
                royalties{" "}
                {situacao === "Todos" ? "" : `com situação "${situacao}"`}
              </p>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Modal de Pagamento */}
      <Dialog
        open={isDialogPagamentoOpen}
        onOpenChange={setIsDialogPagamentoOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
              Registrar Pagamento de Royalties
            </DialogTitle>
            <DialogDescription>
              {royaltyParaPagar && (
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Editora:</span>{" "}
                    {royaltyParaPagar.editora}
                  </p>
                  <p>
                    <span className="font-medium">Documento:</span>{" "}
                    {royaltyParaPagar.documento}
                  </p>
                  <p>
                    <span className="font-medium">Referente:</span>{" "}
                    {royaltyParaPagar.referente || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Valor Total:</span>{" "}
                    {formatarMoeda(royaltyParaPagar.valor)}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor do Pagamento</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={valorPagamento}
                onChange={(e) => setValorPagamento(e.target.value)}
                placeholder="Informe o valor do pagamento"
                disabled={processandoPagamento}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data do Pagamento</label>
              <Input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                disabled={processandoPagamento}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observação</label>
              <Input
                type="text"
                value={observacaoPagamento}
                onChange={(e) => setObservacaoPagamento(e.target.value)}
                placeholder="Observações sobre o pagamento"
                disabled={processandoPagamento}
              />
            </div>

            {resultadoPagamento && (
              <div
                className={`p-3 rounded-md ${
                  resultadoPagamento.sucesso
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={
                    resultadoPagamento.sucesso
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  {resultadoPagamento.mensagem}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={processandoPagamento}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={processarPagamento}
              disabled={processandoPagamento}
              className="bg-green-600 hover:bg-green-700"
            >
              {processandoPagamento ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Pagamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
