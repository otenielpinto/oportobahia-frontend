import { NextResponse } from "next/server";
import { TMongo } from "@/infra/mongoClient";
import { lib } from "@/lib/lib";

export async function POST(req: Request) {
  const body = await req.json();

  const status = body.status;
  const created_at_start = body.created_at_start;
  const created_at_end = body.created_at_end;
  const from_id_company = Number(body.from_id_company);
  const to_id_company = Number(body.to_id_company);
  const page = body.page;

  const startDate = lib.dateUSAToIso8601(created_at_start);
  let endDate = lib.dateUSAToIso8601(created_at_end);
  endDate = lib.setUTCHoursEnd(endDate);

  const query: any = {
    created_at: { $gte: startDate, $lte: endDate },
  };

  if (from_id_company > 0) {
    query.from_id_company = from_id_company;
  }

  if (to_id_company > 0) {
    query.to_id_company = to_id_company;
  }
  if (status !== "All" && status !== "") {
    query.status = status;
  }

  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  const response = await clientdb
    .collection("transferencia_enviada")
    .find(query)
    .toArray();

  await TMongo.mongoDisconnect(client);
  return NextResponse.json(response, { status: 200 });
}
