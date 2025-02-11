import { only } from "node:test";
import { type } from "os";

function setUTCHoursStart(date?: Date): Date {
  if (!date) date = new Date();
  let lDate = new Date(date);
  lDate.setUTCHours(3, 0, 0, 0);
  return lDate;
}

function setUTCHoursEnd(date?: Date): Date {
  if (!date) date = new Date();
  let lDate = new Date(date);
  lDate.setUTCHours(23, 59, 59, 998);
  return lDate;
}

function dateUSAToIso8601(date: any): Date {
  //vem uma data formatada no padrao yyyy-mm-dd  '2024-01-12'
  const partes = date.split("-");
  const ano = parseInt(partes[0]);
  const mes = parseInt(partes[1]) - 1; // Os meses em JavaScript começam do zero (0 = janeiro, 1 = fevereiro, ...)
  const dia = parseInt(partes[2]);
  return new Date(ano, mes, dia); //pega o utc automaticamente  2024-08-12T03:00:00.000Z
}

function dateBrToIso8601(dataString: any): Date {
  //format dd/mm/yyyy
  const partes = dataString.split("/");
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1; // Os meses em JavaScript comecam do zero (0 = janeiro, 1 = fevereiro, ...)
  const ano = parseInt(partes[2], 10);
  return new Date(ano, mes, dia); //pega o utc automaticamente  2024-08-12T03:00:00.000Z
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function obter_percentual(valor_venda: number, valor_nominal: number) {
  let result = 0;
  if (valor_nominal != 0 && valor_venda != 0) {
    result = round((valor_nominal / valor_venda) * 100);
  }
  return result;
}
function formatCurrencyBr(value: number) {
  if (!value) value = 0;
  const options = {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  let nf = new Intl.NumberFormat("pt-BR", options);
  return nf.format(value);
}

function formatNumberBr(value: number) {
  if (!value) value = 0;
  const options = {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  let nf = new Intl.NumberFormat("pt-BR", options);
  return nf.format(value);
}

function calcularMedia(value: number, qtd: number) {
  if (value == 0 || qtd == 0) return 0;
  return value / qtd;
}

function obterQuery(body: any) {
  let query = {};

  //Tive que fazer isso para pegar a data com hora 00:00:00
  let startDate = lib.dateUSAToIso8601(body?.startDate);
  let endDate = lib.dateUSAToIso8601(body?.endDate);
  startDate = lib.setUTCHoursStart(startDate);
  endDate = lib.setUTCHoursEnd(endDate);

  let nome_vendedor = body?.nome_vendedor ? body?.nome_vendedor : "";
  let id_loja = Number(body?.id_loja ? body?.id_loja : 0);
  let id_produto = body?.id_produto;
  let nome = body?.nome;
  let uf = body?.uf ? body?.uf.toUpperCase() : "";
  let marca = body?.marca;
  let natOperacao = body?.natOperacao;
  let categoria = body?.categoria;
  let nota_fiscal = body?.nota_fiscal;
  let nome_ecommerce = body?.nome_ecommerce;
  let order_by = body?.order_by;
  query = {
    startDate,
    endDate,
    nome_vendedor,
    id_loja,
    id_produto,
    nome,
    uf,
    marca,
    natOperacao,
    categoria,
    nota_fiscal,
    nome_ecommerce,
    order_by,
  };

  return query;
}

function addDays(date: Date, days: number) {
  date.setDate(date.getDate() + days);
  return date;
}

function firstDayMonth(date: Date): Date {
  let response = new Date(date.getFullYear(), date.getMonth(), 1);
  return response;
}

function lastDayMonth(date: Date): Date {
  let response = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return response;
}

function calcularTaxaCrescimento(
  valorAtual: number,
  valorAnterior: number
): number {
  let result = 0;
  if (valorAnterior != 0 && valorAtual != 0) {
    result = round(((valorAtual - valorAnterior) / valorAnterior) * 100);
  }
  return result;
}

function sort(data: any, field: string) {
  switch (field) {
    case "% Lucro Liquido":
      data.sort(
        (a: any, b: any) =>
          a.itens[0].nfe_perc_lucro_liquido - b.itens[0].nfe_perc_lucro_liquido
      );
      break;
    case "Lucro Liquido":
      data.sort(
        (a: any, b: any) =>
          a.itens[0].nfe_lucro_liquido - b.itens[0].nfe_lucro_liquido
      );
      break;

    case "$ Custo":
      data.sort(
        (a: any, b: any) =>
          a.itens[0].nfe_total_preco_custo - b.itens[0].nfe_total_preco_custo
      );
      break;
  }
  return data;
}

export const lib = {
  getBaseUrl: () =>
    (process.env.NEXTAUTH_URL || "http://localhost:3000") as string,
  obter_percentual,
  round,

  firstDayMonth,
  lastDayMonth,
  addDays,

  dateBrToIso8601,
  dateUSAToIso8601,
  setUTCHoursStart,
  setUTCHoursEnd,

  formatCurrencyBr,
  formatNumberBr,
  calcularMedia,
  obterQuery,
  calcularTaxaCrescimento,
  sort,
};
