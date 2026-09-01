import type { CheckIfShortUrlExistResponse, CreateLinkPayload, CreateLinkResponse, DeleteLinkResponse, GetLinkByShortUrlResponse, GetLinksPayload, GetLinksResponse, UpdateLinkPayload, UpdateLinkResponse } from "@/types/api";
import { apiRequest } from "./client";

// Create authenticated User Link
export const createLink = async (data: CreateLinkPayload): Promise<CreateLinkResponse> => {
  return apiRequest("/links", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Get all auth User Links
export const getLinks = async (payload?: GetLinksPayload): Promise<GetLinksResponse> => {
  const params = new URLSearchParams();
  if (payload?.page) params.set("page", String(payload.page));
  if (payload?.limit) params.set("limit", String(payload.limit));
  if (payload?.sort) params.set("sort", payload.sort);
  if (payload?.qrCode !== undefined) params.set("qrCode", String(payload.qrCode));

  const query = params.toString();
  return apiRequest(`/links${query ? `?${query}` : ""}`, { method: "GET" });
};

// check if shortUrl is avaiable for use or not.
// return body {exists: boolean}
export const checkIfShortUrlExist = async (shorturl: string): Promise<CheckIfShortUrlExistResponse> => {
  return apiRequest(`/links/check/${shorturl}`, {
    method: "GET",
  });
}

export const deleteLinks = async (linkId: string): Promise<DeleteLinkResponse> => {
  return apiRequest(`/links/${linkId}`, {
    method: "DELETE"
  });
}

export const getLinkByShortUrl = async (shortUrl: string): Promise<GetLinkByShortUrlResponse> => {
  return apiRequest(`/links/${shortUrl}`, {
    method: "GET"
  });
}

export const updateLink = async (linkId: string, data: Partial<UpdateLinkPayload>): Promise<UpdateLinkResponse> => {
  return apiRequest(`/links/${linkId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

