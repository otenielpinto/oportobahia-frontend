type RoyaltiesValues = {
  quantFaturada?: number | null;
  baseCalculoRoyalties?: number | null;
  valorRoyalties?: number | null;
  copyrightNormal?: number | null;
};

export function royaltiesSummary(
  records: readonly (RoyaltiesValues & { tipoVenda?: string | null })[],
) {
  const groups = (["V", "B"] as const).map((tipoVenda) => ({
    tipoVenda,
    quantFaturada: 0,
    baseCalculoRoyalties: 0,
    valorRoyalties: 0,
    copyrightNormal: 0,
  }));

  for (const record of records) {
    const group = groups[record.tipoVenda === "B" ? 1 : 0];
    group.quantFaturada += record.quantFaturada ?? 0;
    group.baseCalculoRoyalties += record.baseCalculoRoyalties ?? 0;
    group.valorRoyalties += record.valorRoyalties ?? 0;
    group.copyrightNormal += record.copyrightNormal ?? 0;
  }

  return groups;
}
