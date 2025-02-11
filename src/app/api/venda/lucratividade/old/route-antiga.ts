import { NextResponse } from "next/server";
import { TMongo } from "@/infra/mongoClient";
import { lib } from "@/lib/lib";

export async function POST(req: Request) {
  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);

  if (!req) {
    return NextResponse.json({ error: "Request not found" });
  }

  //Pesquisar como enviar em formato json ou validar se é uma string
  const body = await req.json();

  //Tive que fazer isso para pegar a data com hora 00:00:00

  let startDateStr = null;
  let endDateStr = null;

  let startDate = null;
  let endDate = null;

  const queryObject: any = {};
  queryObject.data_movto = {
    $gte: startDate,
    $lte: endDate,
  };

  //   const data = await clientdb
  //     .collection("nota_fiscal")
  //     .find(queryObject)
  //     .toArray();

  //   let items = [];
  //   for (let el of data) {
  //     let item = el.itens;
  //     for (let el of item) {
  //       items.push(el);
  //     }
  //   }

  const cursor = await clientdb
    .collection("nota_fiscal")
    .find(queryObject)
    .sort({ data_movto: 1 })
    .project({
      id: 1,
      data_movto: 1,
      data_emissao: 1,
      numero: 1,
      "itens.id": 1,
      "itens.codigo": 1,
      "itens.nfe_descricao": 1,
      "itens.nfe_valor_total": 1,
      "itens.nfe_preco_custo": 1,
      "itens.nfe_valor_lucro_bruto": 1,
      "itens.nfe_perc_lucro_bruto": 1,
      "itens.nfe_lucro_liquido": 1,
      "itens.nfe_perc_lucro_liquido": 1,
    })
    .toArray();

  const items = [];
  for (let el of cursor) {
    if (!el.itens) continue;
    for (let item of el.itens) {
      items.push({
        _id: el._id,
        data_movto: el.data_movto,
        data_emissao: el.data_emissao,
        numero: el.numero,
        ...item,
      });
    }
  }

  await TMongo.mongoDisconnect(client);
  return NextResponse.json(items, { status: 200 });
}
