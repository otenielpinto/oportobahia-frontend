"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { reportToExcel } from "@/lib/reportToExcel";
import { format } from "date-fns";

interface ProdutoEditoraItem {
  codigoProduto: string;
  formato: string;
  editora: string;
  editoraCompleta?: any; // Dados completos da editora para uso em relatórios
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
  NL?: number; // Número de lados
  LD?: number; // Lado
  NF?: number; // Número de faixas
  FX?: number; // Número da faixa
  Mus?: number | string; // Indicador de música
  authors?: string; // Autores da música
  isrc?: string; // Código ISRC da faixa
}

interface RelatorioExcelProps {
  data: ProdutoEditoraItem[];
  periodo: string;
  id_grupo: string;
  filteredData?: ProdutoEditoraItem[];
  empresaData?: any; // Dados da empresa
  apuracaoCurrentData?: any; // Dados da apuração atual
}

export default function RelatorioExcel({
  data,
  periodo,
  id_grupo,
  filteredData,
  empresaData,
  apuracaoCurrentData,
}: RelatorioExcelProps) {
  // Ordenar os itens por editora e formato (mesma lógica do PDF)
  const ordenarPorEditoraEFormato = (itens: ProdutoEditoraItem[]) => {
    return [...itens].sort((a, b) => {
      // Primeiro ordenar por editora
      const comparacaoEditora = a.editora.localeCompare(b.editora);
      if (comparacaoEditora !== 0) return comparacaoEditora;

      // Se a editora for a mesma, ordenar por formato
      const comparacaoFormato = a.formato.localeCompare(b.formato);
      if (comparacaoFormato !== 0) return comparacaoFormato;

      // Se o formato for o mesmo, ordenar por código do produto
      const comparacaoProduto = a.codigoProduto.localeCompare(b.codigoProduto);
      if (comparacaoProduto !== 0) return comparacaoProduto;

      // Se o código do produto for o mesmo, ordenar por obra
      return a.obra.localeCompare(b.obra);
    });
  };

  // Aplicar a ordenação aos itens
  const itensParaExibir = ordenarPorEditoraEFormato(filteredData || data);

  // Definir as colunas para o Excel
  const columns = [
    { header: "Editora", key: "editora", width: 20 },
    { header: "Formato", key: "formato", width: 12 },
    { header: "Cod Produto", key: "codigoProduto", width: 15 },
    { header: "NL", key: "NL", width: 5 },
    { header: "LD", key: "LD", width: 5 },
    { header: "NF", key: "NF", width: 5 },
    { header: "FX", key: "FX", width: 5 },
    { header: "Mus", key: "Mus", width: 5 },
    { header: "Codigo da Obra", key: "publisherCode", width: 12 },
    { header: "Descrição da Obra", key: "obra", width: 30 },
    { header: "Autores", key: "authors", width: 25 },
    { header: "ISRC", key: "isrc", width: 15 },
    { header: "Perc Editora", key: "percentualEditora", width: 10 },
    { header: "Vendas", key: "vendas", width: 10 },
    { header: "Total Vendas", key: "somaVendas", width: 10 },
    { header: "Preço", key: "preco", width: 12 },
    { header: "Perc Obra", key: "percentualObra", width: 10 },
    { header: "Valor Pagamento", key: "valorPagamento", width: 15 },
  ];

  // Preparar os dados para o Excel
  const prepararDadosParaExcel = () => {
    return itensParaExibir.map((item) => ({
      editora: item.editora,
      formato: item.formato,
      codigoProduto: item.codigoProduto || "",
      NL: item.NL || 1,
      LD: item.LD || 1,
      NF: item.NF || 0,
      FX: item.FX || item.codigoFaixa || 0,
      Mus: item.Mus || 1,
      publisherCode: item.publisherCode || "",
      obra: item.obra,
      authors: item.authors || "Não informado",
      isrc: item.isrc || "",
      percentualEditora: item.percentualEditora || 0,
      vendas: item.vendas || 0,
      somaVendas: item.somaVendas || 0,
      preco: item.preco || 0,
      percentualObra: item.percentualObra || 0,
      valorPagamento: item.valorPagamento || 0,
    }));
  };

  // Função para validar e formatar data de forma segura
  const formatarDataSegura = (data: any): string | null => {
    if (!data) return null;

    try {
      const dataObj = new Date(data);
      // Verificar se a data é válida
      if (isNaN(dataObj.getTime())) return null;
      return format(dataObj, "dd-MM-yyyy");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return null;
    }
  };

  // Função para realizar o download
  const handleDownload = () => {
    const dadosParaExcel = prepararDadosParaExcel();

    // Nome do arquivo com data e período
    const dataAtual = format(new Date(), "yyyy-MM-dd");
    const fileName = `Relatorio_Direitos_Autorais_${
      id_grupo || "unknown"
    }_${dataAtual}`;

    // Período para o nome da planilha - com validações mais robustas
    let periodoFormatado = "periodo_nao_definido";

    if (apuracaoCurrentData?.data_inicial && apuracaoCurrentData?.data_final) {
      const dataInicialFormatada = formatarDataSegura(
        apuracaoCurrentData.data_inicial
      );
      const dataFinalFormatada = formatarDataSegura(
        apuracaoCurrentData.data_final
      );

      if (dataInicialFormatada && dataFinalFormatada) {
        periodoFormatado = `${dataInicialFormatada}_a_${dataFinalFormatada}`;
      }
    } else if (
      periodo &&
      typeof periodo === "string" &&
      periodo.trim() !== ""
    ) {
      periodoFormatado = periodo.replace(/[\/\s]/g, "_");
    }

    const sheetName = `Direitos_Autorais_${periodoFormatado}`;

    reportToExcel({
      data: dadosParaExcel,
      columns: columns,
      sheetName: sheetName,
      fileName: fileName,
    });
  };

  return (
    <Button variant="outline" onClick={handleDownload} className="ml-2">
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      Exportar Excel
    </Button>
  );
}
