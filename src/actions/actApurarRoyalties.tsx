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
 * Converte duas datas em um formato de trimestre (ex: 1T2025)
 * @param dataInicial - Data inicial do período
 * @param dataFinal - Data final do período
 * @returns String no formato "[trimestre]T[ano]" ou string vazia se as datas forem inválidas
 */
function converterParaTrimestre(
  dataInicial: Date | null,
  dataFinal: Date | null
): string {
  // Verificar se as datas são válidas
  if (!dataInicial || !dataFinal) {
    return "";
  }

  // Obter o mês da data inicial (0-11)
  const mesInicial = dataInicial.getMonth();

  // Obter o mês da data final (0-11)
  const mesFinal = dataFinal.getMonth();

  // Obter o ano da data inicial
  const ano = dataInicial.getFullYear();

  // Verificar se as datas estão no mesmo ano
  if (dataFinal.getFullYear() !== ano) {
    // Se estiverem em anos diferentes, retornar um formato personalizado
    return `${ano}/${dataFinal.getFullYear()}`;
  }

  // Determinar o trimestre com base nos meses
  let trimestre = 0;

  // Verificar se as datas correspondem a um trimestre específico
  if (mesInicial === 0 && mesFinal === 2) {
    // Janeiro a Março
    trimestre = 1;
  } else if (mesInicial === 3 && mesFinal === 5) {
    // Abril a Junho
    trimestre = 2;
  } else if (mesInicial === 6 && mesFinal === 8) {
    // Julho a Setembro
    trimestre = 3;
  } else if (mesInicial === 9 && mesFinal === 11) {
    // Outubro a Dezembro
    trimestre = 4;
  } else {
    // Se não corresponder a um trimestre específico, verificar se está dentro de um trimestre
    if (mesInicial <= 2 && mesFinal <= 2) {
      // Dentro do 1º trimestre
      trimestre = 1;
    } else if (
      mesInicial >= 3 &&
      mesInicial <= 5 &&
      mesFinal >= 3 &&
      mesFinal <= 5
    ) {
      // Dentro do 2º trimestre
      trimestre = 2;
    } else if (
      mesInicial >= 6 &&
      mesInicial <= 8 &&
      mesFinal >= 6 &&
      mesFinal <= 8
    ) {
      // Dentro do 3º trimestre
      trimestre = 3;
    } else if (mesInicial >= 9 && mesFinal >= 9) {
      // Dentro do 4º trimestre
      trimestre = 4;
    } else {
      // Se não corresponder a um trimestre específico, retornar um formato personalizado
      return `${mesInicial + 1}-${mesFinal + 1}/${ano}`;
    }
  }

  // Retornar o trimestre no formato "[trimestre]T[ano]"
  return `${trimestre}T${ano}`;
}

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

    //Buscar todas as editoras *** Estou fazendo isso , porque pode ser alterado o nome da editora ***
    const editoras = await clientdb.collection("editora").find({}).toArray();

    // Salvar dados na collection tmp_apuracao_current
    await clientdb.collection(collectionCurrent).insertOne({
      id,
      data_inicial: fromDate,
      data_final: toDate,
      data_apuracao: new Date(),
      status: status_aguardando,
      editoras,
      has_error: false,
      messages: [],
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
        has_error: apuracao.has_error || false,
        messages: apuracao.messages || [],
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
 * Processa os dados da apuração após o fechamento
 * @param id - Código identificador da apuração
 * @returns Dados processados da apuração
 */
export async function processarApuracaoFechada({ id }: { id: string }) {
  try {
    // Verificar se a apuração existe e está fechada
    const { client, clientdb } = await TMongo.connectToDatabase();

    const apuracao = await clientdb
      .collection(collectionCurrent)
      .findOne({ id });

    if (!apuracao) {
      await TMongo.mongoDisconnect(client);
      throw new Error(`Apuração com código ${id} não encontrada`);
    }

    if (apuracao.status !== "fechado") {
      await TMongo.mongoDisconnect(client);
      throw new Error(`Apuração com código ${id} não está fechada`);
    }

    // Agrupar os dados por editora
    const dadosPorEditora = await agruparApuracoesPorEditora({ id });
    await clientdb
      .collection("tmp_apuracao_royalties")
      .insertMany(dadosPorEditora);

    await TMongo.mongoDisconnect(client);

    // Retornar os dados processados
    return {
      sucesso: true,
      id,
      mensagem: "Apuração processada com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao processar apuração fechada:", error);
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

    // Excluir os itens relacionados da collection tmp_apuracao_royalties
    await clientdb
      .collection("tmp_apuracao_royalties")
      .deleteMany({ id_grupo: id });

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
/**
 * Agrupa os resultados da apuração por editora após o fechamento
 * @param id - Código identificador da apuração
 * @returns Array com os dados agrupados por editora
 */
export async function agruparApuracoesPorEditora({ id }: { id: string }) {
  try {
    const apuracao = await consultarApuracaoCurrentById(id);

    // Obter os resultados da apuração
    const itensApuracao = await obterResultadosApuracao({ id_grupo: id });

    // Criar um mapa para agrupar os itens por editora
    const grupos: Record<string, any> = {};

    // Processar cada item da apuração
    itensApuracao.forEach((item: any) => {
      // Processar publishers das faixas principais
      if (item.catalogo?.tracks && Array.isArray(item.catalogo.tracks)) {
        item.catalogo.tracks.forEach((track: any) => {
          if (track.publishers && Array.isArray(track.publishers)) {
            track.publishers.forEach((publisher: any) => {
              const nomeEditora = publisher.name || "Editora Desconhecida";

              if (!grupos[nomeEditora]) {
                grupos[nomeEditora] = {
                  editora: nomeEditora,
                  totalItens: 0,
                  totalRoyalties: 0,
                };
              }

              // Utilizar diretamente o valor de royalties da editora
              const valor_royalties = lib.round(publisher.valor_royalties);

              // Adicionar informações ao grupo
              grupos[nomeEditora].totalItens += 1;
              grupos[nomeEditora].totalRoyalties += valor_royalties;
            });
          }
        });
      }

      // Processar publishers das subFaixas
      if (item.catalogo?.tracks && Array.isArray(item.catalogo.tracks)) {
        item.catalogo.tracks.forEach((track: any) => {
          if (track.subTracks && Array.isArray(track.subTracks)) {
            track.subTracks.forEach((subTrack: any) => {
              if (subTrack.publishers && Array.isArray(subTrack.publishers)) {
                subTrack.publishers.forEach((publisher: any) => {
                  const nomeEditora = publisher.name || "Editora Desconhecida";

                  if (!grupos[nomeEditora]) {
                    grupos[nomeEditora] = {
                      editora: nomeEditora,
                      totalItens: 0,
                      totalRoyalties: 0,
                    };
                  }

                  // Utilizar diretamente o valor de royalties da editora
                  const valor_royalties = lib.round(publisher.valor_royalties);

                  // Adicionar informações ao grupo
                  grupos[nomeEditora].totalItens += 1;
                  grupos[nomeEditora].totalRoyalties += valor_royalties;
                });
              }
            });
          }
        });
      }
    });

    // Calcular as datas para os campos
    const dataAtual = new Date();
    const ultimoDiaMes = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Formatar as datas do período para o histórico
    const dataInicial =
      apuracao && apuracao.data_inicial
        ? new Date(apuracao.data_inicial)
        : null;
    const dataFinal =
      apuracao && apuracao.data_final ? new Date(apuracao.data_final) : null;

    // Formatar as datas para exibição no formato DD/MM/YYYY
    const formatarData = (data: Date | null) => {
      if (!data) return "";
      return `${data.getDate().toString().padStart(2, "0")}/${(
        data.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${data.getFullYear()}`;
    };

    const periodoFormatado =
      dataInicial && dataFinal
        ? `${formatarData(dataInicial)} a ${formatarData(dataFinal)}`
        : "";

    // Obter o trimestre do período
    const trimestreFormatado = converterParaTrimestre(dataInicial, dataFinal);

    // Gerar um número de documento baseado no ID e no trimestre
    const documento = trimestreFormatado
      ? `ROY-${id.substring(0, 8)}-${trimestreFormatado}`
      : `ROY-${id.substring(0, 8)}-${dataAtual.getFullYear()}${(
          dataAtual.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}`;

    // Ordenar os grupos por nome da editora e adicionar campos adicionais
    return Object.values(grupos)
      .map((grupo: any) => ({
        ...grupo,
        id: uuidv4(),
        id_grupo: id,
        dt_movto: dataAtual,
        dt_vencto: ultimoDiaMes,
        documento: documento,
        valor: lib.round(grupo.totalRoyalties),
        pago: 0,
        saldo: lib.round(grupo.totalRoyalties),
        situacao: "Aberto",
        dt_pagto: null,
        observacao: "",
        referente:
          trimestreFormatado ||
          `${dataAtual.getFullYear()}/${(dataAtual.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`,
        historico: `Pagamento de Royalties - Período: ${periodoFormatado} (${trimestreFormatado})`,
      }))
      .sort((a: any, b: any) => a.editora.localeCompare(b.editora));
  } catch (error) {
    console.error("Erro ao agrupar apurações por editora:", error);
    throw error;
  }
}

export async function agruparApuracoesPorProdutoEditora({
  id_grupo,
}: {
  id_grupo: string;
}) {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Buscar os dados da apuração . Dessa forma eu sempre terei o nome da editora correta .
    const apuracao: any = await clientdb
      .collection("tmp_apuracao_current")
      .findOne({ id: id_grupo });

    // Buscar todas as editoras e criar um mapa para acesso rápido
    const editoras: any = apuracao.editoras || [];
    const editorasMap = new Map();

    // Criar um mapa de editoras para acesso rápido por nome
    editoras.forEach((editora: any) => {
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

/**
 * Consulta registros na collection tmp_apuracao_royalties filtrados por situação
 * Ordenados por data de vencimento crescente (vencimentos mais próximos primeiro)
 * @param situacao - Situação para filtrar (opcional, padrão: "Aberto")
 * @returns Array com os registros que correspondem à situação especificada
 */
export async function consultarRoyalties({
  situacao = "Aberto",
}: { situacao?: string } = {}) {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Criar o filtro com base na situação fornecida
    // Se a situação for "Todos", não aplicamos filtro de situação
    const filtro = situacao && situacao !== "Todos" ? { situacao } : {};

    // Buscar os registros com o filtro especificado
    const registros = await clientdb
      .collection("tmp_apuracao_royalties")
      .find(filtro)
      .sort({ dt_vencto: 1 }) // Ordenar pela data de vencimento (crescente - mais próximo primeiro)
      .toArray();

    await TMongo.mongoDisconnect(client);

    // Formatar as datas para exibição
    const registrosFormatados = registros.map((registro: any) => {
      // Converter datas para objetos Date se forem strings
      const dt_movto = registro.dt_movto ? new Date(registro.dt_movto) : null;
      const dt_vencto = registro.dt_vencto
        ? new Date(registro.dt_vencto)
        : null;
      const dt_pagto = registro.dt_pagto ? new Date(registro.dt_pagto) : null;

      return {
        ...registro,
        dt_movto,
        dt_vencto,
        dt_pagto,
        // Adicionar campos calculados que podem ser úteis na interface
        diasAteVencimento: dt_vencto
          ? Math.ceil(
              (dt_vencto.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
        vencido: dt_vencto ? dt_vencto < new Date() : false,
      };
    });

    return {
      total: registrosFormatados.length,
      registros: registrosFormatados,
    };
  } catch (error) {
    console.error("Erro ao consultar royalties em aberto:", error);
    throw error;
  }
}

// As funções consultarRoyaltiesPorIdGrupo e consultarRoyaltiesPorEditora foram removidas
// Use a função consultarRoyalties com os parâmetros apropriados para obter os mesmos resultados

/**
 * Realiza o pagamento de um registro na collection tmp_apuracao_royalties
 * @param id - ID do registro
 * @param pago - Valor pago
 * @param dt_pagto - Data do pagamento (opcional, padrão: data atual)
 * @param observacao - Observação sobre o pagamento (opcional)
 * @returns Objeto com informações sobre o resultado da operação
 */
export async function registrarPagamentoRoyalties({
  id,
  pago,
  dt_pagto,
  observacao,
}: {
  id: string;
  pago: number;
  dt_pagto?: Date;
  observacao?: string;
}) {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Buscar o registro pelo ID
    const registro = await clientdb
      .collection("tmp_apuracao_royalties")
      .findOne({ id });

    if (!registro) {
      await TMongo.mongoDisconnect(client);
      throw new Error(`Registro com ID ${id} não encontrado.`);
    }

    // Verificar se o registro já está pago
    // Só consideramos pago se a situação for "Pago" E existir uma data de pagamento
    if (registro.situacao === "Pago" && registro.dt_pagto) {
      await TMongo.mongoDisconnect(client);
      throw new Error(
        `Este registro já foi pago em ${new Date(
          registro.dt_pagto
        ).toLocaleDateString()}.`
      );
    }

    // Verificar se a situação permite pagamento
    // Permitimos pagamento para qualquer situação que não seja "Pago"
    if (registro.situacao === "Pago") {
      await TMongo.mongoDisconnect(client);
      throw new Error(
        `Royalties com situação 'Pago' não podem receber pagamentos. Situação atual: ${registro.situacao}`
      );
    }

    // Definir a data de pagamento (usar a data atual se não for fornecida)
    // Definir a data de pagamento com a hora atual (usar a data atual se não for fornecida)
    const dataPagamento = dt_pagto
      ? new Date(
          dt_pagto.setHours(
            new Date().getHours(),
            new Date().getMinutes(),
            new Date().getSeconds(),
            new Date().getMilliseconds()
          )
        )
      : new Date();

    // Calcular o saldo após o pagamento
    const novoSaldo = registro.valor - pago;

    // Determinar a nova situação com base no valor pago
    // Se o valor pago for igual ou maior que o valor, a situação será "Pago"
    const novaSituacao = pago >= registro.valor ? "Pago" : "Aberto";

    // Atualizar o registro
    const resultado = await clientdb
      .collection("tmp_apuracao_royalties")
      .updateOne(
        { id: id },
        {
          $set: {
            pago,
            dt_pagto: dataPagamento,
            observacao: observacao || "",
            situacao: novaSituacao,
            saldo: novoSaldo,
            valorPago: pago,
          },
        }
      );

    await TMongo.mongoDisconnect(client);

    if (resultado.modifiedCount === 0) {
      throw new Error(
        "Não foi possível atualizar o registro. Tente novamente."
      );
    }

    return {
      sucesso: true,
      mensagem: `Pagamento registrado com sucesso. Situação: ${novaSituacao}.`,
      id,
      valorPago: pago,
      dataPagamento,
      situacao: novaSituacao,
      saldo: novoSaldo,
    };
  } catch (error) {
    console.error("Erro ao registrar pagamento:", error);
    throw error;
  }
}
