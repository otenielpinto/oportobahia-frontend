import { getAllEmpresa } from "@/actions/actIntegracao";

let listOfEmpresas: any[] = [];

async function findAll() {
  if (!listOfEmpresas || listOfEmpresas.length === 0) {
    listOfEmpresas = await getAllEmpresa();
  }
  return listOfEmpresas;
}

async function getEmpresaById(id: Number): Promise<any> {
  let empresas = await findAll();
  return empresas.filter((e) => e.id === id)[0];
}

async function getEmpresaByCodigo(codigo: String): Promise<any> {
  let empresas = await findAll();
  return empresas.filter((e) => e.codigo === codigo)[0];
}

export const Empresa = { findAll, getEmpresaById, getEmpresaByCodigo };
