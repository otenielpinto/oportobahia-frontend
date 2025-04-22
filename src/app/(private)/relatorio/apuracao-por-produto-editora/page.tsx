"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  agruparApuracoesPorProdutoEditora,
  consultarApuracaoCurrentById,
} from "@/actions/actApurarRoyalties";
import { getEmpresaById } from "@/actions/actEmpresa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  Download,
  FileText,
  SortAsc,
  SortDesc,
  BookOpen,
  FileOutput,
} from "lucide-react";
import RelatorioPDF from "@/components/relatorio/RelatorioPDF";
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
import { useSearchParams } from "next/navigation";

// Interface para os dados retornados pela função agruparApuracoesPorProdutoEditora
interface ProdutoEditoraItem {
  codigoProduto: string;
  formato: string;
  editora: string;
  editoraCompleta?: any; // Dados completos da editora para uso em relatórios
  obra: string;
  codigoFaixa: number;
  percentualEditora: number;
  vendas: number;
  somaVendas: number; // Novo campo igual a somaPrecos
  preco: number;
  percentualObra: number;
  valorPagamento: number;
}

export default function ApuracaoPorProdutoEditoraPage() {
  const searchParams = useSearchParams();
  const id_grupo = searchParams.get("id") || "";

  const [filtroProduto, setFiltroProduto] = useState("");
  const [filtroEditora, setFiltroEditora] = useState("");
  const [filtroObra, setFiltroObra] = useState("");
  const [filtroCodigoFaixa, setFiltroCodigoFaixa] = useState("");
  const [ordenacao, setOrdenacao] = useState<string>("codigoProduto");
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<"asc" | "desc">(
    "asc"
  );

  // Consulta para obter os dados agrupados
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["apuracao-produto-editora", id_grupo],
    queryFn: async () => {
      if (!id_grupo) return [];
      return await agruparApuracoesPorProdutoEditora({
        id_grupo,
      });
    },
    enabled: !!id_grupo,
  });

  // Consulta para obter os dados da empresa com código 1
  const {
    data: empresaData,
    isLoading: empresaLoading,
    error: empresaError,
  } = useQuery({
    queryKey: ["empresa", 1],
    queryFn: async () => {
      try {
        const result = await getEmpresaById(1);
        return result;
      } catch (error) {
        console.error("Erro ao buscar empresa:", error);
        throw error;
      }
    },
  });

  // Consulta para obter os dados da apuração atual pelo id
  const {
    data: apuracaoCurrentData,
    isLoading: apuracaoCurrentLoading,
    error: apuracaoCurrentError,
  } = useQuery({
    queryKey: ["apuracao-current", id_grupo],
    queryFn: async () => {
      if (!id_grupo) return null;
      try {
        const result = await consultarApuracaoCurrentById(id_grupo);
        return result;
      } catch (error) {
        console.error("Erro ao buscar apuração atual:", error);
        throw error;
      }
    },
    enabled: !!id_grupo,
  });

  // Função para formatar valores monetários
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  // Função para formatar percentuais
  const formatarPercentual = (valor: number) => {
    return `${valor.toFixed(2)}%`;
  };

  // Função para filtrar os itens
  const filtrarItens = () => {
    if (!data) return [];

    return data.filter((item: ProdutoEditoraItem) => {
      const matchProduto = filtroProduto
        ? item.codigoProduto.toLowerCase().includes(filtroProduto.toLowerCase())
        : true;
      const matchEditora = filtroEditora
        ? item.editora.toLowerCase().includes(filtroEditora.toLowerCase())
        : true;
      const matchObra = filtroObra
        ? item.obra.toLowerCase().includes(filtroObra.toLowerCase())
        : true;
      const matchCodigoFaixa = filtroCodigoFaixa
        ? item.codigoFaixa.toString().includes(filtroCodigoFaixa)
        : true;
      return matchProduto && matchEditora && matchObra && matchCodigoFaixa;
    });
  };

  // Função para ordenar os itens
  const ordenarItens = (itens: ProdutoEditoraItem[]) => {
    return [...itens].sort((a, b) => {
      let valorA: any = a[ordenacao as keyof ProdutoEditoraItem];
      let valorB: any = b[ordenacao as keyof ProdutoEditoraItem];

      // Para strings, usar localeCompare
      if (typeof valorA === "string" && typeof valorB === "string") {
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
    if (!data) return { totalItens: 0, totalVendas: 0, totalValor: 0 };

    const itens = filtrarItens();
    const totalItens = itens.length;
    const totalVendas = itens.reduce(
      (acc: number, item: ProdutoEditoraItem) => acc + item.vendas,
      0
    );
    const totalValor = itens.reduce(
      (acc: number, item: ProdutoEditoraItem) => acc + item.valorPagamento,
      0
    );

    return { totalItens, totalVendas, totalValor };
  };

  const { totalItens, totalValor } = calcularTotais();

  // Função para exportar os dados para CSV
  const exportarCSV = () => {
    if (!data || data.length === 0) return;

    const itens = filtrarItens();
    const cabecalho = [
      "Código Produto",
      "Formato",
      "Editora",
      "Obra",
      "Código Faixa",
      "% Editora",
      "Vendas",
      "Soma Vendas",
      "Preço",
      "% Obra",
      "Valor Pagamento",
    ].join(";");

    const linhas = itens.map((item: ProdutoEditoraItem) => {
      return [
        item.codigoProduto,
        item.formato,
        item.editora,
        item.obra,
        item.codigoFaixa,
        item.percentualEditora.toFixed(2),
        item.vendas,
        item.somaVendas.toFixed(2).replace(".", ","),
        item.preco.toFixed(6).replace(".", ","),
        item.percentualObra.toFixed(2),
        item.valorPagamento.toFixed(2).replace(".", ","),
      ].join(";");
    });

    const conteudoCSV = [cabecalho, ...linhas].join("\n");
    const blob = new Blob([conteudoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `apuracao-produto-editora-${id_grupo}.csv`);
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
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Apuração por Produto e Editora
          </CardTitle>
          <CardDescription>
            {id_grupo
              ? `Código da Apuração: ${id_grupo}`
              : "Selecione uma apuração para visualizar os dados"}
            {apuracaoCurrentData && (
              <div className="mt-2 text-sm">
                <p>
                  Período:{" "}
                  {new Date(
                    apuracaoCurrentData.data_inicial
                  ).toLocaleDateString("pt-BR")}{" "}
                  a{" "}
                  {new Date(apuracaoCurrentData.data_final).toLocaleDateString(
                    "pt-BR"
                  )}
                </p>
                <p>
                  Status:{" "}
                  <span className="font-semibold">
                    {apuracaoCurrentData.status}
                  </span>
                </p>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!id_grupo && (
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <p className="text-amber-800">
                É necessário selecionar uma apuração para visualizar os dados.
                Volte para a página de consulta de apurações e selecione uma
                apuração.
              </p>
            </div>
          )}

          {(id_grupo && isLoading) ||
          empresaLoading ||
          apuracaoCurrentLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">
                {isLoading
                  ? "Carregando dados da apuração..."
                  : apuracaoCurrentLoading
                  ? "Carregando detalhes da apuração..."
                  : "Carregando dados da empresa..."}
              </span>
            </div>
          ) : null}

          {id_grupo && isError && (
            <div className="bg-red-50 p-4 rounded-md border border-red-200">
              <p className="text-red-800">
                {error instanceof Error
                  ? error.message
                  : "Erro ao carregar os dados da apuração"}
              </p>
            </div>
          )}

          {empresaError && (
            <div className="bg-red-50 p-4 rounded-md border border-red-200 mt-4">
              <p className="text-red-800">
                {empresaError instanceof Error
                  ? empresaError.message
                  : "Erro ao carregar os dados da empresa"}
              </p>
            </div>
          )}

          {apuracaoCurrentError && (
            <div className="bg-red-50 p-4 rounded-md border border-red-200 mt-4">
              <p className="text-red-800">
                {apuracaoCurrentError instanceof Error
                  ? apuracaoCurrentError.message
                  : "Erro ao carregar os detalhes da apuração"}
              </p>
            </div>
          )}

          {id_grupo && data && !isLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="text-sm text-blue-600 font-medium">
                    Total de Itens
                  </div>
                  <div className="text-2xl font-bold">{totalItens}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="text-sm text-green-600 font-medium">
                    Total de Vendas
                  </div>
                  <div className="text-2xl font-bold">-</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-md">
                  <div className="text-sm text-purple-600 font-medium">
                    Valor Total de Pagamentos
                  </div>
                  <div className="text-2xl font-bold">
                    {formatarMoeda(totalValor)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">
                    Código do Produto
                  </label>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={filtroProduto}
                      onChange={(e) => setFiltroProduto(e.target.value)}
                      placeholder="Filtrar por código do produto"
                      className="flex-1"
                    />
                  </div>
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
                  <label className="text-sm font-medium">Obra</label>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={filtroObra}
                      onChange={(e) => setFiltroObra(e.target.value)}
                      placeholder="Filtrar por obra"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Código da Faixa</label>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={filtroCodigoFaixa}
                      onChange={(e) => setFiltroCodigoFaixa(e.target.value)}
                      placeholder="Filtrar por código da faixa"
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
                      <SelectItem value="codigoProduto">
                        Código do Produto
                      </SelectItem>
                      <SelectItem value="editora">Editora</SelectItem>
                      <SelectItem value="obra">Obra</SelectItem>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="somaVendas">Soma Vendas</SelectItem>
                      <SelectItem value="preco">Preço</SelectItem>
                      <SelectItem value="valorPagamento">
                        Valor de Pagamento
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
                        onClick={() => alternarOrdenacao("codigoProduto")}
                      >
                        Código do Produto
                        {ordenacao === "codigoProduto" && (
                          <span className="ml-1">
                            {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead>Formato</TableHead>
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
                        onClick={() => alternarOrdenacao("obra")}
                      >
                        <div className="flex items-center">
                          <BookOpen className="mr-1 h-4 w-4" />
                          Obra
                          {ordenacao === "obra" && (
                            <span className="ml-1">
                              {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => alternarOrdenacao("codigoFaixa")}
                      >
                        Código Faixa
                        {ordenacao === "codigoFaixa" && (
                          <span className="ml-1">
                            {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead>% Editora</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => alternarOrdenacao("vendas")}
                      >
                        Vendas
                        {ordenacao === "vendas" && (
                          <span className="ml-1">
                            {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => alternarOrdenacao("somaVendas")}
                      >
                        Soma Vendas
                        {ordenacao === "somaVendas" && (
                          <span className="ml-1">
                            {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => alternarOrdenacao("preco")}
                      >
                        Preço
                        {ordenacao === "preco" && (
                          <span className="ml-1">
                            {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead>% Obra</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => alternarOrdenacao("valorPagamento")}
                      >
                        Valor Pagamento
                        {ordenacao === "valorPagamento" && (
                          <span className="ml-1">
                            {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordenarItens(filtrarItens()).map(
                      (item: ProdutoEditoraItem, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">
                            {item.codigoProduto}
                          </TableCell>
                          <TableCell>{item.formato}</TableCell>
                          <TableCell>{item.editora}</TableCell>
                          <TableCell
                            className="max-w-[200px] truncate"
                            title={item.obra}
                          >
                            {item.obra}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {item.codigoFaixa}
                          </TableCell>
                          <TableCell>
                            {formatarPercentual(item.percentualEditora)}
                          </TableCell>
                          <TableCell>{item.vendas}</TableCell>
                          <TableCell>
                            {formatarMoeda(item.somaVendas)}
                          </TableCell>
                          <TableCell>{item.preco.toFixed(6)}</TableCell>
                          <TableCell>
                            {formatarPercentual(item.percentualObra)}
                          </TableCell>
                          <TableCell>
                            {formatarMoeda(item.valorPagamento)}
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
        {id_grupo && data && !isLoading && (
          <CardFooter className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Exibindo {filtrarItens().length} de {data.length} itens
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportarCSV}>
                <Download className="mr-2 h-4 w-4" />
                Exportar para CSV
              </Button>
              <RelatorioPDF
                data={data}
                filteredData={filtrarItens()}
                periodo={`${id_grupo}`}
                id_grupo={id_grupo}
                empresaData={empresaData}
                apuracaoCurrentData={apuracaoCurrentData}
              />
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
