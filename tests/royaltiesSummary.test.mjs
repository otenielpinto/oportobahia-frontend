import assert from "node:assert/strict";
import { test } from "node:test";
import { royaltiesSummary } from "../src/lib/royaltiesSummary.ts";

const totals = (quantFaturada = 0, baseCalculoRoyalties = 0, valorRoyalties = 0, copyrightNormal = 0) =>
  ({ quantFaturada, baseCalculoRoyalties, valorRoyalties, copyrightNormal });

test("sums all four stored values by V/B without recalculation or mutation", () => {
  const records = [
    { tipoVenda: "B", ...totals(2, 40.5, 5.25, 1.5) },
    { tipoVenda: "V", ...totals(1000, 100.25, 10.5, 2.25) },
    { tipoVenda: "V", ...totals(-1, -10, -1, -0.25) },
    { tipoVenda: "B", ...totals(3, 20, 2, 0.5) },
  ];
  const original = structuredClone(records);
  assert.deepEqual(royaltiesSummary(records), [
    { tipoVenda: "V", ...totals(999, 90.25, 9.5, 2) },
    { tipoVenda: "B", ...totals(5, 60.5, 7.25, 2) },
  ]);
  assert.deepEqual(records, original);
});

test("keeps every non-B record as a sale, including missing, null and blank types", () => {
  const records = [undefined, null, "", "   ", "X", "b"].map((tipoVenda) =>
    ({ tipoVenda, ...totals(2, 4, 6, 8) }));
  records.push({ ...totals(1, 2, 3, 4) });
  const original = structuredClone(records);
  assert.deepEqual(royaltiesSummary(records), [
    { tipoVenda: "V", ...totals(13, 26, 39, 52) },
    { tipoVenda: "B", ...totals() },
  ]);
  assert.deepEqual(records, original);
});

test("missing or null numeric fields contribute zero", () => {
  assert.deepEqual(royaltiesSummary([
    {}, { tipoVenda: "B" },
    { quantFaturada: null, baseCalculoRoyalties: null, valorRoyalties: null, copyrightNormal: null },
  ]), [{ tipoVenda: "V", ...totals() }, { tipoVenda: "B", ...totals() }]);
});

test("always returns both groups in order for empty and single-group input", () => {
  assert.deepEqual(royaltiesSummary([]), [
    { tipoVenda: "V", ...totals() }, { tipoVenda: "B", ...totals() },
  ]);
  for (const tipoVenda of ["V", "B"]) {
    const records = [{ tipoVenda, ...totals(1, 2, 3, 4) }];
    const original = structuredClone(records);
    assert.deepEqual(royaltiesSummary(records), ["V", "B"].map((type) =>
      ({ tipoVenda: type, ...(type === tipoVenda ? totals(1, 2, 3, 4) : totals()) })));
    assert.deepEqual(records, original);
  }
});
