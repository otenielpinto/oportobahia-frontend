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
import { Usuario } from "@/types/UsuarioType";
import { ArrowLeft, Edit } from "lucide-react";

interface UsuarioViewProps {
  usuario: Usuario;
}

export default function UsuarioView({ usuario }: UsuarioViewProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold">{usuario.name}</CardTitle>
          <CardDescription>{usuario.email}</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/usuario")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button onClick={() => router.push(`/usuario/edit/${usuario.id}`)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nome</p>
            <p className="text-base">{usuario.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-base">{usuario.email || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ativo</p>
            <p className="text-base">{usuario.active === 1 ? "Sim" : "Não"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Data de Criação
            </p>
            <p className="text-base">
              {usuario.createdAt
                ? new Date(usuario.createdAt).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Última Atualização
            </p>
            <p className="text-base">
              {usuario.updatedAt
                ? new Date(usuario.updatedAt).toLocaleDateString()
                : "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
