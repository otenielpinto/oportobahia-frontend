"use client";

import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Papel } from "@/types/PapelTypes";

interface PapelViewProps {
  papel: Papel;
}

export function PapelView({ papel }: PapelViewProps) {
  const router = useRouter();

  const formatDate = (date: string | Date | undefined) => {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">Visualizar Papel</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/papel">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/papel/edit/${papel.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{papel.nome}</span>
            <Badge variant={papel.ativo ? "default" : "secondary"}>
              {papel.ativo ? "Ativo" : "Inativo"}
            </Badge>
          </CardTitle>
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
                  <p className="text-sm text-muted-foreground">{papel.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <p className="text-sm text-muted-foreground">{papel.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-sm text-muted-foreground">
                    {papel.ativo ? "Ativo" : "Inativo"}
                  </p>
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
                    {formatDate(papel.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Atualizado em</label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(papel.updatedAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tenant ID</label>
                  <p className="text-sm text-muted-foreground">
                    {papel.id_tenant}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Empresa ID</label>
                  <p className="text-sm text-muted-foreground">
                    {papel.id_empresa}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
