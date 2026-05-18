"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import NotaFiscalFilterBar from "./NotaFiscalFilterBar";
import {
  getNotasFiscais,
  getAllNotasFiscaisForExport,
} from "@/actions/notaFiscalAction";
import { reportToExcel } from "@/lib/reportToExcel";
import {
  NotaFiscalFilter,
  NotaFiscalListRow,
  NotaFiscalGlobalTotals,
} from "@/types/notaFiscalTypes";

function getDefaultFilter(): NotaFiscalFilter {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  return {
    dateFrom: start,
    dateTo: end,
    natOp: "VENDA DE MERCADORIA",
    page: 1,
    limit: 100,
  };
}

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  // Handle ISO date (from serializeMongoData) or DD/MM/YYYY format
  if (dateStr.includes("T")) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR");
  }
  return dateStr;
}

export default function NotaFiscalTable() {
  const router = useRouter();
  const [filters, setFilters] = useState<NotaFiscalFilter>(getDefaultFilter);
  const [isExporting, setIsExporting] = useState(false);

  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notas-fiscais", filters],
    queryFn: async () => await getNotasFiscais(filters),
  });

  const data: NotaFiscalListRow[] = response?.data ?? [];
  const total = response?.total ?? 0;
  const totalPages = response?.totalPages ?? 1;
  const globalTotals: NotaFiscalGlobalTotals = response?.globalTotals ?? {
    valor_produtos: 0,
    valor_frete: 0,
    valor: 0,
  };

  const pageTotals = useMemo(() => {
    return data.reduce(
      (acc, row) => ({
        valor_produtos:
          acc.valor_produtos + (parseFloat(row.valor_produtos) || 0),
        valor_frete: acc.valor_frete + (parseFloat(row.valor_frete) || 0),
        valor: acc.valor + (parseFloat(row.valor) || 0),
      }),
      { valor_produtos: 0, valor_frete: 0, valor: 0 },
    );
  }, [data]);

  const handleFiltersChange = useCallback(
    (partial: Partial<NotaFiscalFilter>) => {
      setFilters((prev) => ({
        ...prev,
        ...partial,
        page: partial.page ?? 1,
      }));
    },
    [],
  );

  const handleSearch = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const exportData = await getAllNotasFiscaisForExport({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        status: filters.status,
        tipo: filters.tipo,
        natOp: filters.natOp,
        numero: filters.numero,
      });

      if (!exportData || exportData.length === 0) {
        toast.error("Nenhum dado disponível para exportação");
        return;
      }

      reportToExcel({
        data: exportData,
        columns: [
          { header: "Número", key: "numero" },
          { header: "Série", key: "serie" },
          { header: "Data Emissão", key: "data_emissao" },
          { header: "Nome", key: "nome" },
          { header: "Nat. Op.", key: "natOp" },
          { header: "Valor Produtos", key: "valor_produtos" },
          { header: "Valor Frete", key: "valor_frete" },
          { header: "Valor Total", key: "valor" },
          { header: "Situação", key: "descricao_situacao" },
          { header: "Chave Acesso", key: "chave_acesso" },
        ],
        sheetName: "Notas Fiscais",
        fileName: `notas-fiscais-${new Date().toISOString().split("T")[0]}`,
      });

      toast.success(
        `${exportData.length} notas fiscais exportadas com sucesso`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Erro ao exportar:", err);
      toast.error(`Erro ao exportar: ${message}`);
    } finally {
      setIsExporting(false);
    }
  }, [filters]);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleRowClick = useCallback(
    (id: string) => {
      router.push(`/notas-fiscais/view/${id}`);
    },
    [router],
  );

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notas Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 10 }).map((_, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {Array.from({ length: 10 }).map((_, colIdx) => (
                      <TableCell key={colIdx}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notas Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar notas fiscais. Verifique sua conexão e tente
              novamente.
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas Fiscais</CardTitle>
      </CardHeader>
      <CardContent>
        <NotaFiscalFilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          onExport={handleExport}
          isExporting={isExporting}
        />

        {isFetching && !isLoading && (
          <div className="mb-2">
            <Skeleton className="h-1 w-full" />
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-22.5">Número</TableHead>
                <TableHead className="w-12.5">Série</TableHead>
                <TableHead className="w-25">Data Emissão</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Nat. Op.</TableHead>
                <TableHead className="text-right">Valor Produtos</TableHead>
                <TableHead className="text-right">Valor Frete</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="w-30">Chave Acesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    Nenhuma nota fiscal encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow
                    key={row._id}
                    className="cursor-pointer hover:bg-muted/60"
                    onClick={() => handleRowClick(row._id)}
                  >
                    <TableCell className="font-mono text-xs">
                      {row.numero || "-"}
                    </TableCell>
                    <TableCell>{row.serie || "-"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(row.data_emissao)}
                    </TableCell>
                    <TableCell className="max-w-50 truncate">
                      {row.nome || "-"}
                    </TableCell>
                    <TableCell className="max-w-37.5 truncate">
                      {row.natOp || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.valor_produtos)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.valor_frete)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(row.valor)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.descricao_situacao === "Autorizada"
                            ? "default"
                            : row.descricao_situacao === "Cancelada"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {row.descricao_situacao || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] max-w-30 truncate">
                      {row.chave_acesso || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {data.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-medium">
                    Totais da Página:
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(pageTotals.valor_produtos)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(pageTotals.valor_frete)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(pageTotals.valor)}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-medium">
                    Totais Globais:
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(globalTotals.valor_produtos)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(globalTotals.valor_frete)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(globalTotals.valor)}
                  </TableCell>
                  <TableCell colSpan={2} className="text-right text-xs text-muted-foreground">
                    {total} registro{total !== 1 ? "s" : ""}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {(filters.page - 1) * filters.limit + 1} -{" "}
              {Math.min(filters.page * filters.limit, total)} de {total}{" "}
              registros
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {filters.page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page >= totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
