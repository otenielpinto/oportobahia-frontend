import { CatalogList } from "@/components/catalog/catalog-list";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Lista de Catálogo</h1>
      <CatalogList />
    </div>
  );
}
