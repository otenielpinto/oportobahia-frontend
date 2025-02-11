import { NextResponse } from "next/server";
import { TMongo } from "@/infra/mongoClient";
import { lib } from "@/lib/lib";
import { sortList, sortField } from "@/services";
import { obterSomatoriaTotalItens } from "@/lib/sumItens";
import { TotalItens } from "@/types/totalItens";
import { getAllTenant } from "@/actions";

export async function POST(req: Request) {
  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  const body = await req.json();

  let q: any = lib.obterQuery(body);
  const tenants = await getAllTenant();
  let searchFilter = [];
  let queryObject: any = {};

  if (q.id_produto) {
    searchFilter.push({ "itens.codigo": q.id_produto });
  }

  searchFilter.push({
    "itens.data_movto": {
      $gte: q.startDate,
      $lte: q.endDate,
    },
  });

  if (q.nome_vendedor) {
    searchFilter.push({
      "itens.nome_vendedor": {
        $regex: `${q.nome_vendedor}`,
        $options: "i",
      },
    });
  }

  if (q.id_loja && q.id_loja > 0) {
    searchFilter.push({ "itens.id_tenant": q.id_loja });
  }

  if (q.nota_fiscal) {
    searchFilter.push({
      "itens.nfe_numero": { $regex: `${q.nota_fiscal}`, $options: "i" },
    });
  }

  if (q.nome) {
    searchFilter.push({ "itens.nome": { $regex: `${q.nome}`, $options: "i" } });
  }

  if (q.uf) {
    searchFilter.push({ "itens.uf": q.uf });
  }

  if (q.marca) {
    searchFilter.push({
      "itens.marca": { $regex: `${q.marca}`, $options: "i" },
    });
  }

  if (q.natOperacao) {
    searchFilter.push({ "itens.nfe_cfop": q.natOperacao });
  }

  if (q.categoria) {
    searchFilter.push({ "itens.categoria": q.categoria });
  }

  if (q.nome_ecommerce) {
    searchFilter.push({
      "itens.nome_ecommerce": q.nome_ecommerce,
    });
  }

  let sort = sortField(q.order_by, { "itens.data_movto": 1 });
  console.log(searchFilter);

  queryObject["$and"] = searchFilter;
  const rows = await clientdb
    .collection("nota_fiscal")
    .aggregate([
      //first stage
      {
        $match: queryObject,
      },

      //second stage
      {
        $group: {
          _id: "$_id",
          uf: { $first: "$cliente.uf" },
          nome: { $first: "$cliente.nome" },
          id: { $first: "$_id" },
          id_pai: { $first: "$id_pai" },
          id_tenant: { $first: "$id_tenant" },
          numero: { $first: "$numero" },
          nome_vendedor: { $first: "$nome_vendedor" },
          data_movto: { $first: "$data_movto" },
          data_emissao: { $first: "$data_emissao" },
          nome_ecommerce: { $first: "$nome_ecommerce" },
          itens: { $first: "$itens" },

          nfe_valor_total: {
            $sum: "$sum_nfe_valor_total",
          },
          nfe_quantidade: {
            $sum: "$sum_nfe_quantidade",
          },
          nfe_valor_lucro_bruto: {
            $sum: "$sum_nfe_valor_lucro_bruto",
          },
          nfe_lucro_liquido: {
            $sum: "$sum_nfe_lucro_liquido",
          },
          nfe_total_preco_custo: {
            $sum: "$sum_nfe_total_preco_custo",
          },

          //---------------------------------------------------
          sum_nfe_cofins: {
            $sum: "$sum_nfe_cofins",
          },
          sum_nfe_custo_canal: {
            $sum: "$sum_nfe_custo_canal",
          },
          sum_nfe_desconto: {
            $sum: "$sum_nfe_desconto",
          },
          sum_nfe_difal: {
            $sum: "$sum_nfe_difal",
          },
          sum_nfe_fcp: {
            $sum: "$sum_nfe_fcp",
          },
          sum_nfe_frete: {
            $sum: "$sum_nfe_frete",
          },
          sum_nfe_ipi: {
            $sum: "$sum_nfe_ipi",
          },
          sum_nfe_pis: {
            $sum: "$sum_nfe_pis",
          },
          sum_nfe_icms: {
            $sum: "$sum_nfe_icms",
          },
          sum_nfe_outras: {
            $sum: "$sum_nfe_outras",
          },
          sum_nfe_total_imposto: {
            $sum: "$sum_nfe_total_imposto",
          },
          //---------------------------------------------------
          ticket_medio: {
            $avg: "$sum_nfe_valor_total",
          },

          count: { $sum: 1 },
        },
      },

      // Third Stage
      {
        $sort: sort,
      },
    ])
    .toArray();
  await TMongo.mongoDisconnect(client);

  //pegando os nomes dos tenants
  let tenantName: any = {};
  for (const tenant of tenants) {
    tenantName[tenant.id] = tenant.nome ? tenant.nome : tenant.id;
  }

  let data: any = [];
  for (let row of rows) {
    let item: ItemsLucratividade = {
      nfe_value: row._id,
      uf: row.uf,
      nome: row.nome,
      id: row._id,
      id_pai: row.id_pai,
      id_tenant: tenantName[row.id_tenant],
      nfe_numero: row.numero,
      codigo: "",
      nome_vendedor: row.nome_vendedor,
      data_movto: row.data_movto,
      data_emissao: row.data_emissao,
      nfe_descricao: "",
      nfe_valor_total: row.nfe_valor_total,
      nfe_preco_custo: 0,
      nfe_total_preco_custo: row.nfe_total_preco_custo,
      nfe_valor_lucro_bruto: row.nfe_valor_lucro_bruto,
      nfe_perc_lucro_bruto: lib.obter_percentual(
        row.nfe_valor_total,
        row.nfe_valor_lucro_bruto
      ),
      nfe_lucro_liquido: row.nfe_lucro_liquido,
      nfe_perc_lucro_liquido: lib.obter_percentual(
        row.nfe_valor_total,
        row.nfe_lucro_liquido
      ),
      nfe_quantidade: row.nfe_quantidade,
      nfe_valor_unitario: 0,
      marca: "",
      nfe_cfop: 0,
      unidade: "",
      nome_ecommerce: row.nome_ecommerce,
      qtd_vendas: row.count,
      ticket_medio: row.ticket_medio,

      sum_nfe_cofins: row.sum_nfe_cofins,
      sum_nfe_custo_canal: row.sum_nfe_custo_canal,
      sum_nfe_desconto: row.sum_nfe_desconto,
      sum_nfe_difal: row.sum_nfe_difal,
      sum_nfe_fcp: row.sum_nfe_fcp,
      sum_nfe_frete: row.sum_nfe_frete,
      sum_nfe_ipi: row.sum_nfe_ipi,
      sum_nfe_pis: row.sum_nfe_pis,
      sum_nfe_icms: row.sum_nfe_icms,
      sum_nfe_outras: row.sum_nfe_outras,
      sum_nfe_total_imposto: row.sum_nfe_total_imposto,

      itens: row.itens,
    };
    data.push({ itens: [item] });
  }

  data = lib.sort(data, q.order_by);
  let totalItens: TotalItens = await obterSomatoriaTotalItens(data);
  return NextResponse.json({ totalItens, data }, { status: 200 });
}
