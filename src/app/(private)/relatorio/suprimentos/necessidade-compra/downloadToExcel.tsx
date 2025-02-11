import { reportToExcel } from "@/lib/reportToExcel";

export function getColumns(data: any) {
  //otenho o titulo das colunas que são dinamicas

  //adiciono as colunas
  let obj: any = {};

  for (let row of data) {
    obj = {
      venda0: row["venda_periodo0x"],
      venda1: row["venda_periodo1x"],
      venda2: row["venda_periodo2x"],
      venda3: row["venda_periodo3x"],
      venda4: row["venda_periodo4x"],
    };
    return obj;
  }
  return obj;
}

export function downloadToExcel(data: any) {
  if (!data) return null;
  let columns: any[] = [
    { label: "Codigo Produto Interno", value: "idproduto" },
    { label: "SKU", value: "referencia" },
    { label: "Nome do Produto", value: "descricao" },
    { label: "Nome da Marca", value: "nome_marca" },
    { label: "Desde", value: "desde", type: "date" },
    { label: "Venda 12", value: "venda12" },
    { label: "Venda 9", value: "venda9" },
    { label: "Venda 3", value: "venda3" },
    { label: "Estoque", value: "estoque" },
    { label: "Comprar", value: "compra" },
    { label: "Direção Tendencia", value: "direcao_tendencia" },
    { label: "Custo Unitário", value: "custo_unitario" },
    { label: "Total Custo Comprar", value: "totalproduto", format: "0.00" },
    { label: "Total Estoque", value: "total_estoque", format: "0.00" },
  ];

  let o: any = getColumns(data);
  //adiciono as colunas
  columns.push({ label: o.venda0, value: `venda_periodo0` });
  columns.push({ label: "Previsao Venda", value: `previsao_venda` });
  columns.push({ label: "Cobertura Estoque", value: `cobertura_estoque` });
  columns.push({ label: o.venda1, value: `venda_periodo1` });
  columns.push({ label: o.venda2, value: `venda_periodo2` });
  columns.push({ label: o.venda3, value: `venda_periodo3` });
  columns.push({ label: o.venda4, value: `venda_periodo4` });

  columns.push({ label: "Variação 1", value: `tendencia1x` });
  columns.push({ label: "Variação 2", value: `tendencia2x` });
  columns.push({ label: "Variação 3", value: `tendencia3x` });

  columns.push({ label: "% Variação 1", value: `tendencia1` });
  columns.push({ label: "% Variação 2", value: `tendencia2` });
  columns.push({ label: "% Variação 3", value: `tendencia3` });

  reportToExcel({
    data: data,
    columns: columns,
    sheetName: "report",
    fileName: "reportNecessidadeCompra",
  });
}
