"use server";
import { createServerAction } from "zsa";
import { z } from "zod";
import { TMongo } from "@/infra/mongoClient";
import { User } from "@/auth/types/user";
import { ObjectId } from "mongodb";
import * as bcryptjs from "bcryptjs";

//nao usado
export const findUsers = createServerAction()
  .input(
    z.object({
      value: z.string(),
      field: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { value, field } = input;

    const client = await TMongo.mongoConnect();
    const clientdb = await TMongo.mongoSetDatabase(client);

    const data: any[] = await clientdb
      .collection("user")
      .find({ [field]: value })
      .toArray();
    await TMongo.mongoDisconnect(client);
    return data;
  });

export const getAllUsers = createServerAction().handler(async () => {
  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  const users: any = await clientdb.collection("user").find({}).toArray();
  let data: any = [];
  for (let u of users) {
    if (!u.id_empresa) {
      u.id_empresa = 0;
    }
    //Nao enviar a senha para o front
    u.password = "";
    data.push(u);
  }
  await TMongo.mongoDisconnect(client);
  return data as User[];
});

export const getUserById = createServerAction()
  .input(
    z.object({
      _id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { _id }: any = input;
    const client = await TMongo.mongoConnect();
    const clientdb = await TMongo.mongoSetDatabase(client);
    const data: any = await clientdb
      .collection("user")
      .find({ _id: _id })
      .toArray();
    await TMongo.mongoDisconnect(client);
    return data;
  });

export const createUser = createServerAction()
  .input(
    z.object({
      _id: z.string(),
      email: z.string(),
      name: z.string(),
      active: z.number(),
      isAdmin: z.number(),
      password: z.string(),
      id_empresa: z.number(),
    })
  )
  .handler(async ({ input }) => {
    const { _id, email, name, active, isAdmin, password, id_empresa } = input;

    const client = await TMongo.mongoConnect();
    const clientdb = await TMongo.mongoSetDatabase(client);

    const data: any = await clientdb
      .collection("user")
      .insertOne({ email, name, active, isAdmin, password, id_empresa });
    await TMongo.mongoDisconnect(client);
    return data;
  });

export const deleteUser = createServerAction()
  .input(
    z.object({
      _id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { _id }: any = input;

    if (!_id) {
      throw new Error("Informe o codigo para excluir ");
    }
    const client = await TMongo.mongoConnect();
    const clientdb = await TMongo.mongoSetDatabase(client);
    const data: any = await clientdb
      .collection("user")
      .deleteOne({ _id: new ObjectId(_id) });
    console.log(data);
    await TMongo.mongoDisconnect(client);
    return data;
  });

export const updateUser = createServerAction()
  .input(
    z.object({
      _id: z.string(),
      name: z.string(),
      email: z.string(),
      active: z.number(),
      isAdmin: z.number(),
      password: z.string(),
      id_empresa: z.number(),
    })
  )
  .handler(async ({ input }) => {
    const { _id, email, name, active, isAdmin, password, id_empresa } = input;

    const client = await TMongo.mongoConnect();
    const clientdb = await TMongo.mongoSetDatabase(client);
    const body: any = { email, name, active, isAdmin, password, id_empresa };
    if (!password || password === "") {
      delete body["password"];
    } else {
      let salt = await bcryptjs.genSalt(10);
      let hashPassword = bcryptjs.hashSync(password, salt);
      body.password = hashPassword;
    }

    const data: any = await clientdb
      .collection("user")
      .updateOne({ _id: new ObjectId(_id) }, { $set: body });
    await TMongo.mongoDisconnect(client);
    return data;
  });
