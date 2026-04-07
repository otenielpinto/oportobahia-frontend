import { Metadata } from "next";
import EmpresaForm from "@/components/empresa/EmpresaForm";
import { getEmpresaById } from "@/actions/empresaAction";
import { notFound } from "next/navigation";

interface EditEmpresaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: EditEmpresaPageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: empresa } = await getEmpresaById(Number(id));

  return {
    title: empresa
      ? `Editar Empresa: ${(empresa as any).nome || 'Empresa'}`
      : "Empresa não encontrada",
  };
}

export default async function EditEmpresaPage({
  params,
}: EditEmpresaPageProps) {
  const { id } = await params;
  const { data: empresa } = await getEmpresaById(Number(id));

  if (!empresa) {
    notFound(); // Or return a custom not found component
  }

  return (
    <div className="container mx-auto py-6">
      <EmpresaForm isEdit={true} empresa={empresa} />
    </div>
  );
}
