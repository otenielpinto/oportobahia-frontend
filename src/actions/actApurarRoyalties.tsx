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

/**
 * Exclui uma apuração e seus itens relacionados
 * @param id - Código identificador da apuração a ser excluída
 * @returns Informações sobre a exclusão
 */
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

/**
 * Consulta um registro da collection tmp_apuracao_current por id
 * @param id - ID do registro a ser consultado
 * @returns O registro encontrado ou null se não existir
 */
export async function consultarApuracaoCurrentById(id: string) {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Buscar o registro pelo campo id (não pelo id_grupo)
    const apuracao = await clientdb
      .collection("tmp_apuracao_current")
      .findOne({ id: id });

    await TMongo.mongoDisconnect(client);

    return apuracao;
  } catch (error) {
    console.error("Erro ao buscar apuração por id:", error);
    throw error;
  }
}

/**
 * Agrupa os registros de apuração por produto e editora
 * @param id_grupo - Código identificador do grupo de apuração
 * @returns Array com os dados agrupados por produto e editora
 */
export async function agruparApuracoesPorProdutoEditora({
  id_grupo,
}: {
  id_grupo: string;
}) {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Buscar todas as editoras e criar um mapa para acesso rápido
    const editoras = await clientdb.collection("editora").find({}).toArray();
    const editorasMap = new Map();

    // Criar um mapa de editoras para acesso rápido por nome
    editoras.forEach((editora) => {
      editorasMap.set(editora.name, editora);
    });

    // Buscar todos os itens da apuração
    const itensApuracao = await clientdb
      .collection(collectionPeriodo)
      .find({ id_grupo })
      .toArray();

    // Criar um mapa para agrupar os itens
    const gruposMap = new Map();

    // Processar cada item da apuração
    for (const item of itensApuracao) {
      // Verificar se o item tem catálogo e tracks
      if (
        !item.catalogo ||
        !item.catalogo.tracks ||
        item.catalogo.tracks.length === 0
      ) {
        continue; // Pular itens sem catálogo ou tracks
      }

      // Obter os dados necessários
      const barcode = item.catalogo.barcode || "";
      const format = item.catalogo.format || "";

      // Não vamos mais controlar as editoras processadas
      // Vamos somar normalmente a quantidade para cada grupo

      // Processar cada track e seus publishers
      for (const track of item.catalogo.tracks) {
        // Processar publishers da track principal
        if (track.publishers && track.publishers.length > 0) {
          for (const publisher of track.publishers) {
            const publisherName = publisher.name || "Editora Desconhecida";
            const participationPercentage =
              publisher.participationPercentage || 0;
            const valorRoyalties = publisher.valor_royalties || 0;

            // Obter o nome da obra e o código da faixa
            const trackName = track.work || "";
            // Converter trackCode para número inteiro, ou usar 0 se não for possível converter
            const trackCode = parseInt(track.trackCode || "0", 10) || 0;

            // Criar uma chave única para o agrupamento
            const chave = `${barcode}|${format}|${publisherName}|${trackName}|${trackCode}`;

            // Obter os dados completos da editora do mapa
            const editoraCompleta = editorasMap.get(publisherName) || null;

            // Verificar se já existe um grupo para esta chave
            if (!gruposMap.has(chave)) {
              gruposMap.set(chave, {
                codigoProduto: barcode,
                formato: format,
                editora: publisherName,
                editoraCompleta: editoraCompleta, // Adicionar os dados completos da editora
                obra: trackName,
                codigoFaixa: trackCode,
                percentualEditora: participationPercentage,
                vendas: 0,
                somaPrecos: 0, // Soma dos valores totais (baseCalculo) para cálculo do preço médio
                percentualObra:
                  item.tx_copyright && item.catalogo.numberOfTracks > 0
                    ? item.tx_copyright / item.catalogo.numberOfTracks
                    : 0,
                valorPagamento: 0,
                // Novos campos adicionados
                NL: 1, // Número de lados (padrão: 1)
                LD: 1, // Lado (padrão: 1)
                NF: item.catalogo.numberOfTracks || 0, // Número de faixas
                FX: trackCode, // Número da faixa
                Mus:
                  track.subTracks && track.subTracks.length > 0
                    ? track.subTracks.length
                    : 1, // 1 se não tiver subTracks, ou o número de subTracks
                authors: track.authors || "", // Autores da música
                isrc: track.isrc || "", // Código ISRC da faixa
              });
            }

            // Atualizar os valores do grupo
            const grupo = gruposMap.get(chave);

            // Somar vendas normalmente para cada grupo
            grupo.vendas += item.quantidade || 0;
            grupo.somaPrecos += item.baseCalculo;

            // Atualizar o valor de pagamento
            grupo.valorPagamento += valorRoyalties;
          }
        }

        // Processar subTracks se existirem
        if (track.subTracks && track.subTracks.length > 0) {
          for (const subTrack of track.subTracks) {
            if (subTrack.publishers && subTrack.publishers.length > 0) {
              for (const publisher of subTrack.publishers) {
                const publisherName = publisher.name || "Editora Desconhecida";
                const participationPercentage =
                  publisher.participationPercentage || 0;

                // Calcular o valor de royalties para a subTrack com base na porcentagem de participação
                const valorRoyaltiesPorFaixa = item.valorRoyaltiesPorFaixa || 0;
                const valorRoyalties =
                  (valorRoyaltiesPorFaixa * participationPercentage) / 100;

                // Obter o nome da obra (subTrack) e o código da faixa
                const trackName = subTrack.work || "";
                // Para subTracks, usamos um identificador derivado do código da faixa principal
                // Convertemos para número inteiro e adicionamos 1000 para diferenciar das tracks principais
                const trackCodeBase = parseInt(track.trackCode || "0", 10) || 0;
                const trackCode = trackCodeBase + 1000; // Adicionar 1000 para diferenciar subTracks

                // Criar uma chave única para o agrupamento
                const chave = `${barcode}|${format}|${publisherName}|${trackName}|${trackCode}`;

                // Obter os dados completos da editora do mapa
                const editoraCompleta = editorasMap.get(publisherName) || null;

                // Verificar se já existe um grupo para esta chave
                if (!gruposMap.has(chave)) {
                  gruposMap.set(chave, {
                    codigoProduto: barcode,
                    formato: format,
                    editora: publisherName,
                    editoraCompleta: editoraCompleta, // Adicionar os dados completos da editora
                    obra: trackName,
                    codigoFaixa: trackCode,
                    percentualEditora: participationPercentage,
                    vendas: 0,
                    somaPrecos: 0, // Soma dos valores totais (baseCalculo) para cálculo do preço médio
                    percentualObra:
                      item.tx_copyright && item.catalogo.numberOfTracks > 0
                        ? item.tx_copyright / item.catalogo.numberOfTracks
                        : 0,
                    valorPagamento: 0,
                    // Novos campos adicionados
                    NL: 1, // Número de lados (padrão: 1)
                    LD: 1, // Lado (padrão: 1)
                    NF: item.catalogo.numberOfTracks || 0, // Número de faixas
                    FX: trackCode - 1000, // Número da faixa (subtraímos 1000 para obter o número original)
                    Mus: 1, // Para subTracks, sempre 1
                    authors: subTrack.authors || "", // Autores da música
                    isrc: "", // Para subTracks, ISRC vazio pois geralmente não possuem ISRC próprio
                  });
                }

                // Atualizar os valores do grupo
                const grupo = gruposMap.get(chave);

                // Somar vendas normalmente para cada grupo
                grupo.vendas += item.quantidade || 0;
                grupo.somaPrecos += item.baseCalculo;

                // Atualizar o valor de pagamento
                grupo.valorPagamento += valorRoyalties;
              }
            }
          }
        }
      }
    }

    await TMongo.mongoDisconnect(client);

    // Converter o mapa em um array e formatar os valores
    const resultado = Array.from(gruposMap.values()).map((grupo) => ({
      codigoProduto: grupo.codigoProduto,
      formato: grupo.formato,
      editora: grupo.editora,
      editoraCompleta: grupo.editoraCompleta, // Incluir os dados completos da editora
      obra: grupo.obra,
      codigoFaixa: grupo.codigoFaixa,
      percentualEditora: grupo.percentualEditora,
      vendas: grupo.vendas,
      // Adicionar o campo somaVendas igual a somaPrecos
      somaVendas: grupo.somaPrecos,
      // Calcular o preço como somaPrecos / vendas, com até 6 casas decimais
      preco:
        grupo.vendas > 0
          ? Number((grupo.somaPrecos / grupo.vendas).toFixed(6))
          : 0,
      percentualObra: grupo.percentualObra,
      valorPagamento: lib.round(grupo.valorPagamento),
      // Novos campos adicionados
      NL: grupo.NL || 1,
      LD: grupo.LD || 1,
      NF: grupo.NF || 0,
      FX: grupo.FX || 0,
      Mus: grupo.Mus || "",
      authors: grupo.authors || "",
      isrc: grupo.isrc || "",
    }));

    // Ordenar o resultado por código de produto, editora e obra
    resultado.sort((a, b) => {
      if (a.codigoProduto !== b.codigoProduto) {
        return a.codigoProduto.localeCompare(b.codigoProduto);
      }
      if (a.editora !== b.editora) {
        return a.editora.localeCompare(b.editora);
      }
      return a.obra.localeCompare(b.obra);
    });

    return resultado;
  } catch (error) {
    console.error("Erro ao agrupar apurações por produto e editora:", error);
    throw error;
  }
}
