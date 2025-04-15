"use server";

import { TMongo } from "@/infra/mongoClient";
import { getNotasFiscaisPorPeriodo } from "./actNotaFiscal";
import { getTaxaCopyright } from "./actTaxaCopyright";
import { v4 as uuidv4 } from "uuid";
import { lib } from "@/lib/lib";

// Collections utilizadas
const collectionPeriodo = "tmp_apuracao_periodo";
const collectionCurrent = "tmp_apuracao_current";

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
    // Gerar código identificador único (UUID)
    const codigo_identificador = uuidv4();

    // Buscar notas fiscais do período
    const resultAction = await getNotasFiscaisPorPeriodo({
      fromDate,
      toDate,
      page: 1,
      limit: 5000, // Valor alto para trazer todos os registros
    });

    // Verificar se há dados retornados
    if (!resultAction) {
      throw new Error("Nenhuma nota fiscal encontrada no período");
    }

    const result = resultAction;
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Salvar dados na collection tmp_apuracao_current
    await clientdb.collection(collectionCurrent).insertOne({
      codigo_identificador,
      data_inicial: fromDate,
      data_final: toDate,
      data_apuracao: new Date(),
      status: "aberto", // Status padrão: aberto (pode ser excluído)
    });

    // Obter a taxa de copyright
    const { tx_copyright } = await getTaxaCopyright();

    // Processar e salvar itens das notas fiscais na collection tmp_apuracao_periodo
    const itensParaInserir = [];

    for (const notaFiscal of result.data) {
      if (notaFiscal.itens && Array.isArray(notaFiscal.itens)) {
        for (const item of notaFiscal.itens) {
          try {
            let barcode = item.prod.cEAN;
            let catalogo = await clientdb
              .collection("tmp_catalog")
              .findOne({ barcode });

            //Obrigatório estar no catalogo
            if (!catalogo) {
              continue;
            }

            // Extrair informações relevantes do item
            let row = {
              codigo_identificador,
              data_movto: notaFiscal.data_movto,
              numero_nota: notaFiscal.numero,
              produto: item.prod.cProd,
              barcode: item.prod.cEAN,
              descricao: item.prod.xProd,
              quantidade: parseFloat(item.prod.qCom),
              valor_unitario: parseFloat(item.prod.vUnCom),
              valor_total: parseFloat(item.prod.vProd),
              valor_desconto: parseFloat(item.prod.vDesc || 0),
              valor_liquido: lib.round(
                parseFloat(item.prod.vProd) - parseFloat(item.prod.vDesc || 0)
              ),
              tx_copyright,
              catalogo: catalogo, // Pode ser null se não estiver no catálogo
            };
            const itemProcessado = await processarApuracao({ item: row });

            // Adicionar ao array de itens para inserir (mesmo que não esteja no catálogo)
            itensParaInserir.push(itemProcessado);
          } catch (error) {
            console.error(
              `Erro ao processar o produto ${item.prod.cEAN}:`,
              error
            );
          }
        }
      }
    }

    // Inserir itens processados na collection
    if (itensParaInserir.length > 0) {
      await clientdb.collection(collectionPeriodo).insertMany(itensParaInserir);
    }

    await TMongo.mongoDisconnect(client);

    return {
      codigo_identificador,
      total_itens: itensParaInserir.length,
      data_inicial: fromDate,
      data_final: toDate,
    };
  } catch (error) {
    console.error("Erro ao iniciar apuração:", error);
    throw error;
  }
}

/**
 * Processa a apuração de royalties e atualiza a collection tmp_apuracao_periodo
 * @param item  - Item a ser processado
 * @returns Informações sobre a apuração processada
 */
