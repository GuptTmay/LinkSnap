import { z } from "zod";

export const CreateTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tag name cannot be empty")
    .max(50, "Tag name cannot exceed 50 characters"),
});

export const LinkTagParamsSchema = z.object({
  linkId: z.uuid(),
});

export const DeleteLinkTagParamsSchema = z.object({
  linkId: z.uuid(),
  tagId: z.uuid(),
});