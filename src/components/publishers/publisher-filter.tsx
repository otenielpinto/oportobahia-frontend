"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PublisherFilterInterface } from "@/types/publisher";
import { useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface PublisherFilterProps {
  filter: PublisherFilterInterface;
  onFilterChange: (filter: PublisherFilterInterface) => void;
}

export function PublisherFilter({
  filter,
  onFilterChange,
}: PublisherFilterProps) {
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
        page: 1,
      });
    },
    [filter, onFilterChange]
  );

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
      <div className="flex-1">
        <Input
          placeholder="Pesquisar..."
          onChange={handleSearchChange}
          defaultValue={filter.search}
          className="max-w-sm"
        />
      </div>
      <Select value={filter.status || "all"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
