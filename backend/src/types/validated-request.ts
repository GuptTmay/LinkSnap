import type { Request } from "express";
import type { z, ZodType } from "zod";

export type ValidatedRequest<
  B extends ZodType = ZodType<unknown>,
  Q extends ZodType = ZodType<unknown>,
  P extends ZodType = ZodType<unknown>
> = Request & {
  validated: {
    body: z.infer<B>;
    query: z.infer<Q>;
    params: z.infer<P>;
  };
};

export type BodyValidatedRequest<B extends ZodType> = ValidatedRequest<B, ZodType, ZodType>;
export type QueryValidatedRequest<Q extends ZodType> = ValidatedRequest<ZodType, Q, ZodType>;
export type ParamsValidatedRequest<P extends ZodType> = ValidatedRequest<ZodType, ZodType, P>;