// src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {}; // required — makes this a module, not a script, so `declare global` actually applies
// export {} → forces MODULE status instead of script
