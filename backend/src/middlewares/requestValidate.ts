import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { failure } from "../helper/status";

type ValidationSchemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = {
      body: schemas.body?.safeParse(req.body),
      query: schemas.query?.safeParse(req.query),
      params: schemas.params?.safeParse(req.params),
    };

    for (const [key, value] of Object.entries(result)) {
      if (value && !value.success) {
        const details = value.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        }));

        return res.status(400).json(
          failure(
            details.map(
              (d) => `${d.field}: ${d.message}`).join(", "),
            "VALIDATION_ERROR",
            details
          )
        );
      }
    }

    req.validated = {
      body: result.body?.data,
      query: result.query?.data,
      params: result.params?.data,
    }

    next();
  };
}

