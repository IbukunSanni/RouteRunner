export interface ApiRequest {
  id: string;
  method: string;
  name: string;
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

// types/runResult.ts or in integration.ts if shared
export interface RunResult {
  url: string;
  method: string;
  statusCode: number;
  durationMs: number;
  responseBody: string;
  isSuccess: boolean;
}

