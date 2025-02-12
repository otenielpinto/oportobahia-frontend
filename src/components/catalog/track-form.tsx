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
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TrackFormProps {
  catalogId: string;
  track?: Track | null;
  onSuccess: () => void;
}

export function TrackForm({ catalogId, track, onSuccess }: TrackFormProps) {
  const queryClient = useQueryClient();

  // Atualizar defaultValues para incluir publishers explicitamente
  const form = useForm<TrackFormData>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      trackCode: track?.trackCode || "",
      isrc: track?.isrc || "",
      work: track?.work || "",
      authors: track?.authors || "",
      publishers: track?.publishers || [],
      catalogId: catalogId,
      playLength: track?.playLength || "",
    },
  });

  const { data: publishers, isLoading: isLoadingPublishers } = useQuery({
    queryKey: ["publishers"],
    queryFn: () => getPublishers(),
  });

  const validatePublishers = () => {
    if (!selectedPublishers || selectedPublishers.length === 0) {
      toast.error(
        "É necessário adicionar pelo menos uma editora com seu percentual de participação"
      );
      return false;
    }

    if (totalPercentage !== 100) {
      toast.error(
        totalPercentage === 0
          ? "É necessário informar o percentual de participação da editora"
          : "O total de percentuais deve ser igual a 100%"
      );
      return false;
    }

    return true;
  };

  const mutation = useMutation({
    mutationFn: async (data: TrackFormData) => {
      // Validar publishers antes de qualquer operação
      if (!validatePublishers()) {
        throw new Error("Validação de editoras falhou");
      }

      try {
        if (track) {
          return await updateTrack(catalogId, {
            ...data,
            id: track.id,
            publishers: selectedPublishers,
          });
        } else {
          return await createTrack(catalogId, {
            ...data,
            publishers: selectedPublishers,
          });
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

  const [selectedPublishers, setSelectedPublishers] = useState<
    Array<{ name: string; participationPercentage: number }>
  >(track?.publishers || []);
  const [currentPublisher, setCurrentPublisher] = useState("");
  const [currentPercentage, setCurrentPercentage] = useState<number>(0);
  const [totalPercentage, setTotalPercentage] = useState(0);

  useEffect(() => {
    if (track?.publishers) {
      setSelectedPublishers(track.publishers);
    }
  }, [track]);

  useEffect(() => {
    const total = selectedPublishers.reduce(
      (sum, pub) => sum + pub.participationPercentage,
      0
    );
    setTotalPercentage(total);
  }, [selectedPublishers]);

  // Atualizar estado do form quando selectedPublishers mudar
  useEffect(() => {
    const formValue = form.getValues();
    form.setValue("publishers", selectedPublishers, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [selectedPublishers, form]);

  const addPublisher = () => {
    if (!currentPublisher || currentPercentage <= 0) {
      toast.error("Selecione uma editora e defina um percentual maior que 0");
      return;
    }

    if (totalPercentage + currentPercentage > 100) {
      toast.error("O total de percentuais não pode exceder 100%");
      return;
    }

    if (selectedPublishers.some((pub) => pub.name === currentPublisher)) {
      toast.error("Esta editora já foi adicionada");
      return;
    }

    const newPublisher = {
      name: currentPublisher,
      participationPercentage: currentPercentage,
    };

    // Atualizar tanto o estado local quanto o form
    setSelectedPublishers((prev) => {
      const updated = [...prev, newPublisher];
      form.setValue("publishers", updated, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return updated;
    });

    setCurrentPublisher("");
    setCurrentPercentage(0);
  };

  const removePublisher = (publisherName: string) => {
    setSelectedPublishers((prev) => {
      const updated = prev.filter((pub) => pub.name !== publisherName);
      form.setValue("publishers", updated, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return updated;
    });
  };

  const onSubmit = async (data: TrackFormData) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error("Erro no envio do formulário:", error);
    }
  };

  const formatTimeInput = (value: string) => {
    // Se vier vazio ou apenas ":", retorna vazio
    if (!value || value === ':') return '';
    
    // Remove tudo exceto números
    let numbers = value.replace(/\D/g, '');
    
    // Casos especiais para backspace e deleção
    if (value.endsWith(':')) {
      return value.slice(0, -1);
    }
    
    // Se não houver números, retorna vazio
    if (!numbers) return '';
    
    // Se for apenas um dígito
    if (numbers.length === 1) {
      // Se for maior que 5, adiciona 0 na frente
      return parseInt(numbers) > 5 ? `0${numbers}:` : numbers;
    }
    
    // Se forem dois dígitos
    if (numbers.length === 2) {
      // Se for maior que 59, limita a 59
      numbers = parseInt(numbers) > 59 ? '59' : numbers;
      return `${numbers}:`;
    }
    
    // Se forem três dígitos
    if (numbers.length === 3) {
      const minutes = numbers.slice(0, 2);
      const seconds = numbers.slice(2);
      return `${minutes}:${seconds}`;
    }
    
    // Se forem quatro dígitos
    if (numbers.length >= 4) {
      const minutes = numbers.slice(0, 2);
      let seconds = numbers.slice(2, 4);
      // Se os segundos forem maior que 59, limita a 59
      seconds = parseInt(seconds) > 59 ? '59' : seconds;
      return `${minutes}:${seconds}`;
    }
    
    return value;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTimeInput(e.target.value);
    form.setValue('playLength', formatted, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
        </div>
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
          name="playLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tempo</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  placeholder="00:00"
                  onChange={handleTimeChange}
                  maxLength={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <FormItem>
                <FormLabel>Editora</FormLabel>
                <Select
                  value={currentPublisher}
                  onValueChange={setCurrentPublisher}
                >
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
              </FormItem>
            </div>
            <div>
              <FormItem>
                <FormLabel>% de Participação</FormLabel>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={currentPercentage || ""}
                    onChange={(e) =>
                      setCurrentPercentage(Number(e.target.value))
                    }
                  />
                  <Button
                    type="button"
                    onClick={addPublisher}
                    variant="outline"
                    size="icon"
                  >
                    +
                  </Button>
                </div>
              </FormItem>
            </div>
          </div>

          <div className="border rounded-md p-2">
            <ScrollArea className="h-24">
              <div className="flex flex-wrap gap-2 p-1">
                {selectedPublishers.map((pub) => (
                  <Badge
                    key={pub.name}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {pub.name} ({pub.participationPercentage}%)
                    <button
                      type="button"
                      onClick={() => removePublisher(pub.name)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-2 text-sm text-muted-foreground">
              Total: {totalPercentage}%
            </div>
          </div>
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
