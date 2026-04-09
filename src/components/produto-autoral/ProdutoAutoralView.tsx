"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProdutoAutoral } from "@/types/produtoAutoralTypes";

interface ProdutoAutoralViewProps {
  produto: ProdutoAutoral;
}

export default function ProdutoAutoralView({ produto }: ProdutoAutoralViewProps) {
  const router = useRouter();

  const formatCurrency = (value: number | undefined | null) => {
    if (!value && value !== 0) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => router.push("/produto-autoral")}>
          Voltar
        </Button>
        <Button onClick={() => router.push(`/produto-autoral/edit/${produto.id}`)}>
          Editar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {produto.descricaoTitulo || "Produto Autoral"}
          </CardTitle>
          <CardDescription>ID: {produto.id}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna 1: Informações Principal */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">SKU</p>
              <p className="text-base">{produto.sku || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">GTIN/EAN</p>
              <p className="text-base font-mono">{produto.gtinEan || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Parceiro</p>
              <p className="text-base">{produto.parceiro || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Marca</p>
              <p className="text-base">{produto.marca || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gravadora</p>
              <p className="text-base">{produto.gravadora || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fornecedor</p>
              <p className="text-base">{produto.fornecedor || "-"}</p>
            </div>
          </div>

          {/* Coluna 2: Preços e Informações */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preço Oporto</p>
              <p className="text-base">{formatCurrency(produto.precoOporto)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preço Distribuidora</p>
              <p className="text-base">{formatCurrency(produto.precoDistribuidora)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preço Custo</p>
              <p className="text-base">{formatCurrency(produto.precoCusto)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lista Preço</p>
              <p className="text-base">{produto.listaPreco || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">NCM</p>
              <p className="text-base">{produto.ncm || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Origem</p>
              <p className="text-base">{produto.origem || "-"}</p>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="col-span-1 md:col-span-2 border-t pt-4">
            <h3 className="font-semibold mb-4">Informações Adicionais</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                <p className="text-base">{produto.categoriaProduto || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                <p className="text-base">{produto.tipo || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nível Royalty</p>
                <p className="text-base">{produto.nivelRoyalty || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Percentual</p>
                <p className="text-base">{produto.percentual || "-"}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nº Discos</p>
                <p className="text-base">{produto.numeroDiscos || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nº Faixas</p>
                <p className="text-base">{produto.numeroFaixas || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peso (kg)</p>
                <p className="text-base">{produto.peso || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lote Importação</p>
                <p className="text-base">{produto.loteImportacao || "-"}</p>
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="col-span-1 md:col-span-2 border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Release</p>
                <p className="text-base">{formatDate(produto.release)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Importado em</p>
                <p className="text-base">{formatDate(produto.importadoEm)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                <p className="text-base">{formatDate(produto.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                <p className="text-base">{formatDate(produto.updated_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}