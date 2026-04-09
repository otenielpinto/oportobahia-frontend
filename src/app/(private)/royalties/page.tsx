import { ProdutoRoyaltyImporter } from "@/components/produto-royalty/produto-royalty-importer";

export default function RoyaltiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Produtos Royalties
        </h1>
        <p className="text-muted-foreground">
          Importe e gerencie produtos royalties via arquivo Excel.
        </p>
      </div>
      <ProdutoRoyaltyImporter />
    </div>
  );
}
