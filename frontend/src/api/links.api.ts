import type { CheckIfShortUrlExistResponse, CreateLinkPayload, CreateLinkResponse } from "@/types/api";
import { apiRequest } from "./client";

// Create authenticated User Link
export const createLink = async (data: CreateLinkPayload): Promise<CreateLinkResponse> => {
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
export const checkIfShortUrlExist = async (shorturl: string): Promise<CheckIfShortUrlExistResponse> => {
  return apiRequest(`/links/check/${shorturl}`, {
    method: "GET",
  });
}
