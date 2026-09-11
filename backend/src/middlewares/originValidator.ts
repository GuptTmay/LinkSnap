import { NextFunction, Request, Response } from "express";

const allowedOrigins = [
  process.env.FRONTEND_URL,
];

export function originValidator(req: Request, res: Response, next: NextFunction) {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.headers.origin;

    if (!origin || !allowedOrigins.includes(origin)) {
      return res.status(403).json({
        message: "Invalid origin",
      });
    }
  }
  next();
}