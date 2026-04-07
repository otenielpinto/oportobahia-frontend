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
import { Badge } from "@/components/ui/badge";
import { Permissao } from "@/types/PermissaoTypes";
import { ArrowLeft, Edit } from "lucide-react";

interface PermissaoViewProps {
  permissao: Permissao;
}

export default function PermissaoView({ permissao }: PermissaoViewProps) {
  const router = useRouter();

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "acao":
        return "destructive";
      case "menu":
        return "default";
      case "submenu":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            {permissao.nome}
            <Badge variant={getBadgeVariant(permissao.tipo)}>
              {permissao.tipo}
            </Badge>
          </CardTitle>
          <CardDescription>ID: {permissao.id}</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/permissao")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button
            onClick={() => router.push(`/permissao/edit/${permissao.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">
              INFORMAÇÕES BÁSICAS
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">ID</label>
                <p className="text-sm text-muted-foreground">{permissao.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Nome</label>
                <p className="text-sm text-muted-foreground">
                  {permissao.nome}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <div className="mt-1">
                  <Badge variant={getBadgeVariant(permissao.tipo)}>
                    {permissao.tipo}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">
              AUDITORIA
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Criado em</label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(permissao.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Atualizado em</label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(permissao.updatedAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Tenant ID</label>
                <p className="text-sm text-muted-foreground">
                  {permissao.id_tenant}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Empresa ID</label>
                <p className="text-sm text-muted-foreground">
                  {permissao.id_empresa}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
