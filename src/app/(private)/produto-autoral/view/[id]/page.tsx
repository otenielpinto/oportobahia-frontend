import { Metadata } from "next";
import ProdutoAutoralView from "@/components/produto-autoral/ProdutoAutoralView";
import { getProdutoAutoralById } from "@/actions/produtoAutoralAction";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Produto Autoral #${id} - OportoBahia`,
    description: "Visualizar detalhes do produto autoral",
  };
}

export default async function ViewProdutoAutoralPage({ params }: Props) {
  const { id } = await params;
  const { data: produto, success } = await getProdutoAutoralById(Number(id));

  if (!success || !produto) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProdutoAutoralView produto={produto} />
    </div>
  );
}