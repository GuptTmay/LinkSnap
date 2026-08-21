import { ApiError } from "@/types/error";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";
const API_PREFIX = import.meta.env.VITE_BACKEND_BASE_URL_API_PREFIX || "";

export const fullBaseUrl = `${BASE_URL}${API_PREFIX}`;

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const response = await fetch(`${fullBaseUrl}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let data: any = {};
  try {
    data = await response.json();
  } catch {
    // Handling empty or non-JSON responses
    data = {};
  }

  if (!response.ok || data.success === false) {
    throw new ApiError(
      data.message ?? "Something went wrong",
      data.error?.code ?? "UNKNOWN_ERROR",
      response.status
    );
  }

  return data;
};