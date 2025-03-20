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
  cnpj: z.string().optional(),
  account: z
    .object({
      bankName: z.string().min(1, "Nome do banco é obrigatório"),
      bankCode: z.string().min(1, "Código do banco é obrigatório"),
      agency: z.string().min(1, "Agência é obrigatória"),
      accountNumber: z.string().min(1, "Número da conta é obrigatório"),
      accountDigit: z.string().optional(),
      accountType: z.string().min(1, "Tipo da conta é obrigatório"),
      accountHolderName: z.string().min(1, "Nome do titular é obrigatório"),
      accountHolderDocument: z
        .string()
        .min(1, "CPF/CNPJ do titular é obrigatório"),
      pixKey: z.string().optional(),
    })
    .optional(),
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
      cnpj: "",
      account: {
        bankName: "",
        bankCode: "",
        agency: "",
        accountNumber: "",
        accountDigit: "",
        accountType: "",
        accountHolderName: "",
        accountHolderDocument: "",
        pixKey: "",
      },
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
          cnpj: publisher.cnpj,
          account: publisher.account,
        });
      } else {
        reset({
          name: "",
          status: "active",
          cnpj: "",
          account: {
            bankName: "",
            bankCode: "",
            agency: "",
            accountNumber: "",
            accountDigit: "",
            accountType: "",
            accountHolderName: "",
            accountHolderDocument: "",
            pixKey: "",
          },
        });
      }
    }
  }, [publisher, open, reset]);

  const onSubmit = async (data: PublisherFormData) => {
    let id = 0;
    if (publisher) id = publisher?.id;

    try {
      setIsSaving(true);
      await onSave(id, {
        name: data.name,
        status: data.status,
        cnpj: data.cnpj,
        account: data.account,
      });
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
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Criar Editora" : "Editar Editora"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} autoComplete="off" />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" {...register("cnpj")} autoComplete="off" />
              {errors.cnpj && (
                <p className="text-sm text-red-500">{errors.cnpj.message}</p>
              )}
            </div>
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
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-4">Dados Bancários</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Nome do Banco</Label>
                <Input
                  id="bankName"
                  {...register("account.bankName")}
                  autoComplete="off"
                />
                {errors.account?.bankName && (
                  <p className="text-sm text-red-500">
                    {errors.account.bankName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankCode">Código do Banco</Label>
                <Input
                  id="bankCode"
                  {...register("account.bankCode")}
                  autoComplete="off"
                />
                {errors.account?.bankCode && (
                  <p className="text-sm text-red-500">
                    {errors.account.bankCode.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="agency">Agência</Label>
                <Input
                  id="agency"
                  {...register("account.agency")}
                  autoComplete="off"
                />
                {errors.account?.agency && (
                  <p className="text-sm text-red-500">
                    {errors.account.agency.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Número da Conta</Label>
                <Input
                  id="accountNumber"
                  {...register("account.accountNumber")}
                  autoComplete="off"
                />
                {errors.account?.accountNumber && (
                  <p className="text-sm text-red-500">
                    {errors.account.accountNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountDigit">Dígito da Conta</Label>
                <Input
                  id="accountDigit"
                  {...register("account.accountDigit")}
                  autoComplete="off"
                />
                {errors.account?.accountDigit && (
                  <p className="text-sm text-red-500">
                    {errors.account.accountDigit.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Tipo da Conta</Label>
                <Input
                  id="accountType"
                  {...register("account.accountType")}
                  autoComplete="off"
                />
                {errors.account?.accountType && (
                  <p className="text-sm text-red-500">
                    {errors.account.accountType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Nome do Titular</Label>
                <Input
                  id="accountHolderName"
                  {...register("account.accountHolderName")}
                  autoComplete="off"
                />
                {errors.account?.accountHolderName && (
                  <p className="text-sm text-red-500">
                    {errors.account.accountHolderName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolderDocument">
                  CPF/CNPJ do Titular
                </Label>
                <Input
                  id="accountHolderDocument"
                  {...register("account.accountHolderDocument")}
                  autoComplete="off"
                />
                {errors.account?.accountHolderDocument && (
                  <p className="text-sm text-red-500">
                    {errors.account.accountHolderDocument.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave PIX</Label>
                <Input
                  id="pixKey"
                  {...register("account.pixKey")}
                  autoComplete="off"
                />
                {errors.account?.pixKey && (
                  <p className="text-sm text-red-500">
                    {errors.account.pixKey.message}
                  </p>
                )}
              </div>
            </div>
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
