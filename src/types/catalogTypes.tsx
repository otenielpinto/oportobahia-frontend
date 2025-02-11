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
}

export interface Track {
  id: string;
  trackCode: string;
  isrc: string;
  work: string;
  authors: string;
  publishers: { name: string; participationPercentage: number }[];
  catalogId: string;
}

export type CatalogFormData = Omit<Catalog, "id">;
export type TrackFormData = Omit<Track, "id">;
