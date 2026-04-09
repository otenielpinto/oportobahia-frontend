import { Metadata } from "next";
import ProdutoRoyaltyTable from "@/components/produto-royalty/ProdutoRoyaltyTable";

export const metadata: Metadata = {
  title: "Produtos Royalty - OportoBahia",
  description: "Gerencie os produtos royalty do sistema",
};

export default function ProdutoRoyaltyPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProdutoRoyaltyTable />
    </div>
  );
}
