"use server";

import { TMongo } from "@/infra/mongoClient";
import { v4 as uuidv4 } from "uuid";
import { lib } from "@/lib/lib";

type TaxaCopyright = {
  tx_copyright: number;
};

//essa taxa pode ser buscada do banco de dados e definido por empresa

export async function getTaxaCopyright(): Promise<TaxaCopyright> {
  return {
    tx_copyright: 8.5,
  };
}
