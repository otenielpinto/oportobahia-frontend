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

import { Empresa } from "@/types/EmpresaTypes";
import { getAllEmpresas, deleteEmpresa } from "@/actions/empresaAction";

export default function EmpresasTable() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteEmpresaId, setDeleteEmpresaId] = useState<number | null>(null);

  // State for filtering, sorting, and pagination
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState<keyof Empresa>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use React Query for data fetching
  const {
    data: empresas = [],
    isLoading,
    error,
    refetch: fetchEmpresas,
  } = useQuery({
    queryKey: ["empresas"],
    queryFn: async () => {
      const response = await getAllEmpresas();
      if (response.success && response.data) {
        // Ensure dates are parsed back if needed for display, or just use string
        const parsedData = response.data.map((emp) => ({
          ...emp,
          dtCadastro: emp.dtCadastro ? new Date(emp.dtCadastro) : undefined,
          ultAtualizacao: emp.ultAtualizacao
            ? new Date(emp.ultAtualizacao)
            : undefined,
          createdAt: emp.createdAt ? new Date(emp.createdAt) : undefined,
          updatedAt: emp.updatedAt ? new Date(emp.updatedAt) : undefined,
        }));
        return parsedData as Empresa[];
      } else {
        throw new Error(response.error || "Falha ao carregar empresas.");
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleDelete = useCallback(async () => {
    if (deleteEmpresaId === null) return;

    setIsDeleting(true);
    try {
      const response = await deleteEmpresa(deleteEmpresaId);
      if (response.success) {
        toast.success(response.message);
        // Invalidate and refetch the empresas query
        queryClient.invalidateQueries({ queryKey: ["empresas"] });
      } else {
        throw new Error(response.error || "Falha ao excluir empresa.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao excluir empresa.",
      );
    } finally {
      setIsDeleting(false);
      setDeleteEmpresaId(null); // Close dialog
    }
  }, [deleteEmpresaId, queryClient, toast]);

  // Memoized logic for sorting and filtering
  const sortedAndFilteredEmpresas = useMemo(() => {
    return empresas
      .filter((empresa: any) => {
        if (!filter) return true;
        const searchLower = filter.toLowerCase();
        return (
          empresa.nome.toLowerCase().includes(searchLower) ||
          (empresa.fantasia &&
            empresa.fantasia.toLowerCase().includes(searchLower)) ||
          empresa.cpfcnpj.includes(searchLower) ||
          (empresa.email && empresa.email.toLowerCase().includes(searchLower))
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
  }, [empresas, filter, sortField, sortDirection]);

  // Memoized logic for pagination
  const paginatedEmpresas = useMemo(() => {
    return sortedAndFilteredEmpresas.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [sortedAndFilteredEmpresas, currentPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando empresas...</span>
      </div>
    );
  }

  const totalPages = Math.ceil(sortedAndFilteredEmpresas.length / itemsPerPage);

  const toggleSort = (field: keyof Empresa) => {
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
    const ellipsis = (
      <PaginationItem>
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
        <PaginationItem key={`${page}-${index}`}>{ellipsis}</PaginationItem>
      ),
    );
  };

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>{error.message}</p>
        <Button onClick={() => fetchEmpresas()} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Empresas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex gap-2 w-full sm:w-auto items-center">
            <Input
              placeholder="Buscar por nome, CNPJ, etc..."
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
            onClick={() => router.push("/empresa/new")}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Empresa
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  { label: "ID", field: "id" },
                  { label: "Nome", field: "nome" },
                  { label: "Nome Fantasia", field: "fantasia" },
                  { label: "CPF/CNPJ", field: "cpfcnpj" },
                  { label: "Email", field: "email" },
                  { label: "Ativo", field: "ativo" },
                ].map(({ label, field }) => (
                  <TableHead
                    key={field}
                    onClick={() => toggleSort(field as keyof Empresa)}
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
              {paginatedEmpresas.length > 0 ? (
                paginatedEmpresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell className="font-medium">{empresa.id}</TableCell>
                    <TableCell>{empresa.nome}</TableCell>
                    <TableCell>{empresa.fantasia || "-"}</TableCell>
                    <TableCell>{empresa.cpfcnpj}</TableCell>
                    <TableCell>{empresa.email || "-"}</TableCell>
                    <TableCell>
                      {empresa.ativo === "S" ? "Sim" : "Não"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          title="Visualizar"
                          onClick={() =>
                            router.push(`/empresa/view/${empresa.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Editar"
                          onClick={() =>
                            router.push(`/empresa/edit/${empresa.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          title="Excluir"
                          onClick={() => setDeleteEmpresaId(empresa.id!)}
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
                  <TableCell colSpan={7} className="h-24 text-center">
                    {filter
                      ? "Nenhuma empresa encontrada para a busca."
                      : "Nenhuma empresa cadastrada."}
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
              Total de {sortedAndFilteredEmpresas.length} empresas.
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
        open={deleteEmpresaId !== null}
        onOpenChange={() => setDeleteEmpresaId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a
              empresa e removerá seus dados de nossos servidores.
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
