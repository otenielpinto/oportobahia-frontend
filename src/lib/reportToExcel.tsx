import xlsx, { IJsonSheet } from "json-as-xlsx";

function aleatorio() {
  return Math.random().toString(36).substr(2, 9);
}

interface IExcelProps {
  data: any;
  columns: any[];
  sheetName?: any;
  fileName?: any;
}

export function reportToExcel(props: IExcelProps) {
  let data: any = props.data;
  let columns: any = props.columns;
  let sheetName: any = props.sheetName;
  let fileName: any = props.fileName;

  if (!sheetName) sheetName = "report-" + aleatorio();
  if (!fileName) fileName = "report-" + aleatorio();

  let jsonSheet: IJsonSheet[] = [
    {
      sheet: sheetName,
      columns: columns,
      content: data,
    },
  ];

  let settings = {
    fileName: fileName,
  };

  xlsx(jsonSheet, settings);
}

/*
https://www.npmjs.com/package/json-as-xlsx
columns  [   { label: "Preço de Custo", value: "custo_unitario", format: "0.00" }]
( Formata de data pela row )
Consulte para formatar as colunas   https://youtu.be/Jgr8JjYOJsU?si=4UKbms6QQYCk5gXC 

let as propriedades  do objeto
    for (const [key, value] of Object.entries(row)) {
      if (key == "ultatualizacao") continue; 


*/
