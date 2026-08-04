import { ErrorCode } from "./error";

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta?: { page?: number; limit?: number; total?: number };
};

export type ApiError = {
  success: false;
  message: string;
  error: {
    code: ErrorCode;
    details?: unknown;
  };
};

export interface JwtPayload {
  userId: string;
  email: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;