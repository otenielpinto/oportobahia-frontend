"use client";

import { Track } from "@/types/catalogTypes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTracks, deleteTrack } from "@/actions/actCatalog";

import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2Icon, TrashIcon, PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
import { useState } from "react";
import { TrackForm } from "@/components/catalog/track-form";
import { Skeleton } from "@/components/ui/skeleton";

interface TrackListProps {
  catalogId: string;
}
const LIMIT_PER_PAGE = 5;

export function TrackList({ catalogId }: TrackListProps) {
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const queryClient = useQueryClient();
  const [isEdit, setIsEdit] = useState(false);

  const toggleEdit = () => {
    setIsEdit(!isEdit);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["tracks", catalogId, page, LIMIT_PER_PAGE],
    queryFn: () => getTracks(catalogId, page, LIMIT_PER_PAGE),
  });

  const deleteMutation = useMutation({
    mutationFn: (track: any) => deleteTrack(catalogId, track.id),
    onSuccess: async () => {
      // Invalida o cache e força uma nova busca
      await queryClient.invalidateQueries({ queryKey: ["tracks", catalogId] });
      // Força um refetch imediato
      await queryClient.refetchQueries({ queryKey: ["tracks", catalogId] });
      toast.success("Faixa excluída com sucesso");
    },
    onError: () => {
      toast.error("Falha ao excluir faixa");
    },
  });

  const handleEditClick = (track: Track) => {
    setEditingTrack({
      ...track,
      publishers: track.publishers || [], // Garantir que publishers existe
    });
    toggleEdit();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-[100px]" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Faixas</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Adicionar Faixa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <TrackForm
              catalogId={catalogId}
              onSuccess={() => setIsOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº da Faixa</TableHead>
            <TableHead>Obra</TableHead>
            <TableHead>Autores</TableHead>
            <TableHead>ISRC</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((track: any) => (
            <TableRow key={track.trackCode}>
              <TableCell>{track.trackCode}</TableCell>
              <TableCell>{track.work}</TableCell>
              <TableCell>{track.authors}</TableCell>
              <TableCell>{track.isrc}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Dialog open={isEdit} onOpenChange={toggleEdit}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(track)}
                      >
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <TrackForm
                        catalogId={catalogId}
                        track={editingTrack}
                        onSuccess={() => {
                          setEditingTrack(null);
                          toggleEdit();
                        }}
                      />
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
                        <AlertDialogTitle>Excluir Faixa</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza de que deseja excluir esta faixa? Esta
                          ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(track)}
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

      {(data?.total || 0) > LIMIT_PER_PAGE && (
        <div className="flex justify-center mt-4 space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page * LIMIT_PER_PAGE >= (data?.total || 0)}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  );
}
