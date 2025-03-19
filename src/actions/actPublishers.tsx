"use server";
import { TMongo } from "@/infra/mongoClient";
import { genId } from "./actGenerator";
import {
  Publisher,
  PublisherFilterInterface,
  PublisherResponse,
} from "@/types/publisher";

const collection = "editora";
const tmp_log_editora = "tmp_log_editora";

export const createPublisher = async (publisher: any) => {
  let id: number = await genId(collection);

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection(collection).insertOne({
      id,
      name: publisher.name,
      status: publisher.status,
    });
    await TMongo.mongoDisconnect(client);
    return null;
  } catch (error) {
    console.error("Error inserting publisher:", error);
    throw error;
  }
};

export const updatePublisher = async (
  id: number,
  updatedData: Partial<Publisher>
) => {
  console.log("updatePublisher chamado com:", { id, updatedData });
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    // Verificar se a editora existe antes de atualizar
    const existingPublisher = await clientdb
      .collection(collection)
      .findOne({ id: Number(id) });

    const result = await clientdb
      .collection(collection)
      .updateOne({ id: Number(id) }, { $set: { ...updatedData } });

    if (result.modifiedCount > 0) {
      await updateCatalogPublisherName(
        existingPublisher?.name,
        updatedData?.name || ""
      );
    }

    await TMongo.mongoDisconnect(client);

    return null;
  } catch (error) {
    console.error("Error updating publisher:", error);
    throw error;
  }
};

export const deletePublisher = async (id: number) => {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection(collection).deleteOne({ id: id });
    await TMongo.mongoDisconnect(client);
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting publisher:", error);
    throw error;
  }
};

export const getPublishers = async (): Promise<any[]> => {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const publishers = await clientdb.collection(collection).find({}).toArray();
    await TMongo.mongoDisconnect(client);

    const sortedPublishers = [...publishers].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return sortedPublishers.map((doc) => ({
      id: doc.id,
      name: doc.name,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  } catch (error) {
    console.error("Error retrieving publishers:", error);
    throw error;
  }
};

export async function fetchPublishers(
  filter: PublisherFilterInterface
): Promise<PublisherResponse> {
  let publishers = await getPublishers();
  publishers = [...publishers].sort((a, b) => a.name.localeCompare(b.name));
  let filtered: Publisher[] = [...publishers];

  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter((pub) =>
      pub.name.toLowerCase().includes(searchLower)
    );
  }

  if (filter.status) {
    filtered = filtered.filter((pub) => pub.status === filter.status);
  }

  const start = (filter.page - 1) * filter.limit;
  const paged = filtered.slice(start, start + filter.limit);

  return {
    data: paged,
    total: filtered.length,
    page: filter.page,
    limit: filter.limit,
  };
}

export const updateCatalogPublisherName = async (
  oldName: string,
  newName: string
): Promise<void> => {
  // 1. Verificar se oldName e newName são diferentes
  if (oldName === newName) {
    console.log("O nome da editora não foi alterado.");
    return;
  }
  // 2. Verificar se oldName e newName não estão vazios
  if (!oldName || !newName) {
    console.log("O nome da editora não pode ser vazio.");
    return;
  }

  if (oldName.length < 2 || newName.length < 2) {
    console.log("O nome da editora deve ter pelo menos 3 caracteres.");
    return;
  }

  console.log(`Atualizando editora de "${oldName}" para "${newName}"`);

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    // 2. Atualizar em todas as faixas na coleção 'tmp_catalog'
    const catalogUpdateResult = await clientdb
      .collection("tmp_catalog")
      .updateMany(
        { "tracks.publishers.name": oldName },
        { $set: { "tracks.$[track].publishers.$[pub].name": newName } },
        {
          arrayFilters: [
            { "track.publishers": { $exists: true } },
            { "pub.name": oldName },
          ],
        }
      );

    // 3. Atualizar em todas as subTracks
    const subTrackUpdateResult = await clientdb
      .collection("tmp_catalog")
      .updateMany(
        { "tracks.subTracks.publishers.name": oldName },
        {
          $set: {
            "tracks.$[track].subTracks.$[subtrack].publishers.$[pub].name":
              newName,
          },
        },
        {
          arrayFilters: [
            { "track.subTracks": { $exists: true } },
            { "subtrack.publishers": { $exists: true } },
            { "pub.name": oldName },
          ],
        }
      );

    // 4. Registrar no log de alterações
    await clientdb.collection(tmp_log_editora).insertOne({
      oldName,
      newName,
      updatedAt: new Date(),
      catalogsUpdated: catalogUpdateResult.modifiedCount,
      tracksWithSubtracksUpdated: subTrackUpdateResult.modifiedCount,
    });

    // Feedback sobre atualizações
    console.log(`Catálogos atualizados: ${catalogUpdateResult.modifiedCount}`);
    console.log(
      `Catálogos com subTracks atualizados: ${subTrackUpdateResult.modifiedCount}`
    );

    // 5. Buscar os catálogos afetados para logging detalhado
    const affectedCatalogs = await clientdb
      .collection("tmp_catalog")
      .find({
        $or: [
          { "tracks.publishers.name": newName },
          { "tracks.subTracks.publishers.name": newName },
        ],
      })
      .project({ id: 1, catalogCode: 1, artist: 1, workTitle: 1 })
      .toArray();

    console.log(
      `Catálogos afetados pela alteração: ${affectedCatalogs.length}`
    );
    console.log(
      "Detalhes dos catálogos afetados:",
      affectedCatalogs
        .map(
          (c) =>
            `ID: ${c.id}, Código: ${c.catalogCode}, Artista: ${c.artist}, Obra: ${c.workTitle}`
        )
        .join("\n")
    );

    await TMongo.mongoDisconnect(client);
  } catch (error) {
    console.error("Erro ao atualizar o nome da editora:", error);
    throw new Error(
      `Falha ao atualizar nome da editora: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
};
