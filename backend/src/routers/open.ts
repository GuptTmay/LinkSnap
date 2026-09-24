import { Router } from "express";
import { links } from "../controllers/links";
import { validate } from "../middlewares/requestValidate";
import {RedirectLinkSchema } from "../schema/link";
import { ParamsValidatedRequest } from "../types/validated-request";
import redis from "../lib/redis";
import { rateLimitByIp } from "../middlewares/rateLimitByIp";

const router = Router();

router.get('/health', async (req, res) => {
  // Todo: check postgres db
  await redis.set("test", "hello");
  const value = await redis.get("test");
  
  res.json({ message: 'API is working!', redis: value });
});

router.get("/:shorturl", rateLimitByIp, validate({ params: RedirectLinkSchema }), (req, res) => links.redirectToLongUrl(req as ParamsValidatedRequest<typeof RedirectLinkSchema>, res));

export default router;