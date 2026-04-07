"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/actions/sessionAction";

export async function getUserEmpresas(userId: string) {
  if (!userId) {
    return [];
  }

  const session = await getUser();
  if (!session || !session.id_tenant) {
    return [];
  }

  const { client, clientdb } = await TMongo.connectToDatabase();
  const user: any = await clientdb.collection("user").findOne({
    id: userId,
    id_tenant: session.id_tenant,
  });

  if (!user) {
    await TMongo.mongoDisconnect(client);
    console.log("User not found");
    return [];
  }

  // Sempre gravar o array com int32 para evitar problemas de comparação ****
  const empresas = await clientdb
    .collection("empresa")
    .find({
      id_tenant: user.id_tenant,
      // Se o usuário tem id_empresa específico, filtrar por ele também
      ...(session.id_empresa ? { id: session.id_empresa } : {}),
    })
    .toArray();

  const filteredEmpresas = empresas.filter((empresa: any) =>
    user.emp_acesso.includes(Number(empresa.id))
  );

  // Serialize MongoDB documents for Client Components
  const serializedEmpresas = filteredEmpresas.map((empresa) => ({
    ...empresa,
    _id: empresa._id.toString(),
  }));

  const response = serializedEmpresas ? serializedEmpresas : [];
  await TMongo.mongoDisconnect(client);
  return response;
}
