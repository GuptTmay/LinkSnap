// src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { JWT } from "../config";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new AppError(401, "UNAUTHORIZED", "Authorization header is missing");

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT.SECRET_KEY) as JwtPayload;
    req.user = decoded;
    next();

  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(401, "TOKEN_EXPIRED", "Token has expired");
    }

    if (err instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, "INVALID_TOKEN", "Invalid token");
    }

    throw new AppError(401, "UNAUTHORIZED", "Unauthorized access");
  }
}

