"use client";

import { useState } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
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
import { deletePapelUsuario } from "@/actions/papelUsuarioAction";
import { Badge } from "@/components/ui/badge";

// AIDEV-NOTE: table-component; exibe lista de associações papel-usuario com ações CRUD
interface PapelUsuarioTableProps {
  papeisUsuario: any[]; // Array with joined data from aggregation
  onRefresh?: () => void;
}

export function PapelUsuarioTable({
  papeisUsuario,
  onRefresh,
}: PapelUsuarioTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);

    try {
      const result = await deletePapelUsuario(id);

      if (result.success) {
        toast.success(
          result.message || "Papel de usuário excluído com sucesso",
        );

        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(result.error || "Erro ao excluir papel de usuário");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro interno do sistema");
    } finally {
      setDeletingId(null);
    }
  };

  if (papeisUsuario.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum papel de usuário encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status do Papel</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {papeisUsuario.map((papelUsuario) => (
              <TableRow key={papelUsuario.id}>
                <TableCell className="font-medium">{papelUsuario.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {papelUsuario.usuario?.name || "Usuário não encontrado"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {papelUsuario.usuario?.email || "-"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {papelUsuario.papel?.nome || "Papel não encontrado"}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      papelUsuario.papel?.ativo ? "default" : "secondary"
                    }
                  >
                    {papelUsuario.papel?.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `/papel-usuario/view/${papelUsuario.id}`,
                          "_self",
                        )
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `/papel-usuario/edit/${papelUsuario.id}`,
                          "_self",
                        )
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deletingId === papelUsuario.id}
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
                            Tem certeza que deseja excluir a associação entre o
                            usuário{" "}
                            <strong>
                              {papelUsuario.usuario?.name ||
                                papelUsuario.usuario?.email}
                            </strong>{" "}
                            e o papel{" "}
                            <strong>{papelUsuario.papel?.nome}</strong>? Esta
                            ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(papelUsuario.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
