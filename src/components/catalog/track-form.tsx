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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TrackFormProps {
  catalogId: string;
  track?: Track | null;
  onSuccess: () => void;
}

export function TrackForm({ catalogId, track, onSuccess }: TrackFormProps) {
  const queryClient = useQueryClient();

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
      originalPublisher: track?.originalPublisher,
      subTracks: track?.subTracks || [],
    },
  });

  const { data: publishers, isLoading: isLoadingPublishers } = useQuery({
    queryKey: ["publishers"],
    queryFn: () => getPublishers(),
  });

  // const validatePublishers = () => {
  //   if (!selectedPublishers || selectedPublishers.length === 0) {
  //     toast.error(
  //       "É necessário adicionar pelo menos uma editora com seu percentual de participação"
  //     );
  //     return false;
  //   }

  //   if (totalPercentage !== 100) {
  //     toast.error(
  //       totalPercentage === 0
  //         ? "É necessário informar o percentual de participação da editora"
  //         : "O total de percentuais deve ser igual a 100%"
  //     );
  //     return false;
  //   }

  //   return true;
  // };

  const mutation = useMutation({
    mutationFn: async (data: TrackFormData) => {
      // if (!validatePublishers()) {
      //   throw new Error("Validação de editoras falhou");
      // }

      if (data.subTracks?.length === 0 && data.publishers?.length === 0) {
        throw new Error("Validação de editoras falhou");
      }

      if (
        (data.subTracks?.length ?? 0) > 0 &&
        (data.publishers?.length ?? 0) > 0
      ) {
        throw new Error("Validação de editoras falhou");
      }

      try {
        if (track) {
          return await updateTrack(catalogId, {
            ...data,
            id: track.id,
            publishers: selectedPublishers,
            subTracks: selectedSubTracks,
          });
        } else {
          return await createTrack(catalogId, {
            ...data,
            publishers: selectedPublishers,
            subTracks: selectedSubTracks,
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

  // Estados para publishers
  const [selectedPublishers, setSelectedPublishers] = useState<
    Array<{ name: string; participationPercentage: number }>
  >(track?.publishers || []);
  const [currentPublisher, setCurrentPublisher] = useState("");
  const [currentPercentage, setCurrentPercentage] = useState<number>(0);
  const [totalPercentage, setTotalPercentage] = useState(0);

  // Estados para subTracks
  const [selectedSubTracks, setSelectedSubTracks] = useState<
    Array<{
      publisher: string;
      participationPercentage: number;
      work: string;
      authors: string;
      playLength: string;
      originalPublisher: string;
    }>
  >(track?.subTracks || []);
  const [currentSubTrackPublisher, setCurrentSubTrackPublisher] = useState("");
  const [currentSubTrackPercentage, setCurrentSubTrackPercentage] =
    useState<number>(0);
  const [currentSubTrackWork, setCurrentSubTrackWork] = useState("");
  const [currentSubTrackAuthors, setCurrentSubTrackAuthors] = useState("");
  const [currentSubTrackPlayLength, setCurrentSubTrackPlayLength] =
    useState(""); // Changed from time to playLength
  const [
    currentSubTrackOriginalPublisher,
    setCurrentSubTrackOriginalPublisher,
  ] = useState("");
  const [totalSubTrackPercentage, setTotalSubTrackPercentage] = useState(0);

  useEffect(() => {
    if (track?.publishers) {
      setSelectedPublishers(track.publishers);
    }
    if (track?.subTracks) {
      setSelectedSubTracks(track.subTracks);
    }
  }, [track]);

  useEffect(() => {
    const total = selectedPublishers.reduce(
      (sum, pub) => sum + pub.participationPercentage,
      0
    );
    setTotalPercentage(total);
  }, [selectedPublishers]);

  useEffect(() => {
    const total = selectedSubTracks.reduce(
      (sum, track) => sum + track.participationPercentage,
      0
    );
    setTotalSubTrackPercentage(total);
  }, [selectedSubTracks]);

  useEffect(() => {
    form.setValue("publishers", selectedPublishers, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [selectedPublishers, form]);

  useEffect(() => {
    form.setValue("subTracks", selectedSubTracks, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [selectedSubTracks, form]);

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

  const addSubTrack = () => {
    if (selectedPublishers.length > 0) {
      toast.error("Remova as editoras para preencher as Musicas da Faixa");
      return;
    }

    if (!currentSubTrackPublisher || currentSubTrackPercentage <= 0) {
      toast.error("Selecione uma editora e defina um percentual maior que 0");
      return;
    }

    if (totalSubTrackPercentage + currentSubTrackPercentage > 100) {
      toast.error("O total de percentuais não pode exceder 100%");
      return;
    }

    if (
      selectedSubTracks.some(
        (track) => track.publisher === currentSubTrackPublisher
      )
    ) {
      toast.error("Esta editora já foi adicionada");
      return;
    }

    if (!currentSubTrackWork) {
      toast.error("O nome da obra é obrigatório");
      return;
    }

    if (!currentSubTrackAuthors) {
      toast.error("Autores são obrigatórios");
      return;
    }

    if (!currentSubTrackPlayLength) {
      toast.error("Tempo deve estar no formato mm:ss");
      return;
    }

    if (!currentSubTrackOriginalPublisher) {
      toast.error("Editora original é obrigatória");
      return;
    }

    const newSubTrack = {
      publisher: currentSubTrackPublisher,
      participationPercentage: currentSubTrackPercentage,
      work: currentSubTrackWork,
      authors: currentSubTrackAuthors,
      playLength: currentSubTrackPlayLength, // Changed from time to playLength
      originalPublisher: currentSubTrackOriginalPublisher,
    };

    setSelectedSubTracks((prev) => {
      const updated = [...prev, newSubTrack];
      form.setValue("subTracks", updated, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return updated;
    });

    setCurrentSubTrackPublisher("");
    setCurrentSubTrackPercentage(0);
    setCurrentSubTrackWork("");
    setCurrentSubTrackAuthors("");
    setCurrentSubTrackPlayLength(""); // Changed from time to playLength
    setCurrentSubTrackOriginalPublisher("");
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

  const removeSubTrack = (publisherName: string) => {
    setSelectedSubTracks((prev) => {
      const updated = prev.filter((track) => track.publisher !== publisherName);
      form.setValue("subTracks", updated, {
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
    if (!value || value === ":") return "";
    let numbers = value.replace(/\D/g, "");
    if (value.endsWith(":")) {
      return value.slice(0, -1);
    }
    if (!numbers) return "";
    if (numbers.length === 1) {
      return parseInt(numbers) > 5 ? `0${numbers}:` : numbers;
    }
    if (numbers.length === 2) {
      numbers = parseInt(numbers) > 59 ? "59" : numbers;
      return `${numbers}:`;
    }
    if (numbers.length === 3) {
      const minutes = numbers.slice(0, 2);
      const seconds = numbers.slice(2);
      return `${minutes}:${seconds}`;
    }
    if (numbers.length >= 4) {
      const minutes = numbers.slice(0, 2);
      let seconds = numbers.slice(2, 4);
      seconds = parseInt(seconds) > 59 ? "59" : seconds;
      return `${minutes}:${seconds}`;
    }
    return value;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTimeInput(e.target.value);
    form.setValue("playLength", formatted, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="h-[calc(100vh-10rem)] pr-4 max-w-[95%] w-full">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">
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
              </div>
              <div className="col-span-2">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">
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
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="originalPublisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Editora Original</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nome da editora original"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Seção de Editoras */}
            <Accordion type="single" collapsible>
              <AccordionItem value="publishers">
                <AccordionTrigger>Editoras</AccordionTrigger>
                <AccordionContent>
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
                      <ScrollArea className="h-10">
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Seção de SubTracks */}
            <Accordion type="single" collapsible className="my-4">
              <AccordionItem
                value="subtracks"
                className="bg-yellow-200 rounded-lg border"
              >
                <AccordionTrigger className="ml-4">
                  Musicas da Faixa
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-2">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <FormItem>
                            <FormLabel>Obra</FormLabel>
                            <Input
                              value={currentSubTrackWork}
                              onChange={(e) =>
                                setCurrentSubTrackWork(e.target.value)
                              }
                              placeholder="Digite o nome da obra"
                            />
                          </FormItem>
                        </div>

                        <div className="md:col-span-2">
                          <FormItem>
                            <FormLabel>Autores</FormLabel>
                            <Input
                              value={currentSubTrackAuthors}
                              onChange={(e) =>
                                setCurrentSubTrackAuthors(e.target.value)
                              }
                              placeholder="Digite o nome dos autores"
                            />
                          </FormItem>
                        </div>

                        <div>
                          <FormItem>
                            <FormLabel>Tempo</FormLabel>
                            <Input
                              value={currentSubTrackPlayLength} // Changed from time to playLength
                              onChange={(e) => {
                                const formatted = formatTimeInput(
                                  e.target.value
                                );
                                setCurrentSubTrackPlayLength(formatted); // Changed from time to playLength
                              }}
                              placeholder="00:00"
                              maxLength={5}
                            />
                          </FormItem>
                        </div>

                        <div className="md:col-span-2">
                          <FormItem>
                            <FormLabel>Editora Original</FormLabel>
                            <Input
                              value={currentSubTrackOriginalPublisher}
                              onChange={(e) =>
                                setCurrentSubTrackOriginalPublisher(
                                  e.target.value
                                )
                              }
                              placeholder="Digite o nome da editora original"
                            />
                          </FormItem>
                        </div>

                        <div className="col-span-2">
                          <FormItem>
                            <FormLabel>Editora</FormLabel>
                            <Select
                              value={currentSubTrackPublisher}
                              onValueChange={setCurrentSubTrackPublisher}
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
                            <FormLabel>% Participação</FormLabel>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={currentSubTrackPercentage || ""}
                              onChange={(e) =>
                                setCurrentSubTrackPercentage(
                                  Number(e.target.value)
                                )
                              }
                            />
                          </FormItem>
                        </div>
                      </div>

                      <div className="grid grid-cols-6 gap-4">
                        <div className="flex items-end">
                          <Button
                            type="button"
                            onClick={addSubTrack}
                            variant="outline"
                            size="default"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-md p-2">
                      <ScrollArea className="h-20">
                        <div className="flex flex-wrap gap-2 p-1">
                          {selectedSubTracks.map((subTrack) => (
                            <Badge
                              key={subTrack.publisher}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {subTrack.work.slice(0, 30)}... -{" "}
                              {subTrack.publisher.slice(0, 30)}... - Autores *
                              {subTrack.authors.slice(0, 30)}... (
                              {subTrack.participationPercentage}%)
                              <button
                                type="button"
                                onClick={() =>
                                  removeSubTrack(subTrack.publisher)
                                }
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Total: {totalSubTrackPercentage}%
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2 mt-4">
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
