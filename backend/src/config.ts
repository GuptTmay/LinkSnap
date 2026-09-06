// Maximum number of retries to generate a unique short URL
export const MAX_RETRIES = 5;

export const API_PREFIX = "/api/v1";

export const LINK = {
  RANDOM_ID_LENGTH: 7,
  MIN_SHORT_URL_LENGTH: 3,
  MAX_SHORT_URL_LENGTH: 10,
};

export const PORT = 3000;
export const salt_rounds = 10; 

export const JWT = {
    SECRET_KEY: process.env.JWT_SECRET ?? "shhhh", 
    TOKEN_EXP: 60 * 60 * 24 * 7, // 1 Week
}

export const DATABASE_URL = process.env.DATABASE_URL;

