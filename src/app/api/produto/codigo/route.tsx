import { NextResponse } from "next/server";
import { TMongo } from "@/infra/mongoClient";

export async function GET(req: Request) {
  let id_tenant = req.headers.get("x_id_tenant")?.toString();
  let codigo = req.headers.get("x_codigo")?.toString();

  if (!codigo || !id_tenant) {
    return NextResponse.json(
      { error: "codigo and id_tenant are required" },
      { status: 400 }
    );
  }

  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);

  const response = await clientdb
    .collection("tmp_produto_tiny")
    .findOne({ codigo: codigo, id_tenant: Number(id_tenant) });
  await TMongo.mongoDisconnect(client);

  if (!response) {
    return NextResponse.json(
      { error: "codigo and id_tenant are required" },
      { status: 400 }
    );
  }

  return NextResponse.json(response, { status: 200 });
}
