"use server";
import { createServerAction } from "zsa";
import { z } from "zod";
import { TMongo } from "@/infra/mongoClient";

export async function getAllEmpresa(): Promise<any[]> {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const data = await clientdb.collection("mpk_integracao").find({}).toArray();
  await TMongo.mongoDisconnect(client);
  return data;
}

export async function getEmpresaById(id: Number): Promise<any> {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const data = await clientdb
    .collection("mpk_integracao")
    .find({ id: id })
    .toArray();
  await TMongo.mongoDisconnect(client);
  return data;
}

export async function getAllEmpresaSimples(): Promise<any[]> {
  let rows = await getAllEmpresa();
  return rows.map((row) => {
    return {
      id: row.id,
      codigo: row.codigo,
      descricao: row.descricao,
      id_tenant: row.id_tenant,
    };
  });
}
