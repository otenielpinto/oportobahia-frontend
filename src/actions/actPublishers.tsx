"use server";
import { TMongo } from "@/infra/mongoClient";
import { genId } from "./actGenerator";
import {
  Publisher,
  PublisherFilterInterface,
  PublisherResponse,
} from "@/types/publisher";

const collection = "editora";

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
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb
      .collection(collection)
      .updateOne({ id: Number(id) }, { $set: { ...updatedData } });
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

    return publishers.map((doc) => ({
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
  const publishers = await getPublishers();
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
