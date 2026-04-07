"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Users, Shield, Search, X } from "lucide-react";
import { toast } from "sonner";
import { getPapeis } from "@/actions/papelAction";
import { getPermissoes } from "@/actions/permissaoAction";
import {
  getPapelPermissoes,
  createPapelPermissao,
  deletePapelPermissao,
} from "@/actions/papelPermissaoAction";
import { Papel } from "@/types/PapelTypes";
import { Permissao } from "@/types/PermissaoTypes";
import { PapelPermissao } from "@/types/PapelPermissaoTypes";

interface PermissaoWithSelected extends Permissao {
  isSelected: boolean;
  papelPermissaoId?: string;
}

export function PapelPermissaoManager() {
  const [papeis, setPapeis] = useState<Papel[]>([]);
  const [permissoes, setPermissoes] = useState<PermissaoWithSelected[]>([]);
  const [selectedPapelId, setSelectedPapelId] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Filtrar permissões baseado na busca
  const filteredPermissoes = useMemo(() => {
    if (!searchFilter.trim()) {
      return permissoes;
    }

    const searchTerm = searchFilter.toLowerCase().trim();
    return permissoes.filter(
      (permissao) =>
        permissao.nome.toLowerCase().includes(searchTerm) ||
        permissao.tipo.toLowerCase().includes(searchTerm),
    );
  }, [permissoes, searchFilter]);

  // Carregar papéis e permissões iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  // Carregar permissões do papel selecionado
  useEffect(() => {
    if (selectedPapelId) {
      loadPapelPermissoes();
    } else {
      resetPermissionsSelection();
    }
  }, [selectedPapelId]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);

      const [papeisResult, permissoesResult] = await Promise.all([
        getPapeis({ ativo: "true" }),
        getPermissoes(),
      ]);

      if (papeisResult.success && papeisResult.data) {
        setPapeis(papeisResult.data);
      } else {
        toast.error("Não foi possível carregar os papéis");
      }

      if (permissoesResult.success && permissoesResult.data) {
        const permissoesWithSelection: PermissaoWithSelected[] =
          permissoesResult.data.map((permissao: any) => ({
            _id: permissao._id,
            id: permissao.id,
            tipo: permissao.tipo,
            nome: permissao.nome,
            id_empresa: permissao.id_empresa,
            id_tenant: permissao.id_tenant,
            createdAt: permissao.createdAt,
            updatedAt: permissao.updatedAt,
            isSelected: false,
          }));
        setPermissoes(permissoesWithSelection);
      } else {
        toast.error("Não foi possível carregar as permissões");
      }
    } catch (error) {
      toast.error("Erro inesperado ao carregar dados");
    } finally {
      setInitialLoading(false);
    }
  };

  const loadPapelPermissoes = async () => {
    if (!selectedPapelId) return;

    try {
      setLoading(true);

      const result = await getPapelPermissoes({
        id_papel: Number(selectedPapelId),
      });

      if (result.success && result.data) {
        const papelPermissoes = result.data as PapelPermissao[];

        // Atualizar permissões com status de seleção
        setPermissoes((prevPermissoes) =>
          prevPermissoes.map((permissao) => {
            const papelPermissao = papelPermissoes.find(
              (pp) => pp.id_permissao === permissao.id.toString(),
            );

            return {
              ...permissao,
              isSelected: !!papelPermissao,
              papelPermissaoId: papelPermissao?.id,
            };
          }),
        );
      }
    } catch (error) {
      toast.error("Erro ao carregar permissões do papel");
    } finally {
      setLoading(false);
    }
  };

  const resetPermissionsSelection = () => {
    setPermissoes((prevPermissoes) =>
      prevPermissoes.map((permissao) => ({
        ...permissao,
        isSelected: false,
        papelPermissaoId: undefined,
      })),
    );
  };

  const handlePermissaoToggle = async (
    permissaoId: string,
    isCurrentlySelected: boolean,
  ) => {
    setSaving(true);

    try {
      if (isCurrentlySelected) {
        // Remover permissão
        const permissao = permissoes.find((p) => p.id === permissaoId);
        if (permissao?.papelPermissaoId) {
          const result = await deletePapelPermissao(permissao.papelPermissaoId);

          if (result.success) {
            setPermissoes((prev) =>
              prev.map((p) =>
                p.id === permissaoId
                  ? { ...p, isSelected: false, papelPermissaoId: undefined }
                  : p,
              ),
            );

            toast.success("Permissão removida do papel");
          } else {
            toast.error(result.error || "Erro ao remover permissão");
          }
        }
      } else {
        // Adicionar permissão
        const result = await createPapelPermissao({
          id_papel: Number(selectedPapelId),
          id_permissao: permissaoId,
        });

        if (result.success) {
          // Recarregar para obter o ID correto
          await loadPapelPermissoes();

          toast.success("Permissão adicionada ao papel");
        } else {
          toast.error(result.error || "Erro ao adicionar permissão");
        }
      }
    } catch (error) {
      toast.error("Erro inesperado ao atualizar permissão");
    } finally {
      setSaving(false);
    }
  };

  const selectedPapel = papeis.find(
    (papel) => papel.id.toString() === selectedPapelId,
  );
  const selectedPermissionsCount = permissoes.filter(
    (p) => p.isSelected,
  ).length;
  const totalPermissionsCount = permissoes.length;
  const filteredSelectedCount = filteredPermissoes.filter(
    (p) => p.isSelected,
  ).length;
  const filteredTotalCount = filteredPermissoes.length;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seleção de Papel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Selecionar Papel
          </CardTitle>
          <CardDescription>
            Escolha o papel para gerenciar suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPapelId} onValueChange={setSelectedPapelId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um papel..." />
            </SelectTrigger>
            <SelectContent>
              {papeis.map((papel) => (
                <SelectItem key={papel.id} value={papel.id.toString()}>
                  {papel.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Informações do Papel Selecionado */}
      {selectedPapel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissões do Papel: {selectedPapel.nome}
              </div>
              <Badge variant="secondary">
                {searchFilter
                  ? `${filteredSelectedCount} de ${filteredTotalCount} (filtradas)`
                  : `${selectedPermissionsCount} de ${totalPermissionsCount}`}
              </Badge>
            </CardTitle>
            <CardDescription>
              Marque ou desmarque as permissões que este papel deve ter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campo de Filtro */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar permissões por nome ou tipo..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-8 w-8 p-0 -translate-y-1/2"
                  onClick={() => setSearchFilter("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Lista de Permissões */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando permissões...</span>
              </div>
            ) : (
              <>
                {searchFilter &&
                  filteredPermissoes.length !== permissoes.length && (
                    <div className="text-sm text-muted-foreground">
                      Mostrando {filteredTotalCount} de {totalPermissionsCount}{" "}
                      permissões
                    </div>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPermissoes.map((permissao) => (
                    <div
                      key={permissao.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`permissao-${permissao.id}`}
                        checked={permissao.isSelected}
                        onCheckedChange={() =>
                          handlePermissaoToggle(
                            permissao.id,
                            permissao.isSelected,
                          )
                        }
                        disabled={saving}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`permissao-${permissao.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {permissao.nome}
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {permissao.tipo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {filteredPermissoes.length === 0 && !loading && searchFilter && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma permissão encontrada para "{searchFilter}"</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => setSearchFilter("")}
                >
                  Limpar filtro
                </Button>
              </div>
            )}

            {permissoes.length === 0 && !loading && !searchFilter && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma permissão encontrada
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedPapelId && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Selecione um Papel</h3>
            <p className="text-muted-foreground">
              Escolha um papel acima para visualizar e gerenciar suas permissões
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
