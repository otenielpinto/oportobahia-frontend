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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Usuario } from "@/types/UsuarioType";
import { createUsuario, updateUsuario } from "@/actions/usuarioAction";
import { Switch } from "@/components/ui/switch";

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório.").max(60, "Nome muito longo."),
  email: z.string().email("Email inválido.").max(250, "Email muito longo."),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .optional()
    .nullable(),
  active: z.number().optional(),
  isAdmin: z.number().optional(),
});

type UsuarioFormValues = z.infer<typeof formSchema>;

interface UsuarioFormProps {
  isEdit?: boolean;
  usuario?: Usuario;
}

export default function UsuarioForm({
  isEdit = false,
  usuario,
}: UsuarioFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      active: 1,
      isAdmin: 0, // Assuming isAdmin is not part of the form but needed for user creation
    },
  });

  useEffect(() => {
    if (isEdit && usuario) {
      form.reset({
        ...usuario,
        active: 1,
        isAdmin: usuario.isAdmin ?? 0,
      });
    }
  }, [isEdit, usuario, form]);

  async function onSubmit(values: UsuarioFormValues) {
    setIsSubmitting(true);
    try {
      const dataToSave: any = {
        ...values,
      };

      if (!isEdit) {
        if (!dataToSave.password) {
          throw new Error("Senha é obrigatória para novos usuários.");
        }
      } else {
        if (!dataToSave.password) {
          delete dataToSave.password;
        }
      }

      let response;
      if (isEdit && usuario?.id) {
        await updateUsuario(usuario.id, dataToSave);
        response = {
          success: true,
          message: "Usuário atualizado com sucesso!",
        };
      } else {
        await createUsuario(dataToSave);
        response = { success: true, message: "Usuário criado com sucesso!" };
      }

      if (response.success) {
        toast.success(response.message);
        router.push("/usuario");
      } else {
        throw new Error("Falha ao salvar o usuário.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao salvar o usuário."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? `Editar Usuário: ${usuario?.name}` : "Novo Usuário"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do Usuário"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        disabled={isEdit}
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="******"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      {isEdit
                        ? "Deixe em branco para não alterar"
                        : "Mínimo 6 caracteres"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativo</FormLabel>
                    <FormDescription>
                      Define se o usuário está ativo no sistema.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 1}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 1 : 0)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Administrador</FormLabel>
                    <FormDescription>
                      Define se o usuário tem privilégios de administrador.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 1}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 1 : 0)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Salvar Alterações" : "Criar Usuário"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
