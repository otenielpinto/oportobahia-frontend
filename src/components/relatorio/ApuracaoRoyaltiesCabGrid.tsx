"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, FileSpreadsheet, Loader2, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";
import { ApuracaoRoyaltiesCabStatusBadge } from "@/components/relatorio/ApuracaoRoyaltiesCabStatusBadge";
import { usePagination } from "@/hooks/usePagination";
import { ApuracaoRoyaltiesCab, listarApuracoesRoyaltiesCab, excluirApuracaoRoyaltiesCab, exportarRoyaltiesMovto } from "@/actions/apurarRoyaltiesCabAction";
import { reportToExcel } from "@/lib/reportToExcel";

const PAGE_SIZE = 10;

const ROYALTIES_MOVTO_COLUMNS = [
  { label: "CPF/CNPJ", value: "clienteCpfCnpj" },
  { label: "Cliente", value: "clienteNome" },
  { label: "Município", value: "clienteMunicipio" },
  { label: "UF", value: "clienteUf" },
  { label: "Natureza", value: "natureza" },
  { label: "Número Nota", value: "numeroNota" },
  { label: "Série", value: "serie" },
  { label: "Item CFOP", value: "itemCfop" },
  { label: "Data Emissão", value: "dataEmissao" },
  { label: "Catálogo", value: "catalogo" },
  { label: "Barra Code", value: "barraCode" },
  { label: "Item Descrição", value: "itemDescricao" },
  { label: "Série Álbum", value: "serieAlbum" },
  { label: "Quant. Faturada", value: "quantFaturada" },
  { label: "Val. Unit. Lista", value: "valorUnitLista" },
  { label: "Total Lista", value: "totalLista" },
  { label: "Valor Unit. Mercadoria", value: "valorUnitMercadoria" },
  { label: "Valor de Mercadoria", value: "valorMercadoria" },
  { label: "Desconto", value: "desconto" },
  { label: "Desconto %", value: "percentualDesconto" },
  { label: "ICMS", value: "icms" },
  { label: "COFINS", value: "cofins" },
  { label: "PIS", value: "pis" },
  { label: "IPI", value: "ipi" },
  { label: "Valor sem Impostos", value: "valorSemImpostos" },
  { label: "Custo Operativo", value: "custoOperativo" },
  { label: "Custo Operativo %", value: "percentualCustoOperativo" },
  { label: "Base de Cálculo Royalties", value: "baseCalculoRoyalties" },
  { label: "Nível de Royalties", value: "nivelRoyalties" },
  { label: "Valor de Royalties", value: "valorRoyalties" },
  { label: "Tipo", value: "tipo" },
  { label: "Nº de Discos", value: "numDiscos" },
  { label: "Nº de Faixas", value: "numFaixas" },
  { label: "Limite Faixas", value: "limiteFaixas" },
  { label: "Base de Cálculo Lista", value: "baseCalculoLista" },
  { label: "Copyright Normal", value: "copyrightNormal" },
  { label: "Percentual", value: "percentual" },
  { label: "Gravadora", value: "gravadora" },
];

/**
 * Parseia data ISO para Date em timezone local.
 * new Date("2026-03-01T03:00:00.000Z") trata como UTC → no Brasil vira dia anterior.
 * Extraímos apenas ano/mês/dia da string ISO e criamos Date local.
 */
function parseDateLocal(value: string): Date {
  // value pode vir como "2026-03-01" ou "2026-03-01T03:00:00.000Z"
  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    </TableRow>
  ));
}

