import { Metadata } from "next";
import EmpresaView from "@/components/empresa/EmpresaView";
import { getEmpresaById } from "@/actions/empresaAction";
import { notFound } from "next/navigation";

interface ViewEmpresaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ViewEmpresaPageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: empresa } = await getEmpresaById(Number(id));

  return {
    title: empresa
      ? `Detalhes da Empresa: ${(empresa as any)?.nome || "Empresa"}`
      : "Empresa não encontrada",
  };
}

export default async function ViewEmpresaPage({
  params,
}: ViewEmpresaPageProps) {
  const { id } = await params;
  const { data: empresa } = await getEmpresaById(Number(id));

  if (!empresa) {
    notFound(); // Or return a custom not found component
  }

  return (
    <div className="container mx-auto py-6">
      <EmpresaView empresa={empresa} />
    </div>
  );
}
