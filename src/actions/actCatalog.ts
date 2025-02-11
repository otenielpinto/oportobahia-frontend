// ...existing code...

export const updateTrack = async (catalogId: string, data: any) => {
  try {
    const response = await fetch(`/api/catalogs/${catalogId}/tracks/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar faixa');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar faixa:', error);
    throw error;
  }
};

// ...existing code...
