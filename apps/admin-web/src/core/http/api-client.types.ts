export type ApiError = {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
};

export type ApiRequestOptions = RequestInit & { timeoutMs?: number };
