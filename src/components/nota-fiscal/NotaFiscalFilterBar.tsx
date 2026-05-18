"use client";

import { useState } from "react";
import { Filter, Download, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotaFiscalFilter } from "@/types/notaFiscalTypes";

interface NotaFiscalFilterBarProps {
  filters: NotaFiscalFilter;
  onFiltersChange: (filters: Partial<NotaFiscalFilter>) => void;
  onSearch: () => void;
  onExport: () => void;
  isExporting?: boolean;
}

const STATUS_OPTIONS = [
  { value: "Autorizada", label: "Autorizada" },
  { value: "Cancelada", label: "Cancelada" },
  { value: "Denegada", label: "Denegada" },
] as const;

const TIPO_OPTIONS = [
  { value: "E", label: "Entrada" },
  { value: "S", label: "Saída" },
] as const;

function formatDateInput(d?: Date): string {
  if (!d) return "";
  return d.toISOString().split("T")[0];
}

export default function NotaFiscalFilterBar({
  filters,
  onFiltersChange,
  onSearch,
  onExport,
  isExporting = false,
}: NotaFiscalFilterBarProps) {
  // Local state for all filter values — only flushed on "Filtrar" click
  const [dateFromStr, setDateFromStr] = useState(formatDateInput(filters.dateFrom));
  const [dateToStr, setDateToStr] = useState(formatDateInput(filters.dateTo));
  const [natOp, setNatOp] = useState(filters.natOp ?? "VENDA DE MERCADORIA");
  const [status, setStatus] = useState(filters.status ?? "all");
  const [tipo, setTipo] = useState(filters.tipo ?? "all");
  const [numero, setNumero] = useState(filters.numero ?? "");

  const handleFiltrar = () => {
    const changes: Partial<NotaFiscalFilter> = {};

    // Dates
    if (dateFromStr) {
      changes.dateFrom = new Date(dateFromStr + "T00:00:00.000Z");
    } else {
      changes.dateFrom = undefined;
    }
    if (dateToStr) {
      changes.dateTo = new Date(dateToStr + "T23:59:59.999Z");
    } else {
      changes.dateTo = undefined;
    }

    // Text filters
    changes.natOp = natOp || undefined;
    changes.numero = numero || undefined;

    // Selects (normalize "all" → undefined)
    changes.status = status === "all" ? undefined : status;
    changes.tipo = tipo === "all" ? undefined : (tipo as "E" | "S");

    changes.page = 1; // Reset to page 1 on new filter

    onFiltersChange(changes);
    onSearch();
  };

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Período
        </label>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              value={dateFromStr}
              onChange={(e) => setDateFromStr(e.target.value)}
              className="flex h-9 w-[150px] rounded-md border border-input bg-background pl-8 pr-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <span className="text-muted-foreground text-xs">até</span>
          <div className="relative">
            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              value={dateToStr}
              onChange={(e) => setDateToStr(e.target.value)}
              className="flex h-9 w-[150px] rounded-md border border-input bg-background pl-8 pr-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[180px]">
        <label className="text-xs font-medium text-muted-foreground">
          Nat. Operação
        </label>
        <Input
          placeholder="Digite a natureza..."
          value={natOp}
          onChange={(e) => setNatOp(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <label className="text-xs font-medium text-muted-foreground">
          Situação
        </label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[120px]">
        <label className="text-xs font-medium text-muted-foreground">Tipo</label>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {TIPO_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <label className="text-xs font-medium text-muted-foreground">
          Número
        </label>
        <Input
          placeholder="Buscar número..."
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleFiltrar} variant="default">
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
        <Button onClick={onExport} variant="outline" disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </div>
    </div>
  );
}
