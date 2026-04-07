"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { createPapel, updatePapel } from "@/actions/papelAction";
import { Papel } from "@/types/PapelTypes";

// Validation schema
const papelSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  ativo: z.boolean(),
});

type FormValues = z.infer<typeof papelSchema>;

interface PapelFormProps {
  papel?: Papel;
  isEdit?: boolean;
}

export function PapelForm({ papel, isEdit = false }: PapelFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(papelSchema),
    defaultValues: {
      nome: papel?.nome || "",
      ativo: papel?.ativo !== undefined ? papel.ativo : true,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      let response;

      if (isEdit && papel) {
        response = await updatePapel({
          id: papel.id,
          ...data,
        });
      } else {
        response = await createPapel(data);
      }

      if (!response.success) {
        throw new Error(response.error || "Erro desconhecido");
      }

      toast.success(response.message);

      // Redirect to list page
      router.push("/papel");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao salvar papel.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Papel" : "Novo Papel"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome do papel"
                      {...field}
                      disabled={isSubmitting}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativo</FormLabel>
                    <div className="text-[0.8rem] text-muted-foreground">
                      Define se o papel está ativo no sistema
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/papel")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Atualizar" : "Criar"} Papel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
