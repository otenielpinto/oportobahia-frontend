"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import {
  createPapelPermissao,
  updatePapelPermissao,
} from "@/actions/papelPermissaoAction";
import { getPapeis } from "@/actions/papelAction";
import { getPermissoes } from "@/actions/permissaoAction";
import { PapelPermissao } from "@/types/PapelPermissaoTypes";
import { Papel } from "@/types/PapelTypes";
import { Permissao } from "@/types/PermissaoTypes";

// Validation schema
const papelPermissaoSchema = z.object({
  id_papel: z.number().min(1, "Papel é obrigatório"),
  id_permissao: z.string().min(1, "Permissão é obrigatória"),
});

type FormValues = z.infer<typeof papelPermissaoSchema>;

interface PapelPermissaoFormProps {
  papelPermissao?: PapelPermissao;
  isEdit?: boolean;
}

// AIDEV-NOTE: form-component; carrega papeis e permissoes dinamicamente para selects
export function PapelPermissaoForm({
  papelPermissao,
  isEdit = false,
}: PapelPermissaoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [papeis, setPapeis] = useState<Papel[]>([]);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(papelPermissaoSchema),
    defaultValues: {
      id_papel: papelPermissao?.id_papel || 0,
      id_permissao: papelPermissao?.id_permissao || "",
    },
  });

  // Carrega dados para os selects
  useEffect(() => {
    async function loadSelectData() {
      try {
        const [papeisResponse, permissoesResponse] = await Promise.all([
          getPapeis({ ativo: "true" }), // Só papeis ativos
          getPermissoes(),
        ]);

        if (papeisResponse.success && papeisResponse.data) {
          setPapeis(papeisResponse.data as Papel[]);
        }

        if (permissoesResponse.success && permissoesResponse.data) {
          setPermissoes(permissoesResponse.data as Permissao[]);
        }
      } catch (error) {
        toast.error("Falha ao carregar dados dos formulários.");
      } finally {
        setLoadingData(false);
      }
    }

    loadSelectData();
  }, []);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      let response;

      if (isEdit && papelPermissao) {
        response = await updatePapelPermissao({
          id: papelPermissao.id,
          ...data,
        });
      } else {
        response = await createPapelPermissao(data);
      }

      if (!response.success) {
        throw new Error(response.error || "Erro desconhecido");
      }

      toast.success(response.message);

      // Redirect to list page
      router.push("/papel-permissao");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Falha ao salvar papel-permissão.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadingData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando dados...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEdit ? "Editar Papel-Permissão" : "Nova Papel-Permissão"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="id_papel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Papel *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : ""}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um papel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {papeis.map((papel) => (
                        <SelectItem key={papel.id} value={String(papel.id)}>
                          {papel.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="id_permissao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissão *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma permissão" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {permissoes.map((permissao) => (
                        <SelectItem key={permissao.id} value={permissao.id}>
                          {permissao.nome} ({permissao.tipo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/papel-permissao")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Atualizar" : "Criar"} Papel-Permissão
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
