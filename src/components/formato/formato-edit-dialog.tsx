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
import { Formato } from "@/types/formato";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const formatoSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  limite_faixas: z.number().int().min(1, "Limite de faixas é obrigatório"),
  percentual_faixa: z.number().nonnegative(),
  status: z.enum(["active", "inactive"]),
});

type FormatoFormData = z.infer<typeof formatoSchema>;

interface FormatoEditDialogProps {
  formato: Formato | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: number | null, data: Partial<Formato>) => Promise<void>;
}

export function FormatoEditDialog({
  formato,
  open,
  onClose,
  onSave,
}: FormatoEditDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const isCreating = !formato;
  const form = useForm<FormatoFormData>({
    resolver: zodResolver(formatoSchema),
    defaultValues: {
      name: "",
      limite_faixas: 0,
      percentual_faixa: 0,
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
      if (formato) {
        reset({
          name: formato.name,
          limite_faixas: formato.limite_faixas,
          percentual_faixa: formato.percentual_faixa,
          status: formato.status,
        });
      } else {
        reset({
          name: "",
          limite_faixas: 0,
          percentual_faixa: 0,
          status: "active",
        });
      }
    }
  }, [formato, open, reset]);

  const onSubmit = async (data: FormatoFormData) => {
    try {
      setIsSaving(true);
      await onSave(formato?.id || null, data);
      toast.success(
        isCreating
          ? "Formato criado com sucesso"
          : "Formato atualizado com sucesso"
      );
      onClose();
    } catch (error) {
      toast.error("Erro ao salvar formato " + error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Criar Formato" : "Editar Formato"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="limite_faixas">Limite de Faixas</Label>
              <Input
                id="limite_faixas"
                type="number"
                min="1"
                step="1"
                max="999"
                {...register("limite_faixas", { valueAsNumber: true })}
              />

              {errors.limite_faixas && (
                <p className="text-red-600">{errors.limite_faixas.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="percentual_faixa">Percentual por Faixa</Label>
              <Input
                id="percentual_faixa"
                type="number"
                step="0.01"
                {...register("percentual_faixa", { valueAsNumber: true })}
              />

              {errors.percentual_faixa && (
                <p className="text-red-600">
                  {errors.percentual_faixa.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                {...register("status")}
                defaultValue={watch("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
