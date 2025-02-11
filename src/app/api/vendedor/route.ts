import { NextResponse } from "next/server";
import { TMongo } from "@/infra/mongoClient";

export async function GET(req: Request) {
  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);

  const response = await clientdb
    .collection("vendedor")
    .find()
    .sort({ nome_vendedor: 1 })
    .toArray();

  await TMongo.mongoDisconnect(client);
  return NextResponse.json(response, { status: 200 });
}
