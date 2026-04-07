"use client";

import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getPapelById } from "@/actions/papelAction";
import { getPermissoes } from "@/actions/permissaoAction";
import { PapelPermissao } from "@/types/PapelPermissaoTypes";
import { Papel } from "@/types/PapelTypes";
import { Permissao } from "@/types/PermissaoTypes";

interface PapelPermissaoViewProps {
  papelPermissao: PapelPermissao;
}

// AIDEV-NOTE: view-component; carrega dados relacionados para exibicao completa
export function PapelPermissaoView({
  papelPermissao,
}: PapelPermissaoViewProps) {
  const [papel, setPapel] = useState<Papel | null>(null);
  const [permissao, setPermissao] = useState<Permissao | null>(null);
  const [loadingRelatedData, setLoadingRelatedData] = useState(true);
  const router = useRouter();

  // Carrega dados relacionados
  useEffect(() => {
    async function loadRelatedData() {
      try {
        const [papelResponse, permissaoResponse] = await Promise.all([
          getPapelById(papelPermissao.id_papel),
          getPermissoes(),
        ]);

        if (papelResponse.success && papelResponse.data) {
          setPapel(papelResponse.data as Papel);
        }

        if (permissaoResponse.success && permissaoResponse.data) {
          const foundPermissao = (permissaoResponse.data as Permissao[]).find(
            (p) => p.id === papelPermissao.id_permissao,
          );
          setPermissao(foundPermissao || null);
        }
      } catch (error) {
        console.error("Erro ao carregar dados relacionados:", error);
      } finally {
        setLoadingRelatedData(false);
      }
    }

    loadRelatedData();
  }, [papelPermissao.id_papel, papelPermissao.id_permissao]);

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
        <h1 className="text-3xl font-bold">Visualizar Papel-Permissão</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/papel-permissao">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/papel-permissao/edit/${papelPermissao.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relação Papel-Permissão</CardTitle>
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
                  <p className="text-sm text-muted-foreground">
                    {papelPermissao.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">ID do Papel</label>
                  <p className="text-sm text-muted-foreground">
                    {papelPermissao.id_papel}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Nome do Papel</label>
                  <p className="text-sm text-muted-foreground">
                    {loadingRelatedData
                      ? "Carregando..."
                      : papel?.nome || "Não encontrado"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">ID da Permissão</label>
                  <p className="text-sm text-muted-foreground">
                    {papelPermissao.id_permissao}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Nome da Permissão
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {loadingRelatedData
                      ? "Carregando..."
                      : permissao
                        ? `${permissao.nome} (${permissao.tipo})`
                        : "Não encontrada"}
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
                    {formatDate(papelPermissao.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Atualizado em</label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(papelPermissao.updatedAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tenant ID</label>
                  <p className="text-sm text-muted-foreground">
                    {papelPermissao.id_tenant}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Empresa ID</label>
                  <p className="text-sm text-muted-foreground">
                    {papelPermissao.id_empresa}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!loadingRelatedData && (papel || permissao) && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-sm text-muted-foreground mb-4">
                DETALHES RELACIONADOS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {papel && (
                  <div>
                    <h4 className="font-medium mb-2">Informações do Papel</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Nome:</strong> {papel.nome}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {papel.ativo ? "Ativo" : "Inativo"}
                      </p>
                    </div>
                  </div>
                )}
                {permissao && (
                  <div>
                    <h4 className="font-medium mb-2">
                      Informações da Permissão
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Nome:</strong> {permissao.nome}
                      </p>
                      <p>
                        <strong>Tipo:</strong> {permissao.tipo}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
