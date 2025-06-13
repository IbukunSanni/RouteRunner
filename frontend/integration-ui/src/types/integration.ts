export interface ApiRequest {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string | null;
  extractors?: Record<string, string>;
}

export interface Integration {
  id: string;
  name: string;
  requests: ApiRequest[];
}
