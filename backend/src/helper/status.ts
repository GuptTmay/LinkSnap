import { ApiError, ApiSuccess } from "../types/api";
import { ErrorCode } from "../types/error";


/*
  return res
    .status(201)
    .json(success("Link created successfully", { shortUrl }));
*/
export function success<T>(
  message: string,
  data: T,
  meta?: ApiSuccess<T>["meta"]
): ApiSuccess<T> {
  return {
    success: true,
    message,
    data,
    meta,
  };
}

/*
  return res
    .status(404)
    .json(failure("Link not found", ErrorCode.NOT_FOUND));
*/
export function failure(
  message: string,
  code: ErrorCode,
  details?: unknown
): ApiError {
  return {
    success: false,
    message,
    error: {
      code,
      details,
    },
  };
}