"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empresa } from "@/types/EmpresaTypes";
import { ArrowLeft, Edit } from "lucide-react";

interface EmpresaViewProps {
  empresa: Empresa;
}

export default function EmpresaView({ empresa }: EmpresaViewProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold">{empresa.nome}</CardTitle>
          <CardDescription>{empresa.fantasia}</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/empresa")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button onClick={() => router.push(`/empresa/edit/${empresa.id}`)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">ID</p>
            <p className="text-base">{empresa.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              CPF/CNPJ
            </p>
            <p className="text-base">{empresa.cpfcnpj}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-base">{empresa.email || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Telefone
            </p>
            <p className="text-base">{empresa.telefone || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Website</p>
            <p className="text-base">{empresa.website || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ativo</p>
            <p className="text-base">{empresa.ativo === "S" ? "Sim" : "Não"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Endereço
            </p>
            <p className="text-base">
              {empresa.rua}, {empresa.nro}{" "}
              {empresa.bairro && `- ${empresa.bairro}`}
            </p>
            <p className="text-base">
              {empresa.cidade} - {empresa.uf}, {empresa.cep}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Inscrição Estadual
            </p>
            <p className="text-base">{empresa.ie || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Inscrição Municipal
            </p>
            <p className="text-base">{empresa.im || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">CRT</p>
            <p className="text-base">{empresa.crt || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">CNAE</p>
            <p className="text-base">{empresa.cnae || "-"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Filial</p>
            <p className="text-base">
              {empresa.filial === "S" ? "Sim" : "Não"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Estoque por Empresa
            </p>
            <p className="text-base">
              {empresa.estoquePorEmpresa === "S" ? "Sim" : "Não"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Data de Cadastro
            </p>
            <p className="text-base">
              {empresa.dtCadastro
                ? new Date(empresa.dtCadastro).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Última Atualização
            </p>
            <p className="text-base">
              {empresa.ultAtualizacao
                ? new Date(empresa.ultAtualizacao).toLocaleDateString()
                : "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
