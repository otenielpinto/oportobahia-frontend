"use server";

import { TMongo } from "@/infra/mongoClient";
import { v4 as uuidv4 } from "uuid";
import { lib } from "@/lib/lib";

// Collections utilizadas
const collectionPeriodo = "tmp_apuracao_periodo";
const collectionCurrent = "tmp_apuracao_current";
const status_aguardando = "aguardando";

// Sem interfaces de tipagem específicas - usando tipagem dinâmica

/**
 * Inicia o processo de apuração de royalties
 * @param fromDate - Data inicial do período
 * @param toDate - Data final do período
 * @returns Código identificador da apuração
 */
export async function iniciarApuracao({
  fromDate,
  toDate,
}: {
  fromDate: Date;
  toDate: Date;
}) {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    let id = uuidv4();

    // Salvar dados na collection tmp_apuracao_current
    await clientdb.collection(collectionCurrent).insertOne({
      id,
      data_inicial: fromDate,
      data_final: toDate,
      data_apuracao: new Date(),
      status: status_aguardando,
    });
    await TMongo.mongoDisconnect(client);

    return {
      id,
      data_inicial: fromDate,
      data_final: toDate,
      status: status_aguardando,
    };
  } catch (error) {
    console.error("Erro ao iniciar apuração:", error);
    throw error;
  }
}

/**
 * Obtém os resultados de uma apuração processada
 * @param id - Código da apuração
 * @returns Dados da apuração diretamente da collection
 */
export async function obterResultadosApuracao({
  id_grupo,
}: {
  id_grupo: string;
}) {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Buscar todos os itens da apuração já processados
    const itensApuracao = await clientdb
      .collection(collectionPeriodo)
      .find({ id_grupo })
      .toArray();

    await TMongo.mongoDisconnect(client);

    // Retornar os dados da apuração
    return itensApuracao;
  } catch (error) {
    console.error("Erro ao obter resultados da apuração:", error);
    throw error;
  }
}

/**
 * Consulta as apurações realizadas em um período
 * @param fromDate - Data inicial do período
 * @param toDate - Data final do período
 * @returns Lista de apurações realizadas no período
 */
export async function consultarApuracoesPorPeriodo({
  fromDate,
  toDate,
}: {
  fromDate: Date;
  toDate: Date;
}) {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Ajustar horas para garantir que o dia inteiro seja considerado
    const dataInicial = new Date(fromDate);
    dataInicial.setUTCHours(0, 0, 0, 0);

    const dataFinal = new Date(toDate);
    dataFinal.setUTCHours(23, 59, 59, 999);

    // Buscar apurações no período
    const apuracoes = await clientdb
      .collection(collectionCurrent)
      .find({
        data_apuracao: {
          $gte: dataInicial,
          $lte: dataFinal,
        },
      })
      .sort({ data_apuracao: -1 }) // Ordenar pela data de apuração (mais recente primeiro)
      .toArray();

    await TMongo.mongoDisconnect(client);

    // Retornar as apurações encontradas
    return {
      total: apuracoes.length,
      apuracoes: apuracoes.map((apuracao) => ({
        id: apuracao.id,
        data_inicial: apuracao.data_inicial,
        data_final: apuracao.data_final,
        data_apuracao: apuracao.data_apuracao,
        status: apuracao.status || "aberto", // Valor padrão para registros antigos
        data_fechamento: apuracao.data_fechamento,
      })),
    };
  } catch (error) {
    console.error("Erro ao consultar apurações por período:", error);
    throw error;
  }
}

/**
 * Exclui uma apuração e seus itens relacionados
 * @param id - Código identificador da apuração a ser excluída
 * @returns Informações sobre a exclusão
 */
/**
 * Fecha uma apuração alterando seu status para "fechado"
 * @param id - Código  da apuração a ser fechada
 * @returns Informações sobre o fechamento
 */
export async function fecharApuracao({ id }: { id: string }) {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Verificar se a apuração existe antes de fechar
    const apuracao = await clientdb
      .collection(collectionCurrent)
      .findOne({ id });

    if (!apuracao) {
      throw new Error(`Apuração com código ${id} não encontrada`);
    }

    // Verificar se a apuração já está fechada
    if (apuracao.status === "fechado") {
      throw new Error(`Apuração com código ${id} já está fechada`);
    }

    // Atualizar o status da apuração para "fechado"
    await clientdb
      .collection(collectionCurrent)
      .updateOne(
        { id },
        { $set: { status: "fechado", data_fechamento: new Date() } }
      );

    await TMongo.mongoDisconnect(client);

    // Retornar informações sobre o fechamento
    return {
      sucesso: true,
      id,
      mensagem: `Apuração fechada com sucesso.`,
      data_apuracao: apuracao.data_apuracao,
      data_fechamento: new Date(),
    };
  } catch (error) {
    console.error("Erro ao fechar apuração:", error);
    throw error;
  }
}

export async function excluirApuracao({ id }: { id: string }) {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Verificar se a apuração existe antes de excluir
    const apuracao = await clientdb
      .collection(collectionCurrent)
      .findOne({ id });

    if (!apuracao) {
      throw new Error(`Apuração com código ${id} não encontrada`);
    }

    // Verificar se a apuração está em um estado que permite exclusão
    if (apuracao.status !== "aberto" && apuracao.status !== "aguardando") {
      throw new Error(
        `Não é possível excluir a apuração com código ${id} pois ela está ${apuracao.status}`
      );
    }

    // Excluir a apuração da collection tmp_apuracao_current
    await clientdb.collection(collectionCurrent).deleteOne({ id });

    // Excluir os itens relacionados da collection tmp_apuracao_periodo
    const resultadoExclusaoItens = await clientdb
      .collection(collectionPeriodo)
      .deleteMany({ id_grupo: id });

    await TMongo.mongoDisconnect(client);

    // Retornar informações sobre a exclusão
    return {
      sucesso: true,
      id,
      mensagem: `Apuração excluída com sucesso. ${resultadoExclusaoItens.deletedCount} itens relacionados foram excluídos.`,
      data_apuracao: apuracao.data_apuracao,
      itens_excluidos: resultadoExclusaoItens.deletedCount,
    };
  } catch (error) {
    console.error("Erro ao excluir apuração:", error);
    throw error;
  }
}
