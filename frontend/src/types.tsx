export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error: {
    code: string;
    details?: unknown;
  } | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};