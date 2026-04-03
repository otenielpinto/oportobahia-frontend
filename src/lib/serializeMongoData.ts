import { ObjectId } from "mongodb";

/**
 * Serializa dados do MongoDB para objetos JavaScript simples
 * Converte ObjectId para string e Date para ISO string
 * @param data - Dados do MongoDB a serem serializados
 * @returns Objeto serializado seguro para enviar ao cliente
 */
export function serializeMongoData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Converter ObjectId para string
  if (data instanceof ObjectId) {
    return data.toString();
  }

  // Converter Date para ISO string
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Converter arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializeMongoData(item));
  }

  // Converter objetos
  if (typeof data === "object") {
    const serialized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        serialized[key] = serializeMongoData(data[key]);
      }
    }
    return serialized;
  }

  // Retornar primitivos como estão
  return data;
}
