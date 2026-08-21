export type ErrorCode =
  | "INVALID_TOKEN"       // 401 — show a toast notification, redirect to login page
  | "UNAUTHORIZED"        // 401 — show a toast notification, redirect to login page
  | "VALIDATION_ERROR"    // 400 — highlight the specific input fields that failed validation
  | "INVALID_CREDENTIALS" // 401 — show a toast notification, highlight email/password fields
  | "INTERNAL_ERROR"      // 500 — generic server error, show a toast notification
  | "EMAIL_ALREADY_EXISTS"// 409 — focus email field
  | "USERNAME_TAKEN"      // 409 — focus username field
  | "WEAK_PASSWORD"       // 400 — show password strength hint
  | "INVALID_URL"         // 400 — highlight the URL input specifically
  | "RATE_LIMITED"        // 429 — show countdown timer
  | "TOKEN_EXPIRED"       // 401 — token expired
  | "ACCOUNT_SUSPENDED"   // 403 — account suspended
  | "UNKNOWN_ERROR"       // Fallback error code
  | string;

export class ApiError extends Error {
  code: ErrorCode;
  status: number;

  constructor(message: string, code: ErrorCode = "UNKNOWN_ERROR", status: number = 500) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;

    // Maintain proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
