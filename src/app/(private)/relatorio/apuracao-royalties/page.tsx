"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ApuracaoRoyaltiesCabForm } from "@/components/relatorio/ApuracaoRoyaltiesCabForm";
import { ApuracaoRoyaltiesCabGrid } from "@/components/relatorio/ApuracaoRoyaltiesCabGrid";

export default function ApuracaoRoyaltiesPage() {
  const queryClient = useQueryClient();

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["apuracoes-royalties-cab"] });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Apuração de Royalties</h1>

      <ApuracaoRoyaltiesCabForm onSuccess={handleFormSuccess} />

      <ApuracaoRoyaltiesCabGrid />
    </div>
  );
}
