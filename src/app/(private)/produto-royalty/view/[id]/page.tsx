import { Metadata } from "next";
import ProdutoRoyaltyView from "@/components/produto-royalty/ProdutoRoyaltyView";
import { getProdutoRoyaltyById } from "@/actions/produtoRoyaltyAction";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Produto Royalty #${id} - OportoBahia`,
    description: "Visualizar detalhes do produto royalty",
  };
}

export default async function ViewProdutoRoyaltyPage({ params }: Props) {
  const { id } = await params;
  const { data: produto, success } = await getProdutoRoyaltyById(id);

  if (!success || !produto) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProdutoRoyaltyView produto={produto} />
    </div>
  );
}
