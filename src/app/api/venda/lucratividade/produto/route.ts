import { NextResponse } from "next/server";
import { TMongo } from "@/infra/mongoClient";
import { lib } from "@/lib/lib";
import { sortList, sortField } from "@/services";
import { TotalItens } from "@/types/totalItens";
import { obterSomatoriaTotalItens } from "@/lib/sumItens";

export async function POST(req: Request) {
  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  const body = await req.json();
  let q: any = lib.obterQuery(body);
  let searchFilter = [];
  let searchSecond: any = {};
  let queryObject: any = {};

  searchFilter.push({
    "itens.data_movto": {
      $gte: q.startDate,
      $lte: q.endDate,
    },
  });

  if (q.id_produto) {
    searchSecond["itens.codigo"] = q.id_produto;
  }

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

  let sort = sortField(q.order_by, { nfe_quantidade: -1 });
  queryObject.$and = searchFilter;

  const rows = await clientdb
    .collection("nota_fiscal")
    .aggregate([
      // Primeiro estágio: Filtragem inicial (sem "itens.codigo" pois será filtrado depois de unwind)
      {
        $match: queryObject,
      },
      //Percorrer itens e agrupar por codigo
      {
        $unwind: "$itens",
      },
      // Filtrar pelo código do item após unwind
      {
        $match: searchSecond,
      },

      //second stage
      {
        $group: {
          _id: "$itens.codigo",
          uf: { $first: null },
          nome: { $first: null },
          id: { $first: "$itens.id" },
          id_pai: { $first: "$itens.id_pai" },
          id_tenant: { $first: "$itens.id_tenant" },
          nfe_numero: { $first: null },
          codigo: { $first: "$itens.codigo" },
          nome_vendedor: { $first: null },
          data_movto: { $first: null },
          data_emissao: { $first: null },
          nfe_descricao: { $first: "$itens.nfe_descricao" },
          nfe_preco_custo: { $first: "$itens.nfe_preco_custo" },
          nfe_perc_lucro_bruto: { $first: "$itens.nfe_perc_lucro_bruto" },
          nfe_perc_lucro_liquido: { $first: "$itens.nfe_perc_lucro_liquido" },
          nfe_valor_unitario: { $first: "$itens.nfe_valor_unitario" },
          marca: { $first: "$itens.marca" },
          nfe_cfop: { $first: null },
          unidade: { $first: "$itens.unidade" },
          nome_ecommerce: { $first: null },

          nfe_valor_total: {
            $sum: "$itens.nfe_valor_total",
          },
          nfe_quantidade: {
            $sum: "$itens.nfe_quantidade",
          },
          nfe_valor_lucro_bruto: {
            $sum: "$itens.nfe_valor_lucro_bruto",
          },
          nfe_lucro_liquido: {
            $sum: "$itens.nfe_lucro_liquido",
          },
          nfe_total_preco_custo: {
            $sum: "$itens.nfe_total_preco_custo",
          },

          //---------------------------------------------------
          sum_nfe_cofins: {
            $sum: "$itens.nfe_cofins",
          },
          sum_nfe_custo_canal: {
            $sum: "$itens.nfe_custo_canal",
          },
          sum_nfe_desconto: {
            $sum: "$itens.nfe_desconto",
          },
          sum_nfe_difal: {
            $sum: "$itens.nfe_difal",
          },
          sum_nfe_fcp: {
            $sum: "$itens.nfe_fcp",
          },
          sum_nfe_frete: {
            $sum: "$itens.nfe_frete",
          },
          sum_nfe_ipi: {
            $sum: "$itens.nfe_ipi",
          },
          sum_nfe_pis: {
            $sum: "$itens.nfe_pis",
          },
          sum_nfe_icms: {
            $sum: "$itens.nfe_icms",
          },
          sum_nfe_outras: {
            $sum: "$itens.nfe_outras",
          },
          sum_nfe_total_imposto: {
            $sum: "$itens.nfe_total_imposto",
          },
          //---------------------------------------------------
          ticket_medio: {
            $avg: "$itens.nfe_valor_total",
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

  let data: any = [];
  for (let row of rows) {
    let item: ItemsLucratividade = {
      nfe_value: row._id,
      uf: row.uf,
      nome: row.nome,
      id: row._id,
      id_pai: row.id_pai,
      id_tenant: row.id_tenant,
      nfe_numero: 0,
      codigo: row.codigo,
      nome_vendedor: row.nome_vendedor,
      data_movto: row.data_movto,
      data_emissao: row.data_emissao,
      nfe_descricao: row.nfe_descricao,
      nfe_valor_total: row.nfe_valor_total,
      nfe_preco_custo: row.nfe_preco_custo,
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
      nfe_valor_unitario: row.nfe_valor_unitario,
      marca: row.marca,
      nfe_cfop: row.nfe_cfop,
      unidade: row.unidade,
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
    };
    data.push({ itens: [item] });
  }

  data = lib.sort(data, q.order_by);
  let totalItens: TotalItens = await obterSomatoriaTotalItens(data);
  return NextResponse.json({ totalItens, data }, { status: 200 });
}
