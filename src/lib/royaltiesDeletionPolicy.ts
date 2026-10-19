/** Retorna o motivo do bloqueio, ou null quando a idade permite excluir. */
export function royaltiesDeletionError(
  createdAt: unknown,
  now = Date.now(),
): string | null {
  const timestamp = createdAt instanceof Date
    ? createdAt.getTime()
    : typeof createdAt === "string" ? Date.parse(createdAt) : NaN;

  if (!Number.isFinite(timestamp)) {
    return "Não é possível excluir apuração com data de criação ausente ou inválida";
  }

  return now - timestamp > 60 * 24 * 60 * 60 * 1000
    ? "Não é possível excluir apuração criada há mais de 60 dias"
    : null;
}
