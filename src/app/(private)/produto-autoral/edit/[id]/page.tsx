import { Metadata } from "next";
import ProdutoAutoralForm from "@/components/produto-autoral/ProdutoAutoralForm";
import { getProdutoAutoralById } from "@/actions/produtoAutoralAction";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Editar Produto Autoral #${id} - OportoBahia`,
    description: "Editar produto autoral",
  };
}

export default async function EditProdutoAutoralPage({ params }: Props) {
  const { id } = await params;
  const { data: produto, success } = await getProdutoAutoralById(Number(id));

  if (!success || !produto) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProdutoAutoralForm isEdit={true} produto={produto} />
    </div>
  );
}