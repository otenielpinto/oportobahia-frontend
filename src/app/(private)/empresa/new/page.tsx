import { Metadata } from "next";
import EmpresaForm from "@/components/empresa/EmpresaForm";

export const metadata: Metadata = {
  title: "Nova Empresa",
};

export default function NewEmpresaPage() {
  return (
    <div className="container mx-auto py-6">
      <EmpresaForm />
    </div>
  );
}
