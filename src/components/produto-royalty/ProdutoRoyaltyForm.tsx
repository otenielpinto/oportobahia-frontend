"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createProdutoRoyalty,
  updateProdutoRoyalty,
} from "@/actions/produtoRoyaltyAction";
import { ProdutoRoyalty } from "@/types/produtoRoyaltyTypes";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schema de validação
const formSchema = z.object({
  sku: z.string().optional(),
  gtinEan: z.string().optional(),
  descricaoTitulo: z.string().optional(),
  release: z.date().optional().nullable(),
  listaPreco: z.string().optional(),
  precoOporto: z.number().optional(),
  precoDistribuidora: z.number().optional(),
  ncm: z.string().optional(),
  origem: z.string().optional(),
  precoCusto: z.number().optional(),
  fornecedor: z.string().optional(),
  categoriaProduto: z.string().optional(),
  marca: z.string().optional(),
  nivelRoyalty: z.string().optional(),
  percentual: z.number().optional(),
  tipo: z.string().optional(),
  numeroDiscos: z.number().optional(),
  numeroFaixas: z.number().optional(),
  gravadora: z.string().optional(),
  peso: z.number().optional(),
  importadoEm: z.date().optional(),
  loteImportacao: z.string().optional(),
});

interface ProdutoRoyaltyFormProps {
  isEdit?: boolean;
  produto?: ProdutoRoyalty;
}

export default function ProdutoRoyaltyForm({
  isEdit = false,
  produto,
}: ProdutoRoyaltyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: produto?.sku || "",
      gtinEan: produto?.gtinEan || "",
      descricaoTitulo: produto?.descricaoTitulo || "",
      release: produto?.release ? new Date(produto.release) : null,
      listaPreco: produto?.listaPreco || "",
      precoOporto: produto?.precoOporto || 0,
      precoDistribuidora: produto?.precoDistribuidora || 0,
      ncm: produto?.ncm || "",
      origem: produto?.origem || "",
      precoCusto: produto?.precoCusto || 0,
      fornecedor: produto?.fornecedor || "",
      categoriaProduto: produto?.categoriaProduto || "",
      marca: produto?.marca || "",
      nivelRoyalty: produto?.nivelRoyalty || "",
      percentual: produto?.percentual || 0,
      tipo: produto?.tipo || "",
      numeroDiscos: produto?.numeroDiscos || 0,
      numeroFaixas: produto?.numeroFaixas || 0,
      gravadora: produto?.gravadora || "",
      peso: produto?.peso || 0,
      importadoEm: produto?.importadoEm
        ? new Date(produto.importadoEm)
        : undefined,
      loteImportacao: produto?.loteImportacao || "",
    },
  });

  useEffect(() => {
    if (produto) {
      form.reset({
        sku: produto.sku || "",
        gtinEan: produto.gtinEan || "",
        descricaoTitulo: produto.descricaoTitulo || "",
        release: produto.release ? new Date(produto.release) : null,
        listaPreco: produto.listaPreco || "",
        precoOporto: produto.precoOporto || 0,
        precoDistribuidora: produto.precoDistribuidora || 0,
        ncm: produto.ncm || "",
        origem: produto.origem || "",
        precoCusto: produto.precoCusto || 0,
        fornecedor: produto.fornecedor || "",
        categoriaProduto: produto.categoriaProduto || "",
        marca: produto.marca || "",
        nivelRoyalty: produto.nivelRoyalty || "",
        percentual: produto.percentual || 0,
        tipo: produto.tipo || "",
        numeroDiscos: produto.numeroDiscos || 0,
        numeroFaixas: produto.numeroFaixas || 0,
        gravadora: produto.gravadora || "",
        peso: produto.peso || 0,
        importadoEm: produto.importadoEm
          ? new Date(produto.importadoEm)
          : undefined,
        loteImportacao: produto.loteImportacao || "",
      });
    }
  }, [produto, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      let response;

      if (isEdit && produto?.id) {
        response = await updateProdutoRoyalty({ id: produto.id, ...data });
      } else {
        response = await createProdutoRoyalty(data);
      }

      if (response.success) {
        toast.success(response.message || "Produto royalty salvo com sucesso.");
        router.push("/produto-royalty");
      } else {
        throw new Error(response.error || "Falha ao salvar o produto royalty.");
      }
    } catch (error: any) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Falha ao salvar o produto royalty.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit
            ? `Editar Produto Royalty: ${produto?.descricaoTitulo || "Produto"}`
            : "Novo Produto Royalty"}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? "Edite as informações do produto royalty."
            : "Preencha os dados para criar um novo produto royalty."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Linha 1: SKU, GTIN/EAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Código SKU"
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
                name="gtinEan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GTIN/EAN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Código GTIN/EAN"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 2: Título, Marca, Gravadora */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="descricaoTitulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título/Descrição</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Título do produto"
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
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Marca"
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
                name="gravadora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gravadora</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Gravadora"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 3: Preços */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="precoOporto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Oporto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="precoDistribuidora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Distribuidora</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="precoCusto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Custo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="listaPreco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lista Preço</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Lista de preço"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 4: NCM, Origem, Tipo, Fornecedor */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="ncm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NCM</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Código NCM"
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
                name="origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origem</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Origem do produto"
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
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tipo de produto"
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
                name="fornecedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Fornecedor"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 5: Categoria, Nível Royalty, Percentual, Peso */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="categoriaProduto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Categoria do produto"
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
                name="nivelRoyalty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível Royalty</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nível de royalty"
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
                name="percentual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentual</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="peso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 6: Discos, Faixas, Lote Importação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="numeroDiscos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Discos</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numeroFaixas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Faixas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/produto-royalty")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
