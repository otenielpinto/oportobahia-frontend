"use server";
import { TMongo } from "@/infra/mongoClient";

const collection = "nota_fiscal";

interface NotaFiscalResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Action to filter invoices by date range
 * @param fromDate - Start date for filtering
 * @param toDate - End date for filtering
 * @returns Array of invoices filtered by date range
 */
export async function getNotasFiscaisPorPeriodo({
  fromDate,
  toDate,
  page = 1,
  limit = 10,
}: {
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}): Promise<NotaFiscalResponse> {
  // Set default dates if not provided
  if (!fromDate) {
    fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 90); // Default to last 90 days
    fromDate.setUTCHours(0, 0, 0, 0);
  }

  if (!toDate) {
    toDate = new Date();
    toDate.setUTCHours(23, 59, 59, 999);
  }

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Create filter for data_movto field
    const query = {
      data_movto: {
        $gte: fromDate,
        $lte: toDate,
      },
    };

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await clientdb.collection(collection).countDocuments(query);

    // Get paginated results
    const data = await clientdb
      .collection(collection)
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    await TMongo.mongoDisconnect(client);

    return {
      data,
      total,
      page,
      limit,
    };
  } catch (error: any) {
    console.error("Erro ao recuperar notas fiscais:", error);
    throw new Error(
      `Erro ao buscar notas fiscais: ${error?.message || "Erro desconhecido"}`
    );
  }
}
