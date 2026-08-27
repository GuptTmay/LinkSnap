import { apiRequest } from "./client";

// Create authenticated User Link
type CreateLink = {
  shortUrl?: string; // 1-20 chars, regex: /^[a-zA-Z0-9_-]+$/
  longUrl: string;   // valid URL
  title?: string;    // 1-64 chars
  tags?: string[];   // array of string (max 50 chars each)
}

export const createLink = async (data: CreateLink) => {
  return apiRequest("/links", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Get all auth User Links
export const getLinks = async () => {
  return apiRequest("/links", {
    method: "GET",
  });
};

// check if shortUrl is avaiable for use or not.
// return body {exists: boolean}
export const checkIfShortUrlExist = async (shorturl: string) => {
  return apiRequest(`/links/check/${shorturl}`, {
    method: "GET",
  });
}
