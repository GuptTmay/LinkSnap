import { z } from "zod";
import { LINK } from "../config";

export const CreateLinkSchema = z.object({
  // Regex allow only a-z, A-Z, 0-9, _, - in the shortUrl this also prevents non url friend symbols such as ? / 
  shortUrl: z.string().trim().min(LINK.MIN_SHORT_URL_LENGTH).max(LINK.MAX_SHORT_URL_LENGTH).regex(/^[a-zA-Z0-9_-]+$/, "Invalid short URL").optional(),
  longUrl: z.url(),
  title: z.string().trim().min(1).max(64).optional(),
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
  customization: z.object({
    backgroundColor: z.string().optional(),
    foregroundColor: z.string().optional()
  }).optional()
});

export const UpdateLinkParamsSchema = z.object({
  linkId: z.uuid()
});

export const UpdateLinkBodySchema = z.object({
  shortUrl: z
    .string()
    .min(LINK.MIN_SHORT_URL_LENGTH)
    .max(LINK.MAX_SHORT_URL_LENGTH).optional(),
  longUrl: z.url().optional(),
  title: z.string().trim().min(1).max(64).optional(),
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
}).refine(
  (data) =>
    data.shortUrl !== undefined ||
    data.longUrl !== undefined ||
    data.title !== undefined ||
    data.tags !== undefined,
  {
    message: "At least one field must be provided",
  }
);;

export const RedirectLinkSchema = z.object({
  shorturl: z.string().min(LINK.MIN_SHORT_URL_LENGTH).max(LINK.MAX_SHORT_URL_LENGTH),
});

export const FindByUserIdAndShortUrlSchema = z.object({
  shorturl: z.string().min(LINK.MIN_SHORT_URL_LENGTH).max(LINK.MAX_SHORT_URL_LENGTH),
});

export const CheckIfShortUrlExistSchema = z.object({
  shorturl: z.string().min(LINK.MIN_SHORT_URL_LENGTH).max(LINK.MAX_SHORT_URL_LENGTH),
});

export const GetLinksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["asc", "desc"]).default("desc"),
  qrCode: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export const DeleteLinkParamsSchema = z.object({
  linkId: z.uuid()
});