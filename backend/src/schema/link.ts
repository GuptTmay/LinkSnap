import { z } from "zod";
import { LINK } from "../config";

export const CreateLinkSchema = z.object({
  url: z.url(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

export const RedirectLinkSchema = z.object({
  shorturl: z.string().min(LINK.MIN_LINK_ID_LENGTH).max(LINK.MAX_LINK_ID_LENGTH),
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