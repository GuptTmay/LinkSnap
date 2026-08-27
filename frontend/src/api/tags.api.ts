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
export const getTags = async () => {
  return apiRequest("/tags", {
    method: "GET",
  });
};

