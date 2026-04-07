"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";

import { Permissao } from "@/types/PermissaoTypes";
import { getPermissoes, deletePermissao } from "@/actions/permissaoAction";

export default function PermissaoTable() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deletePermissaoId, setDeletePermissaoId] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState<keyof Permissao>("nome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // React Query for fetching permissões
  const {
    data: permissoes = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Permissao[]>({
    queryKey: ["permissoes"],
    queryFn: async () => {
      const response = await getPermissoes();
      if (response.success) {
        return response.data as Permissao[];
      } else {
        throw new Error(response.error || "Falha ao carregar permissões.");
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleDelete = useCallback(async () => {
    if (deletePermissaoId === null) return;

    setIsDeleting(true);
    try {
      const response = await deletePermissao(deletePermissaoId);
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["permissoes"] });
        refetch();
      } else {
        throw new Error(response.error || "Falha ao excluir permissão.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao excluir permissão.",
      );
    } finally {
      setIsDeleting(false);
      setDeletePermissaoId(null);
    }
  }, [deletePermissaoId, queryClient, refetch]);

  // Filter and sort permissões
  const sortedAndFilteredPermissoes = useMemo(() => {
    let filtered = permissoes.filter(
      (permissao) =>
        permissao.nome.toLowerCase().includes(filter.toLowerCase()) ||
        permissao.tipo.toLowerCase().includes(filter.toLowerCase()),
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [permissoes, filter, sortField, sortDirection]);

  // Paginated permissões
  const paginatedPermissoes = useMemo(() => {
    return sortedAndFilteredPermissoes.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [sortedAndFilteredPermissoes, currentPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando permissões...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-destructive">
          Erro ao carregar permissões. Tente novamente.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(
    sortedAndFilteredPermissoes.length / itemsPerPage,
  );

  const toggleSort = (field: keyof Permissao) => {
    const newDirection =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    setCurrentPage(1); // Reset to first page on sort
  };

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "acao":
        return "destructive";
      case "menu":
        return "default";
      case "submenu":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Permissões</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex gap-2 w-full sm:w-auto items-center">
            <Input
              placeholder="Buscar por nome, tipo, etc..."
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="max-w-xs"
            />
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => router.push("/permissao/new")}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Permissão
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  { label: "Nome", field: "nome" },
                  { label: "Tipo", field: "tipo" },
                ].map(({ label, field }) => (
                  <TableHead
                    key={field}
                    onClick={() => toggleSort(field as keyof Permissao)}
                    className="cursor-pointer select-none"
                  >
                    {label}
                    {sortField === field && (
                      <span className="inline-block ml-1 align-middle">
                        {sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </TableHead>
                ))}
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPermissoes.length > 0 ? (
                paginatedPermissoes.map((permissao) => (
                  <TableRow key={permissao.id}>
                    <TableCell>{permissao.nome}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(permissao.tipo)}>
                        {permissao.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          title="Visualizar"
                          onClick={() =>
                            router.push(`/permissao/view/${permissao.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Editar"
                          onClick={() =>
                            router.push(`/permissao/edit/${permissao.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          title="Excluir"
                          onClick={() => setDeletePermissaoId(permissao.id!)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    {filter
                      ? "Nenhuma permissão encontrada para a busca."
                      : "Nenhuma permissão cadastrada."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Pagination */}
      {totalPages > 1 && (
        <CardFooter>
          <div className="w-full flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardFooter>
      )}

      <AlertDialog
        open={deletePermissaoId !== null}
        onOpenChange={() => setDeletePermissaoId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a
              permissão e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
