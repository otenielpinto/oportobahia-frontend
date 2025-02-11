"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Publisher,
  PublisherFilterInterface,
  PublisherResponse,
} from "@/types/publisher";
import { PublisherTable } from "@/components/publishers/publisher-table";
import { PublisherFilter as PublisherFilterComponent } from "@/components/publishers/publisher-filter";
import { PublisherEditDialog } from "@/components/publishers/publisher-edit-dialog";
import {
  fetchPublishers,
  updatePublisher,
  createPublisher,
} from "@/actions/actPublishers";

import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { Pagination } from "@/components/publishers/pagination";
import { set } from "date-fns";

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const [filter, setFilter] = useState<PublisherFilterInterface>({
    page: 1,
    limit: ITEMS_PER_PAGE,
  });
  const [response, setResponse] = useState<PublisherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadPublishers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPublishers(filter);
      setResponse(data);
    } catch (err) {
      setError("Falha ao carregar editoras");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPublishers();
  }, [loadPublishers]);

  const handleFilterChange = useCallback(
    (newFilter: PublisherFilterInterface) => {
      setFilter(newFilter);
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setFilter((prev) => ({ ...prev, page }));
  }, []);

  const handleEdit = useCallback((publisher: Publisher) => {
    setEditingPublisher(publisher);
    setIsEditing(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingPublisher(null);
    setIsCreating(true);
  }, []);

  const handleSave = async (id: number, data: Partial<Publisher>) => {
    let newId = 0;
    if (id) newId = id;

    if (newId) {
      await updatePublisher(newId, data);
    } else {
      await createPublisher(data);
    }

    loadPublishers();
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadPublishers}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Editoras</h1>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Incluir Editora
          </Button>
        </div>
        <PublisherFilterComponent
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
            <PublisherTable publishers={response.data} onEdit={handleEdit} />
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

      <PublisherEditDialog
        publisher={editingPublisher}
        open={isEditing || isCreating}
        onClose={() => {
          setEditingPublisher(null);
          setIsEditing(false);
          setIsCreating(false);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
