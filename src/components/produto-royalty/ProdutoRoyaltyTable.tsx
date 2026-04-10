"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAllProdutoRoyalties,
  deleteProdutoRoyalty,
} from "@/actions/produtoRoyaltyAction";
import { ProdutoRoyalty } from "@/types/produtoRoyaltyTypes";
import { toast } from "sonner";

interface ProdutoRoyaltyTableProps {
  data?: ProdutoRoyalty[];
}

export default function ProdutoRoyaltyTable({
  data: initialData,
}: ProdutoRoyaltyTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof ProdutoRoyalty>("sku");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 25;

  // Fetch data with server-side search
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["produto-royalties", currentPage, limit, searchTerm],
    queryFn: async () => await getAllProdutoRoyalties(currentPage, limit, searchTerm),
    enabled: !initialData,
  });

  const produtos = initialData || response?.data || [];
  const pagination = response?.pagination;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProdutoRoyalty,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Produto royalty excluído com sucesso.");
        queryClient.invalidateQueries({ queryKey: ["produto-royalties"] });
      } else {
        toast.error(data.error || "Falha ao excluir produto royalty.");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Falha ao excluir produto royalty.");
    },
  });

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(search);
    setCurrentPage(1);
  };

  // Sort only (filter is now server-side)
  const sortedProdutos = useMemo(() => {
    return produtos.sort((a: any, b: any) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison =
        typeof aValue === "string"
          ? aValue.localeCompare(bValue)
          : Number(aValue) - Number(bValue);

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [produtos, sortField, sortDirection]);

  const handleSort = (field: keyof ProdutoRoyalty) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto royalty?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="ml-2">Carregando produtos royalty...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <span>Erro ao carregar produtos royalty.</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Royalties</CardTitle>
        <CardDescription>
          Gerencie os produtos royalties do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm">
            <Input
              placeholder="Buscar por SKU, título, GTIN, marca, gravadora ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <Button onClick={() => router.push("/produto-royalty/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Novo
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-4 h-8 data-[state=open]:bg-accent"
                    onClick={() => handleSort("sku")}
                  >
                    SKU
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-4 h-8 data-[state=open]:bg-accent"
                    onClick={() => handleSort("descricaoTitulo")}
                  >
                    Título
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>GTIN/EAN</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Gravadora</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="w-12.5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProdutos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum produto royalty encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                sortedProdutos.map((produto: any) => (
                  <TableRow key={produto.id}>
                    <TableCell>
                      <Badge variant="outline">{produto.sku || "-"}</Badge>
                    </TableCell>
                    <TableCell className="max-w-50 truncate">
                      <button
                        className="text-primary hover:underline text-left cursor-pointer"
                        onClick={() => router.push(`/produto-royalty/view/${produto.id}`)}
                      >
                        {produto.descricaoTitulo || "-"}
                      </button>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {produto.gtinEan || "-"}
                    </TableCell>
                    <TableCell>{produto.marca || "-"}</TableCell>
                    <TableCell>{produto.gravadora || "-"}</TableCell>
                    <TableCell>{produto.categoriaProduto || "-"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/produto-royalty/view/${produto.id}`)
                            }
                          >
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/produto-royalty/edit/${produto.id}`)
                            }
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(produto.id)}
                            className="text-red-600"
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              de {pagination.total} registros
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
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
