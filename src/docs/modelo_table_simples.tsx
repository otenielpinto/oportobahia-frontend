import * as React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { lib } from "@/lib/lib";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { getColumns } from "../app/(private)/relatorio/suprimentos/necessidade-compra/downloadToExcel";
import { Separator } from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

export const TableReportNecessidadeCompra = ({ props }: any) => {
  const data = props;
  if (!data) {
    return null;
  }
  let o = getColumns(data);

  //wrapper para fixar coluna no top
  const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement> & { wrapperClassName?: string }
  >(({ className, wrapperClassName, ...props }, ref) => (
    <div className={cn("relative w-full overflow-auto", wrapperClassName)}>
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  ));
  Table.displayName = "Table";

  return (
    <>
      <Table wrapperClassName="overflow-clip">
        <TableCaption>{`Listagem produtos necessidade de compra`}</TableCaption>
        <TableHeader className="sticky top-0 bg-secondary">
          <TableRow>
            <TableHead>Cod.Produto Interno</TableHead>
            <TableHead className="text-right">SKU</TableHead>
            <TableHead className="text-center">Nome do Produto</TableHead>
            <TableHead className="text-center">Nome da Marca</TableHead>
            <TableHead className="text-center">Desde</TableHead>
            <TableHead className="text-center">
              <br />
              <br />
              <hr />
              {o?.venda4}
            </TableHead>
            <TableHead className="text-right">
              Venda 12M <hr />
              {o?.venda3}
            </TableHead>
            <TableHead className="text-right">
              Venda 9M <hr />
              {o?.venda2}{" "}
            </TableHead>
            <TableHead className="text-right">
              Venda 3M
              <hr /> {o?.venda1}
            </TableHead>
            <TableHead className="text-right">
              Prev Venda
              <hr /> {o.venda0}
            </TableHead>

            <TableHead className="text-right">
              Estoque <br />
              <br />
              <hr /> Cobertura Estoque
            </TableHead>

            <TableHead className="text-right">Comprar</TableHead>
            <TableHead className="text-right">Custo unitário</TableHead>
            <TableHead className="text-right">Variação</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data?.map((item: any) => (
            <>
              <ItemDetail item={item} />
            </>
          ))}
        </TableBody>
        <TableFooter></TableFooter>
      </Table>
    </>
  );
};

export function ItemDetail({ item }: any) {
  if (!item) return null;

  return (
    <>
      <TableRow key={item.id}>
        <TableCell>
          {item?.route ? (
            <Link
              className="text-blue-700 hover:underline"
              href={item.route}
              key={item.idproduto}
            >
              {item.idproduto}
            </Link>
          ) : (
            <div>{item.idproduto}</div>
          )}
        </TableCell>
        <TableCell className="text-right">{item.referencia}</TableCell>
        <TableCell className="text-center">{item.descricao}</TableCell>
        <TableCell className="text-center">{item.nome_marca}</TableCell>
        <TableCell className="text-right">{`${item.desde.toDateString()}`}</TableCell>
        <TableCell className="text-right">
          {"*"}
          <hr />
          {item.venda_periodo4}
        </TableCell>
        <TableCell className="text-right">
          {item.venda12} <hr />
          {item.venda_periodo3}
        </TableCell>
        <TableCell className="text-right">
          {item.venda9}
          <hr />
          {item.venda_periodo2}
        </TableCell>
        <TableCell className="text-right">
          {item.venda3}
          <hr />
          {item.venda_periodo1}
        </TableCell>

        <TableCell className="text-right">
          {"PV  " + item.previsao_venda}
          <hr />
          {"VM " + item.venda_periodo0}
        </TableCell>

        <TableCell className="text-right">
          {"E  " + item.estoque}
          <hr />
          {item.cobertura_estoque + " Dias"}
        </TableCell>

        <TableCell className="text-right">{item.compra}</TableCell>
        <TableCell className="text-right">
          {lib.formatNumberBr(item.custo_unitario)}
        </TableCell>
        <TableCell className="text-right">{`${item.tendencia1}%`}</TableCell>
      </TableRow>
    </>
  );
}

export default TableReportNecessidadeCompra;
