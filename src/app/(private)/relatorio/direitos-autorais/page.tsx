"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPublishers } from "@/actions/actPublishers";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
//import * as XLSX from 'xlsx'

interface DireitosAutoraisData {
  codigoProduto: string;
  nl: string;
  ld: string;
  nf: string;
  fx: string;
  mus: string;
  descricaoObra: string;
  autoresObra: string;
  percentualEditVendas: number;
  percentualObraPagamento: number;
}

export default function DireitosAutoraisPage() {
  const [dataInicial, setDataInicial] =  useState<string>( format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [dataFinal, setDataFinal] = useState<string>(  format(new Date(), "yyyy-MM-dd"));
  const [editora, setEditora] = useState("");


  const { data, isLoading, refetch } = useQuery<DireitosAutoraisData[]>({
    queryKey: ["direitos-autorais"],
    queryFn: async () => {
      // Simulando chamada API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return [];
    },
    enabled: false,
  });


  const { data: publishers, isLoading: isLoadingPublishers } = useQuery({
    queryKey: ["publishers"],
    queryFn: () => getPublishers(),
  });



  const handlePesquisar = () => {
    refetch();
  };

  const handleExportar = () => {
    // if (!data) return
    // const ws = XLSX.utils.json_to_sheet(data)
    // const wb = XLSX.utils.book_new()
    // XLSX.utils.book_append_sheet(wb, ws, "Direitos Autorais")
    // XLSX.writeFile(wb, `direitos-autorais-${format(new Date(), 'dd-MM-yyyy')}.xlsx`)
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Relatório de Direitos Autorais</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm">Data Inicial</label>
          <Input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="rounded-md border"
            aria-label="Selecionar data inicial"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Data Final</label>
          <Input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="rounded-md border"
            aria-label="Selecionar data final"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Editora</label>
          <Select value={editora} onValueChange={setEditora}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma editora" />
            </SelectTrigger>
            <SelectContent>

              {publishers?.map((pub) => (
                    <SelectItem key={pub.id} value={pub.name}>
                      {pub.name}
                    </SelectItem>
                  ))}

            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handlePesquisar} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Pesquisar
        </Button>
        <Button
          variant="outline"
          onClick={handleExportar}
          disabled={!data?.length}
        >
          Exportar para Excel
        </Button>
      </div>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código Produto</TableHead>
                <TableHead>NL</TableHead>
                <TableHead>LD</TableHead>
                <TableHead>NF</TableHead>
                <TableHead>FX</TableHead>
                <TableHead>Mus</TableHead>
                <TableHead>Descrição da Obra</TableHead>
                <TableHead>Autores da Obra</TableHead>
                <TableHead>% Edit. Vendas</TableHead>
                <TableHead>% Obra Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.codigoProduto}</TableCell>
                  <TableCell>{item.nl}</TableCell>
                  <TableCell>{item.ld}</TableCell>
                  <TableCell>{item.nf}</TableCell>
                  <TableCell>{item.fx}</TableCell>
                  <TableCell>{item.mus}</TableCell>
                  <TableCell>{item.descricaoObra}</TableCell>
                  <TableCell>{item.autoresObra}</TableCell>
                  <TableCell>{item.percentualEditVendas}%</TableCell>
                  <TableCell>{item.percentualObraPagamento}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