export async function processarApuracao({ item }: { item: any }) {
  try {
    // Verificar se o item tem catálogo ou não
    if (item.catalogo) {
      // Extrair informações do catálogo
      const percentual = item.catalogo.baseCalculationPercentage || 0;
      const numberOfTracks = item.catalogo.numberOfTracks || 1;

      // Adicionar campos na raiz do item
      item.baseCalculo = lib.round((item.valor_liquido * percentual) / 100);
      item.valorRoyalties = lib.round(
        (item.baseCalculo * item.tx_copyright) / 100
      );
      item.valorRoyaltiesPorFaixa = lib.round(
        item.valorRoyalties / numberOfTracks
      );

      // Processar publishers se existirem
      if (item.catalogo.tracks && Array.isArray(item.catalogo.tracks)) {
        for (const track of item.catalogo.tracks) {
          if (track.publishers && Array.isArray(track.publishers)) {
            for (const publisher of track.publishers) {
              // Adicionar campos diretamente no publisher
              publisher.valor_royalties = lib.round(
                (item.valorRoyaltiesPorFaixa *
                  publisher.participationPercentage) /
                  100
              );
            }
          }

          // Processar subTracks se existirem
          if (track.subTracks && Array.isArray(track.subTracks)) {
            for (const subTrack of track.subTracks) {
              if (subTrack.publishers && Array.isArray(subTrack.publishers)) {
                for (const publisher of subTrack.publishers) {
                  // Adicionar campos diretamente no publisher do subTrack
                  publisher.valor_royalties = lib.round(
                    (item.valorRoyaltiesPorFaixa *
                      publisher.participationPercentage) /
                      100
                  );
                }
              }
            }
          }
        }
      }
    } else {
      // Produto não está no catálogo, mas ainda assim deve ser processado
      // Adicionar campos na raiz do item com valores zerados
      item.baseCalculo = 0;
      item.valorRoyalties = 0;
      item.valorRoyaltiesPorFaixa = 0;
    }

    // Retornar informações sobre a apuração processada
    return item;
  } catch (error) {
    console.error("Erro ao processar apuração:", error);
    throw error;
  }
}

/**
 * Obtém os resultados de uma apuração processada
 * @param codigo_identificador - Código identificador da apuração
 * @returns Dados da apuração diretamente da collection
 */
export async function obterResultadosApuracao({
  codigo_identificador,
}: {
  codigo_identificador: string;
}) {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Buscar todos os itens da apuração já processados
    const itensApuracao = await clientdb
      .collection(collectionPeriodo)
      .find({ codigo_identificador })
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
        codigo_identificador: apuracao.codigo_identificador,
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
 * @param codigo_identificador - Código identificador da apuração a ser excluída
 * @returns Informações sobre a exclusão
 */
/**
 * Fecha uma apuração alterando seu status para "fechado"
 * @param codigo_identificador - Código identificador da apuração a ser fechada
 * @returns Informações sobre o fechamento
 */
export async function fecharApuracao({
  codigo_identificador,
}: {
  codigo_identificador: string;
}) {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Verificar se a apuração existe antes de fechar
    const apuracao = await clientdb
      .collection(collectionCurrent)
      .findOne({ codigo_identificador });

    if (!apuracao) {
      throw new Error(
        `Apuração com código ${codigo_identificador} não encontrada`
      );
    }

    // Verificar se a apuração já está fechada
    if (apuracao.status === "fechado") {
      throw new Error(
        `Apuração com código ${codigo_identificador} já está fechada`
      );
    }

    // Atualizar o status da apuração para "fechado"
    await clientdb
      .collection(collectionCurrent)
      .updateOne(
        { codigo_identificador },
        { $set: { status: "fechado", data_fechamento: new Date() } }
      );

    await TMongo.mongoDisconnect(client);

    // Retornar informações sobre o fechamento
    return {
      sucesso: true,
      codigo_identificador,
      mensagem: `Apuração fechada com sucesso.`,
      data_apuracao: apuracao.data_apuracao,
      data_fechamento: new Date(),
    };
  } catch (error) {
    console.error("Erro ao fechar apuração:", error);
    throw error;
  }
}

export async function excluirApuracao({
  codigo_identificador,
}: {
  codigo_identificador: string;
}) {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Verificar se a apuração existe antes de excluir
    const apuracao = await clientdb
      .collection(collectionCurrent)
      .findOne({ codigo_identificador });

    if (!apuracao) {
      throw new Error(
        `Apuração com código ${codigo_identificador} não encontrada`
      );
    }

    // Verificar se a apuração está fechada
    if (apuracao.status === "fechado") {
      throw new Error(
        `Não é possível excluir a apuração com código ${codigo_identificador} pois ela está fechada`
      );
    }

    // Excluir a apuração da collection tmp_apuracao_current
    await clientdb
      .collection(collectionCurrent)
      .deleteOne({ codigo_identificador });

    // Excluir os itens relacionados da collection tmp_apuracao_periodo
    const resultadoExclusaoItens = await clientdb
      .collection(collectionPeriodo)
      .deleteMany({ codigo_identificador });

    await TMongo.mongoDisconnect(client);

    // Retornar informações sobre a exclusão
    return {
      sucesso: true,
      codigo_identificador,
      mensagem: `Apuração excluída com sucesso. ${resultadoExclusaoItens.deletedCount} itens relacionados foram excluídos.`,
      data_apuracao: apuracao.data_apuracao,
      itens_excluidos: resultadoExclusaoItens.deletedCount,
    };
  } catch (error) {
    console.error("Erro ao excluir apuração:", error);
    throw error;
  }
}
