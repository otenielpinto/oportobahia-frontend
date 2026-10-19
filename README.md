# oportobahia-frontend

## Royalties Excel export

The Excel export at `/relatorio/apuracao-royalties` keeps the existing columns
in one `Royalties` worksheet: sales (`tipoVenda = V`, including missing or blank
values) first, then 5 blank rows, then bonuses (`tipoVenda = B`). Records keep
their original order within each group. No separator is added when either group
is empty. No records are discarded; non-B records stay in the sales group.

## Exclusão de apurações de royalties

A exclusão é bloqueada quando passaram **mais de 60 dias de 24 horas** desde
`createdAt`, considerando também o horário. Exatamente 60 dias ainda permite
excluir. O período do relatório e `updatedAt` não influenciam essa regra.
Datas de criação ausentes ou inválidas bloqueiam a exclusão com mensagem em
português. O ícone de lixeira fica desabilitado e seu título explica o motivo;
apurações em processamento continuam bloqueadas. O servidor confere a regra
antes de excluir os movimentos ou o cabeçalho, mesmo em chamadas diretas.

Testes isolados, sem acesso ao MongoDB (Node.js 24+):

```sh
node --test tests/royaltiesDeletionPolicy.test.mjs tests/royaltiesDeletionAction.test.mjs
```

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