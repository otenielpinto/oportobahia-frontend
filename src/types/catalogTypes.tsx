export interface Catalog {
  id: string;
  catalogCode: string;
  barcode: string;
  artist: string;
  workTitle: string;
  originalCode: string;
  originalReleaseDate: string;
  baseCalculationPercentage: number;
  numberOfDiscs: number;
  numberOfTracks: number;
  trackLimit: number;
  format: string;
  trackPercentage: number;
  majorGenre: string;
}

export interface Track {
  id: string;
  trackCode: string;
  isrc: string;
  work: string;
  authors: string;
  playLength: string;
  publishers?: {
    name: string;
    publisherCode?: string;
    participationPercentage: number;
  }[];
  catalogId: string;
  originalPublisher: string;
  subTracks?: {
    work: string;
    authors: string;
    playLength: string;
    originalPublisher: string;
    publishers?: {
      name: string;
      publisherCode?: string;
      participationPercentage: number;
    }[];
  }[];
}

export type CatalogFormData = Omit<Catalog, "id">;
export type TrackFormData = Omit<Track, "id">;
