export async function getLucratividadePorProdutoDetail(
  query: any
): Promise<any[]> {
  const response = await fetch(`/api/venda/lucratividade/produtodetail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function getLucratividadePorProduto(query: any): Promise<any[]> {
  const response = await fetch(`/api/venda/lucratividade/produto`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function getAllEcommerce(): Promise<any[]> {
  const response = await fetch(`/api/ecommerce`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function getAllVendedor(): Promise<any[]> {
  const response = await fetch(`/api/vendedor`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function getAllTenant(): Promise<any[]> {
  const response = await fetch(`/api/tenant`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export const sortList = [
  {
    name: "Dt. Emissão",
    value: "itens.data_movto",
  },
  {
    name: "Marca",
    value: "itens.marca",
  },
  {
    name: "Nome do Ecommerce",
    value: "itens.nome_ecommerce",
  },
  {
    name: "$ Custo",
    value: "itens.nfe_total_preco_custo",
  },
  {
    name: "Lucro Liquido",
    value: "itens.nfe_lucro_liquido",
  },
  {
    name: "% Lucro Liquido",
    value: "itens.nfe_perc_lucro_liquido",
  },
];

//https://blog.ramongomes.com.br/como-ordenar-array-utilizando-funcao-sort-js

export function sortField(field: string, xdefault: object) {
  let sort = {};
  for (let item of sortList) {
    if (field == item.name) {
      sort = { [item.value]: 1 };
    }
  }

  if (!field || field == "") {
    sort = xdefault;
  }

  return sort;
}

export async function getLucratividadePorLoja(query: any): Promise<any[]> {
  const response = await fetch(`/api/venda/lucratividade/loja`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    //next: { revalidate: 60 },
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function getLucratividadePorCanalVenda(
  query: any
): Promise<any[]> {
  const response = await fetch(`/api/venda/lucratividade/canalvenda`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    //next: { revalidate: 60 },
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function getLucratividadePorVendedor(query: any): Promise<any[]> {
  const response = await fetch(`/api/venda/lucratividade/vendedor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    //next: { revalidate: 60 },
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function getLucratividadePorCategoria(query: any): Promise<any[]> {
  const response = await fetch(`/api/venda/lucratividade/categoria`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    //next: { revalidate: 60 },
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function getLucratividadePorMarca(query: any): Promise<any[]> {
  const response = await fetch(`/api/venda/lucratividade/marca`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    //next: { revalidate: 60 },
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function getLucratividadePorCliente(query: any): Promise<any[]> {
  const response = await fetch(`/api/venda/lucratividade/cliente`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    //next: { revalidate: 60 },
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function getLucratividadePorUf(query: any): Promise<any[]> {
  const response = await fetch(`/api/venda/lucratividade/uf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    //next: { revalidate: 60 },
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function getLucratividadePorNfe(query: any): Promise<any[]> {
  const response = await fetch(`/api/venda/lucratividade/nfe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    //next: { revalidate: 60 },
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}
