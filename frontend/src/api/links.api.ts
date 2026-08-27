import { apiRequest } from "./client";

// Create authenticated User Link
export const createLink = async (longUrl: string) => {
  return apiRequest("/links", {
    method: "POST",
    body: JSON.stringify({
      longUrl,
    }),
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
