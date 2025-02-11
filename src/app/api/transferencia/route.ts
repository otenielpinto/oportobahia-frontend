import { NextResponse } from "next/server";
import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/actions/actSession";
import { getNextSequence } from "@/actions/actGenerator";
import { statusToStr } from "@/types/statusTransferencia";
import { Empresa } from "@/actions/actEmpresa";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const body = await req.json();
  let genDoc = await getNextSequence("transferencia");
  const user = await getUser();

  if (!genDoc || !user) {
    return NextResponse.json({}, { status: 400 });
  }
  const companyVO = await Empresa.getEmpresaById(Number(user?.id_empresa));
  const doc: any = {
    id: genDoc?.seq ? genDoc?.seq : 0,
    created_at: new Date(),
    from_id_company: companyVO?.id,
    from_company: companyVO?.codigo,
    to_id_company: 0,
    to_company: "",
    status: statusToStr.pendente,
    items: [],
    total_qty: 0,
    user_name: user?.name,
  };

  let items = [];
  let sum_qty = 0;
  let to_company = "";
  for (let item of body) {
    sum_qty += item.quantity;
    to_company = item.company;
    items.push({
      ...item,
      from_id_company: user?.id_empresa,
      user_name: user?.name,
      created_at: new Date(),
      status: statusToStr.pendente,
      id_pai: genDoc?.seq ? genDoc?.seq : 0,
      qtd_original: item.quantity,
    });
  }
  const companyToVO = await Empresa.getEmpresaByCodigo(to_company);
  doc.total_qty = sum_qty;
  doc.items = items;
  doc.to_company = to_company;
  doc.to_id_company = companyToVO?.id;

  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  const response = await clientdb
    .collection("transferencia_enviada")
    .insertOne(doc);
  await TMongo.mongoDisconnect(client);
  return NextResponse.json(doc, { status: 200 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id: any = searchParams.get("id");

  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  const response = await clientdb
    .collection("transferencia_enviada")
    .findOne({ _id: new ObjectId(id) });

  await TMongo.mongoDisconnect(client);
  return NextResponse.json(response, { status: 200 });
}

export async function PUT(req: Request) {
  const itemsUpdate: any[] = await req.json();
  const user = await getUser();
  let id_pai = 0;
  const listOfId: any[] = [];
  const itemsDeleted: any[] = [];

  for (let item of itemsUpdate) {
    id_pai = item.id_pai;
    listOfId.push(item.id);
  }

  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  const response: any = await clientdb
    .collection("transferencia_enviada")
    .findOne({ id: id_pai });

  if (!response || response.status == statusToStr.concluido) {
    return NextResponse.json(
      { message: "Transferencia ja concluida" },
      { status: 400 }
    );
  }

  let itemsOld: any[] = response?.items;
  let itemsNew: any[] = [];

  for (let itemOld of itemsOld) {
    if (listOfId.includes(itemOld.id)) {
      itemsNew.push(itemOld);
    } else {
      itemsDeleted.push(itemOld);
    }
  }
  let sum_qty = 0;

  for (let itemNew of itemsNew) {
    for (let itemUpdate of itemsUpdate) {
      if (itemNew.id == itemUpdate.id) {
        sum_qty += itemUpdate.quantity;
        itemNew.quantity = itemUpdate.quantity;
        itemNew.status = statusToStr.confirmado;
      }
    }
  }

  response.items = itemsNew;
  response.total_qty = sum_qty;
  response.updated_at = new Date();
  response.user_update = user?.name;
  response.status = statusToStr.confirmado;
  response.log = itemsDeleted;
  await clientdb
    .collection("transferencia_enviada")
    .updateOne({ _id: new ObjectId(response._id) }, { $set: response });

  await TMongo.mongoDisconnect(client);
  return NextResponse.json(itemsUpdate, { status: 200 });
}
