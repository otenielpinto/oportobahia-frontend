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
  const [filter, setFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof ProdutoRoyalty>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 25;

  // Fetch data
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["produto-royalties", currentPage, limit],
    queryFn: async () => await getAllProdutoRoyalties(currentPage, limit),
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

  // Filter and sort
  const filteredAndSortedProdutos = useMemo(() => {
    return produtos
      .filter((produto: any) => {
        const searchLower = search.toLowerCase();
        return (
          produto.sku?.toLowerCase().includes(searchLower) ||
          produto.descricaoTitulo?.toLowerCase().includes(searchLower) ||
          produto.gtinEan?.toLowerCase().includes(searchLower) ||
          produto.parceiro?.toLowerCase().includes(searchLower) ||
          produto.marca?.toLowerCase().includes(searchLower)
        );
      })
      .sort((a: any, b: any) => {
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
  }, [produtos, search, filter, sortField, sortDirection]);

  const handleSort = (field: keyof ProdutoRoyalty) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = (id: number) => {
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
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por SKU, título, GTIN, parceiro ou marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => router.push("/produto-royalty/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Novo
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-4 h-8 data-[state=open]:bg-accent"
                    onClick={() => handleSort("id")}
                  >
                    ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
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
                <TableHead>Parceiro</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead className="text-right">Preço Oporto</TableHead>
                <TableHead className="w-12.5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProdutos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhum produto royalty encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedProdutos.map((produto: any) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{produto.sku || "-"}</Badge>
                    </TableCell>
                    <TableCell className="max-w-50 truncate">
                      {produto.descricaoTitulo || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {produto.gtinEan || "-"}
                    </TableCell>
                    <TableCell>{produto.parceiro || "-"}</TableCell>
                    <TableCell>{produto.marca || "-"}</TableCell>
                    <TableCell className="text-right">
                      {produto.precoOporto
                        ? new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(produto.precoOporto)
                        : "-"}
                    </TableCell>
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
