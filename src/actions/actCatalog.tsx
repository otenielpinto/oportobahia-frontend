"use server";

import {
  Catalog,
  Track,
  CatalogFormData,
  TrackFormData,
} from "@/types/catalogTypes";

import { TMongo } from "@/infra/mongoClient";
import { genId } from "./actGenerator";

const collection = "tmp_catalog";
const collection_produto = "product";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProductByGtin(barcode: string): Promise<any | null> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const product = await clientdb
      .collection(collection_produto)
      .findOne({ gtin: barcode });
    await TMongo.mongoDisconnect(client);
    return product;
  } catch (error) {
    console.error("Error retrieving product by barcode:", error);
    throw error;
  }
}

export async function getCatalogByBarcode(
  barcode: string
): Promise<any | null> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const catalog = await clientdb.collection(collection).findOne({ barcode });
    await TMongo.mongoDisconnect(client);
    return catalog;
  } catch (error) {
    console.error("Error retrieving catalog by Code:", error);
    throw error;
  }
}

export async function getCatalogById(id: string): Promise<any | null> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const catalog = await clientdb.collection(collection).findOne({ id });
    await TMongo.mongoDisconnect(client);
    return catalog;
  } catch (error) {
    console.error("Erro ao recuperar catálogo por ID:", error);
    throw error;
  }
}

export async function getCatalogs(
  page = 1,
  limit = 100,
  search = ""
): Promise<{ data: any[]; total: number }> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const skip = (page - 1) * limit;

    // Create search query if search parameter exists
    const query = search
      ? {
          $or: [
            { catalogCode: { $regex: search, $options: "i" } },
            { artist: { $regex: search, $options: "i" } },
            { workTitle: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await clientdb.collection(collection).countDocuments(query);

    // Get paginated results
    const data = await clientdb
      .collection(collection)
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    await TMongo.mongoDisconnect(client);

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Erro ao recuperar catálogos:", error);
    throw error;
  }
}

export async function createCatalog(data: CatalogFormData): Promise<Catalog> {
  const hasCatalog = await getCatalogByBarcode(data.barcode);
  if (hasCatalog) {
    throw new Error("Catálogo já existe com este código de barras");
  }
  const id = String(await genId(collection));
  const body: Catalog = { id, ...data };

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    await clientdb.collection(collection).insertOne(body);
    await TMongo.mongoDisconnect(client);
    return body;
  } catch (error) {
    console.error("Erro ao inserir Catálogo:", error);
    throw error;
  }
}

export async function updateCatalog(id: string, data: any): Promise<Catalog> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const updatedCatalog = await clientdb
      .collection(collection)
      .updateOne({ id }, { $set: data }, { upsert: true });
    await TMongo.mongoDisconnect(client);
    if (!updatedCatalog) throw new Error("Catálogo não encontrado");
    return data;
  } catch (error) {
    console.error("Erro ao atualizar Catálogo:", error);
    throw error;
  }
}

export async function deleteCatalog(id: string): Promise<void> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    await clientdb.collection(collection).deleteOne({ id });
    await TMongo.mongoDisconnect(client);
  } catch (error) {
    console.error("Erro ao deletar Catálogo:", error);
    throw error;
  }
}

export async function getTracks(
  catalogId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ data: any[]; total: number }> {
  const catalog = await getCatalogById(catalogId);
  const tracks = catalog.tracks ? catalog.tracks : [];

  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Slice the tracks array for pagination
  const paginatedTracks = tracks.slice(startIndex, endIndex);

  return {
    data: paginatedTracks,
    total: tracks.length,
  };
}

export async function createTrack(
  catalogId: string,
  data: TrackFormData
): Promise<any> {
  const catalog = await getCatalogById(catalogId);
  const tracks = catalog.tracks ? catalog.tracks : [];

  const newTrack = {
    id: String(Date.now()),
    ...data,
    catalogId,
  };
  tracks.push(newTrack);
  catalog.tracks = tracks;

  await updateCatalog(catalogId, catalog);
  return newTrack;
}

export async function updateTrack(catalogId: string, data: any): Promise<any> {
  const catalog = await getCatalogById(catalogId);
  const tracks = catalog.tracks ? catalog.tracks : [];
  const trackCode = data.trackCode;

  for (let t of tracks) {
    if (t.trackCode === trackCode) {
      t.trackCode = data.trackCode;
      t.work = data.work;
      t.authors = data.authors;
      t.publishers = data.publishers;
      t.participationPercentage = data.participationPercentage;
      t.isrc = data.isrc;
    }
  }

  catalog.tracks = tracks;
  try {
    await updateCatalog(catalogId, catalog);
  } catch (error) {
    console.error("Erro ao atualizar Catálogo:", error);
    throw error;
  }
  return data;
}

export async function deleteTrack(
  catalogId: string,
  idTrack: string
): Promise<void> {
  const catalog = await getCatalogById(catalogId);
  let tracks = catalog.tracks ? catalog.tracks : [];
  const newTracks = tracks.filter((t: any) => t.id !== idTrack);

  catalog.tracks = newTracks;
  try {
    await updateCatalog(catalogId, catalog);
  } catch (error) {
    console.error("Erro ao excluir a faixa do  Catálogo:", error);
    throw error;
  }
}
