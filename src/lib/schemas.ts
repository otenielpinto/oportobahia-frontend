import * as z from "zod";
const mensagens = {
  catalogCode: "Código do Catálogo é obrigatório",
  barcode: "Código de Barras é obrigatório",
  artist: "Artista é obrigatório",
  workTitle: "Título da Obra é obrigatório",
  format: "Formato é obrigatório",
  trackCode: "Código da Faixa é obrigatório",
  work: "Obra é obrigatória",
  authors: "Autores são obrigatórios",
  publisher: "Editora é obrigatória",
};
export const catalogSchema = z.object({
  catalogCode: z.string().min(1, mensagens.catalogCode),
  barcode: z.string().min(1, mensagens.barcode),
  artist: z.string().min(1, mensagens.artist),
  workTitle: z.string().min(1, mensagens.workTitle),
  baseCalculationPercentage: z.number().min(0).max(100),
  numberOfDiscs: z.number().min(1),
  numberOfTracks: z.number().min(1),
  trackLimit: z.number().min(1),
  format: z.string().min(1, mensagens.format),
  trackPercentage: z.number().min(0).max(100),
});

export const trackSchema = z.object({
  trackCode: z.string().min(1, mensagens.trackCode),
  work: z.string().min(1, mensagens.work),
  authors: z.string().min(1, mensagens.authors),
  publisher: z.string().min(1, mensagens.publisher),
  participationPercentage: z.number().min(0).max(100),
  isrc: z.string().min(1, "ISRC é obrigatório"),
});
