"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotaFiscalItem } from "@/types/notaFiscalTypes";
import { useMemo } from "react";

interface NotaFiscalItemsTableProps {
  itens: NotaFiscalItem[];
}

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export default function NotaFiscalItemsTable({
  itens,
}: NotaFiscalItemsTableProps) {
  const totalItems = useMemo(() => {
    return itens.reduce(
      (acc, item) => {
        const vProd = parseFloat(item.prod.vProd) || 0;
        const qCom = parseFloat(item.prod.qCom) || 0;
        return {
          quantidade: acc.quantidade + qCom,
          valorTotal: acc.valorTotal + vProd,
        };
      },
      { quantidade: 0, valorTotal: 0 },
    );
  }, [itens]);

  if (!itens || itens.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum item encontrado nesta nota fiscal.
      </div>
    );
  }

  const tableContent = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Código</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead className="w-[80px]">NCM</TableHead>
          <TableHead className="w-[60px]">CFOP</TableHead>
          <TableHead className="w-[70px] text-right">Qtd</TableHead>
          <TableHead className="w-[60px]">Un</TableHead>
          <TableHead className="w-[100px] text-right">Valor Unit</TableHead>
          <TableHead className="w-[110px] text-right">Valor Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itens.map((item, index) => (
          <TableRow key={`${item.prod.cProd}-${index}`}>
            <TableCell className="font-mono text-xs">
              {item.prod.cProd || "-"}
            </TableCell>
            <TableCell className="max-w-75 truncate">
              {item.prod.xProd || "-"}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {item.prod.NCM || "-"}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {item.prod.CFOP || "-"}
            </TableCell>
            <TableCell className="text-right">
              {item.prod.qCom || "0"}
            </TableCell>
            <TableCell>{item.prod.uCom || "-"}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.prod.vUnCom)}
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(item.prod.vProd)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // Use scroll area if more than 10 items
  if (itens.length > 10) {
    return (
      <div>
        <ScrollArea className="h-[400px] rounded-md border">
          {tableContent}
        </ScrollArea>
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-xs text-muted-foreground">
            {itens.length} itens
          </span>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>
              Qtd total: {totalItems.quantidade.toLocaleString("pt-BR")}
            </span>
            <span>Valor total: {formatCurrency(totalItems.valorTotal)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">{tableContent}</div>
      <div className="flex justify-between items-center mt-2 px-1">
        <span className="text-xs text-muted-foreground">
          {itens.length} itens
        </span>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>
            Qtd total: {totalItems.quantidade.toLocaleString("pt-BR")}
          </span>
          <span>Valor total: {formatCurrency(totalItems.valorTotal)}</span>
        </div>
      </div>
    </div>
  );
}
