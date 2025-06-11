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

interface RelatorioTXTProps {
  data: ProdutoEditoraItem[];
  periodo: string;
  id_grupo: string;
  filteredData?: ProdutoEditoraItem[];
  empresaData?: any; // Dados da empresa
  apuracaoCurrentData?: any; // Dados da apuracao atual
}

export default function RelatorioTXT({
  data,
  periodo,
  id_grupo,
  filteredData,
  empresaData,
  apuracaoCurrentData,
}: RelatorioTXTProps) {
  // Ordenar os itens por editora e formato (mesma logica do CSV)
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

  // Funcao para formatar numero no padrao brasileiro
  const formatarNumero = (numero: number, decimais: number = 2): string => {
    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: decimais,
      maximumFractionDigits: decimais,
    });
  };

  // Funcao para formatar moeda
  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  // Funcao para alinhar texto
  const alinharTexto = (
    texto: string,
    tamanho: number,
    alinhamento: "left" | "right" | "center" = "left"
  ): string => {
    const textoLimitado = texto.substring(0, tamanho);
    if (alinhamento === "right") {
      return textoLimitado.padStart(tamanho);
    } else if (alinhamento === "center") {
      const espacos = tamanho - textoLimitado.length;
      const espacosEsquerda = Math.floor(espacos / 2);
      const espacosDireita = espacos - espacosEsquerda;
      return (
        " ".repeat(espacosEsquerda) + textoLimitado + " ".repeat(espacosDireita)
      );
    }
    return textoLimitado.padEnd(tamanho);
  };

  // Funcao para criar linha separadora
  const criarLinhaSeparadora = (tamanho: number = 120): string => {
    return "=".repeat(tamanho);
  };

  // Funcao para gerar e baixar o arquivo TXT
  const exportarTXT = () => {
    if (!itensParaExportar || itensParaExportar.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    try {
      // Cabecalho do arquivo com informacoes da empresa e periodo
      const cabecalhoInfo = [
        criarLinhaSeparadora(),
        alinharTexto("RELATÓRIO DE DIREITOS AUTORAIS", 120, "center"),
        criarLinhaSeparadora(),
        "",
        `Empresa: ${empresaData?.nome || "Não informado"}`,
        `CNPJ: ${empresaData?.cpfcnpj || "Não informado"}`,
        `Período: ${
          apuracaoCurrentData
            ? `${format(
                new Date(apuracaoCurrentData.data_inicial),
                "dd/MM/yyyy"
              )} a ${format(
                new Date(apuracaoCurrentData.data_final),
                "dd/MM/yyyy"
              )}`
            : periodo
        }`,
        `Status da Apuração: ${apuracaoCurrentData?.status || "Não informado"}`,
        `Código da Apuração: ${id_grupo}`,
        `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", {
          locale: ptBR,
        })}`,
        "",
        criarLinhaSeparadora(),
        "",
      ].join("\n");

      // Cabecalho das colunas formatado
      const cabecalhoColunas = [
        alinharTexto("Editora", 20),
        alinharTexto("Formato", 10),
        alinharTexto("Cód.Produto", 15),
        alinharTexto("NL", 3, "right"),
        alinharTexto("LD", 3, "right"),
        alinharTexto("NF", 3, "right"),
        alinharTexto("FX", 3, "right"),
        alinharTexto("Mus", 3, "right"),
        alinharTexto("Cód.Obra", 10),
        alinharTexto("Obra", 30),
        alinharTexto("Autores", 20),
        alinharTexto("ISRC", 12),
        alinharTexto("%Editora", 8, "right"),
        alinharTexto("Vendas", 8, "right"),
        alinharTexto("Soma Vendas", 12, "right"),
        alinharTexto("Preço", 12, "right"),
        alinharTexto("%Obra", 8, "right"),
        alinharTexto("Vlr.Pagamento", 15, "right"),
      ].join(" | ");

      const linhaSeparadoraColunas = "-".repeat(cabecalhoColunas.length);

      // Dados das linhas formatados
      const linhas = itensParaExportar.map((item: ProdutoEditoraItem) => {
        return [
          alinharTexto(item.editora, 20),
          alinharTexto(item.formato, 10),
          alinharTexto(item.codigoProduto, 15),
          alinharTexto(String(item.NL || 1), 3, "right"),
          alinharTexto(String(item.LD || 1), 3, "right"),
          alinharTexto(String(item.NF || 0), 3, "right"),
          alinharTexto(String(item.FX || item.codigoFaixa || 0), 3, "right"),
          alinharTexto(String(item.Mus || 1), 3, "right"),
          alinharTexto(item.publisherCode || "", 10),
          alinharTexto(item.obra, 30),
          alinharTexto(item.authors || "Não informado", 20),
          alinharTexto(item.isrc || "", 12),
          alinharTexto(
            formatarNumero(item.percentualEditora) + "%",
            8,
            "right"
          ),
          alinharTexto(String(item.vendas), 8, "right"),
          alinharTexto(formatarMoeda(item.somaVendas), 12, "right"),
          alinharTexto(formatarNumero(item.preco, 6), 12, "right"),
          alinharTexto(formatarNumero(item.percentualObra) + "%", 8, "right"),
          alinharTexto(formatarMoeda(item.valorPagamento), 15, "right"),
        ].join(" | ");
      });

      // Calcular totais por editora
      const totaisPorEditora: { [key: string]: number } = {};
      itensParaExportar.forEach((item: ProdutoEditoraItem) => {
        if (!totaisPorEditora[item.editora]) {
          totaisPorEditora[item.editora] = 0;
        }
        totaisPorEditora[item.editora] += item.valorPagamento;
      });

      // Adicionar secao de totais por editora
      const secaoTotais = [
        "",
        criarLinhaSeparadora(),
        alinharTexto("TOTAIS POR EDITORA", 120, "center"),
        criarLinhaSeparadora(),
        "",
      ];

      Object.entries(totaisPorEditora).forEach(([editora, total]) => {
        secaoTotais.push(
          `${alinharTexto(editora, 50)} ${alinharTexto(
            formatarMoeda(total),
            20,
            "right"
          )}`
        );
      });

      // Total geral
      const totalGeral = Object.values(totaisPorEditora).reduce(
        (acc, val) => acc + val,
        0
      );

      const linhaTotalGeral = [
        "",
        "-".repeat(70),
        `${alinharTexto("TOTAL GERAL", 50)} ${alinharTexto(
          formatarMoeda(totalGeral),
          20,
          "right"
        )}`,
        "-".repeat(70),
      ];

      // Montar o conteudo completo do TXT
      const conteudoTXT = [
        cabecalhoInfo,
        cabecalhoColunas,
        linhaSeparadoraColunas,
        ...linhas,
        "",
        ...secaoTotais,
        ...linhaTotalGeral,
        "",
        criarLinhaSeparadora(),
        alinharTexto(
          `Total de registros: ${itensParaExportar.length}`,
          120,
          "center"
        ),
        criarLinhaSeparadora(),
      ].join("\n");

      // Criar e baixar o arquivo
      const blob = new Blob([conteudoTXT], {
        type: "text/plain;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `relatorio_direitos_autorais_${id_grupo}_${format(
          new Date(),
          "yyyyMMdd_HHmmss"
        )}.txt`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar TXT:", error);
      alert("Erro ao gerar o arquivo TXT. Tente novamente.");
    }
  };

  return (
    <Button variant="outline" onClick={exportarTXT} className="ml-2">
      <Download className="mr-2 h-4 w-4" />
      Exportar TXT
    </Button>
  );
}
