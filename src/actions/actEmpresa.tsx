"use server";
import { TMongo } from "@/infra/mongoClient";

export async function getAllEmpresa(): Promise<any[]> {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const data = await clientdb.collection("empresa").find({}).toArray();
  await TMongo.mongoDisconnect(client);
  return data;
}

export async function getEmpresaById(id: Number): Promise<any> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    // Buscar a empresa com o id especificado
    const data = await clientdb
      .collection("empresa")
      .findOne({ id: Number(id) });
    await TMongo.mongoDisconnect(client);
    return data;
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    throw error;
  }
}

//Tem que exportar exatamente assim . Nao pode criar uma variavel , e inserir as functions dentro . pois gera erro .
