import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";

// AIDEV-NOTE: view-component; exibe detalhes de uma associação papel-usuario
interface PapelUsuarioViewProps {
  papelUsuario: any; // Extended type with joined data
}

export function PapelUsuarioView({ papelUsuario }: PapelUsuarioViewProps) {
  const formatDate = (date: string | Date) => {
    if (!date) return "Data não disponível";
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
        <div>
          <h1 className="text-2xl font-bold">
            Papel de Usuário #{papelUsuario.id}
          </h1>
          <p className="text-gray-600">Detalhes da associação</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/papel-usuario">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <Link href={`/papel-usuario/edit/${papelUsuario.id}`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                ID do Usuário
              </label>
              <p className="text-sm font-mono">{papelUsuario.id_usuario}</p>
            </div>

            {papelUsuario.usuario && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nome
                  </label>
                  <p>{papelUsuario.usuario.name || "Não informado"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p>{papelUsuario.usuario.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status do Usuário
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        papelUsuario.usuario.active ? "default" : "secondary"
                      }
                    >
                      {papelUsuario.usuario.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>

                {papelUsuario.usuario.isAdmin && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tipo
                    </label>
                    <div className="mt-1">
                      <Badge variant="destructive">Administrador</Badge>
                    </div>
                  </div>
                )}
              </>
            )}

            {!papelUsuario.usuario && (
              <div className="text-center py-4">
                <p className="text-red-500">
                  Usuário não encontrado ou removido
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Papel */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Papel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                ID do Papel
              </label>
              <p className="text-sm font-mono">{papelUsuario.id_papel}</p>
            </div>

            {papelUsuario.papel && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nome do Papel
                  </label>
                  <p className="font-medium">{papelUsuario.papel.nome}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status do Papel
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        papelUsuario.papel.ativo ? "default" : "secondary"
                      }
                    >
                      {papelUsuario.papel.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Criado em
                  </label>
                  <p className="text-sm">
                    {formatDate(papelUsuario.papel.createdAt)}
                  </p>
                </div>
              </>
            )}

            {!papelUsuario.papel && (
              <div className="text-center py-4">
                <p className="text-red-500">Papel não encontrado ou removido</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações da Associação */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Associação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                ID da Associação
              </label>
              <p className="font-mono">{papelUsuario.id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Data de Criação
              </label>
              <p>{formatDate(papelUsuario.createdAt)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Última Atualização
              </label>
              <p>{formatDate(papelUsuario.updatedAt)}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500">
                ID da Empresa
              </label>
              <p className="font-mono">{papelUsuario.id_empresa}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                ID do Tenant
              </label>
              <p className="font-mono">{papelUsuario.id_tenant}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
