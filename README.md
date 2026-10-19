# oportobahia-frontend

## Royalties Excel export

The Excel export at `/relatorio/apuracao-royalties` keeps the existing columns
in one `Royalties` worksheet: sales (`tipoVenda = V`, including missing or blank
values) first, then 5 blank rows, then bonuses (`tipoVenda = B`). Records keep
their original order within each group. No separator is added when either group
is empty. No records are discarded; non-B records stay in the sales group.

## Royalties summary

Click **Ver detalhes** at `/relatorio/apuracao-royalties` to open the summary
at `/apuracao-royalties/[id]`. It shows two rows, **Venda** and **Amostra grátis**,
summing `quantFaturada`, `baseCalculoRoyalties`, `valorRoyalties`, and
`copyrightNormal` as stored, without recalculation. Only `tipoVenda = B` is
classified as Amostra grátis; all other records, including missing, null or
blank types, count as Venda. Missing numeric values and absent groups total zero.
Quantities use pt-BR formatting and monetary totals use BRL with two decimals.
An empty apuração is identified explicitly; read errors are not shown as zero totals.

Run the summary checks with Node.js 24+:

```sh
node --test tests/royaltiesSummary.test.mjs
```

Run all checks:

```sh
node --test tests/*.test.mjs
```

Run the export checks:

```sh
node --test tests/royaltiesExcelRows.test.mjs
```