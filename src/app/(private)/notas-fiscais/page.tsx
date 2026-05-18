import { Metadata } from "next";
import NotaFiscalTable from "@/components/nota-fiscal/NotaFiscalTable";

export const metadata: Metadata = {
  title: "Notas Fiscais",
  description: "Consulta de notas fiscais emitidas",
};

export default function NotasFiscaisPage() {
  return <NotaFiscalTable />;
}
