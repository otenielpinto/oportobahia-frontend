import { Metadata } from "next";
import { notFound } from "next/navigation";
import NotaFiscalView from "@/components/nota-fiscal/NotaFiscalView";
import { getNotaFiscalById } from "@/actions/notaFiscalAction";

interface ViewNotaFiscalPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ViewNotaFiscalPageProps): Promise<Metadata> {
  const { id } = await params;
  const nota = await getNotaFiscalById(id);

  return {
    title: nota
      ? `Nota Fiscal Nº ${nota.numero}`
      : "Nota fiscal não encontrada",
    description: nota
      ? `Detalhes da nota fiscal ${nota.numero} - ${nota.nome}`
      : "Nota fiscal não encontrada",
  };
}

export default async function ViewNotaFiscalPage({
  params,
}: ViewNotaFiscalPageProps) {
  const { id } = await params;
  const nota = await getNotaFiscalById(id);

  if (!nota) {
    notFound();
  }

  return <NotaFiscalView nota={nota} />;
}
