"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Permissao } from "@/types/PermissaoTypes";
import { createPermissao, updatePermissao } from "@/actions/permissaoAction";

// Zod schema for form validation
const formSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório.")
    .max(255, "Nome muito longo.")
    .transform((val) => val.toLowerCase()),
  tipo: z.string().min(1, "Tipo é obrigatório."),
});

type PermissaoFormValues = z.infer<typeof formSchema>;

interface PermissaoFormProps {
  isEdit?: boolean;
  permissao?: Permissao;
}

export default function PermissaoForm({
  isEdit = false,
  permissao,
}: PermissaoFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PermissaoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      tipo: "",
    },
  });

  useEffect(() => {
    if (isEdit && permissao) {
      form.reset({
        nome: permissao.nome || "",
        tipo: permissao.tipo || "",
      });
    }
  }, [isEdit, permissao, form]);

  async function onSubmit(values: PermissaoFormValues) {
    setIsSubmitting(true);
    try {
      let response;
      if (isEdit && permissao?.id) {
        response = await updatePermissao({ id: permissao.id, ...values });
      } else {
        response = await createPermissao(values);
      }

      if (response.success) {
        toast.success(response.message);
        router.push("/permissao");
      } else {
        throw new Error(response.error || "Falha ao salvar a permissão.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao salvar a permissão.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? `Editar Permissão: ${permissao?.nome}` : "Nova Permissão"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome da permissão"
                        {...field}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="menu">MENU</SelectItem>
                        <SelectItem value="submenu">SUBMENU</SelectItem>
                        <SelectItem value="acao">AÇÃO</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Salvar Alterações" : "Criar Permissão"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
