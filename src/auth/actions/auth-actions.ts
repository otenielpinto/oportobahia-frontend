"use server";
import * as bcryptjs from "bcryptjs";
import { redirect } from "next/navigation";
import AuthService from "@/auth/util";
import { TMongo } from "@/infra/mongoClient";

interface CreateAccountParams {
  email: string;
  name?: string;
  password: string;
  id_empresa?: number;
}

export async function createAccount({
  email,
  name,
  password,
  id_empresa,
}: CreateAccountParams) {
  if (!id_empresa || id_empresa <= 0) id_empresa = 1;

  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  let response: any = await clientdb.collection("user").findOne({ email });

  if (!response) {
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = bcryptjs.hashSync(password, salt);
    const user: any = {
      email,
      name,
      active: 0,
      isAdmin: 0,
      password: hashPassword,
      id_empresa,
    };
    response = await clientdb.collection("user").insertOne(user);
  }
  await TMongo.mongoDisconnect(client);
  redirect("/sign-in");
}

async function getUserByEmail(email: string) {
  let active = 1;
  let query = { email, active };

  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  let response: any = await clientdb.collection("user").findOne(query);

  //mover isso para o create route
  if (!response && email == "oteniel.pinto@gmail.com") {
    let salt = await bcryptjs.genSalt(10);
    let user: any = {
      email,
      name: "Admin",
      active: 1,
      isAdmin: 1,
      password: bcryptjs.hashSync("mudar123", salt),
      id_empresa: 1,
    };
    response = await clientdb.collection("user").insertOne(user);
  }
  await TMongo.mongoDisconnect(client);
  return response;
}

// https://makerkit.dev/blog/tutorials/nextjs-server-actions
export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  let user = await getUserByEmail(email);

  if (!user) {
    // Aqui você pode usar optimistic update para atualizar a tela
    console.log("Usuário ou senha inválidos");
    redirect("/sign-in");
  }

  bcryptjs.genSalt(10);
  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) {
    console.log("Usuário ou senha inválidos");
    alert("Usuário ou senha inválidos");
    redirect("/sign-in");
  }

  await AuthService.createSessionToken({
    sub: user.name,
    name: user.name,
    email: user.email,
    id_empresa: user.id_empresa,
    isAdmin: user?.isAdmin,
  });

  redirect("/home");
}

export async function findAll() {
  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  const response = await clientdb.collection("user").find().toArray();

  await TMongo.mongoDisconnect(client);
  return response;
}
