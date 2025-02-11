"use server";

import { TMongo } from "@/infra/mongoClient";
import { lib } from "@/lib/lib";
import { revalidatePath } from "next/cache";

export async function getAllTenant(): Promise<any[]> {
  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  const data = await clientdb.collection("tenant").find({}).toArray();
  await TMongo.mongoDisconnect(client);
  return data;
}

export async function getTenantById(id: Number): Promise<any> {
  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  const data = await clientdb.collection("tenant").find({ id: id }).toArray();
  await TMongo.mongoDisconnect(client);
  return data;
}

export async function getHistoryMonthSales(
  fromDate?: Date,
  toDate?: Date
): Promise<any[]> {
  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);

  if (!fromDate || !toDate) {
    let daysHistory = -365;
    fromDate = lib.addDays(lib.setUTCHoursStart(new Date()), daysHistory);
    fromDate = lib.firstDayMonth(fromDate);
    if (!toDate) toDate = lib.lastDayMonth(lib.setUTCHoursEnd());
  }

  let startDate = fromDate;
  let endDate = toDate;

  let searchFilter = [];
  let queryObject: any = {};

  searchFilter.push({
    data_movto: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  queryObject["$and"] = searchFilter;
  const rows = await clientdb
    .collection("nota_fiscal")
    .aggregate([
      //first stage
      {
        $match: queryObject,
      },
      //Percorrer itens e agrupar por marca
      // {
      //   $unwind: "$itens",
      // },

      //second stage
      {
        $group: {
          _id: {
            year: {
              $year: "$data_movto",
            },
            month: {
              $month: "$data_movto",
            },
          },
          total: {
            $sum: "$sum_nfe_valor_total",
          },
          lucro_liquido: {
            $sum: "$sum_nfe_lucro_liquido",
          },

          qtd_vendas: {
            $count: {},
          },
        },
      },
      // Third Stage
      {
        $sort: { _id: -1 },
      },
    ])
    .toArray();
  await TMongo.mongoDisconnect(client);

  let somatoria = 0;
  rows.forEach((row: any) => {
    somatoria += row.total;
  });
  let media = Number(somatoria / (rows.length ? rows.length : 0)).toFixed(2);

  let data: any = [];
  for (let row of rows) {
    data.push({
      name: row._id.month + "-" + row._id.year,
      media: media,
      qtd_vendas: row.qtd_vendas,
      lucro_liquido: row.lucro_liquido,
      total: row.total,
    });
  }
  return data;
}

export async function getHistoryDaySales(
  fromDate?: Date,
  toDate?: Date
): Promise<any[]> {
  //Só pode ser preenchido no final
  if (fromDate && toDate) {
    fromDate?.setUTCHours(0, 0, 0, 0);
    toDate?.setUTCHours(23, 59, 59, 999);
  }

  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  if (!fromDate || !toDate) {
    fromDate = lib.addDays(lib.setUTCHoursStart(new Date()), -15);
    if (!toDate) toDate = new Date();
  }
  let startDate = fromDate;
  let endDate = toDate;

  let searchFilter = [];
  let queryObject: any = {};

  searchFilter.push({
    data_movto: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  queryObject["$and"] = searchFilter;
  const rows = await clientdb
    .collection("nota_fiscal")
    .aggregate([
      //first stage
      {
        $match: queryObject,
      },
      //Percorrer itens e agrupar por marca
      // {
      //   $unwind: "$itens",
      // },

      //second stage
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$data_movto" } },

          total: {
            $sum: "$sum_nfe_valor_total",
          },

          lucro_liquido: {
            $sum: "$sum_nfe_lucro_liquido",
          },

          qtd_vendas: {
            $count: {},
          },
        },
      },
      // Third Stage
      {
        $sort: { _id: -1 },
      },
    ])
    .toArray();
  await TMongo.mongoDisconnect(client);

  let somatoria = 0;
  rows.forEach((row: any) => {
    somatoria += row.total;
  });
  let media = Number(somatoria / (rows.length ? rows.length : 0)).toFixed(2);

  let data: any = [];
  for (let row of rows) {
    data.push({
      name: row._id,
      media: media,
      qtd_vendas: row.qtd_vendas,
      ticket_medio: Number(row.total) / Number(row.qtd_vendas),
      lucro_liquido: row.lucro_liquido,
      total: row.total.toFixed(2),
    });
  }
  return data;
}

function createCard(
  title: string,
  total: number,
  description: string,
  icon: string,
  isNumber: boolean
) {
  let total_str: string = total.toString();
  if (isNumber) {
    total_str = lib.formatCurrencyBr(total);
  }

  let card = {
    title: title,
    total: total,
    total_str,
    description: description,
    icon: icon,
  };
  return card;
}

export async function getDashboardDaily(
  fromDate?: Date,
  toDate?: Date
): Promise<any> {
  let data: Object = {};

  interface cardItem {
    title: string;
    qtd_vendas: number;
    lucro_liquido: number;
    total: number;
    media: number;
    ticket_medio: number;
    description: string;
    tx_crescimento: number;
  }

  let cards = [];

  if (!fromDate || !toDate) {
    fromDate = lib.firstDayMonth(lib.setUTCHoursStart());
    if (!toDate) toDate = lib.lastDayMonth(lib.setUTCHoursEnd());
  }

  let monthPassed: Date = lib.firstDayMonth(
    new Date(fromDate ? fromDate : new Date())
  );
  monthPassed = lib.addDays(monthPassed, -1);
  let monthStart = lib.firstDayMonth(monthPassed);
  let monthEnd = lib.lastDayMonth(monthPassed);

  //Só pode ser preenchido no final
  fromDate.setUTCHours(0, 0, 0, 0);
  toDate.setUTCHours(23, 59, 59, 999);
  monthStart.setUTCHours(0, 0, 0, 0);
  monthEnd.setUTCHours(23, 59, 59, 999);

  const [sales_month, sales_day, sales_month_past] = await Promise.all([
    getHistoryMonthSales(fromDate, toDate),
    getHistoryDaySales(lib.setUTCHoursStart(), lib.setUTCHoursEnd()),
    getHistoryMonthSales(monthStart, monthEnd),
  ]);

  let cardMonthPast: cardItem = {
    title: "",
    qtd_vendas: 0,
    lucro_liquido: 0,
    total: 0,
    media: 0,
    ticket_medio: 0,
    description: "",
    tx_crescimento: 0,
  };

  for (let row of sales_month_past) {
    cardMonthPast.title = "Vendas do mês passado";
    cardMonthPast.qtd_vendas += Number(row.qtd_vendas);
    cardMonthPast.lucro_liquido += Number(row.lucro_liquido);
    cardMonthPast.total += Number(row.total);
    cardMonthPast.media += Number(row.total) / Number(row.qtd_vendas);
    cardMonthPast.ticket_medio += Number(row.total) / Number(row.qtd_vendas);
    cardMonthPast.ticket_medio = Number(cardMonthPast.ticket_medio.toFixed(2));
    cardMonthPast.description = "";
    cardMonthPast.tx_crescimento = 0;
    break;
  }

  let cardMonth: cardItem = {
    title: "",
    qtd_vendas: 0,
    lucro_liquido: 0,
    total: 0,
    media: 0,
    ticket_medio: 0,
    description: "",
    tx_crescimento: 0,
  };

  for (let row of sales_month) {
    cardMonth.title = "Total de Vendas Mensal";
    cardMonth.qtd_vendas += Number(row.qtd_vendas);
    cardMonth.lucro_liquido += Number(row.lucro_liquido);
    cardMonth.total += Number(row.total);
    cardMonth.media += Number(row.total) / Number(row.qtd_vendas);
    cardMonth.ticket_medio += Number(row.total) / Number(row.qtd_vendas);
    cardMonth.ticket_medio = Number(cardMonth.ticket_medio.toFixed(2));
    cardMonth.description = "";
    cardMonth.tx_crescimento = 0;
    break;
  }

  let cardDay: cardItem = {
    title: "",
    qtd_vendas: 0,
    lucro_liquido: 0,
    total: 0,
    media: 0,
    ticket_medio: 0,
    description: "",
    tx_crescimento: 0,
  };

  for (let row of sales_day) {
    cardDay.title = "Total de Vendas (Hoje)";
    cardDay.qtd_vendas += Number(row.qtd_vendas);
    cardDay.lucro_liquido += Number(row.lucro_liquido);
    cardDay.total += Number(row.total);
    cardDay.media += Number(row.total) / Number(row.qtd_vendas);
    cardDay.ticket_medio += Number(row.total) / Number(row.qtd_vendas);
    cardDay.ticket_medio = Number(cardDay.ticket_medio.toFixed(2));
    cardDay.description = "";
    cardDay.tx_crescimento = 0;
    break;
  }

  cardMonth.tx_crescimento = lib.calcularTaxaCrescimento(
    cardMonth.total,
    cardMonthPast.total
  );

  let tx_crescimento_lucro = lib.calcularTaxaCrescimento(
    cardMonth.lucro_liquido,
    cardMonthPast.lucro_liquido
  );

  let tx_crescimento_ticket = lib.calcularTaxaCrescimento(
    cardMonth.ticket_medio,
    cardMonthPast.ticket_medio
  );

  let tx_crescimento_qtd_vendas = lib.calcularTaxaCrescimento(
    cardMonth.qtd_vendas,
    cardMonthPast.qtd_vendas
  );

  cardMonth.description =
    cardMonth.tx_crescimento.toFixed(2) + " % em relação ao mês passado";
  cards.push(
    createCard(
      cardMonth.title,
      cardMonth.total,
      cardMonth.description,
      "icoMoney",
      true
    )
  );

  cards.push(
    createCard(
      "Quantidade Vendas(Mês)",
      cardMonth.qtd_vendas,
      tx_crescimento_qtd_vendas.toFixed(2) + " % em relação ao mês passado",
      "icoTrend",
      false
    )
  );

  cards.push(
    createCard(
      "Ticket Medio(Mês)",
      cardMonth.ticket_medio,
      tx_crescimento_ticket.toFixed(2) + " % em relação ao mês passado",
      "icoTicket",
      true
    )
  );

  cards.push(
    createCard(
      "Lucro Liquido(Mês)",
      cardMonth.lucro_liquido,
      tx_crescimento_lucro.toFixed(2) + " % em relação ao mês passado",
      "icoMoney",
      true
    )
  );

  let perc_lucro_liquido = lib.obter_percentual(
    cardDay.total,
    cardDay.lucro_liquido
  );

  //------------------------------------------------------------------------------------------
  cards.push(
    createCard(
      cardDay.title,
      cardDay.total,
      cardDay.description,
      "icoMoney",
      true
    )
  );

  cards.push(
    createCard(
      "Quantidade Vendas(hoje)",
      cardDay.qtd_vendas,
      "",
      "icoTrend",
      false
    )
  );

  cards.push(
    createCard(
      "Ticket Medio(Hoje)",
      cardDay.ticket_medio,
      "",
      "icoTicket",
      true
    )
  );

  cards.push(
    createCard(
      "Lucro Liquido(Hoje)",
      cardDay.lucro_liquido,
      perc_lucro_liquido.toFixed(2) + " % em relação Total Venda",
      "icoMoney",
      true
    )
  );
  //------------------------------------------------------------------------------------------

  data = {
    cards,
  };

  let date = new Date();
  //console.log(date.toISOString());
  return data;
}

export async function getHistoryChanelOfSales(
  fromDate?: Date,
  toDate?: Date,
  id_loja?: string
): Promise<any[]> {
  //Só pode ser preenchido no final
  if (fromDate && toDate) {
    fromDate?.setUTCHours(0, 0, 0, 0);
    toDate?.setUTCHours(23, 59, 59, 999);
  }

  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  if (!fromDate || !toDate) {
    fromDate = lib.addDays(new Date(), -15);
    if (!toDate) toDate = new Date();
  }
  let startDate = fromDate;
  let endDate = toDate;

  let searchFilter = [];
  let queryObject: any = {};

  if (id_loja) {
    searchFilter.push({
      id_tenant: Number(id_loja),
    });
  }

  searchFilter.push({
    data_movto: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  queryObject["$and"] = searchFilter;
  const rows = await clientdb
    .collection("nota_fiscal")
    .aggregate([
      //first stage
      {
        $match: queryObject,
      },
      //Percorrer itens e agrupar por marca
      // {
      //   $unwind: "$itens",
      // },

      //second stage
      {
        $group: {
          _id: "$nome_ecommerce",

          total: {
            $sum: "$sum_nfe_valor_total",
          },

          lucro_liquido: {
            $sum: "$sum_nfe_lucro_liquido",
          },

          qtd_vendas: {
            $count: {},
          },
        },
      },
      // Third Stage
      {
        $sort: { total: -1 },
      },
    ])
    .toArray();
  await TMongo.mongoDisconnect(client);

  let somatoria = 0;
  rows.forEach((row: any) => {
    somatoria += row.total;
  });
  let media = Number(somatoria / (rows.length ? rows.length : 0)).toFixed(2);

  let data: any = [];
  for (let row of rows) {
    data.push({
      name: row._id,
      media: media,
      qtd_vendas: row.qtd_vendas,
      ticket_medio: Number(row.total) / Number(row.qtd_vendas),
      lucro_liquido: row.lucro_liquido,
      total: row.total.toFixed(2),
    });
  }
  return data;
}
