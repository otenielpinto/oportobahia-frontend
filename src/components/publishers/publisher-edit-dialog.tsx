"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Publisher } from "@/types/publisher";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const publisherSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  status: z.enum(["active", "inactive"]),
});

type PublisherFormData = z.infer<typeof publisherSchema>;

interface PublisherEditDialogProps {
  publisher: Publisher | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: number, data: Partial<Publisher>) => Promise<void>;
}

export function PublisherEditDialog({
  publisher,
  open,
  onClose,
  onSave,
}: PublisherEditDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const isCreating = !publisher;

  const form = useForm<PublisherFormData>({
    resolver: zodResolver(publisherSchema),
    defaultValues: {
      name: "",
      status: "active",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  useEffect(() => {
    if (open) {
      if (publisher) {
        reset({
          name: publisher.name,
          status: publisher.status,
        });
      } else {
        reset({
          name: "",
          status: "active",
        });
      }
    }
  }, [publisher, open, reset]);

  const onSubmit = async (data: PublisherFormData) => {
    let id = 0;
    if (publisher) id = publisher?.id;

    try {
      setIsSaving(true);
      await onSave(id, data);
      toast.success(
        isCreating
          ? "Editora criada com sucesso"
          : "Editora atualizada com sucesso"
      );
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        isCreating ? "Falha ao criar editora" : "Falha ao atualizar editora"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Criar Editora" : "Editar Editora"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) =>
                setValue("status", value as "active" | "inactive")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? "Salvando..."
                : isCreating
                ? "Criar"
                : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
