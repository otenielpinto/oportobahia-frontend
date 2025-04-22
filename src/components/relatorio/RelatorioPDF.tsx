"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { FileOutput } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Componente auxiliar para detectar quebras de página
const PageCounter = ({
  onPageChange,
}: {
  onPageChange: (page: number) => void;
}) => {
  useEffect(() => {
    const handlePageChange = () => {
      // Esta função será chamada quando a página mudar durante a impressão
      if (typeof window !== "undefined" && window.matchMedia) {
        const mediaQueryList = window.matchMedia("print");

        // Quando a impressão começar
        mediaQueryList.addEventListener("change", (mql) => {
          if (mql.matches) {
            // Impressão iniciada
            onPageChange(1);
          }
        });

        return () => {
          mediaQueryList.removeEventListener("change", () => {});
        };
      }
    };

    handlePageChange();

    // Adicionar listener para o evento 'beforeprint'
    if (typeof window !== "undefined") {
      window.addEventListener("beforeprint", () => onPageChange(1));
      return () => {
        window.removeEventListener("beforeprint", () => {});
      };
    }
  }, [onPageChange]);

  return null; // Este componente não renderiza nada
};

interface ProdutoEditoraItem {
  codigoProduto: string;
  formato: string;
  editora: string;
  editoraCompleta?: any; // Dados completos da editora para uso em relatórios
  obra: string;
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

interface RelatorioPDFProps {
  data: ProdutoEditoraItem[];
  periodo: string;
  id_grupo: string;
  filteredData?: ProdutoEditoraItem[];
  empresaData?: any; // Dados da empresa
  apuracaoCurrentData?: any; // Dados da apuração atual
}

export default function RelatorioPDF({
  data,
  periodo,
  id_grupo,
  filteredData,
  empresaData,
  apuracaoCurrentData,
}: RelatorioPDFProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  // Ordenar os itens por editora e formato
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

  // Estados para controlar a paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Função para atualizar a página atual
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Calcular totais
  const totalValor = itensParaExibir.reduce(
    (acc: number, item: ProdutoEditoraItem) => acc + item.valorPagamento,
    0
  );

  // Formatação de valores monetários
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  // Calcular o número total de páginas com base no número de itens
  useEffect(() => {
    // Na primeira página cabem apenas 7 itens devido ao cabeçalho, informações da editora, etc.
    const firstPageItems = 7;
    // Nas páginas seguintes cabem 17 itens por página
    const nextPagesItems = 17;

    let totalItems = itensParaExibir.length;
    let pages = 0;

    // Se há itens, a primeira página é preenchida com até 7 itens
    if (totalItems > 0) {
      pages = 1;
      totalItems = Math.max(0, totalItems - firstPageItems);

      // Páginas adicionais para os itens restantes
      if (totalItems > 0) {
        pages += Math.ceil(totalItems / nextPagesItems);
      }
    }

    setTotalPages(pages > 0 ? pages : 1);
  }, [itensParaExibir]);

  // Atualizar a página atual durante a impressão
  const handlePrint = useReactToPrint({
    documentTitle: `Relatorio_Direitos_Autorais_${id_grupo}`,
    contentRef: componentRef,
    pageStyle: "@page { size: landscape; }",
  });

  // Atualizar a página atual antes de imprimir
  const printWithPageUpdate = () => {
    handlePageChange(1);
    handlePrint();
  };

  return (
    <>
      <Button variant="outline" onClick={printWithPageUpdate} className="ml-2">
        <FileOutput className="mr-2 h-4 w-4" />
        Exportar PDF
      </Button>

      <div style={{ display: "none" }}>
        <PageCounter onPageChange={handlePageChange} />
        <div
          ref={componentRef}
          style={{
            padding: "20px",
            width: "297mm", // A4 landscape width
            height: "210mm", // A4 landscape height
            margin: "0 auto",
            backgroundColor: "white",
          }}
        >
          {/* Cabeçalho do documento */}
          <div
            style={{
              marginBottom: "20px",
              position: "relative",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div style={{ textAlign: "left", flex: "1" }}>
              <h1 style={{ margin: "0", fontSize: "20px" }}>
                {empresaData?.nome || "***"}
              </h1>
              <h2 style={{ margin: "5px 0", fontSize: "15px" }}>
                Direitos Autorais
              </h2>
              <h3 style={{ margin: "5px 0", fontSize: "13px" }}>
                HISTÓRICO:{" "}
                {apuracaoCurrentData
                  ? `${format(
                      new Date(apuracaoCurrentData.data_inicial),
                      "dd/MM/yyyy"
                    )} a ${format(
                      new Date(apuracaoCurrentData.data_final),
                      "dd/MM/yyyy"
                    )}`
                  : periodo}
              </h3>
              <p style={{ margin: "5px 0", fontSize: "11px" }}>
                {empresaData?.nome || "***"} - {empresaData?.rua || "***"},{" "}
                {empresaData?.nro || "***"}, {empresaData?.bairro || "***"},{" "}
                {empresaData?.cidade || "***"}-{empresaData?.uf || "***"}, CEP:{" "}
                {empresaData?.cep || "***"}
              </p>
              <p style={{ margin: "5px 0", fontSize: "11px" }}>
                CNPJ: {empresaData?.cpfcnpj || "***"}{" "}
                {empresaData?.ie
                  ? `INSC ESTADUAL ${empresaData.ie}`
                  : "INSC ESTADUAL ***"}
              </p>
            </div>
            <div
              style={{
                textAlign: "right",
                fontSize: "12px",
                paddingTop: "5px",
                minWidth: "150px",
              }}
            >
              <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
                {format(new Date(), "dd-MMM-yyyy", { locale: ptBR })}
              </p>
              <p style={{ margin: "0", fontWeight: "bold" }}>
                Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>

          <hr style={{ border: "1px solid #000", margin: "10px 0" }} />

          {/* Dados agrupados por editora */}
          {(() => {
            // Agrupar itens por editora e formato
            const editorasAgrupadas: {
              [key: string]: {
                dadosEditora: ProdutoEditoraItem;
                formatosAgrupados: {
                  [key: string]: ProdutoEditoraItem[];
                };
              };
            } = {};

            // Primeiro agrupamos por editora
            itensParaExibir.forEach((item: ProdutoEditoraItem) => {
              if (!editorasAgrupadas[item.editora]) {
                editorasAgrupadas[item.editora] = {
                  dadosEditora: item, // Guardamos o primeiro item para acessar os dados da editora
                  formatosAgrupados: {},
                };
              }

              // Depois agrupamos por formato dentro de cada editora
              if (
                !editorasAgrupadas[item.editora].formatosAgrupados[item.formato]
              ) {
                editorasAgrupadas[item.editora].formatosAgrupados[
                  item.formato
                ] = [];
              }

              editorasAgrupadas[item.editora].formatosAgrupados[
                item.formato
              ].push(item);
            });

            // Renderizar os grupos de editoras
            return Object.entries(editorasAgrupadas).map(
              ([nomeEditora, dadosEditora], editoraIndex) => {
                // Obter o primeiro item para acessar os dados da editora
                const primeiroItem = dadosEditora.dadosEditora;

                return (
                  <div key={`editora-grupo-${editoraIndex}`}>
                    {/* Quebra de página entre grupos de editoras */}
                    {editoraIndex > 0 && (
                      <div
                        className="page-break-before"
                        style={{
                          pageBreakBefore: "always",
                          breakBefore: "page",
                          marginTop: 0,
                          marginBottom: 0,
                          height: 0,
                        }}
                      ></div>
                    )}

                    {/* Card da Editora */}
                    <div
                      style={{
                        marginBottom: "15px",
                        border: "1px solid #ddd",
                        padding: "10px",
                        borderRadius: "5px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ flex: "1" }}>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "bold",
                            }}
                          >
                            {nomeEditora}
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              marginTop: "5px",
                              display: "flex",
                              flexWrap: "wrap",
                            }}
                          >
                            {primeiroItem.editoraCompleta ? (
                              <>
                                {primeiroItem.editoraCompleta.account && (
                                  <>
                                    <div style={{ marginRight: "30px" }}>
                                      {
                                        primeiroItem.editoraCompleta.account
                                          .accountHolderName
                                      }
                                    </div>
                                    <div style={{ marginRight: "30px" }}>
                                      CNPJ:{" "}
                                      {primeiroItem.editoraCompleta.cnpj ||
                                        "Não informado"}
                                      <br />
                                      {
                                        primeiroItem.editoraCompleta.account
                                          .bankName
                                      }{" "}
                                      AG{" "}
                                      {
                                        primeiroItem.editoraCompleta.account
                                          .agency
                                      }{" "}
                                      CC{" "}
                                      {
                                        primeiroItem.editoraCompleta.account
                                          .accountNumber
                                      }
                                      -
                                      {primeiroItem.editoraCompleta.account
                                        .accountDigit || ""}
                                    </div>
                                    {primeiroItem.editoraCompleta.account
                                      .pixKey && (
                                      <div>
                                        PIX:{" "}
                                        {
                                          primeiroItem.editoraCompleta.account
                                            .pixKey
                                        }
                                      </div>
                                    )}
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                <div style={{ marginRight: "30px" }}>
                                  Endereço: ***
                                </div>
                                <div style={{ marginRight: "30px" }}>
                                  CNPJ: ***
                                  <br />
                                  Banco: *** AG: *** CC: ***
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Renderizar cada formato dentro da editora */}
                    {Object.entries(dadosEditora.formatosAgrupados).map(
                      ([nomeFormato, itensFormato], formatoIndex) => {
                        // Calcular o total de pagamentos para este formato
                        const totalPagamentosFormato = itensFormato.reduce(
                          (acc: number, item: ProdutoEditoraItem) =>
                            acc + item.valorPagamento,
                          0
                        );

                        return (
                          <React.Fragment
                            key={`formato-${editoraIndex}-${formatoIndex}`}
                          >
                            {/* Linha de Formato */}
                            <div
                              style={{
                                marginBottom: "10px",
                                borderBottom: "1px solid #000",
                                padding: "3px 0",
                                marginTop: formatoIndex > 0 ? "20px" : "0",
                              }}
                            >
                              <div
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                {nomeFormato || "***"}
                              </div>
                            </div>

                            {/* Tabela de dados para este formato */}
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: "10px",
                                tableLayout: "fixed",
                                marginBottom: "15px",
                              }}
                            >
                              <thead>
                                <tr style={{ backgroundColor: "#f0f0f0" }}>
                                  <th
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px",
                                      textAlign: "left",
                                      width: "110px",
                                    }}
                                  >
                                    Código Produto
                                  </th>
                                  <th
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px 3px",
                                      textAlign: "center",
                                      width: "25px",
                                    }}
                                  >
                                    NL
                                  </th>
                                  <th
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px 3px",
                                      textAlign: "center",
                                      width: "25px",
                                    }}
                                  >
                                    LD
                                  </th>
                                  <th
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px 3px",
                                      textAlign: "center",
                                      width: "25px",
                                    }}
                                  >
                                    NF
                                  </th>
                                  <th
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px 3px",
                                      textAlign: "center",
                                      width: "25px",
                                    }}
                                  >
                                    FX
                                  </th>
                                  <th
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px 3px",
                                      textAlign: "center",
                                      width: "25px",
                                    }}
                                  >
                                    Mus
                                  </th>
                                  <th
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px",
                                      textAlign: "left",
                                    }}
                                  >
                                    Descrição da Obra
                                  </th>
                                  <th
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px",
                                      textAlign: "left",
                                    }}
                                  >
                                    Autores da Obra
                                  </th>

                                  <th
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px 3px",
                                      textAlign: "center",
                                      width: "35px",
                                    }}
                                  >
                                    % Edit.
                                  </th>
                                  <th
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px",
                                      textAlign: "center",
                                      width: "50px",
                                    }}
                                  >
                                    Vendas
                                  </th>
                                  <th
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px",
                                      textAlign: "right",
                                      width: "60px",
                                    }}
                                  >
                                    Preço
                                  </th>
                                  <th
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px 3px",
                                      textAlign: "center",
                                      width: "35px",
                                    }}
                                  >
                                    % Obra
                                  </th>
                                  <th
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px",
                                      textAlign: "right",
                                      width: "70px",
                                    }}
                                  >
                                    Pagamento
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* Itens do formato */}
                                {itensFormato.map(
                                  (item: ProdutoEditoraItem, index: number) => (
                                    <tr
                                      key={`item-${editoraIndex}-${formatoIndex}-${index}`}
                                      style={{
                                        backgroundColor:
                                          index % 2 === 0 ? "#fff" : "#f9f9f9",
                                      }}
                                    >
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "5px",
                                          width: "110px",
                                        }}
                                      >
                                        {item.codigoProduto}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "5px 3px",
                                          textAlign: "center",
                                          width: "25px",
                                        }}
                                      >
                                        {item.NL || 1}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "5px 3px",
                                          textAlign: "center",
                                          width: "25px",
                                        }}
                                      >
                                        {item.LD || 1}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "5px 3px",
                                          textAlign: "center",
                                          width: "25px",
                                        }}
                                      >
                                        {item.NF || 0}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "5px 3px",
                                          textAlign: "center",
                                          width: "25px",
                                        }}
                                      >
                                        {item.FX || item.codigoFaixa || 0}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "5px 3px",
                                          textAlign: "center",
                                          width: "25px",
                                        }}
                                      >
                                        {item.Mus || 1}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "5px",
                                        }}
                                      >
                                        {item.obra}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "5px",
                                        }}
                                      >
                                        {item.authors || "Não informado"}
                                      </td>

                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "5px 3px",
                                          textAlign: "center",
                                          width: "35px",
                                        }}
                                      >
                                        {item.percentualEditora
                                          .toFixed(2)
                                          .replace(".", ",")}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "5px",
                                          textAlign: "center",
                                          width: "50px",
                                        }}
                                      >
                                        {item.vendas}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "5px",
                                          textAlign: "right",
                                          width: "60px",
                                        }}
                                      >
                                        {item.preco
                                          .toFixed(6)
                                          .replace(".", ",")}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "5px 3px",
                                          textAlign: "center",
                                          width: "35px",
                                        }}
                                      >
                                        {item.percentualObra
                                          .toFixed(2)
                                          .replace(".", ",")}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "5px",
                                          textAlign: "right",
                                          width: "70px",
                                        }}
                                      >
                                        {formatarMoeda(item.valorPagamento)}
                                      </td>
                                    </tr>
                                  )
                                )}

                                {/* Subtotal por formato */}
                                <tr style={{ backgroundColor: "#f0f0f0" }}>
                                  <td
                                    colSpan={12}
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px",
                                      textAlign: "right",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Subtotal {nomeFormato}:
                                  </td>
                                  <td
                                    style={{
                                      border: "1px solid #ddd",
                                      padding: "5px",
                                      textAlign: "right",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {formatarMoeda(totalPagamentosFormato)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </React.Fragment>
                        );
                      }
                    )}

                    {/* Total por editora */}
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "10px",
                        tableLayout: "fixed",
                        marginBottom: "15px",
                        marginTop: "20px",
                      }}
                    >
                      <tfoot>
                        <tr
                          style={{
                            backgroundColor: "#e0e0e0",
                            fontWeight: "bold",
                          }}
                        >
                          <td
                            colSpan={12}
                            style={{
                              border: "1px solid #ddd",
                              padding: "8px",
                              textAlign: "right",
                              fontSize: "12px",
                            }}
                          >
                            TOTAL {nomeEditora}:
                          </td>
                          <td
                            style={{
                              border: "1px solid #ddd",
                              padding: "8px",
                              textAlign: "right",
                              fontSize: "12px",
                            }}
                          >
                            {formatarMoeda(
                              Object.values(dadosEditora.formatosAgrupados)
                                .flat()
                                .reduce(
                                  (acc: number, item: ProdutoEditoraItem) =>
                                    acc + item.valorPagamento,
                                  0
                                )
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              }
            );
          })()}

          {/* Tabela de Total Geral */}
          {itensParaExibir.length > 0 && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "11px",
                tableLayout: "fixed",
                marginTop: "30px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#e0e0e0", fontWeight: "bold" }}>
                  <td
                    colSpan={12}
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                      textAlign: "right",
                      fontSize: "14px",
                    }}
                  >
                    TOTAL GERAL:
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                      textAlign: "right",
                      fontSize: "14px",
                    }}
                  >
                    {formatarMoeda(totalValor)}
                  </td>
                </tr>
              </thead>
            </table>
          )}

          {/* Rodapé */}
          <div
            style={{
              marginTop: "20px",
              borderTop: "1px solid #ccc",
              paddingTop: "8px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "9px",
            }}
          >
            <div>
              <p>
                Documento gerado em{" "}
                {format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss")}
              </p>
              {apuracaoCurrentData && (
                <p>
                  Status da apuração:{" "}
                  <strong>{apuracaoCurrentData.status}</strong> | Data de
                  processamento:{" "}
                  {format(
                    new Date(apuracaoCurrentData.data_processamento),
                    "dd/MM/yyyy HH:mm"
                  )}
                </p>
              )}
            </div>
            <div>
              <p>https://catalogo.ogestorpro.com.br/</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
