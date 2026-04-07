"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Search } from "lucide-react";

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
import { Empresa } from "@/types/EmpresaTypes";
import { createEmpresa, updateEmpresa } from "@/actions/empresaAction";
import { Switch } from "@/components/ui/switch";

// Zod schema for form validation
const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório.").max(60, "Nome muito longo."),
  fantasia: z
    .string()
    .max(60, "Nome fantasia muito longo.")
    .optional()
    .nullable(),
  rua: z.string().max(60, "Rua muito longa.").optional().nullable(),
  nro: z.string().max(60, "Número muito longo.").optional().nullable(),
  bairro: z.string().max(60, "Bairro muito longo.").optional().nullable(),
  cep: z.string().max(10, "CEP muito longo.").optional().nullable(),
  cidade: z.string().max(60, "Cidade muito longa.").optional().nullable(),
  uf: z.string().max(2, "UF inválida.").optional().nullable(),
  ddd: z
    .number()
    .int("DDD inválido.")
    .min(0, "DDD inválido.")
    .max(999, "DDD inválido.")
    .optional()
    .nullable(),
  telefone: z.string().max(20, "Telefone muito longo.").optional().nullable(),
  fax: z.string().max(20, "Fax muito longo.").optional().nullable(),
  email: z
    .string()
    .email("Email inválido.")
    .max(250, "Email muito longo.")
    .optional()
    .nullable(),
  website: z
    .string()
    .max(250, "Website muito longo.")
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      {
        message: "URL inválida.",
      },
    )
    .optional()
    .nullable(),
  cpfcnpj: z
    .string()
    .min(1, "CPF/CNPJ é obrigatório.")
    .max(18, "CPF/CNPJ muito longo."),
  ie: z
    .string()
    .max(20, "Inscrição Estadual muito longa.")
    .optional()
    .nullable(),
  im: z
    .string()
    .max(20, "Inscrição Municipal muito longa.")
    .optional()
    .nullable(),
  crt: z
    .number()
    .int("CRT inválido.")
    .min(0, "CRT inválido.")
    .optional()
    .nullable(),
  cnae: z
    .number()
    .int("CNAE inválido.")
    .min(0, "CNAE inválido.")
    .optional()
    .nullable(),
  ativo: z.boolean().optional(), // Changed from string 'S'/'N' to boolean
  filial: z.boolean().optional(), // Changed from string 'S'/'N' to boolean
  estoquePorEmpresa: z.boolean().optional(), // Changed from string 'S'/'N' to boolean
  // Other fields like multa, juros, carta, txPis, txCofins, xIbge are not in EmpresaFormData,
  // so they are omitted for simplicity in this form.
});

type EmpresaFormValues = z.infer<typeof formSchema>;

interface EmpresaFormProps {
  isEdit?: boolean;
  empresa?: Empresa;
}

export default function EmpresaForm({
  isEdit = false,
  empresa,
}: EmpresaFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      fantasia: "",
      rua: "",
      nro: "",
      bairro: "",
      cep: "",
      cidade: "",
      uf: "",
      ddd: null,
      telefone: "",
      fax: "",
      email: "",
      website: "",
      cpfcnpj: "",
      ie: "",
      im: "",
      crt: null,
      cnae: null,
      ativo: true, // Default to true for new, or based on existing
      filial: false,
      estoquePorEmpresa: false,
    },
  });

  useEffect(() => {
    if (isEdit && empresa) {
      form.reset({
        ...empresa,
        ddd: empresa.ddd || null,
        crt: empresa.crt || null,
        cnae: empresa.cnae || null,
        ativo: empresa.ativo === "S", // Convert 'S'/'N' to boolean
        filial: empresa.filial === "S",
        estoquePorEmpresa: empresa.estoquePorEmpresa === "S",
      });
    }
  }, [isEdit, empresa, form]);

  const formatCnpj = (cnpj: string): string => {
    return cnpj.replace(/\D/g, "");
  };

  const handleSearchCnpj = async () => {
    const cnpj = form.getValues("cpfcnpj");
    if (!cnpj) {
      toast.warning("Digite um CNPJ para buscar os dados.");
      return;
    }

    const formattedCnpj = formatCnpj(cnpj);
    if (formattedCnpj.length !== 14) {
      toast.error("CNPJ deve conter 14 dígitos.");
      return;
    }

    setIsSearchingCnpj(true);
    try {
      const response = await fetch(`/api/receita?cnpj=${formattedCnpj}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao consultar CNPJ");
      }
      console.log(data);

      // Auto-preencher os campos do formulário
      form.setValue("nome", data.nome || "");
      form.setValue("fantasia", data.fantasia || "");
      form.setValue("rua", data.logradouro || "");
      form.setValue("nro", data.numero || "");
      form.setValue("bairro", data.bairro || "");
      form.setValue("cep", data.cep || "");
      form.setValue("cidade", data.municipio || "");
      form.setValue("uf", data.uf || "");
      form.setValue("cnae", data.cnae_fiscal || null);
      form.setValue("telefone", data.telefone || "");
      form.setValue("email", data.email || "");

      toast.success("Dados do CNPJ carregados com sucesso.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao buscar dados do CNPJ.",
      );
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  async function onSubmit(values: EmpresaFormValues) {
    setIsSubmitting(true);
    try {
      const dataToSave: any = {
        ...values,
        ativo: values.ativo ? "S" : "N", // Convert boolean back to 'S'/'N'
        filial: values.filial ? "S" : "N",
        estoquePorEmpresa: values.estoquePorEmpresa ? "S" : "N",
      };

      let response;
      if (isEdit && empresa?.id) {
        response = await updateEmpresa({ id: empresa.id, ...dataToSave });
      } else {
        response = await createEmpresa(dataToSave);
      }

      if (response.success) {
        toast.success(response.message);
        router.push("/empresa");
      } else {
        throw new Error(response.error || "Falha ao salvar a empresa.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao salvar a empresa.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? `Editar Empresa: ${empresa?.nome}` : "Nova Empresa"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* CNPJ Field - First field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpfcnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="CNPJ somente numeros"
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleSearchCnpj}
                        disabled={isSearchingCnpj}
                        title="Buscar dados do CNPJ"
                      >
                        {isSearchingCnpj ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da Empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fantasia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Fantasia</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome Fantasia"
                        {...field}
                        value={field.value || ""}
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
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(XX) XXXX-XXXX"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.exemplo.com"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00000-000"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rua"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rua Exemplo"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bairro Exemplo"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cidade Exemplo"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="uf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SP"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <FormDescription>
                        Define se a empresa está ativa no sistema.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="filial"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Filial</FormLabel>
                      <FormDescription>
                        Indica se esta empresa é uma filial.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estoquePorEmpresa"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Estoque por Empresa
                      </FormLabel>
                      <FormDescription>
                        Controla o estoque individualmente para esta empresa.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Salvar Alterações" : "Criar Empresa"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
