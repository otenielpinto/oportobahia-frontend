import { Metadata } from "next";
import ProdutoAutoralForm from "@/components/produto-autoral/ProdutoAutoralForm";

export const metadata: Metadata = {
  title: "Novo Produto Copyright - OportoBahia",
  description: "Criar novo produto copyright",
};

export default function NewProdutoCopyrightPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProdutoAutoralForm isEdit={false} />
    </div>
  );
}
