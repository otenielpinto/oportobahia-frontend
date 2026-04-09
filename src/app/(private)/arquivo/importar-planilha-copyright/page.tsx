import { PlanilhaCopyrightImporter } from "@/components/planilha/planilha-copyright-importer";

export default function ImportarPlanilhaCopyrightPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Importar Planilha Copyright
        </h1>
        <p className="text-muted-foreground">
          Importe e gerencie produtos royalties via arquivo Excel.
        </p>
      </div>
      <PlanilhaCopyrightImporter />
    </div>
  );
}
