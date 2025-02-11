"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Formato,
  FormatoFilterInterface,
  FormatoResponse,
} from "@/types/formato";
import { FormatoTable } from "@/components/formato/formato-table";
import { FormatoFilter as FormatoFilterComponent } from "@/components/formato/formato-filter";
import { FormatoEditDialog } from "@/components/formato/formato-edit-dialog";
import {
  fetchFormatos,
  updateFormato,
  createFormato,
} from "@/actions/actFormatos";

import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { Pagination } from "@/components/formato/pagination";

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const [filter, setFilter] = useState<FormatoFilterInterface>({
    page: 1,
    limit: ITEMS_PER_PAGE,
  });
  const [response, setResponse] = useState<FormatoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFormato, setEditingFormato] = useState<Formato | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadFormatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFormatos(filter);
      setResponse(data);
    } catch (err) {
      setError("Falha ao carregar formatos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadFormatos();
  }, [loadFormatos]);

  const handleFilterChange = useCallback(
    (newFilter: FormatoFilterInterface) => {
      setFilter(newFilter);
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setFilter((prev) => ({ ...prev, page }));
  }, []);

  const handleEdit = useCallback((formato: Formato) => {
    setEditingFormato(formato);
  }, []);

  const handleCreate = useCallback(() => {
    setIsCreating(true);
  }, []);

  const handleSave = async (id: number | null, data: Partial<Formato>) => {
    if (id) {
      await updateFormato(id, data);
    } else {
      await createFormato(data as Omit<Formato, "id">);
    }
    loadFormatos();
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadFormatos}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Formatos</h1>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Incluir Formato
          </Button>
        </div>
        <FormatoFilterComponent
          filter={filter}
          onFilterChange={handleFilterChange}
        />
      </div>
      {loading && !response ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        response && (
          <>
            <FormatoTable formatos={response.data} onEdit={handleEdit} />
            <div className="mt-4 flex justify-center">
              <Pagination
                total={response.total}
                pageSize={response.limit}
                page={response.page}
                onChange={handlePageChange}
              />
            </div>
          </>
        )
      )}
      <FormatoEditDialog
        formato={editingFormato}
        open={!!editingFormato || isCreating}
        onClose={() => {
          setEditingFormato(null);
          setIsCreating(false);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
