import { Metadata } from "next";
import ProdutoAutoralTable from "@/components/produto-autoral/ProdutoAutoralTable";

export const metadata: Metadata = {
  title: "Produtos Autoral - OportoBahia",
  description: "Gerencie os produtos autorais do sistema",
};

export default function ProdutoAutoralPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProdutoAutoralTable />
    </div>
  );
}