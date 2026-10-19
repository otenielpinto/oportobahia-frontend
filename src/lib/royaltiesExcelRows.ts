export function royaltiesExcelRows<T extends { tipoVenda?: string | null }>(
  records: T[],
): (T | Record<string, never>)[] {
  const vendas: T[] = [];
  const bonificacoes: T[] = [];

  for (const record of records) {
    (record.tipoVenda === "B" ? bonificacoes : vendas).push(record);
  }

  return [
    ...vendas,
    ...(vendas.length && bonificacoes.length
      ? Array.from({ length: 5 }, () => ({}))
      : []),
    ...bonificacoes,
  ];
}
