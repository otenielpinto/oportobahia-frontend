"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  consultarRoyaltiesEmAberto,
  consultarRoyaltiesPorEditora,
} from "@/actions/actApurarRoyalties";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
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

// Interface para os dados retornados pela função consultarRoyaltiesEmAberto
// Usamos tipagem dinâmica (any) para evitar problemas com a estrutura dos dados
// que pode variar dependendo da fonte

export default function RoyaltiesEmAbertoPage() {
  // Estados para filtros e ordenação
  const [filtroEditora, setFiltroEditora] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [filtroReferente, setFiltroReferente] = useState("");
  const [ordenacao, setOrdenacao] = useState<string>("dt_vencto");
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<"asc" | "desc">(
    "asc"
  );

  // Consulta para obter os dados de royalties em aberto
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["royalties-em-aberto"],
    queryFn: async () => {
      return await consultarRoyaltiesEmAberto();
    },
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
      `royalties-em-aberto-${format(new Date(), "yyyy-MM-dd")}.csv`
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Royalties em Aberto
              </CardTitle>
              <CardDescription>
                Consulta de todos os royalties com situação &#39;Aberto&#39;
                para pagamento
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
                    Total de Royalties em Aberto
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
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                title="Ver detalhes"
                              >
                                Detalhes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                title="Registrar pagamento"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Pagar
                              </Button>
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
                royalties em aberto
              </p>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
