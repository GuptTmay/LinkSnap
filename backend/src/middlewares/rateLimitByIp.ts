import type { Request, Response, NextFunction } from "express";
import ipLimiter from "../services/ipLimiter";
import { sendRateLimitPage } from "../utils/errorView";

export const rateLimitByIp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip;

  try {
    if (ip) await ipLimiter.consume(ip);
    next();
  } catch {
    return sendRateLimitPage(res);
    // res.status(429).json(failure("Too many requests. Try again later.", "TOO_MANY_REQUESTS"));
  }
};