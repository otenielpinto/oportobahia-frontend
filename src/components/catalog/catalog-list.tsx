"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCatalogs } from "@/actions/actCatalog";
import { CatalogTable } from "@/components/catalog/catalog-table";
import { CatalogForm } from "@/components/catalog/catalog-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export function CatalogList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const MAX_PER_PAGE = 25;

  const { data, isLoading } = useQuery({
    queryKey: ["catalogs", page, searchTerm],
    queryFn: () => getCatalogs(page, MAX_PER_PAGE, searchTerm),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(search);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
          <Input
            placeholder="Pesquisar ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="secondary">
            <SearchIcon className="h-4 w-4" />
          </Button>
        </form>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Novo Catalogo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <CatalogForm onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <CatalogTable
        data={data?.data || []}
        total={data?.total || 0}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
