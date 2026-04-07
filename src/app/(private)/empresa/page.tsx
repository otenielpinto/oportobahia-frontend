import { Metadata } from "next";
import EmpresasTable from "@/components/empresa/EmpresaTable";

export const metadata: Metadata = {
  title: "Empresas",
  description: "Gerencie suas empresas",
};

export default function EmpresasPage() {
  return (
    <div className="container mx-auto py-6">
      <EmpresasTable />
    </div>
  );
}
