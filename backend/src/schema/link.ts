import { z } from "zod";
import { LINK } from "../config";

export const CreateLinkSchema = z.object({
  // Regex allow only a-z, A-Z, 0-9, _, - in the shortUrl this also prevents non url friend symbols such as ? / 
  shortUrl: z.string().trim().min(1).max(20).regex(/^[a-zA-Z0-9_-]+$/, "Invalid short URL").optional(),
  longUrl: z.url(),
  title: z.string().trim().min(1).max(64).optional(),
  tags: z.array(z.string().trim().min(1).max(50).toLowerCase()).optional(),
});

export const UpdateLinkParamsSchema = z.object({
  linkId: z.uuid()
});

export const UpdateLinkBodySchema = z.object({
  shortUrl: z
    .string()
    .min(LINK.MIN_LINK_ID_LENGTH)
    .max(LINK.MAX_LINK_ID_LENGTH),
  longUrl: z.url().optional(),
});

export const RedirectLinkSchema = z.object({
  shorturl: z.string().min(LINK.MIN_LINK_ID_LENGTH).max(LINK.MAX_LINK_ID_LENGTH),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
});

export const SignupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.email(),
  password: z.string().min(8).max(100),
});

export const GetExpenseByTimeSchema = z.object({
  startTime: z.coerce.date().default(new Date(0)),
  endTime: z.coerce.date().default(new Date()),

});

export const CreateExpenseSchema = z.object({
  title: z.string().min(1).max(100),
  message: z.string().max(500),
  category: z.string(),
  amount: z.float64().positive(),
});

export const UpdateExpenseSchema =
  CreateExpenseSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided",
    }
  );

export const UpdateExpenseParamsSchema = z.object({
  id: z.string().min(1).max(50)
});