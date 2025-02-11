"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormatoFilterInterface } from "@/types/formato";
import { useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface FormatoFilterProps {
  filter: FormatoFilterInterface;
  onFilterChange: (filter: FormatoFilterInterface) => void;
}

export function FormatoFilter({ filter, onFilterChange }: FormatoFilterProps) {
  const debouncedSearch = useDebounce((value: string) => {
    onFilterChange({ ...filter, search: value, page: 1 });
  }, 300);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(e.target.value);
    },
    [debouncedSearch]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...filter,
        status: value === "all" ? undefined : (value as "active" | "inactive"),
      });
    },
    [filter, onFilterChange]
  );

  return (
    <div className="flex space-x-4">
      <Input
        placeholder="Pesquisar..."
        onChange={handleSearchChange}
        defaultValue={filter.search}
      />
      <Select value={filter.status || "all"} onValueChange={handleStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativo</SelectItem>
          <SelectItem value="inactive">Inativo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
