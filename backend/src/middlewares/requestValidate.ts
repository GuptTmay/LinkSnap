import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { AppError } from "../errors/AppError";

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
        throw new AppError(400, "VALIDATION_ERROR", `${key} validation failed`, value.error.issues);  
        // return res.status(400).json({
        //   error: `${key} validation failed`,
        //   issues: value.error.issues,
        // });
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

