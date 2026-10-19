import assert from "node:assert/strict";
import { test } from "node:test";
import xlsx from "json-as-xlsx";
import { read, utils } from "xlsx";
import { royaltiesExcelRows } from "../src/lib/royaltiesExcelRows.ts";

test("exports sales, five blank rows, then bonuses in one worksheet", () => {
  const records = [
    { numeroNota: "B1", tipoVenda: "B", valorRoyalties: 0 },
    { numeroNota: "V1", tipoVenda: "V", valorRoyalties: 12.5 },
    { numeroNota: "V2" },
    { numeroNota: "B2", tipoVenda: "B", valorRoyalties: 5 },
    { numeroNota: "V3", tipoVenda: "" },
    { numeroNota: "V4", tipoVenda: null },
    { numeroNota: "V5", tipoVenda: "   " },
  ];
  const original = structuredClone(records);
  const content = royaltiesExcelRows(records);
  assert.deepEqual(content.slice(0, 5).map((row) => row.numeroNota), ["V1", "V2", "V3", "V4", "V5"]);
  assert.deepEqual(content.slice(5, 10), Array.from({ length: 5 }, () => ({})));
  assert.deepEqual(content.slice(10).map((row) => row.numeroNota), ["B1", "B2"]);
  assert.deepEqual(records, original);

  const buffer = xlsx([{
    sheet: "Royalties",
    columns: [
      { label: "Número Nota", value: "numeroNota" },
      { label: "Valor de Royalties", value: "valorRoyalties" },
    ],
    content,
  }], { writeMode: "write", writeOptions: { type: "buffer", bookType: "xlsx" } });
  const workbook = read(buffer, { type: "buffer" });
  assert.deepEqual(workbook.SheetNames, ["Royalties"]);
  const rows = utils.sheet_to_json(workbook.Sheets.Royalties, { header: 1, blankrows: true, defval: "" });
  assert.deepEqual(rows[0], ["Número Nota", "Valor de Royalties"]);
  assert.deepEqual(rows[1], ["V1", 12.5]);
  assert.deepEqual(rows.slice(6, 11), Array.from({ length: 5 }, () => ["", ""]));
  assert.deepEqual(rows[11], ["B1", 0]);
  assert.deepEqual(rows[12], ["B2", 5]);
  assert.equal(rows.length, 13);
});

test("keeps single-group and empty exports free of separator rows", () => {
  for (const records of [[], [{ numeroNota: "V", tipoVenda: "V" }], [{ numeroNota: "B", tipoVenda: "B" }], [{ numeroNota: "legacy" }]]) {
    assert.deepEqual(royaltiesExcelRows(records), records);
  }
});
