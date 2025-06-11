"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProdutoEditoraItem {
  codigoProduto: string;
  formato: string;
  editora: string;
  editoraCompleta?: any; // Dados completos da editora para uso em relatorios
  obra: string;
  publisherCode?: string; // Codigo da obra
  codigoFaixa: number;
  percentualEditora: number;
  vendas: number;
  somaVendas: number;
  preco: number;
  percentualObra: number;
  valorPagamento: number;
  // Novos campos adicionados
  NL?: number; // Numero de lados
  LD?: number; // Lado
  NF?: number; // Numero de faixas
  FX?: number; // Numero da faixa
  Mus?: number | string; // Indicador de musica
  authors?: string; // Autores da musica
  isrc?: string; // Codigo ISRC da faixa
}

interface RelatorioCSVProps {
  data: ProdutoEditoraItem[];
  periodo: string;
  id_grupo: string;
  filteredData?: ProdutoEditoraItem[];
  empresaData?: any; // Dados da empresa
  apuracaoCurrentData?: any; // Dados da apuracao atual
}

export default function RelatorioCSV({
  data,
  periodo,
  id_grupo,
  filteredData,
  empresaData,
  apuracaoCurrentData,
}: RelatorioCSVProps) {
  // Ordenar os itens por editora e formato (mesma logica do PDF)
  const ordenarPorEditoraEFormato = (itens: ProdutoEditoraItem[]) => {
    return [...itens].sort((a, b) => {
      // Primeiro ordenar por editora
      const comparacaoEditora = a.editora.localeCompare(b.editora);
      if (comparacaoEditora !== 0) return comparacaoEditora;

      // Se a editora for a mesma, ordenar por formato
      const comparacaoFormato = a.formato.localeCompare(b.formato);
      if (comparacaoFormato !== 0) return comparacaoFormato;

      // Se o formato for o mesmo, ordenar por codigo do produto
      const comparacaoProduto = a.codigoProduto.localeCompare(b.codigoProduto);
      if (comparacaoProduto !== 0) return comparacaoProduto;

      // Se o codigo do produto for o mesmo, ordenar por obra
      return a.obra.localeCompare(b.obra);
    });
  };

  // Aplicar a ordenacao aos itens
  const itensParaExportar = ordenarPorEditoraEFormato(filteredData || data);

  // Funcao para escapar caracteres especiais no CSV
  const escaparCSV = (valor: any): string => {
    if (valor == null) return "";

    const str = String(valor);
    // Se contem aspas, virgulas, quebras de linha ou ponto e virgula, envolver em aspas duplas
    if (
      str.includes('"') ||
      str.includes(",") ||
      str.includes("\n") ||
      str.includes(";")
    ) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  // Funcao para formatar numero no padrao americano (ponto como decimal)
  const formatarNumero = (numero: number, decimais: number = 2): string => {
    return numero.toFixed(decimais);
  };

  // Funcao para gerar e baixar o arquivo CSV
  const exportarCSV = () => {
    if (!itensParaExportar || itensParaExportar.length === 0) {
      alert("Nao ha dados para exportar.");
      return;
    }

    try {
      // Cabecalho do arquivo com informacoes da empresa e periodo
      const cabecalhoInfo = [
        `# Relatorio de Direitos Autorais`,
        `# Empresa: ${empresaData?.nome || "Nao informado"}`,
        `# CNPJ: ${empresaData?.cpfcnpj || "Nao informado"}`,
        `# Periodo: ${
          apuracaoCurrentData
            ? `${format(
                new Date(apuracaoCurrentData.data_inicial),
                "dd/MM/yyyy"
              )} a ${format(
                new Date(apuracaoCurrentData.data_final),
                "dd/MM/yyyy"
              )}`
            : periodo || "Período não definido"
        }`,
        `# Status da Apuracao: ${
          apuracaoCurrentData?.status || "Nao informado"
        }`,
        `# Gerado em: ${format(new Date(), "dd/MM/yyyy 'as' HH:mm:ss", {
          locale: ptBR,
        })}`,
        `# Codigo da Apuracao: ${id_grupo}`,
        "",
      ].join("\n");

      // Cabecalho das colunas
      const cabecalhoColunas = [
        "Editora",
        "Formato",
        "Codigo Produto",
        "NL",
        "LD",
        "NF",
        "FX",
        "Mus",
        "Codigo da Obra",
        "Descricao da Obra",
        "Autores da Obra",
        "ISRC",
        "% Editora",
        "Vendas",
        "Soma Vendas",
        "Preco",
        "% Obra",
        "Valor Pagamento",
      ]
        .map(escaparCSV)
        .join(";");

      // Dados das linhas
      const linhas = itensParaExportar.map((item: ProdutoEditoraItem) => {
        return [
          escaparCSV(item.editora),
          escaparCSV(item.formato),
          escaparCSV(item.codigoProduto),
          escaparCSV(item.NL || 1),
          escaparCSV(item.LD || 1),
          escaparCSV(item.NF || 0),
          escaparCSV(item.FX || item.codigoFaixa || 0),
          escaparCSV(item.Mus || 1),
          escaparCSV(item.publisherCode || ""),
          escaparCSV(item.obra),
          escaparCSV(item.authors || "Nao informado"),
          escaparCSV(item.isrc || ""),
          formatarNumero(item.percentualEditora),
          escaparCSV(item.vendas),
          formatarNumero(item.somaVendas),
          formatarNumero(item.preco, 6),
          formatarNumero(item.percentualObra),
          formatarNumero(item.valorPagamento),
        ].join(";");
      });

      // Calcular totais por editora
      const totaisPorEditora: { [key: string]: number } = {};
      itensParaExportar.forEach((item: ProdutoEditoraItem) => {
        if (!totaisPorEditora[item.editora]) {
          totaisPorEditora[item.editora] = 0;
        }
        totaisPorEditora[item.editora] += item.valorPagamento;
      });

      // Adicionar linhas de total por editora
      const linhasTotais: string[] = [];
      Object.entries(totaisPorEditora).forEach(([editora, total]) => {
        linhasTotais.push(
          [
            escaparCSV(`TOTAL ${editora}`),
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            formatarNumero(total),
          ].join(";")
        );
      });

      // Total geral
      const totalGeral = Object.values(totaisPorEditora).reduce(
        (acc, val) => acc + val,
        0
      );
      const linhaTotalGeral = [
        escaparCSV("TOTAL GERAL"),
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        formatarNumero(totalGeral),
      ].join(";");

      // Montar o conteudo completo do CSV
      const conteudoCSV = [
        cabecalhoInfo,
        cabecalhoColunas,
        ...linhas,
        "",
        "# TOTAIS POR EDITORA",
        ...linhasTotais,
        "",
        linhaTotalGeral,
      ].join("\n");

      // Criar e baixar o arquivo
      const blob = new Blob([conteudoCSV], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `relatorio_direitos_autorais_${id_grupo}_${format(
          new Date(),
          "yyyyMMdd_HHmmss"
        )}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar CSV:", error);
      alert("Erro ao gerar o arquivo CSV. Tente novamente.");
    }
  };

  return (
    <Button variant="outline" onClick={exportarCSV} className="ml-2">
      <Download className="mr-2 h-4 w-4" />
      Exportar CSV
    </Button>
  );
}
