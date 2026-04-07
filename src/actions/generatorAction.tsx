"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/actions/sessionAction";
import { WithId } from "mongodb";

/**
 * @name gen_id
 * @description Generates unique sequential numbers for collections.
 *
 * @param {string} collectionName - The name of the collection to generate a sequence for.
 *
 * @example
 * ```typescript
 * const nextNumber = await gen_id('mdfe');
 * // Returns the next sequential number for the MDFe collection
 * ```
 *
 * @returns {Promise<{ success: boolean; message: string; data: number | null; error?: string }>}
 *  A promise that resolves to an object with the following properties:
 *   - success: boolean - Indicates whether the operation was successful.
 *   - message: string - A message describing the result of the operation.
 *   - data: number | null - The next available sequence number for the collection, or null if an error occurred.
 *   - error: string | undefined - An error message if the operation was not successful.
 */

export async function gen_id(collectionName: string): Promise<{
  success: boolean;
  message: string;
  data: number | null;
  error?: string;
}> {
  let user = await getUser();
  let sequenceDocument: WithId<{ value: number }> | null = null;

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    const filter = {
      table_name: collectionName,
      id_tenant: user?.id_tenant,
      id_empresa: user?.id_empresa,
    };

    const result = await clientdb
      .collection("tmp_generator")
      .findOneAndUpdate(
        filter,
        { $inc: { value: 1 } },
        { upsert: true, returnDocument: "after" },
      );

    // Type assertion: result is ModifyResult<Document> with value being WithId<Document> | null
    // WithId<Document> has a value property that contains the actual value
    sequenceDocument = result?.value as WithId<{ value: number }> | null;

    if (!sequenceDocument) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Falha ao gerar sequência",
        data: null,
        error: "Não foi possível obter o documento de sequência",
      };
    }

    // Extract the value from WithId<Document>
    const generatedValue = sequenceDocument.value as number;

    // Guard: on first upsert the driver may return an inconsistent value — retry once
    if (typeof generatedValue !== "number" || isNaN(generatedValue)) {
      const retryResult = await clientdb
        .collection("tmp_generator")
        .findOneAndUpdate(
          filter,
          { $inc: { value: 1 } },
          { upsert: true, returnDocument: "after" },
        );
      const retryValue = (
        retryResult?.value as WithId<{ value: number }> | null
      )?.value as number;
      const finalValue = retryValue ?? 1;

      await TMongo.mongoDisconnect(client);

      return {
        success: true,
        message: "Sequência gerada com sucesso (após retry)",
        data: finalValue,
      };
    }

    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Sequência gerada com sucesso",
      data: generatedValue,
    };
  } catch (error) {
    console.error("Erro ao gerar sequência:", error);
    return {
      success: false,
      message: "Erro ao gerar sequência",
      error: error instanceof Error ? error.message : "Erro desconhecido",
      data: null,
    };
  }
}
