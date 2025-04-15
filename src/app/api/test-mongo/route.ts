import { NextResponse } from "next/server";
import { TMongo } from "@/infra/mongoClient";

export async function GET() {
  try {
    console.log("API: Iniciando teste de conexão MongoDB...");
    
    // Testar conexão com o banco de dados
    const { client, clientdb } = await TMongo.connectToDatabase();
    
    // Listar as coleções disponíveis
    const collections = await clientdb.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    // Verificar se a coleção nota_fiscal existe
    const hasNotaFiscalCollection = collectionNames.includes("nota_fiscal");
    
    // Se a coleção existir, contar documentos
    let notaFiscalCount = 0;
    if (hasNotaFiscalCollection) {
      notaFiscalCount = await clientdb.collection("nota_fiscal").countDocuments();
    }
    
    // Fechar a conexão
    await TMongo.mongoDisconnect(client);
    
    return NextResponse.json({
      success: true,
      message: "Conexão com MongoDB estabelecida com sucesso",
      database: process.env.MONGO_DATABASE,
      collections: collectionNames,
      notaFiscalCollection: {
        exists: hasNotaFiscalCollection,
        documentCount: notaFiscalCount
      }
    });
  } catch (error: any) {
    console.error("API: Erro ao testar conexão MongoDB:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao conectar ao MongoDB",
        error: error?.message || "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}
