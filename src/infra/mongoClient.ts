import { MongoClient } from "mongodb";

async function mongoConnect() {
  const connectionString = String(process.env.MONGO_CONNECTION);

  if (!connectionString || connectionString.trim() === "") {
    console.error("String de conexão MongoDB não configurada!");
    throw new Error(
      "String de conexão MongoDB não configurada. Verifique a variável de ambiente MONGO_CONNECTION."
    );
  }

  try {
    const client = new MongoClient(connectionString);
    await client.connect();

    return client;
  } catch (error: any) {
    console.error(
      "Erro ao conectar ao MongoDB:",
      error?.message || "Erro desconhecido"
    );
    throw error;
  }
}

async function mongoSetDatabase(client: MongoClient) {
  const dbName = process.env.MONGO_DATABASE;

  if (!dbName || dbName.trim() === "") {
    console.error("Nome do banco de dados MongoDB não configurado!");
    throw new Error(
      "Nome do banco de dados MongoDB não configurado. Verifique a variável de ambiente MONGO_DATABASE."
    );
  }

  const db = client.db(dbName);

  return db;
}

async function mongoDisconnect(client: MongoClient) {
  try {
    await client.close();
  } catch (error: any) {
    console.error(
      "Erro ao fechar conexão com MongoDB:",
      error?.message || "Erro desconhecido"
    );
    // Não lançamos o erro aqui para evitar problemas em cascata
  }
}

const connectToDatabase = async () => {
  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  return { client, clientdb };
};

export const TMongo = {
  mongoConnect,
  mongoSetDatabase,
  mongoDisconnect,
  connectToDatabase,
};
