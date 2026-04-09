import { Metadata } from "next";
import ProdutoRoyaltyForm from "@/components/produto-royalty/ProdutoRoyaltyForm";
import { getProdutoRoyaltyById } from "@/actions/produtoRoyaltyAction";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Editar Produto Royalty #${id} - OportoBahia`,
    description: "Editar produto royalty",
  };
}

export default async function EditProdutoRoyaltyPage({ params }: Props) {
  const { id } = await params;
  const { data: produto, success } = await getProdutoRoyaltyById(Number(id));

  if (!success || !produto) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProdutoRoyaltyForm isEdit={true} produto={produto} />
    </div>
  );
}
