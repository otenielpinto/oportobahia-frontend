"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { catalogSchema } from "@/lib/schemas";
import { type Catalog, type CatalogFormData } from "@/types/catalogTypes";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  getProductByGtin,
  getCatalogByBarcode,
  createCatalog,
  updateCatalog,
} from "@/actions/actCatalog";
import { getFormatos, getFormatoByName } from "@/actions/actFormatos";
import { toast } from "sonner";
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
import { useEffect, useState } from "react";

interface CatalogFormProps {
  catalog?: Catalog | null;
  onSuccess: () => void;
}

export function CatalogForm({ catalog, onSuccess }: CatalogFormProps) {
  const queryClient = useQueryClient();

  const { data: formatos, isLoading: isLoadingFormatos } = useQuery<any[]>({
    queryKey: ["formatos"],
    queryFn: async () => await getFormatos(),
  });

  const handleFormatChange = async (formatName: string) => {
    try {
      const formato = await getFormatoByName(formatName);
      if (formato) {
        form.setValue("trackLimit", formato.limite_faixas);
        form.setValue("trackPercentage", formato.percentual_faixa);
      }
    } catch (error) {
      console.error("Erro ao buscar formato:", error);
    }
  };

  const handleBarcodeChange = async (barcode: string) => {
    if (!barcode || catalog) return;
    try {
      const hasCatalog = await getCatalogByBarcode(barcode);
      if (hasCatalog) {
        toast.error("Já existe um catálogo com este código de barras");
        return;
      }

      const product = await getProductByGtin(barcode);
      if (product?.nome) {
        form.setValue("workTitle", product?.nome);
        form.setValue("catalogCode", product?.codigo);
      }
    } catch (error) {
      console.error("Erro ao buscar catálogo pelo código de barras:", error);
    }
  };

  const form = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
    defaultValues: catalog || {
      catalogCode: "",
      barcode: "",
      artist: "",
      workTitle: "",
      originalCode: "",
      originalReleaseDate: "",
      baseCalculationPercentage: 0,
      numberOfDiscs: 1,
      numberOfTracks: 1,
      trackLimit: 1,
      format: "",
      trackPercentage: 0,
      majorGenre : "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CatalogFormData) =>
      catalog ? updateCatalog(catalog.id, data) : createCatalog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      toast.success(
        catalog
          ? "Catálogo atualizado com sucesso"
          : "Catálogo criado com sucesso"
      );
      onSuccess();
    },
    onError: () => {
      toast.error(
        catalog ? "Falha ao atualizar catálogo" : "Falha ao criar catálogo"
      );
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        {isLoadingFormatos && <p>Carregando formatos...</p>}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Barras</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onBlur={() => handleBarcodeChange(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="catalogCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código do Catálogo</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="artist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artista</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="workTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Obra</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="originalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Original</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="originalReleaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Lanc. Original</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="majorGenre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gênero Principal</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="format"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formato</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleFormatChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {formatos?.map((format: any) => (
                      <SelectItem key={format.id} value={format.name}>
                        {format.name}
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
            name="baseCalculationPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel> % de Cálculo Base</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trackPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>% por Faixa</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="numberOfDiscs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Discos</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numberOfTracks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Faixas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trackLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limite de Faixas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={mutation.isPending}>
            {catalog ? "Atualizar" : "Criar"} Catálogo
          </Button>
        </div>
      </form>
    </Form>
  );
}
