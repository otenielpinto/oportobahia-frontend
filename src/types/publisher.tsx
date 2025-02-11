export interface Publisher {
  id: number;
  name: string;
  status: "active" | "inactive";
}

export interface PublisherFilterInterface {
  search?: string;
  status?: "active" | "inactive";
  page: number;
  limit: number;
}

export interface PublisherResponse {
  data: Publisher[];
  total: number;
  page: number;
  limit: number;
}
