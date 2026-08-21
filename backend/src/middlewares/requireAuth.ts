import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT } from "../config";
import { failure } from "../utils/status";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token;
  // console.log(req.cookies);

  if (!token) {
    return res.status(401).json(
      failure(
        "Authentication required",
        "UNAUTHORIZED"
      )
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT.SECRET_KEY
    ) as JwtPayload;

    req.user = decoded;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json(
        failure(
          "Token has expired",
          "TOKEN_EXPIRED"
        )
      );
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(
        failure(
          "Invalid token",
          "INVALID_TOKEN"
        )
      );
    }

    return res.status(401).json(
      failure(
        "Unauthorized access",
        "UNAUTHORIZED"
      )
    );
  }
}