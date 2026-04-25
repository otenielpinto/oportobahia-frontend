"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { startOfMonth, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { criarApuracaoRoyaltiesCab } from "@/actions/apurarRoyaltiesCabAction";

const formSchema = z
  .object({
    dataInicial: z.coerce.date({
      required_error: "Data inicial é obrigatória",
      invalid_type_error: "Data inválida",
    }),
    dataFinal: z.coerce.date({
      required_error: "Data final é obrigatória",
      invalid_type_error: "Data inválida",
    }),
    cotacaoDollar: z.preprocess(
      (val) => {
        if (val === "" || val === null || val === undefined || Number.isNaN(val)) return undefined;
        return Number(val);
      },
      z.number({
        required_error: "Cotação é obrigatória",
        invalid_type_error: "Informe um valor numérico",
      }).gt(0, "Cotação deve ser maior que zero"),
    ),
    observacao: z.string().optional(),
  })
  .refine((data) => data.dataFinal >= data.dataInicial, {
    message: "Data final deve ser igual ou posterior à data inicial",
    path: ["dataFinal"],
  });

export type ApuracaoRoyaltiesCabFormValues = z.infer<typeof formSchema>;

export interface ApuracaoRoyaltiesCabFormProps {
  onSuccess?: () => void;
}

/**
 * Converte string yyyy-MM-dd (input type="date") para Date em timezone local.
 * new Date("2026-03-01") cria meia-noite UTC → no Brasil vira 21:00 do dia anterior.
 * Usamos split para garantir data local correta.
 */
function parseDateLocal(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function ApuracaoRoyaltiesCabForm({
  onSuccess,
}: ApuracaoRoyaltiesCabFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ApuracaoRoyaltiesCabFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataInicial: startOfMonth(new Date()),
      dataFinal: new Date(),
      observacao: "",
    },
  });

  const onSubmit = (values: ApuracaoRoyaltiesCabFormValues) => {
    startTransition(async () => {
      try {
        const result = await criarApuracaoRoyaltiesCab({
          dataInicial: values.dataInicial,
          dataFinal: values.dataFinal,
          cotacaoDollar: values.cotacaoDollar,
          observacao: values.observacao,
        });

        if (result.success) {
          toast.success("Apuração criada com sucesso!");
          form.reset({
            dataInicial: startOfMonth(new Date()),
            dataFinal: new Date(),
            observacao: "",
          });
          onSuccess?.();
        } else {
          toast.error(result.error || "Erro ao criar apuração");
        }
      } catch {
        toast.error("Erro inesperado ao criar apuração");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Apuração de Royalties</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data Inicial */}
            <div className="space-y-2">
              <Label htmlFor="dataInicial">Data Inicial</Label>
              <Controller
                name="dataInicial"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="dataInicial"
                    type="date"
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      field.onChange(e.target.value ? parseDateLocal(e.target.value) : undefined);
                    }}
                  />
                )}
              />
              {form.formState.errors.dataInicial && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.dataInicial.message}
                </p>
              )}
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <Label htmlFor="dataFinal">Data Final</Label>
              <Controller
                name="dataFinal"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="dataFinal"
                    type="date"
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      field.onChange(e.target.value ? parseDateLocal(e.target.value) : undefined);
                    }}
                  />
                )}
              />
              {form.formState.errors.dataFinal && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.dataFinal.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cotação Dólar */}
            <div className="space-y-2">
              <Label htmlFor="cotacaoDollar">Cotação do Dólar (BRL)</Label>
              <Input
                id="cotacaoDollar"
                type="number"
                step="0.01"
                {...form.register("cotacaoDollar", {
                  valueAsNumber: true,
                })}
                placeholder="5.25"
              />
              {form.formState.errors.cotacaoDollar && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.cotacaoDollar.message}
                </p>
              )}
            </div>

            {/* Observação */}
            <div className="space-y-2">
              <Label htmlFor="observacao">Observação (opcional)</Label>
              <Input
                id="observacao"
                type="text"
                {...form.register("observacao")}
                placeholder="Apuração de março/2026"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Iniciar Apuração
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
