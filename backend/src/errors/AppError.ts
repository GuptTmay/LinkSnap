import { ErrorCode } from "../types/error";

// errors/AppError.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}