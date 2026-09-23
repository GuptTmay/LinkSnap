import { Router } from "express";

import { analytics } from "../controllers/analytics";
import { requireAuth } from "../middlewares/requireAuth";
import { validate } from "../middlewares/requestValidate";

import {
  AnalyticsParamsSchema,
  AnalyticsQuerySchema,
} from "../schema/analytics";

import {
  ValidatedRequest,
} from "../types/validated-request";

import type { ZodType } from "zod";

const router = Router();

router.get(
  "/:linkId",
  requireAuth,
  validate({
    params: AnalyticsParamsSchema,
    query: AnalyticsQuerySchema,
  }),
  (req, res) =>
    analytics.getAnalytics(
      req as ValidatedRequest<
        ZodType,
        typeof AnalyticsQuerySchema,
        typeof AnalyticsParamsSchema
      >,
      res
    )
);

export default router;
