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

import { Usuario } from "@/types/UsuarioType";
import { getUsuarios, deleteUsuario } from "@/actions/usuarioAction";

export default function UsuarioTable() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // React Query for fetching usuarios
  const {
    data: usuarios = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Usuario[]>({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const response = await getUsuarios();
      return response as unknown as Usuario[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteUsuarioId, setDeleteUsuarioId] = useState<string | null>(null);

  // State for filtering, sorting, and pagination
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState<keyof Usuario>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDelete = useCallback(async () => {
    if (deleteUsuarioId === null) return;

    setIsDeleting(true);
    try {
      await deleteUsuario(deleteUsuarioId);
      // Invalidate and refetch usuarios data
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuário excluído com sucesso.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao excluir usuário.",
      );
    } finally {
      setIsDeleting(false);
      setDeleteUsuarioId(null); // Close dialog
    }
  }, [deleteUsuarioId, queryClient]);

  // Memoized logic for sorting and filtering
  const sortedAndFilteredUsuarios = useMemo(() => {
    return usuarios
      .filter((usuario: any) => {
        if (!filter) return true;
        const searchLower = filter.toLowerCase();
        return (
          usuario.name.toLowerCase().includes(searchLower) ||
          (usuario.email && usuario.email.toLowerCase().includes(searchLower))
        );
      })
      .sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];

        if (fieldA === null || fieldA === undefined) return 1;
        if (fieldB === null || fieldB === undefined) return -1;

        let comparison = 0;
        if (typeof fieldA === "number" && typeof fieldB === "number") {
          comparison = fieldA - fieldB;
        } else {
          comparison = String(fieldA).localeCompare(String(fieldB));
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [usuarios, filter, sortField, sortDirection]);

  // Memoized logic for pagination
  const paginatedUsuarios = useMemo(() => {
    return sortedAndFilteredUsuarios.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [sortedAndFilteredUsuarios, currentPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando usuários...</span>
      </div>
    );
  }

  const totalPages = Math.ceil(sortedAndFilteredUsuarios.length / itemsPerPage);

  const toggleSort = (field: keyof Usuario) => {
    const newDirection =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    setCurrentPage(1); // Reset to first page on sort
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    const ellipsis = (key: string) => (
      <PaginationItem key={key}>
        <PaginationEllipsis />
      </PaginationItem>
    );

    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) {
        pageNumbers.push("ellipsis-start");
      }

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      }

      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push("ellipsis-end");
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers.map((page, index) =>
      typeof page === "number" ? (
        <PaginationItem key={page}>
          <PaginationLink
            onClick={() => setCurrentPage(page)}
            isActive={currentPage === page}
            className="cursor-pointer"
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      ) : (
        ellipsis(`ellipsis-${index}`)
      ),
    );
  };

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>
          {error instanceof Error ? error.message : "Erro ao carregar usuários"}
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Usuários</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex gap-2 w-full sm:w-auto items-center">
            <Input
              placeholder="Buscar por nome, email, etc..."
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
            onClick={() => router.push("/usuario/new")}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow key="header-row">
                {[
                  { label: "Nome", field: "name" },
                  { label: "Email", field: "email" },
                  { label: "Ativo", field: "active" },
                ].map(({ label, field }) => (
                  <TableHead
                    key={field}
                    onClick={() => toggleSort(field as keyof Usuario)}
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
              {paginatedUsuarios.length > 0 ? (
                paginatedUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>{usuario.name}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      {usuario.active === 1 ? "Sim" : "Não"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          title="Visualizar"
                          onClick={() =>
                            router.push(`/usuario/view/${usuario.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Editar"
                          onClick={() =>
                            router.push(`/usuario/edit/${usuario.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          title="Excluir"
                          onClick={() => setDeleteUsuarioId(usuario.id!)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow key="no-users-found">
                  <TableCell colSpan={4} className="h-24 text-center">
                    {filter
                      ? "Nenhum usuário encontrado para a busca."
                      : "Nenhum usuário cadastrado."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {totalPages > 1 && (
        <CardFooter>
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-muted-foreground">
              Total de {sortedAndFilteredUsuarios.length} usuários.
            </div>
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

                {renderPagination()}

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
        open={deleteUsuarioId !== null}
        onOpenChange={() => setDeleteUsuarioId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              usuário e removerá seus dados de nossos servidores.
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
