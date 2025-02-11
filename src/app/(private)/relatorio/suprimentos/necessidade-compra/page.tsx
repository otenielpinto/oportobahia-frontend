"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useServerAction } from "zsa-react";

import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@radix-ui/react-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

import { toast } from "sonner";

import { reportNecessidadeCompra } from "@/actions/actNecessidadeCompra";
import { Suspense } from "react";
import Loading from "@/components/loading";
import { TableReportNecessidadeCompra } from "./table";
import { downloadToExcel } from "./downloadToExcel";

const formSchema = z.object({
  stockReplenishmentDays: z
    .number()
    .min(1, { message: "Preencha o campo Dias para Reposição de Estoque" })
    .int()
    .positive(),
  percentageLast12Months: z.number().min(1).max(100),
  percentageLast9Months: z.number().min(1).max(100),
  percentageLast3Months: z.number().min(1).max(100),
  stockCoverage: z.string(),
  displayProducts: z.string(),
  minMaxStock: z.string(),
  brands: z.string(),
  name_product: z.string(),
  reference: z.string(),
});

export default function PurchaseNeedsForm() {
  const { isPending, execute, isSuccess, data, isError, error } =
    useServerAction(reportNecessidadeCompra);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stockReplenishmentDays: 0,
      percentageLast12Months: 1,
      percentageLast9Months: 1,
      percentageLast3Months: 98,
      stockCoverage: "",
      displayProducts: "",
      minMaxStock: "",
      brands: "",
      name_product: "",
      reference: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast.warning("Processando sua solicitação...");
    await execute(values);
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Necessidades de Compra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <details open>
              <summary></summary>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="stockReplenishmentDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dias para Reposição de Estoque</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referencia do Produto</FormLabel>
                        <FormControl>
                          <Input
                            type="string"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name_product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Produto</FormLabel>
                        <FormControl>
                          <Input
                            type="string"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
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
                    name="percentageLast12Months"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>% últimos 12 meses</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="percentageLast9Months"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>% últimos 9 meses</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="percentageLast3Months"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>% últimos 3 meses</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 ">
                  <FormField
                    control={form.control}
                    name="stockCoverage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calcular cobertura de estoque</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                defaultValue="yes"
                                placeholder="Selecione"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Sim</SelectItem>
                            <SelectItem value="no">Não</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="displayProducts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exibir produtos</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Todos</SelectItem>
                            <SelectItem value="1">
                              Apenas com necessidade de compra
                            </SelectItem>
                            <SelectItem value="2">
                              Com necessidade de compra para atender o estoque
                              minimo
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minMaxStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exibir estoque mínimo e máximo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Não" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no">Não</SelectItem>
                            <SelectItem value="yes">Sim</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brands"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Informa as marcas ** separadas por virgula(,) **
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="string"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    {data?.length > 0 ? (
                      <p className="text-sm">
                        {"Total de registros: " + data?.length}
                      </p>
                    ) : (
                      <p className="text-sm">{"Total de registros: 0"}</p>
                    )}
                  </FormItem>
                </div>

                <div className="flex justify-start space-x-4">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className={cn("rounded-full w-32")}
                  >
                    {isPending ? "Enviando..." : "gerar"}
                  </Button>

                  <Button
                    className={cn("rounded-full")}
                    disabled={isPending}
                    onClick={() => {
                      downloadToExcel(data);
                    }}
                    variant="outline"
                  >
                    Exportar Planilha
                  </Button>
                </div>
              </form>
            </details>
          </Form>
        </CardContent>

        <CardFooter>
          <form>
            {isPending ? <Loading /> : <></>}
            {isSuccess && (
              <Suspense>
                <div className="grid grid-cols-1 gap-4">
                  <TableReportNecessidadeCompra props={data} />
                </div>
              </Suspense>
            )}
            {isError && (
              <p className="text-red-500">
                {JSON.stringify(error?.fieldErrors)}
              </p>
            )}
          </form>
        </CardFooter>
      </Card>
    </>
  );
}

// cor antiga do button className="bg-blue-600 hover:bg-blue-700"
/*

  customerCode: z
    .number({
      required_error: "Código do Fornecedor é obrigatório",
      invalid_type_error: "Informe um valor numérico",
    })
    .int()
    .positive(),
      customerCode: 0,
              <FormField
                control={form.control}
                name="customerCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código do Fornecedor</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />




*/
