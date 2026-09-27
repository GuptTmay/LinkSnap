import { Router } from "express";
import { links } from "../controllers/links";
import { validate } from "../middlewares/requestValidate";
import {RedirectLinkSchema } from "../schema/link";
import { ParamsValidatedRequest } from "../types/validated-request";
import redis from "../lib/redis";
import { rateLimitByIp } from "../middlewares/rateLimitByIp";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/health", async (_req, res) => {
  try {
    await Promise.all([
      redis.ping(),
      prisma.$queryRaw`SELECT 1`,
    ]);

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(503).json({ status: "unavailable" });
  }
});

router.get("/:shorturl", rateLimitByIp, validate({ params: RedirectLinkSchema }), (req, res) => links.redirectToLongUrl(req as ParamsValidatedRequest<typeof RedirectLinkSchema>, res));

export default router;