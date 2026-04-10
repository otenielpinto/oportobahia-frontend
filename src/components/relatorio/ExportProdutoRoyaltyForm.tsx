"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileSpreadsheet, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { reportToExcel } from "@/lib/reportToExcel";
import {
  getProdutoRoyaltyFilterOptions,
  exportProdutoRoyalty,
} from "@/actions/produtoRoyaltyAction";
import type {
  ProdutoRoyaltyFilterOptions,
  ProdutoRoyaltyExportFilters,
} from "@/types/produtoRoyaltyTypes";

const FILTER_FIELDS = [
  { key: "listaPreco", label: "Lista Preço" },
  { key: "origem", label: "Origem" },
  { key: "categoriaProduto", label: "Categoria Produto" },
  { key: "marca", label: "Marca" },
  { key: "nivelRoyalty", label: "Nível Royalty" },
  { key: "tipo", label: "Tipo" },
  { key: "gravadora", label: "Gravadora" },
  { key: "fornecedor", label: "Fornecedor" },
] as const;

const EXPORT_COLUMNS = [
  { label: "SKU", value: "sku" },
  { label: "GTIN/EAN", value: "gtinEan" },
  { label: "Descrição/Título", value: "descricaoTitulo" },
  { label: "Lista de Preço", value: "listaPreco" },
  { label: "Preço Oporto", value: "precoOporto" },
  { label: "Preço Distribuidora", value: "precoDistribuidora" },
  { label: "NCM", value: "ncm" },
  { label: "Origem", value: "origem" },
  { label: "Preço de Custo", value: "precoCusto" },
  { label: "Fornecedor", value: "fornecedor" },
  { label: "Categoria Produto", value: "categoriaProduto" },
  { label: "Marca", value: "marca" },
  { label: "Nível Royalty", value: "nivelRoyalty" },
  { label: "Percentual", value: "percentual" },
  { label: "Tipo", value: "tipo" },
  { label: "Número Discos", value: "numeroDiscos" },
  { label: "Número Faixas", value: "numeroFaixas" },
  { label: "Gravadora", value: "gravadora" },
  { label: "Peso", value: "peso" },
  { label: "Lote Importação", value: "loteImportacao" },
];

export function ExportProdutoRoyaltyForm() {
  const [filterOptions, setFilterOptions] =
    useState<ProdutoRoyaltyFilterOptions | null>(null);
  const [filters, setFilters] = useState<ProdutoRoyaltyExportFilters>({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportCount, setExportCount] = useState<number | null>(null);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const result = await getProdutoRoyaltyFilterOptions();
      if (result.success && result.data) {
        setFilterOptions(result.data);
      } else {
        toast.error(result.error || "Erro ao carregar opções de filtro");
      }
    } catch (error) {
      toast.error("Erro ao carregar opções de filtro");
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    if (value === "Todos") {
      setFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters[key as keyof ProdutoRoyaltyExportFilters];
        return newFilters;
      });
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
    setExportCount(null);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportProdutoRoyalty(filters);
      if (result.success && result.data) {
        setExportCount(result.count || 0);
        reportToExcel({
          data: result.data,
          columns: EXPORT_COLUMNS,
          sheetName: "Produto_Royalty",
          fileName: `Export_Produto_Royalty_${new Date().toISOString().split("T")[0]}`,
        });
        toast.success(`Exportados ${result.count} registros`);
      } else {
        toast.error(result.error || "Erro ao exportar dados");
      }
    } catch (error) {
      toast.error("Erro ao exportar dados");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setExportCount(null);
  };

  if (isLoadingOptions) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exportar Produto Royalty</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grid de filtros - 8 selects em grid de 3 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FILTER_FIELDS.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium">{label}</label>
              <Select
                value={filters[key as keyof ProdutoRoyaltyExportFilters] || "Todos"}
                onValueChange={(value) => handleFilterChange(key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Selecione ${label}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {filterOptions?.[key]?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-4 items-center">
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
          {exportCount !== null && (
            <span className="text-sm text-muted-foreground">
              {exportCount} registros exportados
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}