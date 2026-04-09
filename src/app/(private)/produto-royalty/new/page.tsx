import { Metadata } from "next";
import ProdutoRoyaltyForm from "@/components/produto-royalty/ProdutoRoyaltyForm";

export const metadata: Metadata = {
  title: "Novo Produto Royalty - OportoBahia",
  description: "Criar novo produto royalty",
};

export default function NewProdutoRoyaltyPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProdutoRoyaltyForm isEdit={false} />
    </div>
  );
}
