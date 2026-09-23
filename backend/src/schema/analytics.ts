import { z } from "zod";

export const AnalyticsParamsSchema = z.object({
  linkId: z.uuid(),
});

export const AnalyticsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  granularity: z.enum(["day", "week", "month"]).optional(),
});
