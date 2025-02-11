import { useMemo } from "react";
import * as z from "zod";
import { lib } from "@/lib/lib";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { ArrowUpDown } from "lucide-react";
import { ChevronDown } from "lucide-react";

import Link from "next/link";
import { getColumns } from "./downloadToExcel";

export const description = "Grafico Vendas";

export const ItemsSchema = z.object({
  idproduto: z.string(),
  descricao: z.string(),
  nome_marca: z.string(),
  desde: z.date(),
  venda12: z.number(),
  venda9: z.number(),
  venda3: z.number(),
  estoque: z.number(),
  est_minimo: z.number(),
  est_maximo: z.number(),
  compra: z.number(),
  id_equivalente: z.number(),
  id_fornecedor: z.string(),
  custo_unitario: z.number(),
  totalproduto: z.number(),
  total_estoque: z.number(),
  parametro: z.string(),
  venda_periodo0: z.number(),
  venda_periodo1: z.number(),
  venda_periodo2: z.number(),
  venda_periodo3: z.number(),
  venda_periodo4: z.number(),
  venda_periodo0x: z.number(),
  venda_periodo1x: z.number(),
  venda_periodo2x: z.number(),
  venda_periodo3x: z.number(),
  venda_periodo4x: z.number(),
  tendencia1: z.number(),
  tendencia2: z.number(),
  tendencia3: z.number(),
  tendencia1x: z.string(),
  tendencia2x: z.string(),
  tendencia3x: z.string(),
  direcao_tendencia: z.string(),
  referencia: z.string(),
  preferencia: z.number(),
  previsao_venda: z.number(),
  cobertura_estoque: z.number(),
  num_record: z.number(),
});
export type Items = z.infer<typeof ItemsSchema>;

