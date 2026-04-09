import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ViewProdutoAutoralPage({ params }: Props) {
  const { id } = await params;
  redirect(`/produto-copyright/view/${id}`);
}
