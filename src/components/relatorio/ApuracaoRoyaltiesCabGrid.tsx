"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, Trash2 } from "lucide-react";

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
import { listarApuracoesRoyaltiesCab, excluirApuracaoRoyaltiesCab } from "@/actions/apurarRoyaltiesCabAction";

const PAGE_SIZE = 10;

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
                      {format(new Date(item.dataInicial), "dd/MM/yyyy")} —{" "}
                      {format(new Date(item.dataFinal), "dd/MM/yyyy")}
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
                        <Link href={`/apuracao-royalties/${item._id}`}>
                          <Button variant="ghost" size="sm">
                            Ver detalhes
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={item.status === "processando"}
                          onClick={() => setDeleteId(item._id)}
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
