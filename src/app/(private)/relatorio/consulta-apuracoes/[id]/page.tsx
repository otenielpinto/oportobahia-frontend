"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// import { format } from "date-fns";
// import { ptBR } from "date-fns/locale";
import { obterResultadosApuracao } from "@/actions/actApurarRoyalties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  ArrowLeft,
  FileText,
  Search,
  Music,
  BarChart3,
  Download,
  BookOpen,
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
// import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function DetalhesApuracaoPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const [filtroBarcode, setFiltroBarcode] = useState("");
  const [filtroDescricao, setFiltroDescricao] = useState("");

  // Consulta para obter os dados da apuração
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["apuracao-detalhes", id],
    queryFn: async () => {
      return await obterResultadosApuracao({
        id_grupo: id,
      });
    },
  });

  // Função para formatar valores monetários
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  // Função para formatar a data - será usada em implementações futuras
  // const formatarData = (data: string | Date) => {
  //   return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
  // };

  // Função para filtrar os itens da apuração
  const filtrarItens = () => {
    if (!data) return [];

    return data.filter((item: any) => {
      const matchBarcode = filtroBarcode
        ? item.barcode?.toLowerCase().includes(filtroBarcode.toLowerCase())
        : true;
      const matchDescricao = filtroDescricao
        ? item.descricao?.toLowerCase().includes(filtroDescricao.toLowerCase())
        : true;
      return matchBarcode && matchDescricao;
    });
  };

  // Calcular totais
  const calcularTotais = () => {
    if (!data) return { totalItens: 0, totalValor: 0, totalRoyalties: 0 };

    const itens = filtrarItens();
    const totalItens = itens.length;
    const totalValor = itens.reduce(
      (acc: number, item: any) => acc + (item.valor_liquido || 0),
      0
    );
    const totalRoyalties = itens.reduce(
      (acc: number, item: any) => acc + (item.valorRoyalties || 0),
      0
    );

    return { totalItens, totalValor, totalRoyalties };
  };

  const { totalItens, totalValor, totalRoyalties } = calcularTotais();

  // Agrupar por artista
  const agruparPorArtista = () => {
    if (!data) return [];

    const itens = filtrarItens();
    const grupos: Record<string, any> = {};

    itens.forEach((item: any) => {
      const artista = item.catalogo?.artist || "Sem Artista";
      if (!grupos[artista]) {
        grupos[artista] = {
          artista,
          totalItens: 0,
          totalValor: 0,
          totalRoyalties: 0,
          itens: [],
        };
      }

      grupos[artista].totalItens += 1;
      grupos[artista].totalValor += item.valor_liquido || 0;
      grupos[artista].totalRoyalties += item.valorRoyalties || 0;
      grupos[artista].itens.push(item);
    });

    return Object.values(grupos).sort((a: any, b: any) =>
      a.artista.localeCompare(b.artista)
    );
  };

  // Agrupar por editora
  const agruparPorEditora = () => {
    if (!data) return [];

    const itens = filtrarItens();
    const grupos: Record<string, any> = {};

    itens.forEach((item: any) => {
      // Processar publishers das faixas principais
      if (item.catalogo?.tracks && Array.isArray(item.catalogo.tracks)) {
        item.catalogo.tracks.forEach((track: any) => {
          if (track.publishers && Array.isArray(track.publishers)) {
            track.publishers.forEach((publisher: any) => {
              const nomeEditora = publisher.name || "Editora Desconhecida";

              if (!grupos[nomeEditora]) {
                grupos[nomeEditora] = {
                  editora: nomeEditora,
                  totalItens: 0,
                  totalRoyalties: 0,
                  itens: [],
                };
              }

              // Calcular valor de royalties com base na porcentagem de participação
              const valorRoyaltiesPorFaixa = item.valorRoyaltiesPorFaixa || 0;
              const participacao = publisher.participationPercentage || 100;
              const valorRoyaltiesEditora =
                (valorRoyaltiesPorFaixa * participacao) / 100;

              // Adicionar informações ao grupo
              if (!grupos[nomeEditora].itens.includes(item)) {
                grupos[nomeEditora].totalItens += 1;
                // Não somamos o valor líquido para editoras
                grupos[nomeEditora].itens.push({
                  ...item,
                  editora: nomeEditora,
                  valorRoyaltiesEditora,
                  participacao,
                  track: track.work || "",
                });
              }

              grupos[nomeEditora].totalRoyalties += valorRoyaltiesEditora;
            });
          }
        });
      }

      // Processar publishers das subFaixas
      if (item.catalogo?.tracks && Array.isArray(item.catalogo.tracks)) {
        item.catalogo.tracks.forEach((track: any) => {
          if (track.subTracks && Array.isArray(track.subTracks)) {
            track.subTracks.forEach((subTrack: any) => {
              if (subTrack.publishers && Array.isArray(subTrack.publishers)) {
                subTrack.publishers.forEach((publisher: any) => {
                  const nomeEditora = publisher.name || "Editora Desconhecida";

                  if (!grupos[nomeEditora]) {
                    grupos[nomeEditora] = {
                      editora: nomeEditora,
                      totalItens: 0,
                      totalRoyalties: 0,
                      itens: [],
                    };
                  }

                  // Calcular valor de royalties com base na porcentagem de participação
                  const valorRoyaltiesPorFaixa =
                    item.valorRoyaltiesPorFaixa || 0;
                  const participacao = publisher.participationPercentage || 100;
                  const valorRoyaltiesEditora =
                    (valorRoyaltiesPorFaixa * participacao) / 100;

                  // Adicionar informações ao grupo
                  if (
                    !grupos[nomeEditora].itens.some(
                      (i: any) =>
                        i.barcode === item.barcode &&
                        i.subTrack === subTrack.work
                    )
                  ) {
                    grupos[nomeEditora].totalItens += 1;
                    // Não somamos o valor líquido para editoras
                    grupos[nomeEditora].itens.push({
                      ...item,
                      editora: nomeEditora,
                      valorRoyaltiesEditora,
                      participacao,
                      track: track.work || "",
                      subTrack: subTrack.work || "",
                    });
                  }

                  grupos[nomeEditora].totalRoyalties += valorRoyaltiesEditora;
                });
              }
            });
          }
        });
      }
    });

    return Object.values(grupos).sort((a: any, b: any) =>
      a.editora.localeCompare(b.editora)
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/relatorio/consulta-apuracoes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Detalhes da Apuração</h1>
        </div>
      </div>

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
                : "Erro desconhecido ao consultar detalhes da apuração"}
            </p>
          </CardContent>
        </Card>
      )}

      {data && !isLoading && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Resumo da Apuração
              </CardTitle>
              <CardDescription>Código Identificador: {id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="text-sm text-blue-600 font-medium">
                    Total de Itens
                  </div>
                  <div className="text-2xl font-bold">{totalItens}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="text-sm text-green-600 font-medium">
                    Valor Total
                  </div>
                  <div className="text-2xl font-bold">
                    {formatarMoeda(totalValor)}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-md">
                  <div className="text-sm text-purple-600 font-medium">
                    Total de Royalties
                  </div>
                  <div className="text-2xl font-bold">
                    {formatarMoeda(totalRoyalties)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Código de Barras
                  </label>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={filtroBarcode}
                      onChange={(e) => setFiltroBarcode(e.target.value)}
                      placeholder="Filtrar por código de barras"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={filtroDescricao}
                      onChange={(e) => setFiltroDescricao(e.target.value)}
                      placeholder="Filtrar por descrição"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="itens">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="itens">
                <FileText className="mr-2 h-4 w-4" />
                Itens da Apuração
              </TabsTrigger>
              <TabsTrigger value="artistas">
                <Music className="mr-2 h-4 w-4" />
                Agrupado por Artista
              </TabsTrigger>
              <TabsTrigger value="editoras">
                <BookOpen className="mr-2 h-4 w-4" />
                Agrupado por Editora
              </TabsTrigger>
              <TabsTrigger value="resumo">
                <BarChart3 className="mr-2 h-4 w-4" />
                Resumo Geral
              </TabsTrigger>
            </TabsList>

            <TabsContent value="itens" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Itens da Apuração</CardTitle>
                  <CardDescription>
                    {filtrarItens().length} itens encontrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código de Barras</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Valor Unitário</TableHead>
                          <TableHead>Valor Total</TableHead>
                          <TableHead>Valor Líquido</TableHead>
                          <TableHead>Base de Cálculo</TableHead>
                          <TableHead>Taxa Copyright</TableHead>
                          <TableHead>Valor Royalties</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtrarItens().map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs">
                              {item.barcode}
                            </TableCell>
                            <TableCell>{item.descricao}</TableCell>
                            <TableCell>{item.quantidade}</TableCell>
                            <TableCell>
                              {formatarMoeda(item.valor_unitario)}
                            </TableCell>
                            <TableCell>
                              {formatarMoeda(item.valor_total)}
                            </TableCell>
                            <TableCell>
                              {formatarMoeda(item.valor_liquido)}
                            </TableCell>
                            <TableCell>
                              {formatarMoeda(item.baseCalculo)}
                            </TableCell>
                            <TableCell>{item.tx_copyright}%</TableCell>
                            <TableCell>
                              {formatarMoeda(item.valorRoyalties)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="artistas" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Agrupado por Artista</CardTitle>
                  <CardDescription>
                    {agruparPorArtista().length} artistas encontrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {agruparPorArtista().map((grupo: any, index: number) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold">{grupo.artista}</h3>
                          <div className="flex space-x-4">
                            <div className="text-sm">
                              <span className="font-medium">Itens:</span>{" "}
                              {grupo.totalItens}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Valor Total:</span>{" "}
                              {formatarMoeda(grupo.totalValor)}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">
                                Total Royalties:
                              </span>{" "}
                              {formatarMoeda(grupo.totalRoyalties)}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Código de Barras</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Quantidade</TableHead>
                                <TableHead>Valor Líquido</TableHead>
                                <TableHead>Valor Royalties</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {grupo.itens.map((item: any, idx: number) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-mono text-xs">
                                    {item.barcode}
                                  </TableCell>
                                  <TableCell>{item.descricao}</TableCell>
                                  <TableCell>{item.quantidade}</TableCell>
                                  <TableCell>
                                    {formatarMoeda(item.valor_liquido)}
                                  </TableCell>
                                  <TableCell>
                                    {formatarMoeda(item.valorRoyalties)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="editoras" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Agrupado por Editora</CardTitle>
                  <CardDescription>
                    {agruparPorEditora().length} editoras encontradas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {agruparPorEditora().map((grupo: any, index: number) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold">{grupo.editora}</h3>
                          <div className="flex space-x-4">
                            <div className="text-sm">
                              <span className="font-medium">Itens:</span>{" "}
                              {grupo.totalItens}
                            </div>

                            <div className="text-sm">
                              <span className="font-medium">
                                Total Royalties:
                              </span>{" "}
                              {formatarMoeda(grupo.totalRoyalties)}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Código de Barras</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Faixa</TableHead>
                                <TableHead>Sub-Faixa</TableHead>
                                <TableHead>Participação (%)</TableHead>
                                <TableHead>Valor Royalties</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {grupo.itens.map((item: any, idx: number) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-mono text-xs">
                                    {item.barcode}
                                  </TableCell>
                                  <TableCell>{item.descricao}</TableCell>
                                  <TableCell>{item.track}</TableCell>
                                  <TableCell>{item.subTrack || "-"}</TableCell>
                                  <TableCell>{item.participacao}%</TableCell>
                                  <TableCell>
                                    {formatarMoeda(item.valorRoyaltiesEditora)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resumo" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Geral</CardTitle>
                  <CardDescription>
                    Visão geral dos valores de royalties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-md">
                        <div className="text-sm text-blue-600 font-medium">
                          Total de Itens
                        </div>
                        <div className="text-2xl font-bold">{totalItens}</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-md">
                        <div className="text-sm text-green-600 font-medium">
                          Valor Total
                        </div>
                        <div className="text-2xl font-bold">
                          {formatarMoeda(totalValor)}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-md">
                        <div className="text-sm text-purple-600 font-medium">
                          Total de Royalties
                        </div>
                        <div className="text-2xl font-bold">
                          {formatarMoeda(totalRoyalties)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Por Artista
                        </h3>
                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Artista</TableHead>
                                <TableHead>Quantidade de Itens</TableHead>
                                <TableHead>Valor Total</TableHead>
                                <TableHead>Valor Royalties</TableHead>
                                <TableHead>% do Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {agruparPorArtista().map(
                                (grupo: any, index: number) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">
                                      {grupo.artista}
                                    </TableCell>
                                    <TableCell>{grupo.totalItens}</TableCell>
                                    <TableCell>
                                      {formatarMoeda(grupo.totalValor)}
                                    </TableCell>
                                    <TableCell>
                                      {formatarMoeda(grupo.totalRoyalties)}
                                    </TableCell>
                                    <TableCell>
                                      {totalRoyalties > 0
                                        ? (
                                            (grupo.totalRoyalties /
                                              totalRoyalties) *
                                            100
                                          ).toFixed(2)
                                        : "0.00"}
                                      %
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Por Editora
                        </h3>
                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Editora</TableHead>
                                <TableHead>Quantidade de Itens</TableHead>
                                <TableHead>Valor Royalties</TableHead>
                                <TableHead>% do Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {agruparPorEditora().map(
                                (grupo: any, index: number) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">
                                      {grupo.editora}
                                    </TableCell>
                                    <TableCell>{grupo.totalItens}</TableCell>
                                    <TableCell>
                                      {formatarMoeda(grupo.totalRoyalties)}
                                    </TableCell>
                                    <TableCell>
                                      {totalRoyalties > 0
                                        ? (
                                            (grupo.totalRoyalties /
                                              totalRoyalties) *
                                            100
                                          ).toFixed(2)
                                        : "0.00"}
                                      %
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Relatório
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
