"use server";
import { TMongo } from "@/infra/mongoClient";
import { genId } from "./actGenerator";
import {
  Formato,
  FormatoFilterInterface,
  FormatoResponse,
} from "@/types/formato";

const collection = "formato";

export const createFormato = async (formato: Partial<Formato>) => {
  let id: number = await genId(collection);
  //return await insertInitialData();

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection(collection).insertOne({
      id,
      name: formato.name,
      limite_faixas: formato.limite_faixas,
      percentual_faixa: formato.percentual_faixa,
      status: formato.status,
    });
    await TMongo.mongoDisconnect(client);
    return result.insertedId;
  } catch (error) {
    console.error("Error inserting formato:", error);
    throw error;
  }
};

export const updateFormato = async (
  id: number,
  updatedData: Partial<Formato>
) => {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb
      .collection(collection)
      .updateOne({ id: Number(id) }, { $set: updatedData });
    await TMongo.mongoDisconnect(client);

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating formato:", error);
    throw error;
  }
};

export const deleteFormato = async (id: number) => {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection(collection).deleteOne({ id: id });
    await TMongo.mongoDisconnect(client);
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting formato:", error);
    throw error;
  }
};

export const getFormatos = async (): Promise<Formato[]> => {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const formatos = await clientdb.collection(collection).find().toArray();
    await TMongo.mongoDisconnect(client);

    return formatos.map((doc) => ({
      id: doc.id,
      name: doc.name,
      status: doc.status,
      limite_faixas: doc.limite_faixas,
      percentual_faixa: doc.percentual_faixa,
    }));
  } catch (error) {
    console.error("Error retrieving formatos:", error);
    throw error;
  }
};

export const getFormatoByName = async (
  name: string
): Promise<Formato | null> => {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const formato = await clientdb
      .collection(collection)
      .findOne({ name: name });
    await TMongo.mongoDisconnect(client);

    if (!formato) {
      return null;
    }

    return {
      id: formato.id,
      name: formato.name,
      status: formato.status,
      limite_faixas: formato.limite_faixas,
      percentual_faixa: formato.percentual_faixa,
    };
  } catch (error) {
    console.error("Error retrieving formato by name:", error);
    throw error;
  }
};

export async function fetchFormatos(
  filter: FormatoFilterInterface
): Promise<FormatoResponse> {
  const formatos = await getFormatos();
  let filtered: Formato[] = [...formatos];

  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter((form) =>
      form.name.toLowerCase().includes(searchLower)
    );
  }

  if (filter.status) {
    filtered = filtered.filter((form) => form.status === filter.status);
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

const initialData = [
  { name: "CD", limite_faixas: 14, percentual_faixa: 0.61 },
  { name: "CD 2", limite_faixas: 28, percentual_faixa: 0.61 },
  { name: "CD 3", limite_faixas: 42, percentual_faixa: 0.61 },
  { name: "CD 4", limite_faixas: 56, percentual_faixa: 0.61 },
  { name: "CD 5", limite_faixas: 70, percentual_faixa: 0.61 },
  { name: "CD 6", limite_faixas: 84, percentual_faixa: 0.61 },
  { name: "CD 7", limite_faixas: 98, percentual_faixa: 0.61 },
  { name: "CD 8", limite_faixas: 112, percentual_faixa: 0.61 },
  { name: "CD 10", limite_faixas: 140, percentual_faixa: 0.61 },
  { name: "CD 11", limite_faixas: 154, percentual_faixa: 0.61 },
  { name: "CD 22", limite_faixas: 308, percentual_faixa: 0.61 },
  { name: "CD 29", limite_faixas: 406, percentual_faixa: 0.61 },
  { name: "CDR", limite_faixas: 14, percentual_faixa: 0.61 },
  { name: "VINIL", limite_faixas: 14, percentual_faixa: 0.61 },
  { name: "DVD FILME", limite_faixas: 1, percentual_faixa: 0 },
  { name: "DVD FI", limite_faixas: 1, percentual_faixa: 0 },
  { name: "DVD MU", limite_faixas: 24, percentual_faixa: 0.27 },
  { name: "DVD 2", limite_faixas: 48, percentual_faixa: 0.27 },
  { name: "BLURAY", limite_faixas: 24, percentual_faixa: 0.27 },
  { name: "DVD 3", limite_faixas: 72, percentual_faixa: 0.27 },
  { name: "DVD 4", limite_faixas: 96, percentual_faixa: 0.27 },
  { name: "DVD 6", limite_faixas: 144, percentual_faixa: 0.27 },
  { name: "CD+DVD", limite_faixas: 38, percentual_faixa: 0.44 },
  { name: "DVD+CD", limite_faixas: 38, percentual_faixa: 0.343 },
];

export const insertInitialData = async () => {
  await genId(collection);
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const formattedData = initialData.map((data, index) => ({
      id: index + 1,
      name: data.name,
      status: typeof data.limite_faixas === "number" ? "active" : "error",
      limite_faixas: data.limite_faixas,
      percentual_faixa: data.percentual_faixa,
    }));
    await clientdb.collection(collection).insertMany(formattedData);
    await TMongo.mongoDisconnect(client);
  } catch (error) {
    console.error("Error inserting initial data:", error);
    throw error;
  }
};
