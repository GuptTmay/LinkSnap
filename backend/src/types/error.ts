export type ErrorCode =
  | "SHORT_URL_ALREADY_EXISTS"
  | "QR_CODE_ALREADY_EXISTS" // 409 — Show a toast notification.  
  | "LINK_NOT_FOUND"         // 404 — Show a toast notification.  
  | "NOT_FOUND"               // 404 — show a toast notification, redirect to a 404 page  
  | "INVALID_TOKEN"       // 401 — show a toast notification, redirect to login page
  | "UNAUTHORIZED"            // 401 — show a toast notification, redirect to login page
  | "VALIDATION_ERROR"        // 400 — highlight the specific input fields that failed validation
  | "INVALID_CREDENTIALS"     // 401 — show a toast notification, highlight email/password fields
  | "INTERNAL_ERROR"          // 500 — generic server error, show a toast notification
  | "EMAIL_ALREADY_EXISTS"    // 409 — focus email field, offer "sign in instead?" link
  | "USERNAME_TAKEN"          // 409 — focus username field
  | "WEAK_PASSWORD"           // 400 — show password strength hint
  | "INVALID_URL"             // 400 — highlight the URL input specifically
  | "RATE_LIMITED"            // 429 — show countdown timer, disable submit button
  | "TOKEN_EXPIRED"           // 401 — silently refresh token and retry, no toast at all
  | "ACCOUNT_SUSPENDED";      // 403 — redirect to a dedicated "account suspended" page, not a toast

