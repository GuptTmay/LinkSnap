import type { CredentialResponse } from "@react-oauth/google";
import { apiRequest } from "./client";

export const getCurrentUser = async () => {
  return apiRequest("/auth/me", {
    method: "GET",
  });
};

export const logout = async () => {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
};

export const googleOauth = async (credentialResponse: CredentialResponse) => {
  return apiRequest("auth/google", {
    method: "POST",
    body: JSON.stringify({
      credential: credentialResponse.credential,
    }),
  });
};


