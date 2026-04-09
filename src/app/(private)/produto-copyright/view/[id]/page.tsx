import { Metadata } from "next";
import ProdutoAutoralView from "@/components/produto-autoral/ProdutoAutoralView";
import { getProdutoCopyrightById } from "@/actions/produtoCopyrightAction";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Produto Copyright #${id} - OportoBahia`,
    description: "Visualizar detalhes do produto copyright",
  };
}

export default async function ViewProdutoCopyrightPage({ params }: Props) {
  const { id } = await params;
  const { data: produto, success } = await getProdutoCopyrightById(Number(id));

  if (!success || !produto) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProdutoAutoralView produto={produto} />
    </div>
  );
}