export function ApuracaoRoyaltiesCabGrid() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["apuracoes-royalties-cab"],
    queryFn: () => listarApuracoesRoyaltiesCab({ page: 1, limit: 100 }),
    staleTime: 30_000,
    retry: 2,
  });

  const {
    currentPage,
    totalPages,
    paginatedData,
    handlePageChange,
  } = usePagination({
    data: data?.data ?? [],
    initialPageSize: PAGE_SIZE,
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await excluirApuracaoRoyaltiesCab(deleteId);
      if (result.success) {
        toast.success("Apuração excluída com sucesso!");
        refetch();
      } else {
        toast.error(result.error || "Erro ao excluir apuração");
      }
    } catch {
      toast.error("Erro inesperado ao excluir apuração");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleExportExcel = async (item: ApuracaoRoyaltiesCab) => {
    setIsExporting(item.id);
    try {
      const result = await exportarRoyaltiesMovto(item.id);
      if (!result.success || !result.data) {
        toast.error(result.error || "Erro ao exportar dados");
        return;
      }

      // Warning se não há movimentos
      if (result.data.length === 0) {
        toast.warning("Nenhum movimento encontrado para esta apuração");
        return;
      }

      // Formata datas e aplica fallbacks para nulos
      const formattedData = result.data.map((row) => ({
        clienteCpfCnpj: row.clienteCpfCnpj ?? "—",
        clienteNome: row.clienteNome ?? "—",
        clienteMunicipio: row.clienteMunicipio ?? "—",
        clienteUf: row.clienteUf ?? "—",
        natureza: row.natureza ?? "—",
        numeroNota: row.numeroNota ?? "—",
        serie: row.serie ?? "—",
        itemCfop: row.itemCfop ?? "—",
        dataEmissao: row.dataEmissao ?? "—",
        catalogo: row.catalogo ?? "—",
        barraCode: row.barraCode ?? "—",
        itemDescricao: row.itemDescricao ?? "—",
        serieAlbum: row.serieAlbum ?? "—",
        quantFaturada: row.quantFaturada ?? 0,
        valorUnitLista: row.valorUnitLista ?? 0,
        totalLista: row.totalLista ?? 0,
        valorUnitMercadoria: row.valorUnitMercadoria ?? 0,
        valorMercadoria: row.valorMercadoria ?? 0,
        desconto: row.desconto ?? 0,
        percentualDesconto: row.percentualDesconto ?? 0,
        icms: row.icms ?? 0,
        cofins: row.cofins ?? 0,
        pis: row.pis ?? 0,
        ipi: row.ipi ?? 0,
        valorSemImpostos: row.valorSemImpostos ?? 0,
        custoOperativo: row.custoOperativo ?? 0,
        percentualCustoOperativo: row.percentualCustoOperativo ?? 0,
        baseCalculoRoyalties: row.baseCalculoRoyalties ?? 0,
        nivelRoyalties: row.nivelRoyalties ?? "—",
        valorRoyalties: row.valorRoyalties ?? 0,
        tipo: row.tipo ?? "—",
        numDiscos: row.numDiscos ?? 0,
        numFaixas: row.numFaixas ?? 0,
        limiteFaixas: row.limiteFaixas ?? 0,
        baseCalculoLista: row.baseCalculoLista ?? 0,
        copyrightNormal: row.copyrightNormal ?? 0,
        percentual: row.percentual ?? 0,
        gravadora: row.gravadora ?? "—",
      }));

      // Monta nome do arquivo com período
      const periodoStr = `${format(parseDateLocal(item.dataInicial), "dd/MM/yyyy")}-${format(parseDateLocal(item.dataFinal), "dd/MM/yyyy")}`;
      const dateSuffix = format(new Date(), "yyyy-MM-dd");
      const fileName = `Royalties_${periodoStr}_${dateSuffix}`;

      reportToExcel({
        data: formattedData,
        columns: ROYALTIES_MOVTO_COLUMNS,
        sheetName: "Royalties",
        fileName,
      });

      toast.success(`Exportados ${result.data.length} registros`);
    } catch {
      toast.error("Erro inesperado ao exportar relatório");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apurações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Loading state */}
        {isLoading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Gravadora</TableHead>
                <TableHead>Cotação $</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SkeletonRows />
            </TableBody>
          </Table>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Não foi possível carregar as apurações.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && (!data?.data || data.data.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma apuração encontrada
            </h3>
            <p className="text-sm text-muted-foreground">
              Inicie uma nova apuração acima.
            </p>
          </div>
        )}

        {/* Data state */}
        {!isLoading && !error && data?.data && data.data.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Gravadora</TableHead>
                  <TableHead>Cotação $</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">
                      {format(parseDateLocal(item.dataInicial), "dd/MM/yyyy")} —{" "}
                      {format(parseDateLocal(item.dataFinal), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      {item.gravadora ?? "Todos"}
                    </TableCell>
                    <TableCell>
                      {item.cotacaoDollar.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell>
                      <ApuracaoRoyaltiesCabStatusBadge
                        status={item.status}
                        erroMessage={item.erroMessage}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/apuracao-royalties/${item.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver detalhes
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={item.status !== "completada" || isExporting === item.id}
                          onClick={() => handleExportExcel(item)}
                          title={item.status !== "completada" ? "Exportação disponível apenas para apurações completadas" : "Exportar para Excel"}
                        >
                          {isExporting === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileSpreadsheet className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={item.status === "processando"}
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} — {data.total} registro(s)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Próxima
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* AlertDialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta apuração? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
