import * as z from "zod";

const mensagens = {
  catalogCode: "Código do Catálogo é obrigatório",
  barcode: "Código de Barras é obrigatório",
  artist: "Artista é obrigatório",
  workTitle: "Título da Obra é obrigatório",
  originalCode: "Código Original é obrigatório",
  originalReleaseDate: "Data de Lançamento Original é obrigatória",
  format: "Formato é obrigatório",
  trackCode: "Código da Faixa é obrigatório",
  work: "Obra é obrigatória",
  authors: "Autores são obrigatórios",
  publisher: "Editora é obrigatória",
  majorGenre: "Gênero Principal é obrigatório",
  playLength: "Duração deve estar no formato mm:ss",
  originalPublisher: "Editora original é obrigatória",
};

export const catalogSchema = z.object({
  catalogCode: z.string().min(1, mensagens.catalogCode),
  barcode: z.string().min(1, mensagens.barcode),
  artist: z.string().min(1, mensagens.artist),
  workTitle: z.string().min(1, mensagens.workTitle),
  originalCode: z.string().min(1, mensagens.originalCode),
  originalReleaseDate: z.string().min(1, mensagens.originalReleaseDate),
  baseCalculationPercentage: z.number().min(0).max(100),
  numberOfDiscs: z.number().min(1),
  numberOfTracks: z.number().min(1),
  trackLimit: z.number().min(1),
  format: z.string().min(1, mensagens.format),
  trackPercentage: z.number().min(0).max(100),
  majorGenre: z.string().min(1, mensagens.majorGenre),
});

export const publisherSchema = z.object({
  name: z.string().min(1, "Nome da editora é obrigatório"),
  participationPercentage: z.number().min(0).max(100),
  publisherCode: z.string().optional(),
});

export const subTrackSchema = z.object({
  work: z.string().min(1, mensagens.work),
  originalPublisher: z.string().min(1, "Editora original é obrigatória"),
  publisherCode: z.string().optional(),
  playLength: z
    .string()
    .min(1, mensagens.playLength)
    .regex(/^([0-5][0-9]):([0-5][0-9])$/, mensagens.playLength),
  authors: z.string().min(1, "Nome dos autores é obrigatório"),
  publishers: z
    .array(publisherSchema)
    .optional()
    .refine((publishers) => {
      const total = publishers?.reduce(
        (sum, pub) => sum + pub.participationPercentage,
        0
      );
      return total === 100 || total === 0;
    }, "O total de percentuais deve ser igual a 100%"),
});

export const trackSchema = z.object({
  trackCode: z.string().min(1, "Número da faixa é obrigatório"),
  isrc: z.string().min(1, "ISRC é obrigatório"),
  work: z.string().min(1, "Nome da obra é obrigatório"),
  authors: z.string().min(1, "Nome dos autores é obrigatório"),
  originalPublisher: z.string().min(1, "Editora original é obrigatória"),
  playLength: z
    .string()
    .min(1, mensagens.playLength)
    .regex(/^([0-5][0-9]):([0-5][0-9])$/, mensagens.playLength),
  publishers: z
    .array(publisherSchema)
    .optional()
    .refine((publishers) => {
      const total = publishers?.reduce(
        (sum, pub) => sum + pub.participationPercentage,
        0
      );
      return total === 100 || total === 0;
    }, "O total de percentuais deve ser igual a 100%"),
  catalogId: z.string().optional(),
  subTracks: z.array(subTrackSchema).optional(),
});
