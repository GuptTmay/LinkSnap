const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const API_PREFIX = import.meta.env.VITE_BACKEND_BASE_URL_API_PREFIX;

export const fullBaseUrl = `${BASE_URL}${API_PREFIX}`;

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  return fetch(`${fullBaseUrl}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};