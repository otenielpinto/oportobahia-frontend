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
import { X, FileCode } from "lucide-react";
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

  const mutation = useMutation({
    mutationFn: async (data: TrackFormData) => {
      if (track) {
        return await updateTrack(catalogId, {
          ...data,
          id: track.id,
        });
      } else {
        return await createTrack(catalogId, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks", catalogId] });
      toast.success(
        track ? "Faixa atualizada com sucesso" : "Faixa criada com sucesso"
      );
      form.reset();
      setSelectedPublishers([]);
      setSelectedSubTracks([]);
      setCurrentSubTrack({
        work: "",
        authors: "",
        playLength: "",
        originalPublisher: "",
        publishers: [],
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Erro na operação:", error);
      if (error instanceof Error) {
        toast.error(`Erro: ${error.message}`);
      } else {
        toast.error(
          track
            ? "Falha ao atualizar faixa. Tente novamente."
            : "Falha ao criar faixa. Tente novamente."
        );
      }
    },
  });

  // Estados para publishers
  const [selectedPublishers, setSelectedPublishers] = useState<
    Array<{
      name: string;
      publisherCode: string;
      participationPercentage: number;
    }>
  >(
    track?.publishers?.map((pub) => ({
      ...pub,
      publisherCode: pub.publisherCode || "",
    })) || []
  );
  const [currentPublisher, setCurrentPublisher] = useState("");
  const [currentPublisherCode, setCurrentPublisherCode] = useState("");
  const [currentPercentage, setCurrentPercentage] = useState<number>(0);
  const [totalPercentage, setTotalPercentage] = useState(0);

  // Estados para subTracks
  const [selectedSubTracks, setSelectedSubTracks] = useState<
    Array<{
      work: string;
      authors: string;
      playLength: string;
      originalPublisher: string;
      publishers: Array<{
        name: string;
        publisherCode?: string;
        participationPercentage: number;
      }>;
    }>
  >(
    track?.subTracks?.map((subTrack) => ({
      ...subTrack,
      publishers: subTrack.publishers || [],
    })) || []
  );

  // Estado para o subTrack atual em edição
  const [currentSubTrack, setCurrentSubTrack] = useState<{
    work: string;
    authors: string;
    playLength: string;
    originalPublisher: string;
    publishers: Array<{
      name: string;
      publisherCode?: string;
      participationPercentage: number;
    }>;
  }>({
    work: "",
    authors: "",
    playLength: "",
    originalPublisher: "",
    publishers: [],
  });

  // Estado para a editora atual sendo adicionada ao subTrack
  const [currentSubTrackPublisher, setCurrentSubTrackPublisher] = useState("");
  const [currentSubTrackPublisherCode, setCurrentSubTrackPublisherCode] =
    useState("");
  const [
    currentSubTrackPublisherPercentage,
    setCurrentSubTrackPublisherPercentage,
  ] = useState<number>(0);
  const [totalSubTrackPercentage, setTotalSubTrackPercentage] = useState(0);

  useEffect(() => {
    if (track?.publishers) {
      setSelectedPublishers(
        track.publishers.map((pub) => ({
          ...pub,
          publisherCode: pub.publisherCode || "",
        }))
      );
    }
    if (track?.subTracks) {
      setSelectedSubTracks(
        track.subTracks.map((subTrack) => ({
          ...subTrack,
          publishers: subTrack.publishers || [],
        }))
      );
    }
  }, [track]);

  useEffect(() => {
    const total = selectedPublishers.reduce(
      (sum, pub) => sum + pub.participationPercentage,
      0
    );
    setTotalPercentage(total);
  }, [selectedPublishers]);

  // Atualizado para calcular o total baseado na nova estrutura
  useEffect(() => {
    if (currentSubTrack.publishers.length > 0) {
      const total = currentSubTrack.publishers.reduce(
        (sum, pub) => sum + pub.participationPercentage,
        0
      );
      setTotalSubTrackPercentage(total);
    } else {
      setTotalSubTrackPercentage(0);
    }
  }, [currentSubTrack.publishers]);

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
      publisherCode: currentPublisherCode, // Adicionado campo publisherCode,
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

  const addPublisherToSubTrack = () => {
    if (!currentSubTrackPublisher || currentSubTrackPublisherPercentage <= 0) {
      toast.error("Selecione uma editora e defina um percentual maior que 0");
      return;
    }

    if (totalSubTrackPercentage + currentSubTrackPublisherPercentage > 100) {
      toast.error("O total de percentuais não pode exceder 100%");
      return;
    }

    if (
      currentSubTrack.publishers.some(
        (pub) => pub.name === currentSubTrackPublisher
      )
    ) {
      toast.error("Esta editora já foi adicionada para esta obra");
      return;
    }

    const newPublisher = {
      name: currentSubTrackPublisher,
      publisherCode: currentSubTrackPublisherCode || undefined,
      participationPercentage: currentSubTrackPublisherPercentage,
    };

    setCurrentSubTrack((prev) => ({
      ...prev,
      publishers: [...prev.publishers, newPublisher],
    }));

    setCurrentSubTrackPublisher("");
    setCurrentSubTrackPublisherCode("");
    setCurrentSubTrackPublisherPercentage(0);
  };

  const addSubTrack = () => {
    console.log("Adicionando subTrack:", currentSubTrack);

    // Remova a validação que impede adicionar subTracks quando há publishers
    // Isso permite mais flexibilidade ao preencher o formulário
    // if (selectedPublishers.length > 0) {
    //   toast.error("Remova as editoras para preencher as Musicas da Faixa");
    //   return;
    // }

    if (!currentSubTrack.work) {
      toast.error("O nome da obra é obrigatório");
      return;
    }

    if (!currentSubTrack.authors) {
      toast.error("Autores são obrigatórios");
      return;
    }

    if (!currentSubTrack.playLength) {
      toast.error("Tempo deve estar no formato mm:ss");
      return;
    }

    if (!currentSubTrack.originalPublisher) {
      toast.error("Editora original é obrigatória");
      return;
    }

    if (currentSubTrack.publishers.length === 0) {
      toast.error("Adicione pelo menos uma editora");
      return;
    }

    if (totalSubTrackPercentage !== 100) {
      toast.error("O total de percentuais deve ser igual a 100%");
      return;
    }

    setSelectedSubTracks((prev) => {
      const updated = [...prev, { ...currentSubTrack }];
      form.setValue("subTracks", updated, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return updated;
    });

    // Resetar o formulário de subTrack
    setCurrentSubTrack({
      work: "",
      authors: "",
      playLength: "",
      originalPublisher: "",
      publishers: [],
    });
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

  const removePublisherFromSubTrack = (publisherName: string) => {
    setCurrentSubTrack((prev) => ({
      ...prev,
      publishers: prev.publishers.filter((pub) => pub.name !== publisherName),
    }));
  };

  const removeSubTrack = (index: number) => {
    setSelectedSubTracks((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      form.setValue("subTracks", updated, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return updated;
    });
  };

  const onSubmit = async (data: TrackFormData) => {
    console.group("Form Submission Debug");
    console.log("Dados do formulário:", JSON.stringify(data, null, 2));
    console.log(
      "Publishers selecionados:",
      JSON.stringify(selectedPublishers, null, 2)
    );
    console.log(
      "SubTracks selecionados:",
      JSON.stringify(selectedSubTracks, null, 2)
    );
    console.log("Estado do formulário:", {
      isValid: form.formState.isValid,
      isDirty: form.formState.isDirty,
      errors: form.formState.errors,
    });

    try {
      console.log("Validando dados...");

      // Verifica campos obrigatórios
      if (!data.trackCode) {
        toast.error("O número da faixa é obrigatório");
        return;
      }

      if (!data.isrc) {
        toast.error("O ISRC é obrigatório");
        return;
      }

      if (!data.work) {
        toast.error("O nome da obra é obrigatório");
        return;
      }

      if (!data.authors) {
        toast.error("Os autores são obrigatórios");
        return;
      }

      // Preparação dos dados para envio
      const trackData = {
        ...data,
        publishers: selectedPublishers,
        subTracks: selectedSubTracks.map((subTrack) => ({
          ...subTrack,
          publishers: subTrack.publishers.map((pub) => ({
            name: pub.name,
            publisherCode: pub.publisherCode || "",
            participationPercentage: pub.participationPercentage,
          })),
        })),
      };

      console.log("Dados formatados para envio:", trackData);

      // Executa diretamente a ação sem usar mutation.mutateAsync
      try {
        let result;
        if (track) {
          result = await updateTrack(catalogId, {
            ...trackData,
            id: track.id,
          });
        } else {
          result = await createTrack(catalogId, trackData);
        }

        // Atualiza a UI após sucesso
        queryClient.invalidateQueries({ queryKey: ["tracks", catalogId] });
        toast.success(
          track ? "Faixa atualizada com sucesso" : "Faixa criada com sucesso"
        );

        // Limpa o formulário
        form.reset();
        setSelectedPublishers([]);
        setSelectedSubTracks([]);
        setCurrentSubTrack({
          work: "",
          authors: "",
          playLength: "",
          originalPublisher: "",
          publishers: [],
        });

        onSuccess?.();
        console.log("Operação concluída com sucesso:", result);
        console.groupEnd();
        return result;
      } catch (error) {
        console.error("Erro na requisição:", error);
        if (error instanceof Error) {
          toast.error(`Erro: ${error.message}`);
        } else {
          toast.error(
            track
              ? "Falha ao atualizar faixa. Tente novamente."
              : "Falha ao criar faixa. Tente novamente."
          );
        }
        throw error;
      }
    } catch (error) {
      console.error("Erro durante o envio:", error);
      if (error instanceof Error) {
        console.error("Detalhes do erro:", {
          message: error.message,
          stack: error.stack,
        });
        toast.error(`Erro: ${error.message}`);
      } else {
        console.error("Erro desconhecido:", error);
        toast.error(
          track
            ? "Falha ao atualizar faixa. Tente novamente."
            : "Falha ao criar faixa. Tente novamente."
        );
      }
      console.groupEnd();
      return null;
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

  const handleSubTrackTimeChange = (value: string) => {
    const formatted = formatTimeInput(value);
    setCurrentSubTrack((prev) => ({ ...prev, playLength: formatted }));
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

                      {/* Adicionando o campo publisherCode */}
                      <div>
                        <FormItem>
                          <FormLabel>Código da Obra</FormLabel>
                          <Input
                            value={currentPublisherCode}
                            onChange={(e) =>
                              setCurrentPublisherCode(e.target.value)
                            }
                            placeholder="Código da obra"
                          />
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
                              className={`flex items-center gap-1 `}
                            >
                              {pub.name}
                              {pub.publisherCode ? (
                                <span className="font-medium text-green-700 dark:text-green-300 flex items-center gap-1">
                                  <span className="flex items-center">
                                    <FileCode className="h-3 w-3 mr-1" />
                                    {pub.publisherCode}
                                  </span>
                                </span>
                              ) : null}
                              {` (${pub.participationPercentage}%)`}
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
                  <div className="space-y-4">
                    {/* Formulário para adicionar novo subTrack */}
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2">
                        Adicionar Nova Música
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <FormItem>
                            <FormLabel>Obra</FormLabel>
                            <Input
                              value={currentSubTrack.work}
                              onChange={(e) =>
                                setCurrentSubTrack((prev) => ({
                                  ...prev,
                                  work: e.target.value,
                                }))
                              }
                              placeholder="Digite o nome da obra"
                            />
                          </FormItem>
                        </div>
                        <div>
                          <FormItem>
                            <FormLabel>Autores</FormLabel>
                            <Input
                              value={currentSubTrack.authors}
                              onChange={(e) =>
                                setCurrentSubTrack((prev) => ({
                                  ...prev,
                                  authors: e.target.value,
                                }))
                              }
                              placeholder="Digite o nome dos autores"
                            />
                          </FormItem>
                        </div>
                        <div>
                          <FormItem>
                            <FormLabel>Tempo</FormLabel>
                            <Input
                              value={currentSubTrack.playLength}
                              onChange={(e) =>
                                handleSubTrackTimeChange(e.target.value)
                              }
                              placeholder="00:00"
                              maxLength={5}
                            />
                          </FormItem>
                        </div>
                        <div>
                          <FormItem>
                            <FormLabel>Editora Original</FormLabel>
                            <Input
                              value={currentSubTrack.originalPublisher}
                              onChange={(e) =>
                                setCurrentSubTrack((prev) => ({
                                  ...prev,
                                  originalPublisher: e.target.value,
                                }))
                              }
                              placeholder="Digite o nome da editora original"
                            />
                          </FormItem>
                        </div>
                      </div>

                      <h5 className="font-medium mb-2">Editoras da Música</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <div>
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
                            <FormLabel>Código da Obra</FormLabel>
                            <Input
                              value={currentSubTrackPublisherCode}
                              onChange={(e) =>
                                setCurrentSubTrackPublisherCode(e.target.value)
                              }
                              placeholder="Código da obra"
                            />
                          </FormItem>
                        </div>
                        <div>
                          <FormItem>
                            <FormLabel>% Participação</FormLabel>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={currentSubTrackPublisherPercentage || ""}
                                onChange={(e) =>
                                  setCurrentSubTrackPublisherPercentage(
                                    Number(e.target.value)
                                  )
                                }
                              />
                              <Button
                                type="button"
                                onClick={addPublisherToSubTrack}
                                variant="outline"
                                size="icon"
                              >
                                +
                              </Button>
                            </div>
                          </FormItem>
                        </div>
                      </div>

                      {/* Lista de editoras adicionadas para o subTrack atual */}
                      <div className="border rounded-md p-2 mb-4">
                        <ScrollArea className="h-10">
                          <div className="flex flex-wrap gap-2 p-1">
                            {currentSubTrack.publishers.map((pub, idx) => (
                              <Badge
                                key={`${pub.name}-${idx}`}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {pub.name}
                                {pub.publisherCode && (
                                  <span className="font-medium text-green-700 dark:text-green-300 flex items-center gap-1">
                                    <FileCode className="h-3 w-3 mr-1" />
                                    {pub.publisherCode}
                                  </span>
                                )}
                                {` (${pub.participationPercentage}%)`}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removePublisherFromSubTrack(pub.name)
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

                      <Button
                        type="button"
                        onClick={addSubTrack}
                        variant="outline"
                      >
                        Adicionar Música
                      </Button>
                    </div>

                    {/* Lista de subTracks adicionados */}
                    <div>
                      <h4 className="font-medium mb-2">Músicas Adicionadas</h4>
                      {selectedSubTracks.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          Nenhuma música adicionada
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedSubTracks.map((subTrack, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex justify-between mb-2">
                                <h5 className="font-medium">{subTrack.work}</h5>
                                <Button
                                  type="button"
                                  onClick={() => removeSubTrack(index)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="font-medium">Autores:</span>{" "}
                                  {subTrack.authors}
                                </div>
                                <div>
                                  <span className="font-medium">Tempo:</span>{" "}
                                  {subTrack.playLength}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Editora Original:
                                  </span>{" "}
                                  {subTrack.originalPublisher}
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="font-medium text-sm">
                                  Editoras:
                                </span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {subTrack.publishers.map((pub, idx) => (
                                    <Badge
                                      key={`${pub.name}-${idx}`}
                                      variant="secondary"
                                      className="flex items-center gap-1"
                                    >
                                      {pub.name}
                                      {pub.publisherCode && (
                                        <span className="text-xs text-green-700 dark:text-green-300">
                                          ({pub.publisherCode})
                                        </span>
                                      )}
                                      {` ${pub.participationPercentage}%`}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {mutation.isPending
              ? "Processando..."
              : track
              ? "Atualizar Faixa"
              : "Criar Faixa"}
          </Button>

          {process.env.NODE_ENV !== "production" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log("Estado atual do formulário:", form.getValues());
                console.log("Publishers:", selectedPublishers);
                console.log("SubTracks:", selectedSubTracks);
                console.log("Current SubTrack:", currentSubTrack);
                console.log("Current Publisher:", currentPublisher);
                console.log("track", track);
                toast.info("Dados do formulário exibidos no console");
              }}
            >
              Debug
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
