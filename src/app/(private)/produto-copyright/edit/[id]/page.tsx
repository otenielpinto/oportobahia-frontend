import { Metadata } from "next";
import ProdutoAutoralForm from "@/components/produto-autoral/ProdutoAutoralForm";
import { getProdutoCopyrightById } from "@/actions/produtoCopyrightAction";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Editar Produto Copyright #${id} - OportoBahia`,
    description: "Editar produto copyright",
  };
}

export default async function EditProdutoCopyrightPage({ params }: Props) {
  const { id } = await params;
  const { data: produto, success } = await getProdutoCopyrightById(Number(id));

  if (!success || !produto) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProdutoAutoralForm isEdit={true} produto={produto} />
    </div>
  );
}
