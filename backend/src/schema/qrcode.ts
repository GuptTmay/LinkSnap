import { z } from "zod";

export const CreateQrCodeParamsSchema = z.object({
  linkId: z.uuid()
});

export const CreateQrCodeBodySchema = z.object({
  customization: z.object({
    backgroundColor: z.string().optional(),
    foregroundColor: z.string().optional()
  }).optional()
});

