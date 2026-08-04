

export const LINK_ID_LENGTH = 7;
// Maximum number of retries to generate a unique short URL
export const MAX_RETRIES = 5;

export const API_PREFIX = "/api/v1";

export const LINK = {
  RANDOM_ID_LENGTH: 7,
  MIN_LINK_ID_LENGTH: 3,
  MAX_LINK_ID_LENGTH: 50,
};

export const PORT = 3000;
export const salt_rounds = 10; 
export const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";


export const JWT = {
    SECRET_KEY: "shhhhhhhhhhhh!",
    TOKEN_EXP: 60 * 60 * 24 * 7, // 1 Week
}

export const SESSION_SECRET = process.env.SESSION_SECRET ?? "shhhhhhh!";
export const DATABASE_URL = process.env.DATABASE_URL;

