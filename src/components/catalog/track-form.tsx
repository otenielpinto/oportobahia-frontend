"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trackSchema } from "@/lib/schemas";
import { type Track, type TrackFormData } from "@/types/catalogTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateTrack, createTrack } from "@/actions/actCatalog";
import { getPublishers } from "@/actions/actPublishers";
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

interface TrackFormProps {
  catalogId: string;
  track?: Track | null;
  onSuccess: () => void;
}

export function TrackForm({ catalogId, track, onSuccess }: TrackFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<TrackFormData>({
    resolver: zodResolver(trackSchema),
    defaultValues: track || {
      trackCode: "",
      isrc: "",
      work: "",
      authors: "",
      publisher: "",
      participationPercentage: 0,
    },
  });

  const { data: publishers, isLoading: isLoadingPublishers } = useQuery({
    queryKey: ["publishers"],
    queryFn: () => getPublishers(),
  });

  const mutation = useMutation({
    mutationFn: async (data: TrackFormData) => {
      try {
        if (track) {
          return await updateTrack(catalogId, data);
        } else {
          return await createTrack(catalogId, data);
        }
      } catch (error) {
        console.error("Erro na mutação:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks", catalogId] });
      toast.success(
        track ? "Faixa atualizada com sucesso" : "Faixa criada com sucesso"
      );
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Erro na operação:", error);
      toast.error(
        track
          ? "Falha ao atualizar faixa. Tente novamente."
          : "Falha ao criar faixa. Tente novamente."
      );
    },
  });

  const onSubmit = async (data: TrackFormData) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error("Erro no envio do formulário:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="trackCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nº da Faixa</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isrc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ISRC</FormLabel>
              <FormControl>
                <Input {...field} placeholder="BR-XXX-YY-NNNNN" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="work"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Obra</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="authors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Autores</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="publisher"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Editora</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={isLoadingPublishers}>
                    <SelectValue
                      placeholder={
                        isLoadingPublishers
                          ? "Carregando editoras..."
                          : "Selecione a editora"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {publishers?.map((pub) => (
                    <SelectItem key={pub.id} value={pub.name}>
                      {pub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="participationPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>% de Participação</FormLabel>
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
        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={mutation.isPending || form.formState.isSubmitting}
          >
            {mutation.isPending
              ? "Processando..."
              : track
              ? "Atualizar Faixa"
              : "Criar Faixa"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
