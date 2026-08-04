// middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: { code: err.code, details: err.details },
    });
  }

  // Unknown/unexpected error — never leak internals to the client
  console.error(err); // full error goes to logs, not to the response
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: { code: "INTERNAL_ERROR" },
  });
}