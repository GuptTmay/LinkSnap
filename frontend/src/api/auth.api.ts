import type { CredentialResponse } from "@react-oauth/google";
import { apiRequest } from "./client";
import { ApiError } from "@/types/error";

export const getCurrentUser = async () => {
  return apiRequest("/auth/me", {
    method: "GET",
  });
};

export const logout = async () => {
  localStorage.removeItem("token");
  return apiRequest("/auth/logout", {
    method: "POST",
  });
};

export const googleOauth = async (credentialResponse: CredentialResponse) => {
  const data = await apiRequest("/auth/google", {
    method: "POST",
    body: JSON.stringify({
      credential: credentialResponse.credential,
    }),
  });

  if (!data?.data?.token) {
    throw new ApiError(
      data.message ?? "Something went wrong",
      data.error?.code ?? "UNKNOWN_ERROR",
      401
    );
  }

  localStorage.setItem("token", data.data.token);
  return data;
};
