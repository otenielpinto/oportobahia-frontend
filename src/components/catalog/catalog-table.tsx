"use client";

import { Catalog } from "@/types/catalogTypes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2Icon, TrashIcon, Music2Icon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCatalog } from "@/actions/actCatalog";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { CatalogForm } from "@/components/catalog/catalog-form";
import { TrackList } from "@/components/catalog/track-list";
const MAX_PER_PAGE = 25;

interface CatalogTableProps {
  data: Catalog[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

export function CatalogTable({
  data,
  total,
  page,
  onPageChange,
}: CatalogTableProps) {
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      toast.success("Catálogo deletado com sucesso");
    },
    onError: () => {
      toast.error("Falha ao deletar catálogo");
    },
  });

  const handleEditClick = (catalog: Catalog) => {
    setEditingCatalog(catalog);
    setIsEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditingCatalog(null);
    setIsEditDialogOpen(false);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código do Catálogo</TableHead>
            <TableHead>Código de Barras</TableHead>
            <TableHead>Artista</TableHead>
            <TableHead>Título da Obra</TableHead>
            <TableHead>Formato</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((catalog) => (
            <TableRow key={catalog.id}>
              <TableCell>{catalog.catalogCode}</TableCell>
              <TableCell>{catalog.barcode}</TableCell>
              <TableCell>{catalog.artist}</TableCell>
              <TableCell>{catalog.workTitle}</TableCell>
              <TableCell>{catalog.format}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(catalog)}
                      >
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Editar Catálogo</DialogTitle>
                        <DialogDescription>
                          Atualize as informações do catálogo abaixo.
                        </DialogDescription>
                      </DialogHeader>
                      <CatalogForm
                        catalog={editingCatalog}
                        onSuccess={handleEditClose}
                      />
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={selectedCatalog?.id === catalog.id}
                    onOpenChange={(open) =>
                      setSelectedCatalog(open ? catalog : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Music2Icon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[900px]">
                      <DialogHeader>
                        <DialogTitle>Gerenciar Faixas</DialogTitle>
                        <DialogDescription>
                          Gerenciar faixas para o catálogo:{" "}
                          {catalog.catalogCode} - {catalog.workTitle}
                        </DialogDescription>
                      </DialogHeader>
                      <TrackList catalogId={catalog.id} />
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar Catálogo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza de que deseja deletar este catálogo? Esta
                          ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(catalog.id)}
                        >
                          Delete
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
      {total > MAX_PER_PAGE && (
        <div className="flex justify-center mt-4 space-x-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page * MAX_PER_PAGE >= total}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  );
}
