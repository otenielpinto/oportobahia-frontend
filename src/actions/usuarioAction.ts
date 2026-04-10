"use server";

import { TMongo } from "@/infra/mongoClient";
import { Usuario, UsuarioFormData } from "@/types/UsuarioType";
import { getUser } from "@/actions/sessionAction";
import { revalidatePath } from "next/cache";
import { hashPassword, getNewId } from "@/auth/actions/auth-actions";
import { serializeMongoData } from "@/lib/serializeMongoData";

export async function getUsuarios() {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const session = await getUser();
  if (!session) {
    throw new Error("Usuário não autenticado");
  }

  const usuarios = await clientdb
    .collection("user")
    .find({
      id_tenant: session.id_tenant,
      id_empresa: session.id_empresa,
    })
    .toArray();

  await TMongo.mongoDisconnect(client);
  return serializeMongoData(
    usuarios.map((usuario) => ({
      ...usuario,
      _id: usuario._id.toString(),
    })),
  );
}

export async function getUsuarioById(id: string) {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const session = await getUser();
  if (!session) {
    throw new Error("Usuário não autenticado");
  }

  const usuario = await clientdb.collection("user").findOne({
    id: id,
    id_tenant: session.id_tenant,
    id_empresa: session.id_empresa,
  });

  await TMongo.mongoDisconnect(client);

  if (usuario) {
    return serializeMongoData({ ...usuario, _id: usuario._id.toString() });
  }
  return null;
}

export async function createUsuario(data: UsuarioFormData) {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const session = await getUser();
  if (!session) {
    throw new Error("Usuário não autenticado");
  }
  if (!data.password) {
    throw new Error("Senha é obrigatória");
  }

  if (!data?.emp_acesso || data?.emp_acesso.length === 0) {
    data.emp_acesso = [Number(session.id_empresa)]; // Se não houver empresas selecionadas, usa a empresa do usuário logado
  }

  // Verifica se o usuário já existe
  const existingUser = await clientdb.collection("user").findOne({
    email: data.email,
    id_tenant: Number(session.id_tenant),
    id_empresa: Number(session.id_empresa),
  });

  if (existingUser) {
    throw new Error("Usuário já existe");
  }
  // Gera o hash da senha
  if (!data.password) {
    throw new Error("Senha é obrigatória");
  }

  let password = await hashPassword(data.password);
  const newUsuario: Usuario = {
    ...data,
    password,
    id_tenant: Number(session.id_tenant),
    id_empresa: Number(session.id_empresa),
    codigo: Date.now().toString(),
    id: await getNewId(),
    active: 1,
    isAdmin: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await clientdb.collection("user").insertOne(newUsuario);
  await TMongo.mongoDisconnect(client);

  revalidatePath("/usuario");
}

export async function updateUsuario(id: string, data: UsuarioFormData) {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const session = await getUser();
  if (!session) {
    throw new Error("Usuário não autenticado");
  }
  let oldUser = await clientdb.collection("user").findOne({
    id: id,
    id_tenant: Number(session.id_tenant),
    id_empresa: Number(session.id_empresa),
  });

  // Se a senha não for alterada, removemos do objeto de atualização
  if (data.password && data.password === oldUser?.password) {
    delete data.password;
  } else if (data.password) {
    data.password = await hashPassword(data.password);
  }

  await clientdb.collection("user").updateOne(
    {
      id: id,
      id_tenant: Number(session.id_tenant),
      id_empresa: Number(session.id_empresa),
    },
    { $set: { ...data, updatedAt: new Date() } },
  );

  await TMongo.mongoDisconnect(client);

  revalidatePath("/usuario");
  revalidatePath(`/usuario/edit/${id}`);
  revalidatePath(`/usuario/view/${id}`);
}

export async function deleteUsuario(id: string) {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const session = await getUser();
  if (!session) {
    throw new Error("Usuário não autenticado");
  }

  await clientdb.collection("user").deleteOne({
    id: id,
    id_tenant: Number(session.id_tenant),
    id_empresa: Number(session.id_empresa),
  });

  await TMongo.mongoDisconnect(client);

  revalidatePath("/usuario");
}
