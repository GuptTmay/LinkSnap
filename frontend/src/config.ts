export const SHORT_URL_CONFIG = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 50,
  PATTERN: /^[a-zA-Z0-9_-]{3,50}$/,
  ERROR_MESSAGE: "Use 3–50 letters, numbers, hyphens, or underscores.",
} as const;
