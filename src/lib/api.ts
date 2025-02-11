import { Catalog, Track } from "@/types/catalog";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchCatalogs(): Promise<Catalog[]> {
  await delay(1000); // Simulate network delay
  return [
    {
      id: "1",
      codigoCatalogo: "SPIDE0903109",
      codigoBarras: "P40T145003109",
      artista: "CHILO REN OF BODOM",
      tituloObra:
        "A CHAPTER CALLED CHILDREN OF BODOM (THE FINAL SHOW IN HELSINKI ICE HALL 2019)",
      percentualBaseCalculo: 34.37,
      numeroDiscos: 1,
      numeroFaixas: 10,
      limiteFaixas: 15,
      formato: "CD",
      percentualPorFaixa: 0.61,
      faixas: [],
    },
  ];
}

export async function createCatalog(
  catalog: Omit<Catalog, "id">
): Promise<Catalog> {
  await delay(1000);
  return {
    id: Math.random().toString(36).substring(7),
    ...catalog,
    faixas: catalog.faixas || [],
  };
}

export async function updateCatalog(
  id: string,
  catalog: Catalog
): Promise<Catalog> {
  await delay(1000);
  return {
    ...catalog,
    faixas: catalog.faixas || [],
  };
}

export async function deleteCatalog(id: string): Promise<void> {
  await delay(1000);
}
