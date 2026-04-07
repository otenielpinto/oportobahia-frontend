"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Edit, Trash2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { deletePapelPermissao } from "@/actions/papelPermissaoAction";
import { getPapeis } from "@/actions/papelAction";
import { getPermissoes } from "@/actions/permissaoAction";
import { PapelPermissao } from "@/types/PapelPermissaoTypes";
import { Papel } from "@/types/PapelTypes";
import { Permissao } from "@/types/PermissaoTypes";

interface PapelPermissaoTableProps {
  papelPermissoes: PapelPermissao[];
}

// AIDEV-NOTE: table-component; resolve nomes de papel e permissao para exibicao
export function PapelPermissaoTable({
  papelPermissoes,
}: PapelPermissaoTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [papeis, setPapeis] = useState<Papel[]>([]);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);

  // Carrega dados para resolução de nomes
  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [papeisResponse, permissoesResponse] = await Promise.all([
          getPapeis(),
          getPermissoes(),
        ]);

        if (papeisResponse.success && papeisResponse.data) {
          setPapeis(papeisResponse.data as Papel[]);
        }

        if (permissoesResponse.success && permissoesResponse.data) {
          setPermissoes(permissoesResponse.data as Permissao[]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados de referência:", error);
      }
    }

    loadReferenceData();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);

    try {
      const response = await deletePapelPermissao(id);

      if (!response.success) {
        throw new Error(response.error || "Erro desconhecido");
      }

      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Falha ao excluir papel-permissão.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Funções auxiliares para resolver nomes
  const getPapelNome = (id_papel: number): string => {
    const papel = papeis.find((p) => p.id === id_papel);
    return papel ? papel.nome : `Papel ${id_papel}`;
  };

  const getPermissaoNome = (id_permissao: string): string => {
    const permissao = permissoes.find((p) => p.id === id_permissao);
    return permissao
      ? `${permissao.nome} (${permissao.tipo})`
      : `Permissão ${id_permissao}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Papel-Permissões</h2>
        <Button asChild>
          <Link href="/papel-permissao/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Papel-Permissão
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Permissão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {papelPermissoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhuma papel-permissão encontrada.
                </TableCell>
              </TableRow>
            ) : (
              papelPermissoes.map((papelPermissao) => (
                <TableRow key={papelPermissao.id}>
                  <TableCell className="font-medium">
                    {papelPermissao.id}
                  </TableCell>
                  <TableCell>{getPapelNome(papelPermissao.id_papel)}</TableCell>
                  <TableCell>
                    {getPermissaoNome(papelPermissao.id_permissao)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/papel-permissao/view/${papelPermissao.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/papel-permissao/edit/${papelPermissao.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingId === papelPermissao.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirmar exclusão
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esta relação entre
                              papel &quot;
                              {getPapelNome(papelPermissao.id_papel)}&quot; e
                              permissão &quot;
                              {getPermissaoNome(papelPermissao.id_permissao)}
                              &quot;? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(papelPermissao.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
