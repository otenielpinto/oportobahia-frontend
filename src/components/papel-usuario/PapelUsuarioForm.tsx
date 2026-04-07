"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  createPapelUsuario,
  updatePapelUsuario,
} from "@/actions/papelUsuarioAction";
import { getUsuarios } from "@/actions/usuarioAction";
import { getPapeis } from "@/actions/papelAction";
import { PapelUsuario } from "@/types/PapelUsuarioTypes";
import { Usuario } from "@/types/UsuarioType";
import { Papel } from "@/types/PapelTypes";

// AIDEV-NOTE: form-validation; schema Zod para validação client-side
const papelUsuarioSchema = z.object({
  id_usuario: z.string().min(1, "Selecione um usuário"),
  id_papel: z.number().min(1, "Selecione um papel"),
});

type PapelUsuarioFormData = z.infer<typeof papelUsuarioSchema>;

interface PapelUsuarioFormProps {
  papelUsuario?: PapelUsuario;
  onSuccess?: () => void;
}

export function PapelUsuarioForm({
  papelUsuario,
  onSuccess,
}: PapelUsuarioFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [papeis, setPapeis] = useState<Papel[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<PapelUsuarioFormData>({
    resolver: zodResolver(papelUsuarioSchema),
    defaultValues: {
      id_usuario: papelUsuario?.id_usuario || "",
      id_papel: papelUsuario?.id_papel || 0,
    },
  });

  // AIDEV-NOTE: data-loading; carrega usuários e papéis para os selects
  useEffect(() => {
    async function loadSelectData() {
      try {
        const [usuariosResult, papeisResult] = await Promise.all([
          getUsuarios(),
          getPapeis({ ativo: "true" }),
        ]);

        if (Array.isArray(usuariosResult)) {
          setUsuarios(usuariosResult as any[]);
        }

        if (papeisResult.success && papeisResult.data) {
          setPapeis(papeisResult.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Não foi possível carregar os dados necessários");
      } finally {
        setLoadingData(false);
      }
    }

    loadSelectData();
  }, []);

  const onSubmit = async (data: PapelUsuarioFormData) => {
    setIsSubmitting(true);

    try {
      let result;

      if (papelUsuario?.id) {
        // Update
        result = await updatePapelUsuario({
          id: papelUsuario.id,
          ...data,
        });
      } else {
        // Create
        result = await createPapelUsuario(data);
      }

      if (result.success) {
        toast.success(result.message || "Operação realizada com sucesso");

        if (onSuccess) {
          onSuccess();
        } else {
          form.reset();
        }
      } else {
        toast.error(result.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro no envio:", error);
      toast.error("Erro interno do sistema");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {papelUsuario ? "Editar" : "Novo"} Papel de Usuário
        </h1>
        <p className="text-gray-600">
          {papelUsuario
            ? "Edite os dados do papel de usuário"
            : "Associe um papel a um usuário"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="id_usuario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuário</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id!}>
                        {usuario.name || usuario.email}
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
            name="id_papel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Papel</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value ? String(field.value) : ""}
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

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {papelUsuario ? "Atualizando..." : "Criando..."}
                </>
              ) : (
                <>{papelUsuario ? "Atualizar" : "Criar"}</>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
