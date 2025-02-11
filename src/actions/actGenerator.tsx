"use server";
import { TMongo } from "@/infra/mongoClient";

//conforme documentacao do mongo precisar ter indice pelo campo name

export async function getNextSequence(name: string) {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const data = await clientdb
    .collection("tmp_generator")
    .findOneAndUpdate({ name }, { $inc: { seq: 1 } }, { upsert: true });
  await TMongo.mongoDisconnect(client);
  return data;
}

export async function genId(name: string): Promise<number> {
  let seq = 0;
  while (seq === 0) {
    const newData = await getNextSequence(name);
    seq = Number(newData?.seq);
  }
  return seq;
}
