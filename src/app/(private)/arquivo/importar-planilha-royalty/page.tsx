import { PlanilhaRoyaltyImporter } from "@/components/planilha/planilha-royalty-importer";

export default function ImportarPlanilhaRoyaltyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Importar Planilha Royalty
        </h1>
        <p className="text-muted-foreground">
          Importe e gerencie produtos via arquivo Excel.
        </p>
      </div>
      <PlanilhaRoyaltyImporter />
    </div>
  );
}
