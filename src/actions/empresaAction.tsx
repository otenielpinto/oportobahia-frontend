"use server";

import { TMongo } from "@/infra/mongoClient";
import { Empresa, EmpresaFormData } from "@/types/EmpresaTypes";
import { gen_id } from "@/actions/generatorAction";
import { v4 as uuidv4 } from "uuid";
import { getUser } from "@/actions/sessionAction";
import { revalidatePath } from "next/cache";

// Define types for create and update operations
type EmpresaCreateInput = Omit<
  EmpresaFormData,
  "id_tenant" // id_tenant will be injected by the server action
>;

type EmpresaUpdateInput = Partial<EmpresaCreateInput> & {
  id: number; // id is required for update
};

export async function getAllEmpresas() {
  try {
    let user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const empresas = await clientdb
      .collection("empresa")
      .find({ id_tenant: user.id_tenant })
      .toArray();
    await TMongo.mongoDisconnect(client);

    const serializedEmpresas = empresas.map((empresa) => ({
      ...empresa,
      _id: empresa._id.toString(),
      // Ensure dates are serialized if needed, or handled on client
      dtCadastro: empresa.dtCadastro?.toISOString(),
      ultAtualizacao: empresa.ultAtualizacao?.toISOString(),
      createdAt: empresa.createdAt?.toISOString(),
      updatedAt: empresa.updatedAt?.toISOString(),
    }));

    return { success: true, data: serializedEmpresas };
  } catch (error: any) {
    console.error("Erro ao buscar todas as empresas:", error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar as empresas.",
    };
  }
}

export async function getEmpresaById(id: Number) {
  try {
    let user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const empresa = await clientdb.collection("empresa").findOne({
      id: Number(id),
      id_tenant: user.id_tenant,
      ...(user.id_empresa && { id: user.id_empresa }), // Filtrar por empresa se disponível
    });
    await TMongo.mongoDisconnect(client);

    if (!empresa) {
      return { success: false, error: "Empresa não encontrada." };
    }

    const serializedEmpresa = {
      ...empresa,
      _id: empresa._id.toString(),
      dtCadastro: empresa.dtCadastro?.toISOString(),
      ultAtualizacao: empresa.ultAtualizacao?.toISOString(),
      createdAt: empresa.createdAt?.toISOString(),
      updatedAt: empresa.updatedAt?.toISOString(),
    };

    return { success: true, data: serializedEmpresa };
  } catch (error: any) {
    console.error(`Erro ao buscar empresa com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar a empresa.",
    };
  }
}

export async function createEmpresa(data: EmpresaCreateInput) {
  try {
    let user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    const row = await gen_id("empresa");
    if (!row.success || !row.data) {
      await TMongo.mongoDisconnect(client);
      return { success: false, error: "Falha ao gerar ID para a empresa." };
    }
    const newId = parseInt(String(row.data));

    const empresaData: Empresa = {
      ...data,
      id: newId,
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
      dtCadastro: new Date(),
      ultAtualizacao: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ensure required fields from Empresa are present, even if optional in EmpresaFormData
      nome: data.nome || "Nova Empresa", // Provide a default if nome is somehow missing
      cpfcnpj: data.cpfcnpj || "", // Provide a default if cpfCnpj is somehow missing
      ativo: data.ativo || "S", // Default to 'S' if not provided
    };

    const result = await clientdb.collection("empresa").insertOne(empresaData);
    await TMongo.mongoDisconnect(client);

    if (!result.acknowledged) {
      return { success: false, error: "Falha ao criar empresa." };
    }

    revalidatePath("/empresa");
    return { success: true, message: "Empresa criada com sucesso." };
  } catch (error: any) {
    console.error("Erro ao criar empresa:", error);
    return {
      success: false,
      error: error.message || "Não foi possível criar a empresa.",
    };
  }
}

export async function updateEmpresa(data: EmpresaUpdateInput) {
  try {
    let user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { id, ...updateFields } = data;

    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection("empresa").updateOne(
      { id: Number(id), id_tenant: user.id_tenant },
      {
        $set: {
          ...updateFields,
          ultAtualizacao: new Date(),
          updatedAt: new Date(),
        },
      },
    );
    await TMongo.mongoDisconnect(client);

    if (result.matchedCount === 0) {
      return {
        success: false,
        error: "Empresa não encontrada ou não pertence ao seu tenant.",
      };
    }
    if (result.modifiedCount === 0) {
      return { success: false, message: "Nenhuma alteração detectada." };
    }

    revalidatePath("/empresa");
    revalidatePath(`/empresa/view/${id}`);
    revalidatePath(`/empresa/edit/${id}`);
    return { success: true, message: "Empresa atualizada com sucesso." };
  } catch (error: any) {
    console.error(`Erro ao atualizar empresa com ID ${data.id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível atualizar a empresa.",
    };
  }
}

export async function deleteEmpresa(id: Number) {
  try {
    let user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb
      .collection("empresa")
      .deleteOne({ id: Number(id), id_tenant: user.id_tenant });
    await TMongo.mongoDisconnect(client);

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "Empresa não encontrada ou não pertence ao seu tenant.",
      };
    }

    revalidatePath("/empresa");
    return { success: true, message: "Empresa excluída com sucesso." };
  } catch (error: any) {
    console.error(`Erro ao excluir empresa com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível excluir a empresa.",
    };
  }
}

export async function getEmpresaByCnpj(cnpj: String) {
  let user: any = await getUser();
  const { client, clientdb } = await TMongo.connectToDatabase();
  const response = await clientdb
    .collection("empresa")
    .findOne({ cpfcnpj: cnpj, id_tenant: user.id_tenant });
  await TMongo.mongoDisconnect(client);

  // Serialize MongoDB document for Client Components
  if (response) {
    return {
      ...response,
      _id: response._id.toString(),
    };
  }
  return response;
}

//vai ser usado para criar a empresa padrão
export async function autoCreateEmpresa() {
  let rows: any = await getAllEmpresas();
  if (rows.length > 0) {
    return;
  }

  let row = await gen_id("empresa");
  if (!row.success) {
    throw new Error("Failed to generate ID");
  }

  const empresaData: EmpresaCreateInput = {
    nome: "empresa " + uuidv4(),
    fantasia: "empresa " + uuidv4(),
    cpfcnpj: "",
    ativo: "S",
  };

  return await createEmpresa(empresaData);
}

/**
 * Busca todas as empresas do banco de dados
 * @returns Array de empresas com id, nome e fantasia
 */
export async function getEmpresas() {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Busca as empresas e filtra apenas os campos necessários
    const empresas = await clientdb
      .collection("empresa")
      .find({})
      .project({ _id: 1, id: 1, nome: 1, fantasia: 1, cpfcnpj: 1 })
      .toArray();

    // Formata o array apenas com os campos necessários
    const formattedEmpresas = empresas.map((empresa) => ({
      _id: empresa._id.toString(),
      id: empresa.id,
      nome: empresa.nome,
      fantasia: empresa.fantasia || empresa.nome,
      cpfcnpj: empresa.cpfcnpj || "",
    }));

    client.close();

    return formattedEmpresas || [];
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    return {
      success: false,
      error: "Não foi possível carregar as empresas",
    };
  }
}