const chartConfig = {
  qtd: {
    label: "Quantidade Vendas",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function ChartGrid({ data }: any) {
  const o: any = data.original;

  const chartData = [
    { month: o.venda_periodo4x, qtd: o.venda_periodo4 },
    { month: o.venda_periodo3x, qtd: o.venda_periodo3 },
    { month: o.venda_periodo2x, qtd: o.venda_periodo2 },
    { month: o.venda_periodo1x, qtd: o.venda_periodo1 },
    { month: o.venda_periodo0x, qtd: o.venda_periodo0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quantidade Vendas</CardTitle>
        <CardDescription>
          {o.venda_periodo4x + " - " + o.venda_periodo0x}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="qtd" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Tendencia {o.tendencia1} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando ultimos 4 meses de venda
        </div>
      </CardFooter>
    </Card>
  );
}

function TableHistorySells({ data }: any) {
  const o: any = data?.original ? data?.original : data;
  const items = [
    { id: 1, month: o.venda_periodo4x, value: o.venda_periodo4 },
    { id: 2, month: o.venda_periodo3x, value: o.venda_periodo3 },
    { id: 3, month: o.venda_periodo2x, value: o.venda_periodo2 },
    { id: 4, month: o.venda_periodo1x, value: o.venda_periodo1 },
    { id: 5, month: o.venda_periodo0x, value: o.venda_periodo0 },
    { id: 6, month: "Previsao Venda", value: o.previsao_venda },
    { id: 7, month: "Cobertura Estoque (dias)", value: o.cobertura_estoque },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Mês</th>
            <th className="py-3 px-6 text-left">Valor</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {items?.map((o: any) => {
            return (
              <tr
                className="border-b border-gray-200 hover:bg-gray-100"
                key={o.id}
              >
                <td className="py-3 px-6 text-left">{o.month}</td>
                <td className="py-3 px-6 text-left">{o.value}</td>
              </tr>
            );
          })}
          ;
        </tbody>
      </table>
    </div>
  );
}

export const TableReportNecessidadeCompra = ({ props }: any) => {
  const data = props as Items[];
  const headers = getColumns(data);

  //Vercel nao aceita compilar se os hooks estiverem fora do componente
  const columns = useMemo<MRT_ColumnDef<Items>[]>(
    () => [
      {
        accessorKey: "idproduto",
        size: 100,
        header: "Cod. do Produto",
      },
      { accessorKey: "referencia", header: "Referencia", size: 100 },
      { accessorKey: "descricao", header: "Descrição do Produto", size: 300 },
      { accessorKey: "nome_marca", header: "Nome da Marca", size: 150 },
      {
        accessorKey: "desde",
        header: "Desde",

        accessorFn: (dataRow) =>
          new Date(dataRow.desde as any).toLocaleDateString(),
      },
      { accessorKey: "venda12", header: "V12", size: 90 },
      { accessorKey: "venda9", header: "V9", size: 90 },
      { accessorKey: "venda3", header: "V3", size: 90 },
      {
        accessorKey: "estoque",
        header: "Estoque",
        filterFn: "between",
        id: "estoque",
        size: 120,
      },
      { accessorKey: "compra", header: "Comprar", size: 110 },

      {
        accessorKey: "cobertura_estoque",
        header: "CE",
        size: 90,
      },
      { accessorKey: "previsao_venda", header: "PV", size: 90 },

      {
        accessorKey: "est_minimo",
        header: "E.Minimo",
        size: 90,
      },
      {
        accessorKey: "est_maximo",
        header: "E.Maximo",
        size: 90,
      },
      { accessorKey: "id_equivalente", header: "id_equivalente" },
      { accessorKey: "id_fornecedor", header: "Codigo Fornecedor" },
      { accessorKey: "custo_unitario", header: "Custo unitário", size: 120 },
      { accessorKey: "totalproduto", header: "Total do Produto", size: 180 },
      { accessorKey: "total_estoque", header: "Total do Estoque", size: 180 },
      { accessorKey: "parametro", header: "Parametros" },
      {
        accessorKey: "venda_periodo0",
        header: headers.venda0,
        size: 110,
      },
      { accessorKey: "venda_periodo1", header: headers.venda1, size: 110 },
      { accessorKey: "venda_periodo2", header: headers.venda2, size: 110 },
      { accessorKey: "venda_periodo3", header: headers.venda3, size: 110 },
      { accessorKey: "venda_periodo4", header: headers.venda4, size: 110 },
      { accessorKey: "venda_periodo0x", header: "venda_periodo0x" },
      { accessorKey: "venda_periodo1x", header: "venda_periodo1x" },
      { accessorKey: "venda_periodo2x", header: "venda_periodo2x" },
      { accessorKey: "venda_periodo3x", header: "venda_periodo3x" },
      { accessorKey: "venda_periodo4x", header: "venda_periodo4x" },
      { accessorKey: "tendencia1", header: "tendencia1" },
      { accessorKey: "tendencia2", header: "tendencia2" },
      { accessorKey: "tendencia3", header: "tendencia3" },
      { accessorKey: "tendencia1x", header: "tendencia1x" },
      { accessorKey: "tendencia2x", header: "tendencia2x" },
      { accessorKey: "tendencia3x", header: "tendencia3x" },
      { accessorKey: "direcao_tendencia", header: "Direção da Tendencia" },
      { accessorKey: "preferencia", header: "Preferencia" },
      { accessorKey: "num_record", header: "Num. Registro" },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableColumnResizing: true,
    columnResizeMode: "onChange", //default
    enableStickyHeader: true,
    enableExpandAll: false, //disable expand all button
    // isMultiSortEvent: () => true,
    //enableStickyFooter: true,

    // //optionally override the default column widths
    // defaultColumn: {
    //   maxSize: 300,
    //   minSize: 80,
    //   size: 160, //default size is usually 180
    // },
    //enableRowNumbers: true,
    initialState: {
      pagination: { pageSize: 100, pageIndex: 0 },
      density: "compact",

      columnVisibility: {
        totalproduto: false,
        idproduto: false,
        desde: false,
        direcao_tendencia: false,
        id_equivalente: false,
        id_fornecedor: false,
        venda_periodo0x: false,
        venda_periodo1x: false,
        venda_periodo2x: false,
        venda_periodo3x: false,
        venda_periodo4x: false,
        tendencia1: true,
        tendencia2: false,
        tendencia3: false,
        tendencia1x: false,
        tendencia2x: false,
        tendencia3x: false,
        parametro: false,
        num_record: false,
        preferencia: false,
      },
    },
    //conditionally render detail panel
    renderDetailPanel: ({ row }) => (
      <div className="flex gap-1">
        <ChartGrid data={row}></ChartGrid>
        <div>
          <TableHistorySells data={row}></TableHistorySells>
        </div>
      </div>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default TableReportNecessidadeCompra;
