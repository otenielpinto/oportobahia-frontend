# oportobahia-frontend

## Royalties Excel export

The Excel export at `/relatorio/apuracao-royalties` keeps the existing columns
in one `Royalties` worksheet: sales (`tipoVenda = V`, including missing or blank
values) first, then 5 blank rows, then bonuses (`tipoVenda = B`). Records keep
their original order within each group. No separator is added when either group
is empty. No records are discarded; non-B records stay in the sales group.

Run the export checks with Node.js 24+:

```sh
node --test tests/royaltiesExcelRows.test.mjs
```